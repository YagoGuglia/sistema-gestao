import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Termos de Uso | Vitrinia",
  description: "Termos e condições gerais de uso da plataforma SaaS Vitrinia.",
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-vitrinia-purple hover:underline mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a página inicial
        </Link>

        <div className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2 text-vitrinia-purple mb-2">
            <Shield className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wider">Documento Jurídico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Termos de Uso</h1>
          <p className="text-xs text-gray-500 mt-1">Última atualização: Novembro de 2026</p>
        </div>

        <div className="prose prose-sm text-gray-600 space-y-4 text-justify leading-relaxed">
          <h2 className="text-base font-bold text-gray-900">1. Objeto e Natureza da Plataforma</h2>
          <p>
            O <strong>Vitrinia (v2.2)</strong> é uma solução de software como serviço (SaaS) multi-tenant voltada a micro e pequenos empreendedores no Brasil, destinada à criação de catálogos digitais de produtos, agendamento de serviços e gestão operacional. O Vitrinia não atua como intermediário financeiro nas transações diretas entre lojista e consumidor final.
          </p>

          <h2 className="text-base font-bold text-gray-900">2. Planos e Monetização</h2>
          <p>
            A plataforma disponibiliza o <strong>Plano Gratuito</strong> (limitado a 30 cadastros e baixa manual de pagamentos) e o <strong>Plano PRO</strong> (recursos ilimitados, baixa automática via webhooks, lembretes de WhatsApp e painel financeiro pelo valor vigente de R$ 49,90/mês). Oferece ainda o serviço opcional de <strong>Setup Premium</strong> sob taxa única de aceleração.
          </p>

          <h2 className="text-base font-bold text-gray-900">3. Responsabilidades do Lojista</h2>
          <p>
            O lojista cadastrado é o único e exclusivo responsável pela veracidade das informações dos produtos ou serviços anunciados, pela entrega dos pedidos, emissão de documentos fiscais quando aplicável e pelo cumprimento das obrigações do Código de Defesa do Consumidor (Lei 8.078/1990).
          </p>

          <h2 className="text-base font-bold text-gray-900">4. Pagamentos e Chaves Pix</h2>
          <p>
            A liquidação financeira das vendas através de chaves Pix ou gateways terceirizados (Mercado Pago, PagBank, Asaas e Stripe) ocorre diretamente na conta do respectivo lojista. O Vitrinia não retém custódia de valores transacionados na ponta final.
          </p>

          <h2 className="text-base font-bold text-gray-900">5. Foro e Legislação Aplicável</h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil, em especial o Marco Civil da Internet (Lei 12.965/2014) e a LGPD (Lei 13.709/2018).
          </p>
        </div>
      </div>
    </div>
  );
}

