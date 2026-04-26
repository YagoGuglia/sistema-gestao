import { prisma } from "@/lib/prisma";
import { OrderForm } from "@/components/OrderForm";

export default async function NovoPedidoPage() {
  const products = await prisma.product.findMany({
    where: { isRawMaterial: false },
    orderBy: { name: 'asc' }
  });

  const settings = await prisma.globalSettings.findUnique({
    where: { id: "default" }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Lançar Novo Pedido</h1>
        <p className="text-sm text-gray-500 font-medium">Registre vendas ou agende entregas para seus clientes.</p>
      </header>

      <OrderForm 
        availableProducts={products} 
        defaultDeliveryFee={settings?.defaultDeliveryFee || 0}
        decimalSeparator={settings?.decimalSeparator || "."}
        defaultSchedulingEnabled={settings?.defaultSchedulingEnabled ?? false}
      />
    </div>
  );
}
