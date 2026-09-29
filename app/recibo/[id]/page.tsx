import { ReceiptViewer } from "@/components/ReceiptViewer";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";

export default async function ReciboPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let orderData: {
    totalAmount?: number;
    status?: string;
    storeName?: string;
    storeWhatsApp?: string | null;
    storeSlug?: string | null;
  } = {};

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        tenant: {
          include: {
            settings: true,
          },
        },
      },
    });

    if (order) {
      orderData = {
        totalAmount: order.totalAmount,
        status: order.status,
        storeName: order.tenant.settings?.companyName || order.tenant.name,
        storeWhatsApp: order.tenant.settings?.whatsappNumber || null,
        storeSlug: order.tenant.slug,
      };
    }
  } catch (error) {
    console.error("Erro ao carregar detalhes do pedido para o recibo:", error);
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Carregando recibo...</div>}>
      <ReceiptViewer
        orderId={id}
        totalAmount={orderData.totalAmount}
        status={orderData.status}
        storeName={orderData.storeName}
        storeWhatsApp={orderData.storeWhatsApp}
        storeSlug={orderData.storeSlug}
      />
    </Suspense>
  );
}
