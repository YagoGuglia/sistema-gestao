"use client";

import { useState } from "react";
import { adjustStock } from "@/app/actions/stock-actions";
import { Plus, Minus, Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function StockAdjustmentForm({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState(1);
  const [justification, setJustification] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const change = type === "IN" ? quantity : -quantity;
    const res = await adjustStock(productId, change, justification);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      router.refresh();
      setTimeout(() => {
        setSuccess(false);
        setJustification("");
        setQuantity(1);
      }, 2000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold animate-shake">
           {error}
        </div>
      )}

      {/* Tipo de Movimentação */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setType("IN")}
          className={cn(
            "flex flex-col items-center gap-2 p-6 rounded-3xl border-2 transition-all",
            type === "IN" 
              ? "bg-green-50 border-green-500 text-green-700 shadow-lg shadow-green-100" 
              : "bg-white border-gray-100 text-gray-400 hover:border-green-200"
          )}
        >
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", type === "IN" ? "bg-green-500 text-white" : "bg-gray-100")}>
             <Plus size={20} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">Entrada (+)</span>
        </button>

        <button
          type="button"
          onClick={() => setType("OUT")}
          className={cn(
            "flex flex-col items-center gap-2 p-6 rounded-3xl border-2 transition-all",
            type === "OUT" 
              ? "bg-red-50 border-red-500 text-red-700 shadow-lg shadow-red-100" 
              : "bg-white border-gray-100 text-gray-400 hover:border-red-200"
          )}
        >
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", type === "OUT" ? "bg-red-500 text-white" : "bg-gray-100")}>
             <Minus size={20} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">Saída (-)</span>
        </button>
      </div>

      <div className="space-y-6">
        <div>
           <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest px-1">Quantidade a Ajustar</label>
           <input 
              type="number" 
              step="0.001"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full text-center text-3xl font-black p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
           />
        </div>

        <div>
           <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest px-1">Justificativa da Alteração</label>
           <textarea 
              required
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Ex: Compra de insumo novo, Quebra de mercadoria, Ajuste de inventário..."
              className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-gray-700"
           />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || success}
        className={cn(
          "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold shadow-xl transition active:scale-95",
          success 
            ? "bg-green-500 text-white" 
            : "bg-blue-600 hover:bg-blue-700 text-white"
        )}
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : success ? (
          <>
            <Check size={20} />
            Estoque Ajustado!
          </>
        ) : (
          <>
            <Send size={18} />
            Confirmar e Registrar Log
          </>
        )}
      </button>
    </form>
  );
}
