"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
  observation?: string;
}

export async function createManualOrder(data: {
  tenantId: string;
  userId: string;
  orderType: string; // "RETIRADA" or "DELIVERY"
  status?: string;   // "RECEIVED", "PREPARING", "DONE"
  scheduledAt?: Date | null;
  deliveryFee: number;
  observation?: string;
  items: OrderItemInput[];
}) {
  try {
    const totalItemsAmount = data.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalAmount = totalItemsAmount + data.deliveryFee;

    const order = await prisma.$transaction(async (tx) => {
      // 1. Criar o pedido
      const newOrder = await tx.order.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          totalAmount,
          status: data.status || "RECEIVED",
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
              observation: item.observation || null
            }))
          }
        }
      });

      // 2. Dar baixa no estoque e criar Logs
      for (const item of data.items) {
        // Reduz estoque do produto final
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });

        // Registrar Log de saída de venda (Sales)
        await tx.stockLog.create({
          data: {
            tenantId: data.tenantId,
            productId: item.productId,
            quantityChange: -Math.abs(item.quantity),
            type: "SALE",
            justification: `Venda via pedido manual #${newOrder.id}`
          }
        });

        // TODO: Reduzir estoques de matérias primas baseados nas receitas se necessário
        // Depende de como a logística da empresa foi planejada
      }

      return newOrder;
    });

    revalidatePath("/admin/pedidos");
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
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
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
    // Get order items to restore stock
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) return { error: "Pedido não encontrado." };
    if (order.status === "CANCELLED") return { error: "Pedido já está cancelado." };

    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { 
          status: "CANCELLED",
          observation: order.observation 
            ? `${order.observation}\n[CANCELADO] ${justification}`
            : `[CANCELADO] ${justification}`
        }
      });

      // Restore stock for each item
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
        await tx.stockLog.create({
          data: {
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
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    return { error: "Falha ao cancelar pedido." };
  }
}
