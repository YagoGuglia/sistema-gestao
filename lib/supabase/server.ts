import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from "@/lib/prisma"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function requireTenant() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) throw new Error("Não autorizado");

  const MASTER_ADMIN_EMAIL = "yagoguglia@gmail.com"

  const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
  
  // Se for superadmin mestre e estiver tentando acessar uma rota de admin, 
  // ele precisa estar vinculado a um tenant ou o sistema precisa saber qual tenant ele está "emulando".
  // Por enquanto, mantemos a trava, mas garantimos que o erro seja claro.
  if (user.email === MASTER_ADMIN_EMAIL && !dbUser?.tenantId) {
     // Se for o superadmin e não tiver tenantId, ele só deveria acessar /superadmin
     // Mas se ele estiver em uma rota de tenant, talvez devêssemos permitir se ele for o dono?
     // Vamos deixar como está, mas o callback já garante que ele vá para /superadmin.
  }

  if (!dbUser?.tenantId) throw new Error("Loja não encontrada ou usuário sem permissão.");

  return dbUser.tenantId;
}
