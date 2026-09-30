"use client";

import { useState } from "react";
import { 
  Wrench, 
  X, 
  Check, 
  AlertTriangle, 
  Loader2, 
  Layers,
  ArrowRight,
  PackageCheck
} from "lucide-react";
import { produceProductBatch } from "@/app/actions/stock-actions";
import { cn } from "@/lib/utils";

interface IngredientDetail {
  ingredientId: string;
  quantity: number;
  ingredient: {
    id: string;
    name: string;
    unit?: string;
    stock: number;
    costPrice?: number;
  };
}

interface ProductForProduction {
  id: string;
  name: string;
  unit?: string;
  stock: number;
  ingredients?: IngredientDetail[];
}

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductForProduction | null;
  onSuccess: () => void;
}

export function ProductionModal({ isOpen, onClose, product, onSuccess }: ProductionModalProps) {
  const [quantityToProduce, setQuantityToProduce] = useState(1);
  const [justification, setJustification] = useState("Montagem de lote / Produção interna");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const ingredients = product.ingredients || [];
  const hasRecipe = ingredients.length > 0;

  // Calculate total batch cost and check stock shortages
  let totalBatchCost = 0;
  let hasStockShortage = false;

  const recipeBreakdown = ingredients.map(item => {
    const requiredQty = item.quantity * quantityToProduce;
    const availableStock = item.ingredient.stock;
    const isShortage = availableStock < requiredQty;
    if (isShortage) hasStockShortage = true;

    const unitCost = item.ingredient.costPrice || 0;
    const itemCost = unitCost * requiredQty;
    totalBatchCost += itemCost;

    return {
      id: item.ingredientId,
      name: item.ingredient.name,
      unit: item.ingredient.unit || "UN",
      requiredQty,
      availableStock,
      isShortage,
      itemCost
    };
  });

  async function handleConfirmProduction() {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await produceProductBatch(product!.id, quantityToProduce, justification);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccessMsg(`Produção de ${quantityToProduce} un de "${product!.name}" concluída com sucesso!`);
      setLoading(false);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Wrench className="text-amber-200" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Produção / Montagem de Lote</h2>
              <p className="text-xs text-amber-100">{product.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition text-amber-100 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-3">
              <Check size={18} className="shrink-0" />
              <p>{successMsg}</p>
            </div>
          )}

          {!hasRecipe ? (
            <div className="py-12 text-center text-gray-400 space-y-3">
              <Layers size={40} className="mx-auto opacity-30 text-amber-600" />
              <p className="text-sm font-bold text-gray-700">Este produto não possui Ficha Técnica (Receita) cadastrada.</p>
              <p className="text-xs max-w-sm mx-auto">
                Para realizar a montagem automática com baixa de insumos, edite o produto e adicione a receita na opção <strong>Ficha Técnica</strong>.
              </p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Quantidade a Produzir */}
              <div className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-800 uppercase tracking-widest">
                    Quantidade a Montar / Produzir
                  </label>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Saldo atual em estoque: <strong>{product.stock} {product.unit || "UN"}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="number"
                    min="1"
                    step="1"
                    value={quantityToProduce}
                    onChange={(e) => setQuantityToProduce(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 p-3 text-center text-xl font-black bg-white border border-amber-300 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 shadow-sm"
                  />
                  <span className="text-xs font-black text-amber-800 uppercase">{product.unit || "UN"}</span>
                </div>
              </div>

              {/* Detalhamento dos Insumos Necessários */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Insumos Necessários para {quantityToProduce}x {product.name}
                  </h3>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                    Custo Lote: R$ {totalBatchCost.toFixed(2)}
                  </span>
                </div>

                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 max-h-56 overflow-y-auto">
                  {recipeBreakdown.map(item => (
                    <div key={item.id} className="p-3.5 bg-white flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-[10px] text-gray-400">
                          Estoque Atual: {item.availableStock} {item.unit}
                        </p>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-black text-gray-900">
                            Necessário: {item.requiredQty} {item.unit}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-medium">
                            R$ {item.itemCost.toFixed(2)}
                          </p>
                        </div>

                        {item.isShortage ? (
                          <span className="bg-red-100 text-red-700 text-[9px] font-black px-2 py-1 rounded-lg uppercase">
                            Falta Estoque
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-1 rounded-lg uppercase">
                            OK
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Justificativa */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Observação / Justificativa da Montagem
                </label>
                <input 
                  type="text"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-700"
                />
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition text-xs"
          >
            Cancelar
          </button>

          {hasRecipe && (
            <button 
              onClick={handleConfirmProduction}
              disabled={loading || hasStockShortage}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold text-xs shadow-lg transition flex items-center gap-2",
                hasStockShortage 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200 active:scale-95"
              )}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Wrench size={16} />
              )}
              Confirmar Produção de {quantityToProduce} {product.unit || "UN"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
