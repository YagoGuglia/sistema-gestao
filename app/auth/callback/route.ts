import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const plano = searchParams.get('plano') || ''

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {}
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user?.email) {
      let next = '/admin'
      const email = data.user.email
      const name = data.user.user_metadata?.full_name || data.user.email.split('@')[0]

      let dbUser = await prisma.user.findUnique({ where: { email } })

      // Regra de Superadmin Inviolável
      const MASTER_ADMIN_EMAIL = "yagoguglia@gmail.com" // Pode ser movido para .env futuramente
      
      if (email === MASTER_ADMIN_EMAIL) {
        if (!dbUser || dbUser.role !== 'SUPERADMIN') {
          dbUser = await prisma.user.upsert({
            where: { email },
            update: { role: 'SUPERADMIN' },
            create: {
              email,
              name: "Super Admin",
              role: 'SUPERADMIN',
              phone: "00000000000"
            }
          })
        }
        next = '/superadmin'
      } else if (!dbUser) {
        // Novo usuário (E-mail/Senha ou Google) -> Criar no Prisma
        // Nota: O tenantId será preenchido no onboarding
        dbUser = await prisma.user.create({
          data: {
            email,
            name,
            phone: data.user.user_metadata?.phone || "",
            role: 'CUSTOMER' // Role padrão inicial
          }
        })
        next = `/onboarding${plano ? `?plano=${plano}` : ''}`
      } else if (dbUser.role === 'SUPERADMIN') {
        next = '/superadmin'
      } else if (!dbUser.tenantId) {
        next = `/onboarding${plano ? `?plano=${plano}` : ''}`
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalhost = process.env.NODE_ENV === 'development'

      if (isLocalhost) return NextResponse.redirect(`${origin}${next}`)
      if (forwardedHost) return NextResponse.redirect(`https://${forwardedHost}${next}`)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}
