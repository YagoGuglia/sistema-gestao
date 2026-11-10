import { prisma } from "@/lib/prisma";
import { Plus, PackageSearch, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { requireTenant } from "@/lib/supabase/server";
import { OrdersKanbanClient } from "@/components/admin/OrdersKanbanClient";

export default async function PedidosPage() {
  const tenantId = await requireTenant();

  const [orders, settings] = await Promise.all([
    prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
    }),
    prisma.globalSettings.findUnique({
      where: { tenantId },
      select: { notificationAudioInterval: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="text-blue-600" />
            Central de Pedidos
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Histórico de vendas, alertas em tempo real e deliveries.
          </p>
        </div>

        <Link
          href="/admin/pedidos/novo"
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg active:scale-95 text-sm"
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
        <OrdersKanbanClient
          initialOrders={orders as any}
          audioIntervalSeconds={settings?.notificationAudioInterval || 0}
        />
      )}
    </div>
  );
}
