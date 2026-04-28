import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Calendar,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Star,
  Shield,
  Globe,
  Smartphone,
  TrendingUp,
} from "lucide-react";

const APP_URL = "sistema-gestao-pink.vercel.app";
const APP_FULL_URL = `https://${APP_URL}`;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-vitrinia-purple rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight">vitrinia</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-gray-50 rounded-xl px-2 py-1.5 border border-gray-100">
            <Globe size={12} className="text-gray-400" />
            <span className="text-[11px] font-mono text-gray-500 select-all">{APP_URL}</span>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-vitrinia-purple text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-vitrinia-purple/90 transition-all active:scale-95 shadow-md"
          >
            Gerenciar meu negócio
            <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-blue-50 via-indigo-50 to-white rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-56 h-56 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-4 py-2 rounded-full mb-8">
            <Zap size={12} className="fill-blue-500" />
            Plataforma completa para pequenos empreendedores
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6">
            Gerencie seu negócio{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vitrinia-purple to-vitrinia-orange">
              com inteligência
            </span>
          </h1>

          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
            Estoque, pedidos, vitrine digital e agendamentos — tudo num só lugar.
            Simples de usar, poderoso o suficiente para fazer seu negócio crescer.
          </p>

          {/* URL destaque */}
          <div className="inline-flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-6 py-3 mb-10 shadow-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-mono select-all">{APP_FULL_URL}</span>
            <Globe size={14} className="text-gray-400" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#planos"
              className="inline-flex items-center justify-center gap-2 bg-vitrinia-purple text-white font-black px-8 py-4 rounded-2xl hover:bg-vitrinia-purple/90 transition-all active:scale-95 shadow-xl text-base"
            >
              Ver planos e começar
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-gray-50 text-gray-800 font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition-all border border-gray-200 text-base"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-3">Tudo que você precisa</p>
            <h2 className="text-4xl font-black text-gray-900">Um sistema. Infinitas possibilidades.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Package size={22} className="text-blue-600" />,
                bg: "bg-blue-50",
                title: "Controle de Estoque",
                desc: "Monitore produtos e insumos em tempo real. Alertas automáticos de reposição.",
              },
              {
                icon: <ShoppingCart size={22} className="text-emerald-600" />,
                bg: "bg-emerald-50",
                title: "Pedidos & Vendas",
                desc: "Lance pedidos rapidamente, acompanhe status e envie recibos pelo WhatsApp.",
              },
              {
                icon: <Globe size={22} className="text-purple-600" />,
                bg: "bg-purple-50",
                title: "Vitrine Digital",
                desc: "Sua loja na internet com link exclusivo. Clientes fazem pedidos online.",
              },
              {
                icon: <Calendar size={22} className="text-amber-600" />,
                bg: "bg-amber-50",
                title: "Agendamentos",
                desc: "Organize sua agenda de atendimentos. Notificações automáticas para clientes.",
              },
              {
                icon: <BarChart3 size={22} className="text-rose-600" />,
                bg: "bg-rose-50",
                title: "Relatórios",
                desc: "Acompanhe vendas, lucros e tendências. Tome decisões com dados reais.",
              },
              {
                icon: <Smartphone size={22} className="text-cyan-600" />,
                bg: "bg-cyan-50",
                title: "Funciona no Celular",
                desc: "Acesse de qualquer dispositivo. Interface otimizada para mobile.",
              },
              {
                icon: <TrendingUp size={22} className="text-indigo-600" />,
                bg: "bg-indigo-50",
                title: "Crescimento",
                desc: "Ferramentas que escalam junto com o seu negócio, do pequeno ao médio.",
              },
              {
                icon: <Shield size={22} className="text-gray-600" />,
                bg: "bg-gray-100",
                title: "Seguro e Confiável",
                desc: "Seus dados protegidos com criptografia e backup automático na nuvem.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="py-24 px-6 bg-white scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-3">Planos e Preços</p>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Escolha o plano ideal para você</h2>
            <p className="text-gray-500 font-medium">
              Comece gratuitamente e evolua conforme seu negócio cresce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* PLANO FREE */}
            <div className="relative bg-white rounded-3xl border-2 border-gray-200 p-8 hover:border-gray-300 transition-all hover:shadow-xl">
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Gratuito</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-gray-900">R$ 0</span>
                </div>
                <p className="text-sm text-gray-400 font-medium">Para sempre</p>
              </div>

              <ul className="space-y-3 mb-10">
                {[
                  "Até 20 produtos no catálogo",
                  "Controle de estoque básico",
                  "Lançamento de pedidos manuais",
                  "Dashboard com resumo diário",
                  "Acesso via qualquer dispositivo",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/login?plano=free"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
              >
                Começar gratuitamente
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* PLANO PRO */}
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl shadow-blue-200 overflow-hidden">
              {/* Glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

              {/* Badge */}
              <div className="absolute top-6 right-6 flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                <Star size={10} className="fill-amber-900" />
                Recomendado
              </div>

              <div className="relative mb-8">
                <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-2">Pro</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-white">R$ 29</span>
                  <span className="text-blue-200 mb-2 font-medium">/mês</span>
                </div>
                <p className="text-sm text-blue-200 font-medium">Cancele quando quiser</p>
              </div>

              <ul className="relative space-y-3 mb-10">
                {[
                  "Tudo do plano Gratuito",
                  "Produtos ilimitados",
                  "Vitrine digital pública com link exclusivo",
                  "Agendamentos e calendário",
                  "Recibos automáticos via WhatsApp",
                  "Relatórios avançados de vendas",
                  "Suporte prioritário",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white">
                    <CheckCircle2 size={16} className="text-blue-200 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/login?plano=pro"
                className="relative flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white text-blue-700 font-black hover:bg-blue-50 transition-all text-sm shadow-lg shadow-blue-900/20 active:scale-95"
              >
                Assinar o Pro agora
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8 font-medium">
            Ao escolher um plano, você será redirecionado para criar sua conta com o Google.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                <div className="w-10 h-10 bg-vitrinia-purple rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-black">V</span>
                </div>
                <div>
                  <p className="font-black text-lg">vitrinia</p>
                  <p className="text-xs text-gray-500">Gestão para Pequenos Empreendedores</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3 bg-gray-800 rounded-2xl px-5 py-3 border border-gray-700">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-mono text-gray-300 select-all">{APP_FULL_URL}</span>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} Vitrinia. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-xs text-gray-500 hover:text-gray-300 transition font-medium">
                Acessar sistema
              </Link>
              <a
                href={APP_FULL_URL}
                className="text-xs text-gray-500 hover:text-gray-300 transition font-medium"
              >
                {APP_URL}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}