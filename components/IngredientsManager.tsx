"use client";

import { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Search, 
  Layers, 
  Check,
  Package,
  ChevronDown,
  ChevronUp
} from "lucide-react";
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

interface IngredientsManagerProps {
  availableInsumos: Ingredient[];
  initialIngredients?: SelectedIngredient[];
  onIngredientsChange: (ingredients: SelectedIngredient[]) => void;
  decimalSeparator?: string;
}

export function IngredientsManager({ 
  availableInsumos, 
  initialIngredients = [], 
  onIngredientsChange,
  decimalSeparator = "."
}: IngredientsManagerProps) {
  const [selected, setSelected] = useState<SelectedIngredient[]>(initialIngredients);
  const [searchTerm, setSearchTerm] = useState("");
  const [isListExpanded, setIsListExpanded] = useState(true);

  const filteredInsumos = availableInsumos.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleIngredient = (insumo: Ingredient) => {
    const isSelected = selected.some(s => s.ingredientId === insumo.id);
    let newList;
    
    if (isSelected) {
      newList = selected.filter(s => s.ingredientId !== insumo.id);
    } else {
      newList = [...selected, { 
        ingredientId: insumo.id, 
        name: insumo.name, 
        quantity: 1 
      }];
    }
    
    setSelected(newList);
    onIngredientsChange(newList);
  };

  const updateQuantity = (id: string, qty: number) => {
    const newList = selected.map(s => 
      s.ingredientId === id ? { ...s, quantity: qty } : s
    );
    setSelected(newList);
    onIngredientsChange(newList);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
         <div className="flex items-center gap-2">
            <Layers size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Ficha Técnica (Receita)</h3>
         </div>
      </div>

      {/* Seção 1: Seleção com Busca e Scroll Vertical */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100/50 transition"
          onClick={() => setIsListExpanded(!isListExpanded)}
        >
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg border flex items-center justify-center text-gray-400">
                 <Package size={16} />
              </div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Matérias-Primas Disponíveis</span>
           </div>
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-gray-400">{availableInsumos.length} itens</span>
              {isListExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
           </div>
        </div>

        {isListExpanded && (
           <div className="p-4 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Barra de Pesquisa */}
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                 <input 
                    type="text"
                    placeholder="Pesquisar insumo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none transition"
                 />
              </div>

              {/* Lista Vertical Scrolável */}
              <div className="max-h-60 overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
                 {filteredInsumos.length === 0 ? (
                    <p className="text-center py-8 text-xs text-gray-400 italic">Nenhum insumo encontrado.</p>
                 ) : filteredInsumos.map(insumo => {
                    const isSelected = selected.some(s => s.ingredientId === insumo.id);
                    return (
                       <button
                          key={insumo.id}
                          type="button"
                          onClick={() => toggleIngredient(insumo)}
                          className={cn(
                             "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                             isSelected 
                               ? "bg-blue-50 border-blue-200" 
                               : "bg-white border-transparent hover:border-gray-200"
                          )}
                       >
                          <div className="flex items-center gap-3">
                             <div className={cn(
                                "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                                isSelected ? "bg-blue-600 border-blue-600" : "bg-gray-50 border-gray-200"
                             )}>
                                {isSelected && <Check size={12} className="text-white" />}
                             </div>
                             <div>
                                <p className="text-xs font-bold text-gray-800">{insumo.name}</p>
                                <p className="text-[9px] text-gray-400 font-medium">Estoque: {insumo.stock} un</p>
                             </div>
                          </div>
                          {!isSelected && (
                             <Plus size={14} className="text-gray-300" />
                          )}
                       </button>
                    );
                 })}
              </div>
           </div>
        )}
      </div>

      {/* Seção 2: Detalhamento das Quantidades Usadas */}
      <div className="space-y-4">
         <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Insumos da Receita</h4>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{selected.length} selecionados</span>
         </div>

         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
           {selected.length === 0 ? (
             <div className="p-12 text-center text-gray-300">
                <Layers size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs italic font-medium">Selecione os insumos acima para definir as quantidades.</p>
             </div>
           ) : (
             <div className="divide-y divide-gray-50">
               {selected.map(item => (
                 <div key={item.ingredientId} className="p-4 flex items-center justify-between group hover:bg-gray-50/50 transition">
                    <div className="flex-1">
                       <p className="text-xs font-bold text-gray-800">{item.name}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-xl border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
                          <input 
                            type="text"
                            value={item.quantity.toString().replace(".", decimalSeparator)}
                            onChange={(e) => {
                               const val = e.target.value.replace(decimalSeparator, ".");
                               updateQuantity(item.ingredientId, parseFloat(val) || 0);
                            }}
                            className="w-12 bg-transparent text-center font-bold text-blue-600 outline-none text-xs"
                          />
                          <span className="text-[10px] text-gray-400 font-black uppercase">un</span>
                       </div>

                       <button 
                         type="button"
                         onClick={() => toggleIngredient({ id: item.ingredientId } as any)}
                         className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
               ))}
             </div>
           )}
         </div>
      </div>
    </div>
  );
}
