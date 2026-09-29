"use client";

import { useState } from "react";
import { Store, Wallet, AlertCircle, CheckCircle2, X, Loader2 } from "lucide-react";
import { updateStoreAndRegisterStatus } from "@/app/actions/settings-actions";

interface StoreStatusWidgetProps {
  initialStoreOpen: boolean;
  initialRegisterOpen: boolean;
}

export function StoreStatusWidget({
  initialStoreOpen,
  initialRegisterOpen,
}: StoreStatusWidgetProps) {
  const [isStoreOpen, setIsStoreOpen] = useState(initialStoreOpen);
  const [isRegisterOpen, setIsRegisterOpen] = useState(initialRegisterOpen);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingStoreAction, setPendingStoreAction] = useState<"OPEN" | "CLOSE" | null>(null);

  // Iniciar fluxo ao clicar no botão da loja
  const handleStoreClick = () => {
    if (isStoreOpen) {
      setPendingStoreAction("CLOSE");
    } else {
      setPendingStoreAction("OPEN");
    }
    setIsModalOpen(true);
  };

  // Executar a ação confirmada no modal
  const executeStoreAction = async (alsoToggleRegister: boolean) => {
    const nextStoreOpen = pendingStoreAction === "OPEN";
    const nextRegisterOpen = alsoToggleRegister ? nextStoreOpen : isRegisterOpen;

    setLoading(true);
    setIsModalOpen(false);

    try {
      await updateStoreAndRegisterStatus({
        isStoreOpen: nextStoreOpen,
        ...(alsoToggleRegister ? { isRegisterOpen: nextRegisterOpen } : {}),
      });
      setIsStoreOpen(nextStoreOpen);
      if (alsoToggleRegister) {
        setIsRegisterOpen(nextRegisterOpen);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setLoading(false);
      setPendingStoreAction(null);
    }
  };

  // Alternar o caixa diretamente
  const handleDirectRegisterToggle = async () => {
    const nextRegisterOpen = !isRegisterOpen;
    setLoading(true);
    try {
      await updateStoreAndRegisterStatus({
        isRegisterOpen: nextRegisterOpen,
      });
      setIsRegisterOpen(nextRegisterOpen);
    } catch (error) {
      console.error("Erro ao alterar status do caixa:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* BLOCO DA LOJA */}
          <div className="flex-1 flex items-center justify-between p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                  isStoreOpen ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}
              >
                <Store size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isStoreOpen
                        ? "bg-emerald-500 animate-pulse ring-4 ring-emerald-100"
                        : "bg-red-500 ring-4 ring-red-100"
                    }`}
                  />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Status da Loja
                  </span>
                </div>
                <p className="text-base font-bold text-gray-900 mt-0.5">
                  {isStoreOpen ? "Loja Aberta" : "Loja Fechada"}
                </p>
                <p className="text-[11px] text-gray-500">
                  {isStoreOpen
                    ? "Recebendo pedidos na vitrine pública"
                    : "Aviso de fechado na vitrine"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStoreClick}
              disabled={loading}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition active:scale-95 disabled:opacity-50 shrink-0 ${
                isStoreOpen
                  ? "bg-white text-red-600 border border-red-200 hover:bg-red-50 shadow-sm"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
              }`}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin mx-auto" />
              ) : isStoreOpen ? (
                "Fechar Loja"
              ) : (
                "Abrir Loja"
              )}
            </button>
          </div>

          {/* DIVISOR SUTIL EM DESKTOP */}
          <div className="hidden sm:block w-px h-12 bg-gray-100 self-center" />

          {/* BLOCO DO CAIXA */}
          <div className="flex-1 flex items-center justify-between p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                  isRegisterOpen
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <Wallet size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isRegisterOpen
                        ? "bg-indigo-500 animate-pulse ring-4 ring-indigo-100"
                        : "bg-gray-400 ring-4 ring-gray-100"
                    }`}
                  />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Status do Caixa
                  </span>
                </div>
                <p className="text-base font-bold text-gray-900 mt-0.5">
                  {isRegisterOpen ? "Caixa Aberto" : "Caixa Fechado"}
                </p>
                <p className="text-[11px] text-gray-500">
                  {isRegisterOpen
                    ? "Registros e vendas operacionais"
                    : "Nenhuma movimentação em andamento"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDirectRegisterToggle}
              disabled={loading}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition active:scale-95 disabled:opacity-50 shrink-0 ${
                isRegisterOpen
                  ? "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shadow-sm"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
              }`}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin mx-auto" />
              ) : isRegisterOpen ? (
                "Fechar Caixa"
              ) : (
                "Abrir Caixa"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO AO ABRIR OU FECHAR A LOJA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    pendingStoreAction === "OPEN"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {pendingStoreAction === "OPEN" ? (
                    <Store size={24} />
                  ) : (
                    <AlertCircle size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {pendingStoreAction === "OPEN" ? "Abrir Loja" : "Fechar Loja"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {pendingStoreAction === "OPEN"
                      ? "Sua loja passará a aceitar novos pedidos."
                      : "Sua loja deixará de aceitar novos pedidos no momento."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* PERGUNTA SOBRE O CAIXA */}
            {pendingStoreAction === "OPEN" ? (
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-sm text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-2">
                  <Wallet size={18} className="text-emerald-700" />
                  Deseja também abrir o caixa agora?
                </p>
                <p className="text-xs text-emerald-700">
                  {isRegisterOpen
                    ? "O caixa já se encontra aberto no sistema."
                    : "Você pode abrir a loja e o caixa simultaneamente com apenas 1 clique."}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100 text-sm text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-2">
                  <Wallet size={18} className="text-amber-700" />
                  Deseja também fechar o caixa agora?
                </p>
                <p className="text-xs text-amber-700">
                  {!isRegisterOpen
                    ? "O caixa já se encontra fechado no sistema."
                    : "Recomendado ao encerrar o expediente para fechar o movimento do dia."}
                </p>
              </div>
            )}

            {/* BOTÕES DE AÇÃO */}
            <div className="flex flex-col gap-2.5 pt-2">
              {pendingStoreAction === "OPEN" ? (
                <>
                  {!isRegisterOpen ? (
                    <button
                      type="button"
                      onClick={() => executeStoreAction(true)}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 text-sm transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Abrir Loja e Caixa Juntos
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => executeStoreAction(false)}
                    className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-sm transition active:scale-95"
                  >
                    Abrir Apenas a Loja
                  </button>
                </>
              ) : (
                <>
                  {isRegisterOpen ? (
                    <button
                      type="button"
                      onClick={() => executeStoreAction(true)}
                      className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 text-sm transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Fechar Loja e Caixa Juntos
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => executeStoreAction(false)}
                    className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-sm transition active:scale-95"
                  >
                    Fechar Apenas a Loja
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 px-4 text-xs font-bold text-gray-500 hover:text-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
