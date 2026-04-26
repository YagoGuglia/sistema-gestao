"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus, cancelOrder } from "@/app/actions/order-actions";
import { 
  Clock, Flame, CheckCircle, XCircle, 
  ChevronDown, Loader2, AlertTriangle, X, Pencil
} from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "RECEIVED",  label: "Recebido",    color: "yellow",  icon: Clock },
  { value: "PREPARING", label: "Preparando",  color: "orange",  icon: Flame },
  { value: "DONE",      label: "Finalizado",  color: "green",   icon: CheckCircle },
  { value: "CANCELLED", label: "Cancelar",    color: "red",     icon: XCircle },
];

const colorMap: Record<string, string> = {
  yellow: "bg-yellow-500 hover:bg-yellow-600 text-white",
  orange: "bg-orange-500 hover:bg-orange-600 text-white",
  green:  "bg-green-600 hover:bg-green-700 text-white",
  red:    "bg-red-600 hover:bg-red-700 text-white",
};

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
  userPhone: string;
  totalAmount: number;
}

export function OrderActions({ orderId, currentStatus, userPhone, totalAmount }: OrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const isCancelled = currentStatus === "CANCELLED";

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === "CANCELLED") {
      setShowDropdown(false);
      setShowCancelModal(true);
      return;
    }
    setShowDropdown(false);
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
    });
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      setCancelError("Por favor, informe o motivo do cancelamento.");
      return;
    }
    setCancelError("");
    setCancelLoading(true);
    const result = await cancelOrder(orderId, cancelReason);
    setCancelLoading(false);
    if (result?.error) {
      setCancelError(result.error);
    } else {
      setShowCancelModal(false);
      setCancelReason("");
    }
  };

  const currentStatusOption = STATUS_OPTIONS.find(s => s.value === currentStatus);

  const handleWhatsApp = () => {
    const baseUrl = window.location.origin;
    const receiptUrl = `${baseUrl}/api/comprovante/${orderId}`;
    
    // Remove tudo que não for número
    let cleanPhone = userPhone.replace(/\D/g, "");
    
    // Se o número tiver 10 ou 11 dígitos, provavelmente é do Brasil sem o DDI
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = `55${cleanPhone}`;
    }

    const text = `Olá! O seu pedido de R$ ${totalAmount.toFixed(2).replace('.', ',')} foi registrado com sucesso. 📄 Veja o comprovante aqui: ${receiptUrl}`;
    
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center p-1.5 w-8 h-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition"
          title="Enviar para WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
        </button>

        {/* Recibo Button */}
        <Link
          href={`/recibo/${orderId}`}
          target="_blank"
          className="flex items-center justify-center p-1.5 w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
          title="Ver Recibo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
        </Link>

        {/* Edit Button */}
        <Link
          href={`/admin/pedidos/${orderId}/editar`}
          className="flex items-center justify-center p-1.5 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          title="Editar Pedido"
        >
          <Pencil size={14} />
        </Link>

        {/* Status Dropdown */}
        {!isCancelled && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition disabled:opacity-50"
            >
              {isPending ? <Loader2 size={12} className="animate-spin" /> : null}
              Status
              <ChevronDown size={12} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[150px]">
                  {STATUS_OPTIONS.filter(s => s.value !== currentStatus).map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(option.value)}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-left hover:bg-gray-50 transition ${
                          option.value === "CANCELLED" ? "text-red-600 border-t border-gray-100 mt-1" : "text-gray-700"
                        }`}
                      >
                        <Icon size={13} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {isCancelled && (
          <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">Cancelado</span>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="text-red-600" size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900">Cancelar Pedido</h2>
                  <p className="text-xs text-gray-500">#{orderId.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => { setShowCancelModal(false); setCancelReason(""); setCancelError(""); }} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 mb-4">
              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                O estoque dos itens será <strong>restaurado automaticamente</strong>. Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Motivo do Cancelamento <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => { setCancelReason(e.target.value); setCancelError(""); }}
                placeholder="Ex: Cliente desistiu, pagamento não aprovado, falta de ingrediente..."
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                rows={3}
                autoFocus
              />
              {cancelError && (
                <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} /> {cancelError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(""); setCancelError(""); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelLoading && <Loader2 size={14} className="animate-spin" />}
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
