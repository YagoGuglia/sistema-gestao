import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Política de Cancelamento e Reembolso | Vitrinia",
  description: "Diretrizes de estorno, cancelamento e reembolso de pedidos e agendamentos.",
};

export default function ReembolsoPage() {
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
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <RefreshCw className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wider">Garantia & Devolução</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Política de Cancelamento e Reembolso</h1>
          <p className="text-xs text-gray-500 mt-1">Regras claras de transparência para pedidos e serviços</p>
        </div>

        <div className="prose prose-sm text-gray-600 space-y-4 text-justify leading-relaxed">
          <h2 className="text-base font-bold text-gray-900">1. Cancelamento e Estorno de Pedidos</h2>
          <p>
            O consumidor pode solicitar o cancelamento do pedido ou agendamento diretamente pelo canal de WhatsApp do estabelecimento. Quando o cancelamento ocorrer dentro do limite de tolerância configurado pelo lojista (padrão de 2 horas ou conforme política da loja), o estorno de pagamentos via Pix é disparado automaticamente ou registrado para conferência.
          </p>

          <h2 className="text-base font-bold text-gray-900">2. Direito de Arrependimento (CDC Art. 49)</h2>
          <p>
            Para compras de produtos físicos não perecíveis realizadas fora do estabelecimento comercial (delivery), o consumidor tem o prazo de até 7 (sete) dias corridos a contar do recebimento para manifestar o arrependimento, devendo o produto ser devolvido em sua embalagem original sem indícios de uso.
          </p>

          <h2 className="text-base font-bold text-gray-900">3. Produtos Perecíveis e Alimentos</h2>
          <p>
            Em pedidos de doces, refeições prontas e alimentos frescos sob encomenda, o cancelamento após o início do preparo poderá ter retenção dos custos de insumos já manipulados, conforme previsto na legislação aplicável.
          </p>

          <h2 className="text-base font-bold text-gray-900">4. Agendamentos de Serviços (Manicures, Barbeiros, Quadras)</h2>
          <p>
            Cancelamentos com antecedência igual ou superior ao limite estabelecido pela loja asseguram o reagendamento ou devolução de eventuais valores antecipados (sinal/caução). Em caso de não comparecimento sem aviso prévio (<em>no-show</em>), o sinal poderá ser retido para cobertura do horário reservado.
          </p>
        </div>
      </div>
    </div>
  );
}

