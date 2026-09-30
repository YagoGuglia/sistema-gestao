"use client";

import { useState, useEffect } from "react";

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
import { getCompatibleUnits, convertUnit, UnitType } from "@/lib/unit-conversion";


interface Ingredient {
  id: string;
  name: string;
  stock: number;
  unit?: string;
  costPrice?: number;
}

interface SelectedIngredient {
  ingredientId: string;
  name: string;
  quantity: number; // Stored in raw material's base unit
  displayQuantity?: number;
  displayUnit?: string;
  unit?: string;
}

interface IngredientsManagerProps {
  availableInsumos: Ingredient[];
  initialIngredients?: SelectedIngredient[];
  onIngredientsChange: (ingredients: SelectedIngredient[]) => void;
  onRecipeCostChange?: (cost: number) => void;
  decimalSeparator?: string;
}

export function IngredientsManager({ 
  availableInsumos, 
  initialIngredients = [], 
  onIngredientsChange,
  onRecipeCostChange,
  decimalSeparator = "."
}: IngredientsManagerProps) {
  const [selected, setSelected] = useState<SelectedIngredient[]>(() => {
    return initialIngredients.map(item => {
      const insumo = availableInsumos.find(i => i.id === item.ingredientId);
      const baseUnit = insumo?.unit || "UN";
      return {
        ...item,
        displayQuantity: item.displayQuantity ?? item.quantity,
        displayUnit: item.displayUnit ?? baseUnit,
        unit: baseUnit
      };
    });
  });

  // Keep string state for inputs so typing "0," or "0." doesn't reset to 0
  const [rawInputs, setRawInputs] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialIngredients.forEach(item => {
      const q = item.displayQuantity ?? item.quantity;
      map[item.ingredientId] = q ? q.toString().replace(".", decimalSeparator) : "1";
    });
    return map;
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [isListExpanded, setIsListExpanded] = useState(true);

  // Sync state when initialIngredients or availableInsumos changes (e.g. on opening Edit)
  useEffect(() => {
    if (initialIngredients.length > 0) {
      const mapped = initialIngredients.map(item => {
        const insumo = availableInsumos.find(i => i.id === item.ingredientId);
        const baseUnit = insumo?.unit || item.unit || "UN";
        return {
          ...item,
          displayQuantity: item.displayQuantity ?? item.quantity,
          displayUnit: item.displayUnit ?? baseUnit,
          unit: baseUnit
        };
      });
      setSelected(mapped);

      const map: Record<string, string> = {};
      mapped.forEach(item => {
        const q = item.displayQuantity ?? item.quantity;
        map[item.ingredientId] = q !== undefined ? q.toString().replace(".", decimalSeparator) : "1";
      });
      setRawInputs(map);
    } else {
      setSelected([]);
      setRawInputs({});
    }
  }, [initialIngredients, availableInsumos, decimalSeparator]);


  // Helper para obter os dados do insumo original
  const getInsumoData = (id: string) => availableInsumos.find(i => i.id === id);

  // Calcular Custo Total da Receita
  const totalRecipeCost = selected.reduce((sum, item) => {
    const insumo = getInsumoData(item.ingredientId);
    const unitCost = insumo?.costPrice || 0;
    return sum + (unitCost * item.quantity);
  }, 0);

  const filteredInsumos = availableInsumos.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const notifyChanges = (newList: SelectedIngredient[]) => {
    onIngredientsChange(newList);
    if (onRecipeCostChange) {
      const cost = newList.reduce((sum, item) => {
        const insumo = getInsumoData(item.ingredientId);
        return sum + ((insumo?.costPrice || 0) * item.quantity);
      }, 0);
      onRecipeCostChange(cost);
    }
  };

  const toggleIngredient = (insumo: Ingredient) => {
    const isSelected = selected.some(s => s.ingredientId === insumo.id);
    let newList;
    
    if (isSelected) {
      newList = selected.filter(s => s.ingredientId !== insumo.id);
      setRawInputs(prev => {
        const copy = { ...prev };
        delete copy[insumo.id];
        return copy;
      });
    } else {
      const baseUnit = insumo.unit || "UN";
      newList = [...selected, { 
        ingredientId: insumo.id, 
        name: insumo.name, 
        quantity: 1,
        displayQuantity: 1,
        displayUnit: baseUnit,
        unit: baseUnit
      }];
      setRawInputs(prev => ({ ...prev, [insumo.id]: "1" }));
    }
    
    setSelected(newList);
    notifyChanges(newList);
  };

  const handleRawInputChange = (id: string, rawVal: string, currentDisplayUnit: string) => {
    setRawInputs(prev => ({ ...prev, [id]: rawVal }));

    const normalizedStr = rawVal.replace(",", ".");
    const parsedVal = parseFloat(normalizedStr);
    const validQty = isNaN(parsedVal) ? 0 : parsedVal;

    updateItem(id, validQty, currentDisplayUnit);
  };

  const updateItem = (id: string, newDisplayQty: number, newDisplayUnit?: string) => {
    const newList = selected.map(s => {
      if (s.ingredientId !== id) return s;

      const insumo = getInsumoData(id);
      const baseUnit = insumo?.unit || "UN";
      const chosenUnit = newDisplayUnit || s.displayUnit || baseUnit;
      
      // Calculate quantity converted to raw material base unit
      const baseQty = convertUnit(newDisplayQty, chosenUnit, baseUnit);

      return {
        ...s,
        quantity: baseQty,
        displayQuantity: newDisplayQty,
        displayUnit: chosenUnit,
        unit: baseUnit
      };
    });

    setSelected(newList);
    notifyChanges(newList);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
         <div className="flex items-center gap-2">
            <Layers size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Ficha Técnica (Receita)</h3>
         </div>

         {selected.length > 0 && (
           <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
             <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Custo Insumos:</span>
             <span className="text-xs font-black text-emerald-700">R$ {totalRecipeCost.toFixed(2)}</span>
           </div>
         )}
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
                    const unit = insumo.unit || "UN";
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
                                <p className="text-[9px] text-gray-400 font-medium">
                                  Estoque: {insumo.stock} {unit} • Custo: R$ {(insumo.costPrice || 0).toFixed(2)}/{unit}
                                </p>
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
                <p className="text-xs italic font-medium">Selecione os insumos acima para definir as quantidades e frações.</p>
             </div>
           ) : (
             <div className="divide-y divide-gray-50">
               {selected.map(item => {
                 const insumoData = getInsumoData(item.ingredientId);
                 const baseUnit = insumoData?.unit || "UN";
                 const compatibleUnits = getCompatibleUnits(baseUnit);
                 const currentDisplayUnit = item.displayUnit || baseUnit;
                 const currentDisplayQty = item.displayQuantity ?? item.quantity;
                 const itemCost = (insumoData?.costPrice || 0) * item.quantity;
                 
                 const showConversionHint = currentDisplayUnit !== baseUnit;
                 const inputVal = rawInputs[item.ingredientId] ?? currentDisplayQty.toString().replace(".", decimalSeparator);

                 return (
                   <div key={item.ingredientId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-gray-50/50 transition">
                      <div className="flex-1 min-w-0">
                         <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                         <div className="flex items-center gap-2 mt-0.5">
                           <p className="text-[10px] text-emerald-600 font-bold">
                             Subtotal: R$ {itemCost.toFixed(2)}
                           </p>
                           {showConversionHint && (
                             <span className="text-[9px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                               = {item.quantity} {baseUnit} no estoque
                             </span>
                           )}
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-xl border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
                            <input 
                              type="text"
                              value={inputVal}
                              onChange={(e) => handleRawInputChange(item.ingredientId, e.target.value, currentDisplayUnit)}
                              className="w-16 bg-transparent text-center font-bold text-blue-600 outline-none text-xs"
                            />
                            
                            <select
                              value={currentDisplayUnit}
                              onChange={(e) => {
                                const newUnit = e.target.value;
                                const currentRaw = rawInputs[item.ingredientId] || currentDisplayQty.toString();
                                const parsed = parseFloat(currentRaw.replace(",", ".")) || 0;
                                updateItem(item.ingredientId, parsed, newUnit);
                              }}
                              className="bg-transparent text-[10px] font-black text-gray-600 uppercase outline-none cursor-pointer border-l border-gray-200 pl-1"
                            >
                              {compatibleUnits.map(u => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
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
                 );
               })}
             </div>
           )}
         </div>
      </div>
    </div>
  );
}



