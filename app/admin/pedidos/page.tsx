import { prisma } from "@/lib/prisma";
import { Plus, PackageSearch, MapPin, Calendar, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { OrderActions } from "@/components/OrderActions";

export default async function PedidosPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: {
        include: { product: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="text-blue-600" />
            Central de Pedidos
          </h1>
          <p className="text-sm text-gray-500 font-medium">Histórico de vendas manuais e deliveries.</p>
        </div>
        
        <Link 
          href="/admin/pedidos/novo"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Lançar Pedido
        </Link>
      </header>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
             <PackageSearch size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhum pedido lançado</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Comece a registrar suas vendas e entregas clicando no botão acima para lançar o primeiro pedido.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              
              <div className="flex gap-4">
                 <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 border border-gray-100 bg-gray-50">
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Dia</span>
                    <span className="text-lg font-black text-blue-600">{new Date(order.createdAt).getDate().toString().padStart(2, '0')}</span>
                 </div>
                 
                 <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                       {order.user.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                       <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          order.status === "RECEIVED" || order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                          order.status === "PREPARING" ? "bg-orange-100 text-orange-700" :
                          order.status === "DONE" || order.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                          order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {order.status === "RECEIVED" || order.status === "PENDING" ? "Recebido" :
                           order.status === "PREPARING" ? "Preparando" :
                           order.status === "DONE" || order.status === "COMPLETED" ? "Finalizado" :
                           order.status === "CANCELLED" ? "Cancelado" : order.status}
                        </span>
                       <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          order.orderType === "DELIVERY" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {order.orderType === "DELIVERY" ? <MapPin size={10} /> : <PackageSearch size={10} />}
                          {order.orderType}
                        </span>
                       {order.items.length > 0 && (
                         <span className="text-[10px] text-gray-400 font-medium">
                           {order.items.reduce((acc, i) => acc + i.quantity, 0)} itens
                         </span>
                       )}
                    </div>
                    {order.observation && (
                      <p className="text-[11px] text-gray-400 mt-1 italic line-clamp-1">
                        📝 {order.observation}
                      </p>
                    )}
                 </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 md:gap-8 w-full md:w-auto">
                 {order.scheduledAt && (
                   <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                     <Calendar size={14} />
                     <span className="font-bold">{new Date(order.scheduledAt).toLocaleString('pt-BR', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                   </div>
                 )}

                 <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-xl font-black text-gray-900">
                       {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount)}
                    </p>
                 </div>

                 <OrderActions 
                    orderId={order.id} 
                    currentStatus={order.status} 
                    userPhone={order.user.phone}
                    totalAmount={order.totalAmount}
                 />
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
