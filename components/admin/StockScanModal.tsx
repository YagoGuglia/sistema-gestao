"use client";

import { useState, useRef } from "react";
import { 
  Camera, 
  Upload, 
  FileText, 
  Sparkles, 
  Check, 
  X, 
  Loader2, 
  AlertCircle, 
  Plus, 
  ArrowRight,
  PackageCheck
} from "lucide-react";
import { createWorker } from "tesseract.js";
import { findBestMatch } from "@/lib/fuzzy-match";
import { batchAdjustStock } from "@/app/actions/stock-actions";
import { cn } from "@/lib/utils";

interface ProductItem {
  id: string;
  name: string;
  unit?: string;
  costPrice?: number;
  isRawMaterial: boolean;
}

interface ScannedLine {
  id: string;
  rawText: string;
  matchedProductId: string | null;
  matchedScore: number;
  quantity: number;
  costPrice: number;
}

interface StockScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onSuccess: () => void;
}

export function StockScanModal({ isOpen, onClose, products, onSuccess }: StockScanModalProps) {
  const [step, setStep] = useState<"UPLOAD" | "SCANNING" | "REVIEW" | "SAVING">("UPLOAD");
  const [textInput, setTextInput] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [scannedLines, setScannedLines] = useState<ScannedLine[]>([]);
  const [justification, setJustification] = useState("Entrada NFe / Scan de Nota");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process raw text into structured items using regex patterns
  function parseTextLines(text: string) {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 2);
    const parsed: ScannedLine[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Exclude header / total noise lines
      if (/total|subtotal|cnpj|cpf|data|emissao|desconto|forma|pagamento|troco|obrigado|volte sempre/i.test(line)) {
        continue;
      }

      // Extract numeric values for quantity & price
      // e.g. "Farinha de Trigo 5kg 2x 15.50" or "Leite 10 UN 4.50" or "001 CAIXA LEITE 12 55.00"
      const qtyMatch = line.match(/(\d+[\.,]?\d*)\s*(kg|g|l|ml|m|cm|un|cx|pct|pcts|unid|unidades)?\b/i);
      const priceMatch = line.match(/(?:R\$|\$)?\s*(\d+[\.,]\d{2})/i);

      let qty = 1;
      if (qtyMatch) {
        const parsedQty = parseFloat(qtyMatch[1].replace(",", "."));
        if (!isNaN(parsedQty) && parsedQty > 0 && parsedQty < 10000) {
          qty = parsedQty;
        }
      }

      let price = 0;
      if (priceMatch) {
        const parsedPrice = parseFloat(priceMatch[1].replace(",", "."));
        if (!isNaN(parsedPrice)) {
          price = parsedPrice;
        }
      }

      // Match against available products
      const match = findBestMatch(line, products, p => p.name);

      parsed.push({
        id: `line-${i}-${Date.now()}`,
        rawText: line,
        matchedProductId: match ? match.item.id : null,
        matchedScore: match ? match.score : 0,
        quantity: qty,
        costPrice: price
      });
    }

    return parsed;
  }

  // Handle OCR file scan using Tesseract.js
  async function handleFileSelect(file: File) {
    try {
      setStep("SCANNING");
      setProgress(5);
      setProgressStatus("Inicializando leitor OCR...");

      const worker = await createWorker('por', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            const p = Math.round(m.progress * 100);
            setProgress(p);
            setProgressStatus(`Reconhecendo texto do papel/cupom... ${p}%`);
          }
        }
      });

      const ret = await worker.recognize(file);
      await worker.terminate();


      const extractedText = ret.data.text;
      const parsed = parseTextLines(extractedText);

      setScannedLines(parsed);
      setStep("REVIEW");
    } catch (err: any) {
      console.error("Erro no OCR:", err);
      setError("Não foi possível ler o arquivo. Tente colar o texto manualmente.");
      setStep("UPLOAD");
    }
  }

  // Handle manual text paste
  function handleProcessText() {
    if (!textInput.trim()) return;
    const parsed = parseTextLines(textInput);
    setScannedLines(parsed);
    setStep("REVIEW");
  }

  // Handle final submission
  async function handleConfirmBatch() {
    setStep("SAVING");
    setError(null);

    const validItems = scannedLines
      .filter(line => line.matchedProductId && line.quantity > 0)
      .map(line => ({
        productId: line.matchedProductId!,
        quantityChange: line.quantity,
        costPrice: line.costPrice > 0 ? line.costPrice : undefined,
        justification: justification || "Entrada via Scan OCR"
      }));

    if (validItems.length === 0) {
      setError("Nenhum item associado a um produto cadastrado.");
      setStep("REVIEW");
      return;
    }

    const res = await batchAdjustStock(validItems);

    if (res.error) {
      setError(res.error);
      setStep("REVIEW");
    } else {
      onSuccess();
      onClose();
    }
  }

  const updateLineProduct = (lineId: string, productId: string) => {
    setScannedLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const prod = products.find(p => p.id === productId);
        return {
          ...line,
          matchedProductId: productId,
          matchedScore: 1.0,
          costPrice: prod?.costPrice || line.costPrice
        };
      }
      return line;
    }));
  };

  const updateLineQty = (lineId: string, qty: number) => {
    setScannedLines(prev => prev.map(line => 
      line.id === lineId ? { ...line, quantity: qty } : line
    ));
  };

  const removeLine = (lineId: string) => {
    setScannedLines(prev => prev.filter(line => line.id !== lineId));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Sparkles className="text-yellow-400" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Scan Inteligente de Estoque</h2>
              <p className="text-xs text-blue-200">Digitalize papéis, notas fiscais ou cupons de compra</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition text-blue-200 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* STEP 1: UPLOAD & INPUT */}
          {step === "UPLOAD" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* File Upload Box */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*,.pdf" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform mb-3">
                    <Camera size={26} />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">Enviar Foto ou Papel</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                    Tire foto da nota fiscal, recibo de compra ou rascunho de estoque.
                  </p>
                </div>

                {/* Text Input Box */}
                <div className="bg-gray-50 rounded-3xl p-5 border border-gray-200 flex flex-col justify-between space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-2">
                      <FileText size={14} className="text-blue-600" />
                      Ou cole o texto aqui
                    </label>
                    <textarea 
                      rows={5}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Exemplo:&#10;5kg Farinha Trigo 15.90&#10;10 Litros Leite 45.00&#10;2 cx Manteiga 24.00"
                      className="w-full p-3 bg-white border border-gray-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <button 
                    onClick={handleProcessText}
                    disabled={!textInput.trim()}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    Processar Texto
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: SCANNING PROGRESS */}
          {step === "SCANNING" && (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Processando Leitura OCR</h3>
                <p className="text-xs text-gray-500 mt-1">{progressStatus}</p>
              </div>
              <div className="w-full max-w-xs mx-auto bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & MATCHING */}
          {step === "REVIEW" && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Itens Detectados ({scannedLines.length})</h3>
                  <p className="text-xs text-gray-500">Confirme a associação com os produtos da sua loja.</p>
                </div>
                <div className="w-1/2">
                  <input 
                    type="text" 
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Justificativa da entrada..."
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 max-h-[40vh] overflow-y-auto">
                {scannedLines.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400 italic">
                    Nenhum item válido identificado no documento.
                  </div>
                ) : (
                  scannedLines.map(line => {
                    const isMatched = !!line.matchedProductId;
                    return (
                      <div key={line.id} className="p-3 bg-white hover:bg-gray-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[11px] text-gray-600 truncate bg-gray-50 px-2 py-0.5 rounded w-fit max-w-full">
                            "{line.rawText}"
                          </p>
                          {isMatched && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 mt-1">
                              <Check size={10} />
                              Match: {Math.round(line.matchedScore * 100)}% de precisão
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Product Selector Dropdown */}
                          <div className="w-52">
                            <select 
                              value={line.matchedProductId || ""}
                              onChange={(e) => updateLineProduct(line.id, e.target.value)}
                              className={cn(
                                "w-full p-2 border rounded-xl outline-none text-xs font-bold cursor-pointer transition",
                                isMatched 
                                  ? "border-emerald-200 bg-emerald-50/30 text-emerald-900 focus:ring-emerald-500" 
                                  : "border-amber-300 bg-amber-50 text-amber-900 focus:ring-amber-500"
                              )}
                            >
                              <option value="">-- Selecione o produto --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.unit || "UN"})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity Input */}
                          <div className="w-20">
                            <input 
                              type="number" 
                              step="0.001"
                              value={line.quantity}
                              onChange={(e) => updateLineQty(line.id, parseFloat(e.target.value) || 0)}
                              className="w-full p-2 border border-gray-200 rounded-xl text-center font-bold text-blue-600 outline-none text-xs"
                            />
                          </div>

                          {/* Remove button */}
                          <button 
                            onClick={() => removeLine(line.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <X size={16} />
                          </button>

                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* STEP 4: SAVING */}
          {step === "SAVING" && (
            <div className="py-16 text-center space-y-3">
              <Loader2 size={36} className="animate-spin text-blue-600 mx-auto" />
              <h3 className="font-bold text-gray-800 text-lg">Registrando Movimentações...</h3>
              <p className="text-xs text-gray-500">Atualizando o estoque e gerando os relatórios de auditoria.</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition text-xs"
          >
            Cancelar
          </button>

          {step === "REVIEW" && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setStep("UPLOAD")}
                className="px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                Voltar
              </button>

              <button 
                onClick={handleConfirmBatch}
                disabled={scannedLines.filter(l => l.matchedProductId).length === 0}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center gap-2"
              >
                <PackageCheck size={16} />
                Confirmar Entradas ({scannedLines.filter(l => l.matchedProductId).length})
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
