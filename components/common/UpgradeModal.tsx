"use client";

import { useState } from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  MessageSquare, 
  BarChart3, 
  Infinity as InfinityIcon,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function UpgradeModal({ isOpen, onClose, featureName }: UpgradeModalProps) {
  const [includeSetup, setIncludeSetup] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    const text = includeSetup
      ? `Olá! Gostaria de assinar o Vitrinia PRO (R$ 49,90/mês) junto com o Setup Premium de R$ 149,00 para configuração em 24h.`
      : `Olá! Gostaria de fazer o upgrade para o Vitrinia PRO (R$ 49,90/mês).`;
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Plano Vitrinia PRO
          </div>

          <h3 className="text-xl md:text-2xl font-black leading-tight">
            Economize 2 horas por dia e evite faltas de clientes.
          </h3>
          <p className="text-purple-100 text-sm mt-1">
            {featureName ? `O recurso "${featureName}" é exclusivo do Plano PRO.` : "Eleve o nível do seu negócio e automatize suas vendas."}
          </p>
        </div>

        {/* Corpo com Benefícios */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-gray-900">R$ 49,90</span>
            <span className="text-gray-500 font-medium">/mês</span>
            <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Sem fidelidade
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              O que está liberado no PRO:
            </h4>

            <div className="grid gap-2.5">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                <div className="p-1.5 rounded-lg bg-purple-600 text-white mt-0.5">
                  <InfinityIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Produtos e Serviços Ilimitados</p>
                  <p className="text-xs text-gray-600">Sem limite de 30 itens. Cadastre todo seu catálogo e variações.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Pix com Baixa Automática (Webhooks)</p>
                  <p className="text-xs text-gray-600">Chega de conferir comprovante manual. Pedidos aprovados na hora.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="p-1.5 rounded-lg bg-emerald-600 text-white mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Lembretes Automáticos no WhatsApp</p>
                  <p className="text-xs text-gray-600">Reduza faltas em até 80% nos agendamentos e confirme entregas.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="p-1.5 rounded-lg bg-amber-600 text-white mt-0.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Dashboard Financeiro Completo</p>
                  <p className="text-xs text-gray-600">Margem de lucro real por produto (Venda - Custo) e DRE detalhado.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Premium Opcional */}
          <div className="p-3.5 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox"
                checked={includeSetup}
                onChange={(e) => setIncludeSetup(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div className="text-xs">
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  ⭐ Adicionar Setup Premium (R$ 149,00 taxa única)
                </span>
                <p className="text-gray-600 mt-0.5">
                  Nossa equipe cadastra seus produtos e configura sua loja completa em até 24h úteis.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer com CTA */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 text-sm font-bold text-gray-600 hover:text-gray-800 transition"
          >
            Continuar no Gratuito
          </button>

          <button
            onClick={handleSubscribe}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-purple-600/25 transition active:scale-[0.98]"
          >
            Assinar Vitrinia PRO
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

