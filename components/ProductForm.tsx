"use client";

import { useEffect, useState } from "react";
import { 
  Package, 
  Layers, 
  Save, 
  AlertTriangle,
  Loader2,
  Plus,
  Check
} from "lucide-react";
import { IngredientsManager } from "./IngredientsManager";
import { saveProduct } from "@/app/actions/product-actions";
import { cn } from "@/lib/utils";

interface Ingredient {
  id: string;
  name: string;
  stock: number;
}

interface SelectedIngredient {
  ingredientId: string;
  name: string;
  quantity: number;
}

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  minStock: number;
  isRawMaterial: boolean;
  image?: string;
  ingredients?: {
    ingredientId: string;
    quantity: number;
    ingredient: { name: string };
  }[];
}

interface ProductFormProps {
  initialData?: Product;
  availableInsumos: Ingredient[];
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  defaultMinStock?: number;
  decimalSeparator?: string;
}

export function ProductForm({ 
  initialData, 
  availableInsumos, 
  onSuccess,
  onDirtyChange,
  defaultMinStock = 10,
  decimalSeparator = "."
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados do Formulário
  const [isRawMaterial, setIsRawMaterial] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Sincronizar estado Dirty com o pai
  useEffect(() => {
    if (onDirtyChange) onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  // Resetar estados quando o produto mudar (Edição vs Novo)
  useEffect(() => {
    setIsRawMaterial(initialData?.isRawMaterial || false);
    setImageUrl(initialData?.image || "");
    setSelectedIngredients(
      initialData?.ingredients?.map(i => ({
        ingredientId: i.ingredientId,
        name: i.ingredient.name,
        quantity: i.quantity
      })) || []
    );
    setIsDirty(false);
    setSuccess(false);
    setError(null);
  }, [initialData]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    formData.set("isRawMaterial", isRawMaterial.toString());
    formData.set("image", imageUrl);
    if (initialData?.id) formData.set("id", initialData.id);

    const result = await saveProduct(
       formData, 
       isRawMaterial ? [] : selectedIngredients
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setIsDirty(false);
      setLoading(false);
      
      // Delay pequeno para o usuário ver a mensagem de sucesso
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    }
  }

  // Marcar como 'sujo' ao alterar qualquer campo (simplificado via onChange no form)
  const handleFormChange = () => {
    if (!isDirty) setIsDirty(true);
  };

  return (
    <form action={handleSubmit} onChange={handleFormChange} className="space-y-6">
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <Plus size={16} className="text-white" />
           </div>
           <p className="text-sm font-bold">Produto salvo com sucesso!</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Identificador de Alterações Não Salvas */}
      {isDirty && !success && (
         <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg w-fit">
            <AlertTriangle size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Alterações não salvas</span>
         </div>
      )}

      {/* Foto do Produto */}
      <div className="flex flex-col items-center gap-4 p-6 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="relative w-32 h-32 bg-white rounded-2xl border shadow-sm overflow-hidden flex items-center justify-center group">
          {imageUrl ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
             <Package size={40} className="text-gray-200" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
             <p className="text-[10px] text-white font-bold uppercase tracking-widest text-center px-2">Alterar Foto (URL)</p>
          </div>
        </div>
        <div className="w-full max-w-xs">
           <input 
             type="text" 
             placeholder="Cole a URL da imagem aqui..." 
             value={imageUrl}
             onChange={(e) => { setImageUrl(e.target.value); setIsDirty(true); }}
             className="w-full p-2 text-[10px] border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-center bg-white"
           />
        </div>
      </div>

      {/* Sessão 1: Tipo */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tipo de Cadastro</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className={cn(
            "relative flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition",
            !isRawMaterial && "border-blue-600 bg-blue-50 ring-1 ring-blue-100"
          )}>
            <input 
              type="radio" name="isRawMaterial" value="false" 
              checked={!isRawMaterial} 
              onChange={() => { setIsRawMaterial(false); setIsDirty(true); }}
              className="text-blue-600 focus:ring-blue-500" 
            />
            <div>
              <div className="font-bold text-gray-900 flex items-center gap-2">
                <Package size={16} className={cn(!isRawMaterial ? "text-blue-600" : "text-gray-400")} />
                Produto de Venda
              </div>
              <p className="text-[10px] text-gray-500">Venda direta ao cliente.</p>
            </div>
          </label>

          <label className={cn(
            "relative flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition",
            isRawMaterial && "border-amber-600 bg-amber-50 ring-1 ring-amber-100"
          )}>
            <input 
              type="radio" name="isRawMaterial" value="true" 
              checked={isRawMaterial}
              onChange={() => { setIsRawMaterial(true); setIsDirty(true); }}
              className="text-amber-600 focus:ring-amber-500" 
            />
            <div>
              <div className="font-bold text-gray-900 flex items-center gap-2">
                <Layers size={16} className={cn(isRawMaterial ? "text-amber-600" : "text-gray-400")} />
                Matéria-prima
              </div>
              <p className="text-[10px] text-gray-500">Insumo para fabricação.</p>
            </div>
          </label>
        </div>
      </div>

      {/* Sessão 2: Dados Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Item</label>
          <input 
            key={initialData?.id + "name"}
            type="text" name="name" defaultValue={initialData?.name} required placeholder="Ex: Bolo, Farinha..."
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea 
            key={initialData?.id + "desc"}
            name="description" defaultValue={initialData?.description || ""} rows={2} 
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
          <input 
            key={initialData?.id + "price"}
            type="text" 
            name="price" 
            defaultValue={initialData?.price !== undefined ? initialData.price.toString().replace(".", decimalSeparator) : "0"}
            placeholder={`0${decimalSeparator}00`}
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Atual</label>
          <input 
            key={initialData?.id + "stock_display"}
            type="text" 
            value={initialData?.stock ? initialData.stock.toString().replace(".", decimalSeparator) : "0"}
            disabled
            className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed outline-none transition font-bold"
          />
          {initialData?.id && (
             <>
               <input type="hidden" name="stock" value={initialData.stock} />
               <p className="text-[9px] text-blue-600 mt-1 font-bold">Use a ferramenta de AJUSTE para alterar o saldo.</p>
             </>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-red-600 mb-1 font-bold">
             Alerta de estoque (Mínimo)
          </label>
          <input 
            key={initialData?.id + "min"}
            type="text" 
            name="minStock" 
            defaultValue={initialData?.minStock !== undefined ? initialData.minStock.toString().replace(".", decimalSeparator) : (defaultMinStock || 10).toString()}
            className="w-full p-2.5 border-red-200 border-2 bg-red-50/20 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition font-bold"
          />
          <p className="text-[10px] text-gray-400 mt-1 italic">
             Mínimo sugerido: {defaultMinStock} un.
          </p>
        </div>
      </div>

      {/* Sessão 3: Ficha Técnica */}
      {!isRawMaterial && (
        <div className="pt-4 border-t border-gray-100">
          <IngredientsManager 
            availableInsumos={availableInsumos}
            initialIngredients={selectedIngredients}
            onIngredientsChange={(ing) => { setSelectedIngredients(ing); setIsDirty(true); }}
          />
        </div>
      )}

      <div className="pt-6 border-t border-gray-100 flex items-center justify-end">
        <button 
          type="submit"
          disabled={loading || success}
          className="flex items-center gap-2 bg-blue-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-wait"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : success ? (
            <Save size={20} />
          ) : (
            <Save size={20} />
          )}
          {success ? "Salvo!" : initialData?.id ? "Salvar Alterações" : "Cadastrar Produto"}
        </button>
      </div>
    </form>
  );
}
