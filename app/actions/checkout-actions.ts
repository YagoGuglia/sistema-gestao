"use server";

import { prisma } from "@/lib/prisma";

interface CheckoutData {
  slug: string;
  items: { id: string; price: number; quantity: number }[];
  customer: {
    name: string;
    phone: string;
    address?: string;
    neighborhood?: string;
    city?: string;
  };
  orderType: "DELIVERY" | "RETIRADA";
  scheduledAt?: string | null;
}

export async function processCheckout(data: CheckoutData) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: data.slug },
      include: { settings: true }
    });

    if (!tenant) throw new Error("Loja não encontrada");

    const tenantId = tenant.id;

    // Upsert Customer
    const user = await prisma.user.upsert({
      where: { tenantId_phone: { tenantId, phone: data.customer.phone } },
      update: {
        name: data.customer.name,
        address: data.customer.address,
        neighborhood: data.customer.neighborhood,
        city: data.customer.city,
      },
      create: {
        tenantId,
        name: data.customer.name,
        phone: data.customer.phone,
        address: data.customer.address,
        neighborhood: data.customer.neighborhood,
        city: data.customer.city,
        role: "CUSTOMER"
      }
    });

    const totalItemsAmount = data.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = data.orderType === "DELIVERY" ? (tenant.settings?.defaultDeliveryFee || 0) : 0;
    const totalAmount = totalItemsAmount + deliveryFee;

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          tenantId,
          userId: user.id,
          totalAmount,
          status: "RECEIVED",
          isManual: false,
          orderType: data.orderType,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          deliveryFee,
        }
      });

      for (const item of data.items) {
        // Create OrderItem
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }
        });

        // Update Stock and create Log
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } }
        });

        await tx.stockLog.create({
          data: {
            tenantId,
            productId: item.id,
            quantityChange: -Math.abs(item.quantity),
            type: "SALE",
            justification: `Venda via Vitrine #${order.id}`
          }
        });
      }

      // Se houver agendamento, cria o appointment
      if (data.scheduledAt && tenant.settings?.defaultSchedulingEnabled) {
        const startTime = new Date(data.scheduledAt);
        // Exemplo: Reserva um bloco de 30 minutos
        const endTime = new Date(startTime.getTime() + 30 * 60000); 

        await tx.appointment.create({
          data: {
            tenantId,
            userId: user.id,
            orderId: order.id,
            startTime,
            endTime,
            status: "SCHEDULED"
          }
        });
      }

      return order;
    });

    return { success: true, orderId: newOrder.id };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Erro ao processar o pedido" };
  }
}
