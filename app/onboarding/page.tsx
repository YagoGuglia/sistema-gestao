import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { OnboardingForm } from '@/components/OnboardingForm'
import { CheckCircle2, Star } from 'lucide-react'

const PLAN_INFO: Record<string, { label: string; price: string; color: string; textColor: string; perks: string[] }> = {
  free: {
    label: "Gratuito",
    price: "R$ 0 / para sempre",
    color: "bg-gray-50 border-gray-200",
    textColor: "text-gray-700",
    perks: ["Até 20 produtos", "Pedidos manuais", "Dashboard básico"],
  },
  pro: {
    label: "Pro ⭐",
    price: "R$ 29 / mês",
    color: "bg-blue-50 border-blue-200",
    textColor: "text-blue-700",
    perks: ["Produtos ilimitados", "Vitrine digital", "WhatsApp + Agendamentos", "Suporte prioritário"],
  },
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const existingUser = await prisma.user.findFirst({
    where: { 
      email: user.email,
      role: 'TENANT'
    },
    include: { tenant: true }
  })

  if (existingUser?.tenantId) {
    redirect('/admin')
  }

  const params = await searchParams
  const plano = params?.plano && PLAN_INFO[params.plano] ? params.plano : null
  const planInfo = plano ? PLAN_INFO[plano] : null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Bem-vindo, {user.user_metadata?.full_name?.split(' ')[0] || 'Empreendedor'}! 👋
        </h2>
        <p className="mt-2 text-sm text-gray-500 font-medium">
          Você está a um passo de ter sua loja digital. Vamos configurar seu negócio.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg space-y-4">

        {/* Plano escolhido */}
        {planInfo ? (
          <div className={`rounded-2xl border-2 p-5 ${planInfo.color}`}>
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 size={20} className="text-blue-600" />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Plano escolhido</p>
                <p className={`font-black text-lg ${planInfo.textColor}`}>
                  {planInfo.label} — <span className="font-medium text-sm">{planInfo.price}</span>
                </p>
              </div>
            </div>
            <ul className="flex flex-wrap gap-2">
              {planInfo.perks.map((p) => (
                <li key={p} className="text-[11px] font-medium text-gray-600 bg-white/80 border border-gray-200 px-2.5 py-1 rounded-lg">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-sm text-amber-700 font-medium">
              Nenhum plano selecionado.{" "}
              <a href="/#planos" className="font-black underline">
                Escolher um plano
              </a>
            </p>
          </div>
        )}

        {/* Formulário da loja */}
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 text-center">Configure sua loja</h3>
          <OnboardingForm 
            email={user.email!} 
            name={user.user_metadata?.full_name || ''} 
            plano={plano || 'free'}
          />
        </div>

        <div className="text-center">
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition font-medium">
            ← Voltar para a página inicial
          </a>
        </div>
      </div>
    </div>
  )
}
