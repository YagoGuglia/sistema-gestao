"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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
  MessageCircle,
  CreditCard,
  Bell,
  ChevronLeft,
  ChevronRight,
  Play,
  Scissors,
  Utensils,
  Dumbbell,
  Sparkles,
  Lock,
} from "lucide-react";

const APP_URL = "sistema-gestao-pink.vercel.app";
const APP_FULL_URL = `https://${APP_URL}`;

// ── Nichos/Slide Data ──────────────────────────────────
const NICHES = [
  {
    emoji: "⚽",
    icon: Dumbbell,
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    title: "Aluguel de Quadras",
    subtitle: "Futsal · Fut7 · Beach Tênis",
    desc: "Gerencie horários, bloqueios de agenda e agendamentos online. Clientes reservam e pagam pelo Pix sem você precisar atender chamada.",
    features: ["Agenda de horários por quadra", "Pix automático na reserva", "Lembretes pelo WhatsApp", "Vitrine com fotos da quadra"],
  },
  {
    emoji: "💈",
    icon: Scissors,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    textColor: "text-violet-700",
    borderColor: "border-violet-200",
    title: "Barbearia & Salão",
    subtitle: "Corte · Barba · Manicure · Maquiagem",
    desc: "Agenda inteligente por profissional, envio automático de lembrete de horário e controle de serviços e comissões da equipe.",
    features: ["Agenda por profissional", "Lembretes automáticos", "Histórico de clientes", "Comissões da equipe"],
  },
  {
    emoji: "🍰",
    icon: Sparkles,
    color: "from-pink-500 to-rose-600",
    bg: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
    title: "Confeitaria & Doceria",
    subtitle: "Bolos · Doces · Salgados · Encomendas",
    desc: "Catálogo de encomendas com fotos, datas de entrega e controle de custos de insumos para calcular sua margem de lucro real.",
    features: ["Catálogo com fotos e preços", "Controle de insumos (BOM)", "Encomendas com data de entrega", "Cálculo de margem de lucro"],
  },
  {
    emoji: "🍕",
    icon: Utensils,
    color: "from-orange-500 to-amber-600",
    bg: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    title: "Restaurante & Lanchonete",
    subtitle: "Delivery · Retirada · Mesas",
    desc: "Cardápio digital com link exclusivo, recebimento de pedidos no painel com kanban e impressão de comanda na térmica.",
    features: ["Cardápio digital com link", "Kanban de pedidos", "Impressão térmica 58mm", "Delivery e retirada"],
  },
  {
    emoji: "🧘",
    icon: Calendar,
    color: "from-cyan-500 to-teal-600",
    bg: "bg-cyan-50",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-200",
    title: "Estúdio & Espaço Fitness",
    subtitle: "Personal · Pilates · Yoga · Funcional",
    desc: "Agendamentos de aulas individuais e em grupo, controle de alunos ativos e pacotes de sessões com pagamento antecipado.",
    features: ["Agendamentos online", "Aulas em grupo e individuais", "Pacotes de sessões", "Lista de presença"],
  },
  {
    emoji: "🛠️",
    icon: Package,
    color: "from-slate-500 to-gray-700",
    bg: "bg-slate-50",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
    title: "Prestador de Serviços",
    subtitle: "Eletricista · Encanador · Pintor · Diarista",
    desc: "Vitrine de serviços com preços e portfólio de fotos, agenda de visitas e orçamentos pelo WhatsApp com um clique.",
    features: ["Portfólio de serviços", "Agenda de visitas", "Orçamentos pelo WhatsApp", "Recibo digital do serviço"],
  },
];

// ── Features ───────────────────────────────────────────
const FEATURES = [
  {
    icon: <Globe size={22} className="text-violet-600" />,
    bg: "bg-violet-50",
    title: "Vitrine Digital",
    desc: "Link exclusivo da sua loja. Clientes fazem pedidos online sem você precisar estar no celular.",
  },
  {
    icon: <Calendar size={22} className="text-blue-600" />,
    bg: "bg-blue-50",
    title: "Agendamentos Inteligentes",
    desc: "Agenda online com slots automáticos. Clientes marcam e pagam sem precisar ligar.",
  },
  {
    icon: <CreditCard size={22} className="text-emerald-600" />,
    bg: "bg-emerald-50",
    title: "Pix com Baixa Automática",
    desc: "Webhook direto com Mercado Pago, PagBank, Asaas e Stripe. Pix confirmado sem conferir comprovante.",
  },
  {
    icon: <MessageCircle size={22} className="text-green-600" />,
    bg: "bg-green-50",
    title: "WhatsApp Automático",
    desc: "Lembrete de horário, confirmação de pedido e recibo — tudo enviado pelo WhatsApp automaticamente.",
  },
  {
    icon: <Bell size={22} className="text-amber-600" />,
    bg: "bg-amber-50",
    title: "Alertas de Novos Pedidos",
    desc: "Som e piscar de tela quando chega pedido novo. Mesmo com a aba minimizada, você é avisado.",
  },
  {
    icon: <BarChart3 size={22} className="text-rose-600" />,
    bg: "bg-rose-50",
    title: "Painel Financeiro",
    desc: "DRE simplificado, margem de lucro por produto e faturamento do período. Dados reais.",
  },
  {
    icon: <Smartphone size={22} className="text-cyan-600" />,
    bg: "bg-cyan-50",
    title: "100% Mobile-First",
    desc: "Interface pensada para celular. Gerencie seu negócio de qualquer lugar, da palma da mão.",
  },
  {
    icon: <TrendingUp size={22} className="text-indigo-600" />,
    bg: "bg-indigo-50",
    title: "Multi-Nicho",
    desc: "Funciona para barbearia, quadra, confeitaria, restaurante e muito mais. Um sistema, infinitos negócios.",
  },
  {
    icon: <Shield size={22} className="text-gray-600" />,
    bg: "bg-gray-100",
    title: "Seguro e Isolado",
    desc: "Seus dados são seus. Isolamento total entre lojas. LGPD compliant com criptografia na nuvem.",
  },
];

// ── Testimonials ───────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Ana Beatriz",
    role: "Dona do Espaço Ana Bella",
    avatar: "AB",
    color: "bg-pink-500",
    text: "Reduzi os cancelamentos de 30% para quase zero. O lembrete automático pelo WhatsApp é incrível. Minha agenda está sempre cheia.",
  },
  {
    name: "Ricardo Santos",
    role: "Proprietário · Quadras RS",
    avatar: "RS",
    color: "bg-green-500",
    text: "Antes eu perdia horas no telefone marcando horário de quadra. Hoje os clientes reservam sozinhos e o Pix cai na hora. Muito mais profissional.",
  },
  {
    name: "Carla Mendes",
    role: "Confeiteira · Doces da Carla",
    avatar: "CM",
    color: "bg-violet-500",
    text: "O controle de custo de insumos me mostrou que eu estava vendendo bolo no prejuízo. Agora sei exatamente minha margem de lucro em cada produto.",
  },
];

// ── NicheCarousel Component ────────────────────────────
function NicheCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 300);
  };

  const prev = () => goTo((current - 1 + NICHES.length) % NICHES.length);
  const next = () => goTo((current + 1) % NICHES.length);

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % NICHES.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const niche = NICHES[current];

  return (
    <div className="relative">
      {/* Main card */}
      <div
        className={`bg-gradient-to-br ${niche.color} rounded-3xl p-8 md:p-12 text-white shadow-2xl transition-all duration-300 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
      >
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left: Content */}
          <div className="flex-1">
            <div className="text-5xl mb-4">{niche.emoji}</div>
            <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-1">
              Nicho
            </p>
            <h3 className="text-3xl md:text-4xl font-black mb-1">{niche.title}</h3>
            <p className="text-white/70 text-sm font-medium mb-5">{niche.subtitle}</p>
            <p className="text-white/90 text-base leading-relaxed mb-8 max-w-md">{niche.desc}</p>

            <ul className="space-y-2.5">
              {niche.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/90">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Mock UI card */}
          <div className="hidden md:block w-72 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/80 text-xs font-bold">Loja Online Ativa</span>
              </div>
              <div className="space-y-2.5">
                {["3 pedidos novos", "2 agendamentos hoje", "Faturamento: R$1.280"].map((item, i) => (
                  <div key={i} className="bg-white/10 rounded-xl px-3 py-2 text-xs text-white/80 font-medium">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-white/20 rounded-xl px-3 py-2.5 text-xs text-white font-bold flex items-center justify-between">
                <span>Novo pedido! 🔔</span>
                <span className="bg-white/30 rounded-lg px-2 py-0.5">Ver</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          {NICHES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all rounded-full ${
                i === current
                  ? "w-8 h-2.5 bg-vitrinia-purple"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-vitrinia-purple flex items-center justify-center hover:bg-vitrinia-purple/90 transition active:scale-95"
          >
            <ChevronRight size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Niche pill list */}
      <div className="flex flex-wrap gap-2 mt-5">
        {NICHES.map((n, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              i === current
                ? `${n.bg} ${n.textColor} ${n.borderColor}`
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            <span>{n.emoji}</span>
            {n.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-vitrinia-purple rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight">vitrinia</span>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#nichos" className="text-sm text-gray-500 font-medium hover:text-gray-900 transition">
              Nichos
            </a>
            <a href="#funcionalidades" className="text-sm text-gray-500 font-medium hover:text-gray-900 transition">
              Funcionalidades
            </a>
            <a href="#planos" className="text-sm text-gray-500 font-medium hover:text-gray-900 transition">
              Planos
            </a>
            <Link href="/login" className="text-sm text-gray-500 font-medium hover:text-gray-900 transition">
              Entrar
            </Link>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-vitrinia-purple text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-vitrinia-purple/90 transition-all active:scale-95 shadow-md"
          >
            Começar Grátis
            <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-28 pb-20 px-5 text-center relative overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-br from-violet-50 via-purple-50 to-white rounded-full blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-56 h-56 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold px-4 py-2 rounded-full mb-8">
            <Zap size={12} className="fill-violet-500" />
            SaaS para Micro e Pequenos Empreendedores Brasileiros
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6">
            Sua loja online,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vitrinia-purple to-vitrinia-orange">
              sua agenda cheia
            </span>
          </h1>

          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
            Vitrine digital, agendamentos online, Pix automático e WhatsApp — tudo numa plataforma só.
            Para barbearia, quadra esportiva, confeitaria e muito mais.
          </p>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
              <div className="flex -space-x-1">
                {["bg-pink-400", "bg-violet-400", "bg-green-400", "bg-blue-400"].map((c, i) => (
                  <div key={i} className={`w-7 h-7 ${c} rounded-full border-2 border-white`} />
                ))}
              </div>
              <span>+200 lojistas ativos</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-amber-500" />
              ))}
              <span className="text-sm text-gray-600 font-medium ml-1">4.9/5</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-vitrinia-purple text-white font-black px-8 py-4 rounded-2xl hover:bg-vitrinia-purple/90 transition-all active:scale-95 shadow-xl shadow-violet-200 text-base"
            >
              <Play size={16} className="fill-white" />
              Começar Gratuitamente
            </Link>
            <a
              href="#nichos"
              className="inline-flex items-center justify-center gap-2 bg-gray-50 text-gray-800 font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition-all border border-gray-200 text-base"
            >
              Ver como funciona
              <ChevronRight size={15} />
            </a>
          </div>

          <p className="text-xs text-gray-400 font-medium mt-4">
            Grátis para sempre · Sem cartão de crédito · Setup em 5 minutos
          </p>
        </div>
      </section>

      {/* ── NICHOS / CARROSSEL ── */}
      <section id="nichos" className="py-24 px-5 bg-gray-50 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-vitrinia-purple font-black text-xs uppercase tracking-[0.2em] mb-3">
              Para o seu nicho
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Um sistema para cada negócio
            </h2>
            <p className="text-gray-500 font-medium max-w-xl mx-auto">
              De quadra de beach tênis a confeitaria artesanal. A Vitrinia se adapta ao seu modelo de negócio.
            </p>
          </div>

          <NicheCarousel />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-vitrinia-purple font-black text-xs uppercase tracking-[0.2em] mb-3">
              Como funciona
            </p>
            <h2 className="text-4xl font-black text-gray-900">Setup em 3 passos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Crie sua conta grátis",
                desc: "Acesse com Google. Configure nome, logo e cores da sua loja em minutos. Sem cartão, sem burocracia.",
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
              {
                step: "02",
                title: "Cadastre seus serviços",
                desc: "Adicione produtos, serviços ou horários de quadra com fotos e preços. Nossa equipe pode fazer isso por você (Setup Premium).",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                step: "03",
                title: "Compartilhe o link",
                desc: "Envie o link da sua vitrine pelo WhatsApp. Clientes fazem pedidos ou agendamentos online. Você recebe no painel.",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
            ].map((step) => (
              <div key={step.step} className="relative">
                <div className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center mb-5`}>
                  <span className={`text-2xl font-black ${step.color}`}>{step.step}</span>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funcionalidades" className="py-24 px-5 bg-gray-50 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-vitrinia-purple font-black text-xs uppercase tracking-[0.2em] mb-3">
              Funcionalidades
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              Tudo que você precisa,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-vitrinia-purple to-vitrinia-orange">
                num só lugar
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
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

      {/* ── PRO PAYWALL PREVIEW ── */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-vitrinia-purple to-indigo-700 rounded-3xl p-10 md:p-16 text-white relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />

            <div className="relative text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-bold px-4 py-2 rounded-full mb-6">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                Plano PRO — R$ 49,90/mês
              </div>

              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Economize 2 horas por dia e evite faltas de clientes
              </h2>
              <p className="text-white/70 text-base mb-8 leading-relaxed">
                Com o PRO você ativa o Pix automático (sem conferir comprovante), lembrete de horário pelo WhatsApp, dashboard financeiro completo e produtos ilimitados.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                {[
                  { icon: <Lock size={16} />, label: "Pix Automático" },
                  { icon: <MessageCircle size={16} />, label: "WhatsApp Auto" },
                  { icon: <BarChart3 size={16} />, label: "DRE Financeiro" },
                  { icon: <Package size={16} />, label: "Produtos ∞" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 rounded-2xl p-3 flex flex-col items-center gap-2">
                    <div className="text-white/80">{item.icon}</div>
                    <span className="text-xs font-bold text-white/90 text-center">{item.label}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/login?plano=pro"
                className="inline-flex items-center gap-2 bg-white text-vitrinia-purple font-black px-8 py-4 rounded-2xl hover:bg-gray-100 transition active:scale-95 shadow-lg shadow-black/20"
              >
                Assinar PRO agora
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-5 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-vitrinia-purple font-black text-xs uppercase tracking-[0.2em] mb-3">
              Depoimentos
            </p>
            <h2 className="text-4xl font-black text-gray-900">O que nossos lojistas dizem</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs font-black">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="py-24 px-5 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-vitrinia-purple font-black text-xs uppercase tracking-[0.2em] mb-3">
              Planos e Preços
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Escolha o plano ideal
            </h2>
            <p className="text-gray-500 font-medium">
              Comece grátis e faça upgrade quando precisar de mais poder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PLANO FREE */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 hover:border-gray-300 transition-all hover:shadow-xl flex flex-col">
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Gratuito</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-gray-900">R$ 0</span>
                </div>
                <p className="text-sm text-gray-400 font-medium">Para sempre</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Até 30 produtos no catálogo",
                  "Vitrine digital com link exclusivo",
                  "Agendamentos básicos",
                  "Pix manual (conferência de comprovante)",
                  "Painel de pedidos",
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
            <div className="relative bg-gradient-to-br from-vitrinia-purple to-indigo-700 rounded-3xl p-8 shadow-2xl shadow-violet-200 overflow-hidden flex flex-col">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="absolute top-6 right-6 flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                <Star size={10} className="fill-amber-900" />
                Recomendado
              </div>

              <div className="relative mb-8">
                <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-2">Pro</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-white">R$ 49</span>
                  <span className="text-blue-200 mb-2 font-medium">,90/mês</span>
                </div>
                <p className="text-sm text-blue-200 font-medium">Cancele quando quiser</p>
              </div>

              <ul className="relative space-y-3 mb-8 flex-1">
                {[
                  "Tudo do plano Gratuito",
                  "Produtos ilimitados",
                  "Pix com baixa automática (Webhook)",
                  "Lembretes WhatsApp automáticos",
                  "Dashboard Financeiro (DRE)",
                  "Alertas sonoros de novos pedidos",
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
                className="relative flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white text-vitrinia-purple font-black hover:bg-blue-50 transition-all text-sm shadow-lg shadow-blue-900/20 active:scale-95"
              >
                Assinar o PRO agora
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* SETUP PREMIUM */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-200 p-8 hover:shadow-xl transition-all flex flex-col">
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-2">Setup Premium</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-gray-900">R$ 149</span>
                </div>
                <p className="text-sm text-amber-600 font-medium">Taxa única · Pago uma vez só</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Nossa equipe cadastra seus produtos",
                  "Configuração completa da loja",
                  "Fotos e descrições otimizadas",
                  "Configuração de horários e agenda",
                  "Entregue em até 24 horas",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/login?plano=setup"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all text-sm active:scale-95"
              >
                Quero o Setup Premium
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8 font-medium">
            Ao escolher um plano, você será redirecionado para criar sua conta. Pagamento seguro.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-5 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold px-4 py-2 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Comece hoje mesmo — grátis
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Pronto para profissionalizar seu negócio?
          </h2>
          <p className="text-gray-400 text-base mb-10 max-w-xl mx-auto">
            Junte-se a centenas de empreendedores que já usam a Vitrinia para vender mais e trabalhar menos.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-vitrinia-purple text-white font-black px-10 py-5 rounded-2xl hover:bg-vitrinia-purple/90 transition-all active:scale-95 shadow-xl shadow-violet-500/30 text-base"
          >
            Criar minha conta grátis
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-white py-14 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition mb-4">
                <div className="w-10 h-10 bg-vitrinia-purple rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-black">V</span>
                </div>
                <div>
                  <p className="font-black text-lg">vitrinia</p>
                  <p className="text-xs text-gray-500">Gestão para Empreendedores</p>
                </div>
              </Link>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                Vitrine digital, agendamentos e gestão de pedidos para micro e pequenos empreendedores brasileiros.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Produto</p>
                <ul className="space-y-2.5">
                  {[
                    { label: "Funcionalidades", href: "#funcionalidades" },
                    { label: "Nichos", href: "#nichos" },
                    { label: "Planos", href: "#planos" },
                    { label: "Entrar", href: "/login" },
                  ].map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-sm text-gray-500 hover:text-gray-300 transition">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Legal</p>
                <ul className="space-y-2.5">
                  {[
                    { label: "Privacidade", href: "/privacidade" },
                    { label: "Termos de Uso", href: "/termos" },
                    { label: "Reembolso", href: "/reembolso" },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-gray-500 hover:text-gray-300 transition">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} Vitrinia. Todos os direitos reservados.</p>
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-2 border border-gray-700">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-gray-400 select-all">{APP_URL}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
