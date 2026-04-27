import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { OnboardingForm } from '@/components/OnboardingForm'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verifica se esse usuário (pelo email do Google) já tem um Tenant associado
  const existingUser = await prisma.user.findFirst({
    where: { 
      email: user.email,
      role: 'TENANT'
    },
    include: { tenant: true }
  })

  // Se já tem um tenant e está ativo, manda direto pro admin
  if (existingUser?.tenantId) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Bem-vindo, {user.user_metadata?.full_name || 'Empreendedor'}!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Você está a um passo de ter sua loja digital. Como ela vai se chamar?
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <OnboardingForm email={user.email!} name={user.user_metadata?.full_name || ''} />
        </div>
      </div>
    </div>
  )
}
