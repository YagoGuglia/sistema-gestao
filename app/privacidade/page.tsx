import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade & LGPD | Vitrinia",
  description: "Política de proteção de dados pessoais e privacidade da plataforma Vitrinia.",
};

export default function PrivacidadePage() {
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
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Lock className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wider">LGPD Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Política de Privacidade</h1>
          <p className="text-xs text-gray-500 mt-1">Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018)</p>
        </div>

        <div className="prose prose-sm text-gray-600 space-y-4 text-justify leading-relaxed">
          <h2 className="text-base font-bold text-gray-900">1. Princípio da Coleta Mínima</h2>
          <p>
            O Vitrinia adota o princípio de <em>data minimization</em>. Coletamos apenas os dados estritamente indispensáveis para o processamento de pedidos e agendamentos: Nome, WhatsApp/Telefone e Endereço de Entrega (quando aplicável).
          </p>

          <h2 className="text-base font-bold text-gray-900">2. Finalidade e Base Legal</h2>
          <p>
            O tratamento de dados pessoais fundamenta-se na execução de contrato ou de procedimentos preliminares a pedido do titular (Art. 7º, V da LGPD) e no legítimo interesse para segurança e prevenção a fraudes (Art. 7º, IX da LGPD).
          </p>

          <h2 className="text-base font-bold text-gray-900">3. Isolamento e Segurança (RLS)</h2>
          <p>
            Empregamos isolamento lógico rígido por Tenant (Row-Level Security e autenticação Supabase Auth com JWTs seguros). Um lojista ou cliente jamais terá acesso aos dados, histórico ou endereços de terceiros.
          </p>

          <h2 className="text-base font-bold text-gray-900">4. Seus Direitos (Art. 18 da LGPD)</h2>
          <p>
            Você tem direito a confirmar a existência de tratamento, acessar seus dados, corrigir dados incompletos ou inexatos, solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.
          </p>

          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Como solicitar a exclusão de dados:</h3>
            <p className="text-xs text-gray-600">
              Para revogar seu consentimento ou solicitar a exclusão integral de sua conta e histórico de pedidos, envie um e-mail para{" "}
              <strong className="text-vitrinia-purple">privacidade@vitrinia.com.br</strong> ou solicite diretamente ao administrador da loja parceira.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

