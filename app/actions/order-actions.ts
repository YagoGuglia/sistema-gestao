"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/supabase/server";
import { executeGatewayRefund, GatewayProvider } from "@/lib/gateways/refund";

interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
  observation?: string;
}

export async function createManualOrder(data: {
  userId: string;
  orderType: string; // "RETIRADA" or "DELIVERY"
  paymentMethod?: string;
  depositAmount?: number;
  pixPaymentId?: string;
  status?: string;   // "RECEIVED", "PREPARING", "DONE"
  scheduledAt?: Date | null;
  deliveryFee: number;
  observation?: string;
  items: OrderItemInput[];
}) {
  try {
    const tenantId = await requireTenant();
    const totalItemsAmount = data.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalAmount = totalItemsAmount + data.deliveryFee;

    const order = await prisma.$transaction(async (tx) => {
      // Buscar custos atuais dos produtos para "travar" no momento da venda (snapshot)
      const products = await tx.product.findMany({
        where: { id: { in: data.items.map(i => i.productId) } },
        select: { id: true, costPrice: true }
      });
      const costMap = new Map(products.map(p => [p.id, p.costPrice]));

      // 1. Criar o pedido
      const newOrder = await tx.order.create({
        data: {
          tenantId,
          userId: data.userId,
          totalAmount,
          depositAmount: data.depositAmount || 0,
          paymentMethod: (data.paymentMethod || "PIX") as any,
          pixPaymentId: data.pixPaymentId || null,
          status: (data.status === "RECEIVED" ? "PENDING" : data.status || "PENDING") as any,
          isManual: true,
          orderType: data.orderType,
          scheduledAt: data.scheduledAt,
          deliveryFee: data.deliveryFee,
          observation: data.observation,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              costPrice: costMap.get(item.productId) || 0,
              observation: item.observation || null
            }))
          }
        }
      });

      // 2. Dar baixa no estoque do produto e das matérias-primas (Ficha Técnica)
      for (const item of data.items) {
        // Reduz estoque do produto final
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });

        // Registrar Log de saída de venda (Sales)
        await tx.stockLog.create({
          data: {
            tenantId,
            productId: item.productId,
            quantityChange: -Math.abs(item.quantity),
            type: "SALE",
            justification: `Venda via pedido manual #${newOrder.id}`
          }
        });

        // Reduzir estoques de matérias-primas baseados nas receitas (Ficha Técnica)
        const productWithRecipe = await tx.product.findUnique({
          where: { id: item.productId },
          include: { ingredients: true }
        });

        if (productWithRecipe?.ingredients && productWithRecipe.ingredients.length > 0) {
          for (const ing of productWithRecipe.ingredients) {
            const rawDeduction = ing.quantity * item.quantity;
            await tx.product.update({
              where: { id: ing.ingredientId },
              data: { stock: { decrement: rawDeduction } }
            });

            await tx.stockLog.create({
              data: {
                tenantId,
                productId: ing.ingredientId,
                quantityChange: -Math.abs(rawDeduction),
                type: "BOM_CONSUMPTION",
                justification: `Consumo de insumo na receita de "${productWithRecipe.name}" (Pedido #${newOrder.id})`
              }
            });
          }
        }
      }


      // 3. Se houver data agendada, cria o agendamento já confirmado
      if (data.scheduledAt) {
        const startTime = new Date(data.scheduledAt);
        const endTime = new Date(startTime.getTime() + 30 * 60000);

        await tx.appointment.create({
          data: {
            tenantId,
            userId: data.userId,
            orderId: newOrder.id,
            startTime,
            endTime,
            status: "CONFIRMED",
          },
        });
      }

      return newOrder;
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/agenda");
    revalidatePath("/admin/produtos");
    revalidatePath("/");
    
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return { error: "Falha ao registrar pedido." };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const normalizedStatus = status === "RECEIVED" ? "PENDING" : status === "DONE" ? "COMPLETED" : status;
    await prisma.order.update({
      where: { id: orderId },
      data: { status: normalizedStatus as any }
    });
    revalidatePath("/admin/pedidos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return { error: "Falha ao atualizar status." };
  }
}

export async function cancelOrder(orderId: string, justification: string) {
  if (!justification?.trim()) {
    return { error: "Justificativa é obrigatória para cancelar um pedido." };
  }
  try {
    const tenantId = await requireTenant();

    // Buscar pedido garantindo isolamento por tenantId (RLS)
    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: {
        items: true,
        tenant: {
          include: { settings: true },
        },
      },
    });

    if (!order) return { error: "Pedido não encontrado ou sem permissão." };
    if (order.status === "CANCELED" || (order.status as string) === "CANCELLED" || order.status === "REFUNDED") {
      return { error: "Pedido já está cancelado ou estornado." };
    }

    const settings = order.tenant?.settings;
    const limitHours = settings?.cancellationHoursLimit ?? 2;
    const hoursSinceCreation = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
    const isWithinRefundLimit = hoursSinceCreation <= limitHours;

    let refundStatusNote = "";
    let finalStatus: "CANCELED" | "REFUNDED" = "CANCELED";

    // Se o pedido tiver pagamento via gateway registrado e estiver dentro do limite de horas
    if (order.pixPaymentId && settings?.gatewayProvider && settings?.gatewayAccessToken) {
      if (isWithinRefundLimit) {
        const refundResult = await executeGatewayRefund({
          provider: settings.gatewayProvider as GatewayProvider,
          accessToken: settings.gatewayAccessToken,
          paymentId: order.pixPaymentId,
          amount: order.totalAmount,
          reason: justification,
        });

        if (refundResult.success) {
          finalStatus = "REFUNDED";
          refundStatusNote = `\n[ESTORNO AUTOMÁTICO REALIZADO VIA ${settings.gatewayProvider}] ID: ${refundResult.refundId}`;
        } else {
          refundStatusNote = `\n[ALERTA ESTORNO MANUAL NECESSÁRIO]: ${refundResult.message}`;
        }
      } else {
        refundStatusNote = `\n[PRAZO DE ESTORNO EXPIRADO]: Pedido cancelado após ${limitHours}h da criação. Estorno automático desativado.`;
      }
    }

    await prisma.$transaction(async (tx) => {
      // Atualizar status do pedido
      await tx.order.update({
        where: { id: orderId },
        data: { 
          status: finalStatus,
          observation: order.observation 
            ? `${order.observation}\n[CANCELADO] ${justification}${refundStatusNote}`
            : `[CANCELADO] ${justification}${refundStatusNote}`
        }
      });

      // Restaurar estoque de cada item
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
        await tx.stockLog.create({
          data: {
            tenantId: order.tenantId,
            productId: item.productId,
            quantityChange: Math.abs(item.quantity),
            type: "MANUAL",
            justification: `Estorno por cancelamento do pedido #${orderId.slice(-6).toUpperCase()} — ${justification}`
          }
        });
      }
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/produtos");
    revalidatePath("/admin/financeiro");
    revalidatePath("/");
    return { success: true, refunded: finalStatus === "REFUNDED", note: refundStatusNote };
  } catch (error: any) {
    console.error("Erro ao cancelar pedido:", error);
    return { error: error.message || "Falha ao cancelar pedido." };
  }
}
