import { getProduct } from "@/app/actions/product-actions";
import { getStockLogs } from "@/app/actions/stock-actions";
import { 
  ArrowLeft, 
  History, 
  Plus, 
  AlertCircle,
  Package
} from "lucide-react";
import Link from "next/link";
import { StockAdjustmentForm } from "@/components/StockAdjustmentForm";
import { cn } from "@/lib/utils";

interface StockLog {
  id: string;
  quantityChange: number;
  justification: string;
  createdAt: Date;
}

export default async function AjusteEstoquePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  const logs = await getStockLogs(id) as StockLog[];

  if (!product) return (
    <div className="p-20 text-center">
      <h1 className="text-xl font-bold text-gray-800">Produto não encontrado.</h1>
      <Link href="/admin/produtos" className="text-blue-600 hover:underline mt-4 inline-block">Voltar para o estoque</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <header className="flex items-center gap-4">
        <Link 
          href="/admin/produtos"
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Movimentar Estoque</h1>
          <p className="text-sm text-gray-500 font-medium">{product.name}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lado Esquerdo: Formulário */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                     <Plus size={20} />
                  </div>
                  <h2 className="font-bold text-gray-800">Nova Movimentação</h2>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Saldo Disponível</p>
                  <p className="text-xl font-black text-gray-900">{product.stock} <span className="text-xs font-bold text-gray-400">un</span></p>
               </div>
            </div>
            
            <div className="p-8">
               <StockAdjustmentForm productId={product.id} />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start shadow-sm shadow-blue-50/50">
             <AlertCircle className="text-blue-600 shrink-0" size={20} />
             <div className="text-xs text-blue-800 leading-relaxed font-medium">
                <strong>Controle Auditável:</strong> Toda alteração manual requer uma justificativa clara. 
                Isso ajuda a manter a transparência e o controle total do seu estoque.
             </div>
          </div>
        </div>

        {/* Lado Direito: Histórico Recente */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
             <History size={16} className="text-gray-400" />
             <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest">Últimos Eventos</h3>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {logs.length === 0 ? (
               <div className="p-16 text-center text-gray-300">
                  <Package size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs italic font-medium">Sem registros.</p>
               </div>
            ) : logs.map((log) => (
               <div key={log.id} className="p-4 hover:bg-gray-50/50 transition group">
                  <div className="flex items-center justify-between mb-1">
                     <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter shadow-sm",
                        log.quantityChange > 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
                     )}>
                        {log.quantityChange > 0 ? "+" : ""}{log.quantityChange} UN
                     </span>
                     <span className="text-[10px] text-gray-300 font-bold group-hover:text-gray-400 transition">
                        {new Intl.DateTimeFormat('pt-BR').format(new Date(log.createdAt))}
                     </span>
                  </div>
                  <p className="text-[11px] text-gray-600 font-medium line-clamp-2">"{log.justification}"</p>
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
