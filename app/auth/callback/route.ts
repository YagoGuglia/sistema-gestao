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
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Verificar se o lojista já tem uma loja criada (Tenant)
      let next = '/admin'

      if (data.user?.email) {
        const existingUser = await prisma.user.findFirst({
          where: { email: data.user.email, role: 'TENANT' },
          include: { tenant: true },
        })

        if (!existingUser?.tenantId) {
          // Ainda não tem loja — enviar para onboarding com plano selecionado
          next = `/onboarding${plano ? `?plano=${plano}` : ''}`
        }
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalhost = process.env.NODE_ENV === 'development'
      
      if (isLocalhost) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Falha na troca de código
  return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}
