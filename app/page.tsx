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
  Printer,
  Clock,
  MapPin,
  Check,
} from "lucide-react";

const APP_URL = "sistema-gestao-pink.vercel.app";
const APP_FULL_URL = `https://${APP_URL}`;

// ── Nichos com Demonstrações Reais do Sistema ──────────────────
interface NicheData {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  category: string;
  accentColor: string;
  accentBg: string;
  textColor: string;
  borderColor: string;
  desc: string;
  features: string[];
  mockup: {
    badge: string;
    storeName: string;
    itemTitle: string;
    itemDetails: string[];
    price: string;
    actionLabel: string;
    status: string;
    extraNote?: string;
  };
}

const NICHES: NicheData[] = [
  {
    id: "quadras",
    emoji: "⚽",
    title: "Aluguel de Quadras Esportivas",
    subtitle: "Futsal · Fut7 · Beach Tênis · Vôlei",
    category: "Quadras & Arenas",
    accentColor: "from-emerald-500 to-green-600",
    accentBg: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    desc: "Controle de horários livres por quadra, bloqueio de horários fixos e agendamento online com confirmação instantânea via Pix.",
    features: [
      "Grade de horários por quadra (manhã, tarde e noite)",
      "Bloqueio rápido para mensalistas e eventos",
      "Confirmação direta via Pix na sua conta",
      "Lembrete automático para o time no WhatsApp",
    ],
    mockup: {
      badge: "Arena Beach Tennis & Fut7",
      storeName: "Arena Central Sports",
      itemTitle: "Quadra 2 (Beach Tênis / Areia)",
      itemDetails: [
        "📅 Terça-feira, 19:00 às 20:00",
        "🎾 Incluso: Bolas e rede oficial",
        "👤 Cliente: Rodrigo Martins (11) 98822-1100",
      ],
      price: "R$ 120,00",
      actionLabel: "Reserva Confirmada via Pix",
      status: "HORÁRIO CONFIRMADO",
      extraNote: "🔔 Notificação enviada para o capitão do time",
    },
  },
  {
    id: "barbearia",
    emoji: "💈",
    title: "Barbearia & Salão de Beleza",
    subtitle: "Cortes · Barba · Manicure · Estética",
    category: "Beleza & Estética",
    accentColor: "from-violet-500 to-purple-600",
    accentBg: "bg-violet-50",
    textColor: "text-violet-700",
    borderColor: "border-violet-200",
    desc: "Agenda organizada por profissional com duração do serviço, comissões automáticas da equipe e lembrete para evitar faltas de clientes.",
    features: [
      "Agenda individual por barbeiro ou cabeleireiro",
      "Duração personalizada por procedimento",
      "Lembrete de horário automático no WhatsApp",
      "Cálculo de comissão por profissional",
    ],
    mockup: {
      badge: "Barbearia & Estética Masculina",
      storeName: "Barbearia Imperial",
      itemTitle: "Corte Fade Navalhado + Barba Terapia",
      itemDetails: [
        "⏰ Duração estimada: 45 min",
        "✂️ Profissional: Barbeiro Lucas",
        "📅 Hoje às 16:30",
      ],
      price: "R$ 75,00",
      actionLabel: "Horário Agendado",
      status: "AGENDAMENTO CONFIRMADO",
      extraNote: "📲 Lembrete automático enviado 2h antes",
    },
  },
  {
    id: "confeitaria",
    emoji: "🍰",
    title: "Confeitaria & Doceria Artesanal",
    subtitle: "Bolos · Doces · Salgados · Encomendas",
    category: "Alimentação Artesanal",
    accentColor: "from-pink-500 to-rose-600",
    accentBg: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
    desc: "Catálogo visual com fotos, cálculo de custo de insumos (Ficha Técnica/BOM) para garantir sua margem de lucro e data de entrega.",
    features: [
      "Catálogo com fotos e opções de personalização",
      "Data e horário programado para entrega ou retirada",
      "Ficha técnica com cálculo do custo de ingredientes",
      "Controle de estoque de insumos (farinha, leite, embalagens)",
    ],
    mockup: {
      badge: "Confeitaria Artesanal",
      storeName: "Doce Encanto Gourmet",
      itemTitle: "Bolo Vulcão Ninho com Nutella (1,5kg)",
      itemDetails: [
        "🎂 Tema: Aniversário · Topo Personalizado",
        "📍 Retirada: Sábado às 14:00",
        "📦 Embalagem para presente inclusa",
      ],
      price: "R$ 98,00",
      actionLabel: "Pedido em Preparação",
      status: "EM PRODUÇÃO",
      extraNote: "📊 Margem de lucro calculada: 62%",
    },
  },
  {
    id: "restaurante",
    emoji: "🍕",
    title: "Restaurante, Hamburgueria & Lanchonete",
    subtitle: "Delivery · Retirada no Balcão · Mesas",
    category: "Delivery & Gastronomia",
    accentColor: "from-amber-500 to-orange-600",
    accentBg: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    desc: "Cardápio digital que abre direto no celular sem app, kanban de pedidos em tempo real e impressão de comanda térmica de 58mm.",
    features: [
      "Cardápio com foto, adicionais e ponto da carne",
      "Taxa de entrega calculada por bairro ou fixo",
      "Impressão térmica em 58mm pronta para cozinha/balcão",
      "Kanban de pedidos com alerta sonoro contínuo",
    ],
    mockup: {
      badge: "Hamburgueria Artesanal",
      storeName: "Burger House Smash",
      itemTitle: "Smash Duplo Bacon + Fritas Rústicas",
      itemDetails: [
        "🥓 Ponto: Bem passado · Maionese da casa",
        "🛵 Entrega: Rua das Acácias, 142 · Apto 32",
        "💵 Pagamento: Pix na Entrega",
      ],
      price: "R$ 44,90",
      actionLabel: "Imprimir Comanda 58mm",
      status: "SAIU PARA ENTREGA",
      extraNote: "🖨️ Cupom emitido com QR Code de rastreio",
    },
  },
  {
    id: "servicos",
    emoji: "🛠️",
    title: "Prestadores de Serviço & Autônomos",
    subtitle: "Manutenção · Consultoria · Fotografia · Aulas",
    category: "Serviços Gerais",
    accentColor: "from-blue-500 to-indigo-600",
    accentBg: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    desc: "Página profissional com seus serviços, valores claros, agendamento de visitas técnicas e emissão de recibos digitais com QR Code.",
    features: [
      "Vitrine com lista de serviços e portfólio",
      "Agendamento de visita técnica ou atendimento",
      "Recibo digital com QR Code e link para o cliente",
      "Sem intermediários: pagamento direto via Pix ou dinheiro",
    ],
    mockup: {
      badge: "Prestador de Serviços",
      storeName: "EletroTech Instalações",
      itemTitle: "Instalação de Padrão & Quadro Elétrico",
      itemDetails: [
        "⚡ Visita técnica e medição de carga",
        "📅 Agendado: Sexta-feira às 10:00",
        "📍 Residencial Quinta do Bosque",
      ],
      price: "R$ 250,00",
      actionLabel: "Orçamento Aprovado",
      status: "SERVIÇO AGENDADO",
      extraNote: "📄 Recibo digital emitido com QR Code",
    },
  },
];

// ── Features Principais ────────────────────────────────
const FEATURES = [
  {
    icon: <Globe size={22} className="text-violet-600" />,
    bg: "bg-violet-50",
    title: "Vitrine Digital com seu Link",
    desc: "Seus clientes acessam sua loja direto pelo link na bio do Instagram ou WhatsApp. Sem precisar baixar aplicativo.",
  },
  {
    icon: <Calendar size={22} className="text-blue-600" />,
    bg: "bg-blue-50",
    title: "Agendamento Sem Conflitos",
    desc: "Motor de agendamento que cruza os horários livres com a duração exata do serviço. Acabou o problema de marcar dois clientes no mesmo horário.",
  },
  {
    icon: <CreditCard size={22} className="text-emerald-600" />,
    bg: "bg-emerald-50",
    title: "Pix Direto na sua Conta",
    desc: "O cliente paga pelo Pix Copia e Cola direto para você. O dinheiro cai na sua conta sem retenção ou taxas da plataforma.",
  },
  {
    icon: <Printer size={22} className="text-gray-700" />,
    bg: "bg-gray-100",
    title: "Impressão Térmica 58mm",
    desc: "Imprima comandas de cozinha, balcão e comprovantes em mini impressoras térmicas (POS58) com QR Code do recibo digital.",
  },
  {
    icon: <Bell size={22} className="text-amber-600" />,
    bg: "bg-amber-50",
    title: "Alertas Sonoros & Visuais",
    desc: "Campainha sonora em loop contínuo e título da aba piscando quando chega pedido novo, mesmo se você estiver em outra tela ou com o navegador minimizado.",
  },
  {
    icon: <MessageCircle size={22} className="text-green-600" />,
    bg: "bg-green-50",
    title: "WhatsApp Pré-Formatado",
    desc: "Envie confirmação de pedido, aviso de preparo, saída para entrega e comprovante direto para o WhatsApp do cliente com um clique.",
  },
  {
    icon: <Package size={22} className="text-rose-600" />,
    bg: "bg-rose-50",
    title: "Estoque & Insumos (BOM)",
    desc: "Controle preciso de produtos prontos e insumos de produção com até 2 casas decimais e alerta quando estiver abaixo do estoque mínimo.",
  },
  {
    icon: <BarChart3 size={22} className="text-indigo-600" />,
    bg: "bg-indigo-50",
    title: "DRE & Margem de Lucro",
    desc: "Saiba exatamente quanto você lucra em cada venda. Cálculo de margem bruta (preço de venda menos custo) e controle financeiro simples.",
  },
  {
    icon: <Smartphone size={22} className="text-cyan-600" />,
    bg: "bg-cyan-50",
    title: "Interface 100% Mobile-First",
    desc: "Gerencie pedidos, estoque e agenda no celular enquanto trabalha. Para o cliente, fazer um pedido leva menos de 1 minuto.",
  },
];

export default function LandingPage() {
  const [activeNicheIdx, setActiveNicheIdx] = useState(0);
  const activeNiche = NICHES[activeNicheIdx];

  const handlePrev = () => {
    setActiveNicheIdx((prev) => (prev - 1 + NICHES.length) % NICHES.length);
  };

  const handleNext = () => {
    setActiveNicheIdx((prev) => (prev + 1) % NICHES.length);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-vitrinia-purple selection:text-white">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <div className="w-8 h-8 bg-vitrinia-purple rounded-xl flex items-center justify-center shadow-md shadow-vitrinia-purple/20">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight">vitrinia</span>
          </Link>

          {/* Links Centrais */}
          <div className="hidden md:flex items-center gap-7">
            <a href="#nichos" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
              Nichos Atendidos
            </a>
            <a href="#funcionalidades" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
              Funcionalidades
            </a>
            <a href="#planos" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
              Planos & Preços
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-bold text-gray-700 hover:text-gray-900 px-3 py-2 transition"
            >
              Entrar
            </Link>
            <Link
              href="/login?plano=free"
              className="inline-flex items-center gap-1.5 bg-vitrinia-purple text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl hover:bg-vitrinia-purple/90 transition shadow-md shadow-vitrinia-purple/20 active:scale-95"
            >
              <span>Criar Loja Grátis</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="pt-32 pb-20 px-5 text-center relative overflow-hidden bg-gradient-to-b from-gray-50/70 via-white to-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-vitrinia-purple/10 to-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-vitrinia-purple/10 text-vitrinia-purple border border-vitrinia-purple/20 text-xs font-bold px-4 py-1.5 rounded-full">
            <Zap size={13} className="fill-vitrinia-purple" />
            <span>SaaS para Micro e Pequenos Empreendedores Brasileiros</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.08]">
            Sua vitrine digital e seus agendamentos,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vitrinia-purple via-indigo-600 to-vitrinia-orange">
              sem complicação.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Elimine a perda de tempo anotando pedidos e conferindo Pix no WhatsApp. 
            Seu cliente escolhe, agenda e pede pelo link exclusivo da sua loja — você recebe tudo organizado no painel com alerta sonoro.
          </p>

          {/* Botões CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Link
              href="/login?plano=free"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-vitrinia-purple text-white font-extrabold px-8 py-4 rounded-2xl hover:bg-vitrinia-purple/90 transition shadow-xl shadow-vitrinia-purple/25 active:scale-95 text-base"
            >
              <span>Começar Minha Loja Grátis</span>
              <ArrowRight size={17} />
            </Link>
            <a
              href="#nichos"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-800 font-bold px-7 py-4 rounded-2xl hover:bg-gray-50 transition border border-gray-200 shadow-sm text-base"
            >
              <span>Ver Exemplos por Nicho</span>
            </a>
          </div>

          {/* Propostas de valor reais (sem métricas ou depoimentos inventados) */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            {[
              { title: "Pix Direto na Conta", desc: "Sem taxa por venda" },
              { title: "Agenda Inteligente", desc: "Sem conflito de horários" },
              { title: "Comanda Térmica 58mm", desc: "Pronta para balcão e motoboy" },
              { title: "100% no seu WhatsApp", desc: "Link pronto para a bio" },
            ].map((prop) => (
              <div key={prop.title} className="bg-white/80 p-3 rounded-xl border border-gray-100 shadow-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs">
                  <Check size={14} className="stroke-[3]" />
                  <span>{prop.title}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARROSSEL DE NICHOS COM DEMONSTRAÇÕES REAIS ── */}
      <section id="nichos" className="py-20 px-5 bg-gray-50 border-y border-gray-100 scroll-mt-16">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-vitrinia-purple">
              Solução Sob Medida
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              O Vitrinia funciona perfeitamente para o seu modelo de negócio
            </h2>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Veja na prática como a plataforma se comporta para agendamento de quadras, salões, delivery e muito mais.
            </p>
          </div>

          {/* Seletor de Nichos por Abas (Fácil navegação desktop e mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start lg:justify-center">
            {NICHES.map((niche, idx) => {
              const isActive = activeNicheIdx === idx;
              return (
                <button
                  key={niche.id}
                  onClick={() => setActiveNicheIdx(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border shrink-0 ${
                    isActive
                      ? "bg-gray-900 text-white border-gray-900 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-base">{niche.emoji}</span>
                  <span>{niche.category}</span>
                </button>
              );
            })}
          </div>

          {/* Card do Nicho com Mockup da Interface */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Lado Esquerdo: Descrição e Diferenciais */}
              <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl">{activeNiche.emoji}</span>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {activeNiche.category}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        {activeNiche.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-vitrinia-purple uppercase tracking-wider">
                    {activeNiche.subtitle}
                  </p>

                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
                    {activeNiche.desc}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {activeNiche.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 font-semibold">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 size={13} className="stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controles de Navegação */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition active:scale-95"
                      title="Anterior"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition active:scale-95"
                      title="Próximo"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <span className="text-xs font-bold text-gray-400 ml-2">
                      {activeNicheIdx + 1} de {NICHES.length}
                    </span>
                  </div>

                  <Link
                    href="/login?plano=free"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-vitrinia-purple hover:underline"
                  >
                    <span>Configurar para este nicho</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Lado Direito: Mockup Realista da Tela */}
              <div className="lg:col-span-6 bg-gradient-to-br from-gray-900 to-gray-950 p-6 sm:p-10 text-white flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-800">
                <div className="max-w-md mx-auto w-full space-y-4">
                  {/* Topo do Mockup estilo Celular/Card */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pb-3 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono text-[11px] text-gray-300">{activeNiche.mockup.badge}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md">
                      Demonstração
                    </span>
                  </div>

                  {/* Card Central */}
                  <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-5 border border-gray-700/80 space-y-4 shadow-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                          {activeNiche.mockup.status}
                        </span>
                        <h4 className="text-lg font-black text-white mt-0.5">
                          {activeNiche.mockup.itemTitle}
                        </h4>
                        <p className="text-xs text-gray-400">{activeNiche.mockup.storeName}</p>
                      </div>
                      <span className="text-lg font-black text-emerald-400 shrink-0">
                        {activeNiche.mockup.price}
                      </span>
                    </div>

                    {/* Detalhes do Pedido / Agendamento */}
                    <div className="bg-gray-900/90 rounded-xl p-3.5 space-y-1.5 border border-gray-800">
                      {activeNiche.mockup.itemDetails.map((det) => (
                        <p key={det} className="text-xs text-gray-300 font-medium">
                          {det}
                        </p>
                      ))}
                    </div>

                    {/* Botão de Ação */}
                    <div className="pt-1">
                      <div className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl text-center text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} />
                        <span>{activeNiche.mockup.actionLabel}</span>
                      </div>
                      {activeNiche.mockup.extraNote && (
                        <p className="text-[11px] text-gray-400 text-center mt-2.5">
                          {activeNiche.mockup.extraNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Informação do Checkout / Painel */}
                  <div className="p-3 bg-gray-800/40 rounded-xl border border-gray-800 text-center">
                    <p className="text-xs text-gray-400">
                      ⚡ Pagamento via Pix com baixa direta · Sem taxas por venda
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA (3 PASSOS REAIS) ── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-vitrinia-purple">
              Simplicidade Total
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Coloque seu negócio no ar em 3 passos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Crie sua loja em 2 minutos",
                desc: "Cadastre seu nome, logotipo e cor da sua marca. Sua vitrine fica pronta instantaneamente com link próprio.",
              },
              {
                step: "02",
                title: "Cadastre produtos ou horários",
                desc: "Adicione seus produtos físicos, serviços com duração ou horários de quadras esportivas com fotos e preços.",
              },
              {
                step: "03",
                title: "Divulgue e receba pedidos",
                desc: "Cole o link no Instagram e WhatsApp. Os pedidos e reservas chegam direto no seu painel com aviso sonoro.",
              },
            ].map((st) => (
              <div key={st.step} className="bg-gray-50/70 p-6 rounded-3xl border border-gray-100 relative space-y-3">
                <span className="text-3xl font-black text-vitrinia-purple/40">{st.step}</span>
                <h3 className="text-lg font-black text-gray-900">{st.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES DO SISTEMA ── */}
      <section id="funcionalidades" className="py-20 px-5 bg-gray-50 border-t border-gray-100 scroll-mt-16">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-vitrinia-purple">
              Recursos Profissionais
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Tudo o que seu negócio precisa para crescer
            </h2>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Desenvolvido com foco na rotina real de quem atende clientes todos os dias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className={`w-11 h-11 rounded-2xl ${feat.bg} flex items-center justify-center shrink-0`}>
                  {feat.icon}
                </div>
                <h3 className="text-base font-black text-gray-900">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS & PREÇOS (APENAS FREE E PRO) ── */}
      <section id="planos" className="py-20 px-5 bg-white scroll-mt-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-vitrinia-purple">
              Preço Justo e Transparente
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Escolha o plano ideal para seu momento
            </h2>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Comece gratuitamente. Faça upgrade para o PRO apenas quando quiser automatizar seu WhatsApp e receber com baixa instantânea do Pix.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* PLANO FREE */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 flex flex-col justify-between space-y-8 hover:border-gray-300 transition">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Comece sem custo
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">Plano Gratuito</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-gray-900">R$ 0</span>
                    <span className="text-xs font-bold text-gray-400">/mês para sempre</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span>Vitrine online com link exclusivo</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span>Até 30 produtos ou serviços cadastrados</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span>Agendamentos básicos</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span>Painel de gestão de pedidos</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span>Pix Copia e Cola manual</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span>Impressão de comanda térmica 58mm</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login?plano=free"
                className="w-full py-3.5 px-4 rounded-xl border-2 border-gray-900 text-gray-900 font-extrabold text-sm text-center hover:bg-gray-900 hover:text-white transition active:scale-95"
              >
                Criar Conta Grátis
              </Link>
            </div>

            {/* PLANO PRO */}
            <div className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white rounded-3xl p-8 flex flex-col justify-between space-y-8 shadow-2xl border-2 border-vitrinia-purple/50">
              <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-400 to-orange-400 text-gray-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                Mais Escolhido
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-vitrinia-purple">
                    Automação e Escala
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">Plano PRO</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white">R$ 49,90</span>
                    <span className="text-xs font-bold text-gray-400">/mês</span>
                  </div>
                  <p className="text-xs text-amber-300/90 mt-1 font-semibold">
                    Economize 2 horas por dia e evite faltas de clientes.
                  </p>
                </div>

                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-center gap-2.5 text-white font-medium">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span><strong>Tudo do Plano Gratuito</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span><strong>Produtos e serviços ilimitados</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span><strong>Pix com baixa automática</strong> (Webhook)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Lembretes e avisos automáticos no WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Dashboard Financeiro completo (DRE e margens)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Alertas sonoros contínuos (loop de 3s, 5s e 10s)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Suporte prioritário via WhatsApp</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login?plano=pro"
                className="w-full py-3.5 px-4 rounded-xl bg-vitrinia-purple hover:bg-vitrinia-purple/90 text-white font-extrabold text-sm text-center transition shadow-lg shadow-vitrinia-purple/30 active:scale-95"
              >
                Assinar o PRO por R$ 49,90/mês
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 font-medium">
            Sem fidelidade ou multas de cancelamento. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-white py-12 px-5 border-t border-gray-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-vitrinia-purple rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <div>
              <p className="font-black text-sm">vitrinia</p>
              <p className="text-[11px] text-gray-500">Plataforma de Gestão e Vitrine Digital</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/termos" className="hover:text-white transition">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-white transition">Privacidade</Link>
            <Link href="/reembolso" className="hover:text-white transition">Política de Reembolso</Link>
          </div>

          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Vitrinia. Todos os direitos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
}
