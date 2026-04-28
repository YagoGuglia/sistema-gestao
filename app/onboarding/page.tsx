import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { OnboardingForm } from '@/components/OnboardingForm'
import { CheckCircle2, Star } from 'lucide-react'
import Link from 'next/link'

const PLAN_INFO: Record<string, { label: string; price: string; perks: string[] }> = {
  free: {
    label: "Gratuito",
    price: "R$ 0 / para sempre",
    perks: ["Até 20 produtos", "Pedidos manuais", "Dashboard básico"],
  },
  pro: {
    label: "Pro ⭐",
    price: "R$ 29 / mês",
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

  if (!user) redirect('/login')

  const existingUser = await prisma.user.findFirst({
    where: { email: user.email },
    include: { tenant: true }
  })

  if (existingUser?.tenantId) redirect('/admin')

  const params = await searchParams
  const plano = params?.plano && PLAN_INFO[params.plano] ? params.plano : null
  const planInfo = plano ? PLAN_INFO[plano] : null

  return (
    <div className="min-h-screen bg-vitrinia-bg font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-7 h-7 bg-vitrinia-purple rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">V</span>
          </div>
          <span className="font-black text-vitrinia-purple text-lg">vitrinia</span>
        </Link>
        <span className="text-xs text-gray-400">Cadastro da sua loja</span>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-vitrinia-purple/10 text-vitrinia-purple text-xs font-bold px-4 py-2 rounded-full mb-4">
            🎉 Quase lá!
          </div>
          <h1 className="text-3xl font-black text-gray-900">
            Bem-vindo, {user.user_metadata?.full_name?.split(' ')[0] || 'Empreendedor'}!
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Configure sua loja em menos de 2 minutos.
          </p>
        </div>

        <div className="space-y-4">
          {/* Plano escolhido */}
          {planInfo ? (
            <div className={`rounded-2xl border-2 p-4 ${plano === 'pro' ? 'border-vitrinia-purple bg-vitrinia-purple/5' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 size={18} className="text-vitrinia-purple shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Plano escolhido</p>
                  <p className="font-black text-gray-900">
                    {planInfo.label} — <span className="font-medium text-sm text-gray-500">{planInfo.price}</span>
                  </p>
                </div>
                {plano === 'pro' && <Star size={16} className="text-amber-400 fill-amber-400 ml-auto" />}
              </div>
              <ul className="flex flex-wrap gap-2">
                {planInfo.perks.map((p) => (
                  <li key={p} className="text-[11px] font-medium text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-center">
              <p className="text-sm text-amber-700 font-medium">
                Nenhum plano selecionado.{" "}
                <a href="/#planos" className="font-black underline">Escolher um plano</a>
              </p>
            </div>
          )}

          {/* Formulário */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-6">Configure sua loja</h2>
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
    </div>
  )
}
