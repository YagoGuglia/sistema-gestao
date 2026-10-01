"use server";

import { prisma } from "@/lib/prisma";
import { calculateOrderDuration, validateAppointmentSlot } from "@/lib/scheduling";

interface CheckoutData {
  slug: string;
  items: { id: string; price: number; quantity: number; observation?: string }[];
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
      include: { settings: true },
    });

    if (!tenant) throw new Error("Loja não encontrada");

    const tenantId = tenant.id;

    // Se o cliente escolheu um horário, valida antecipadamente antes de iniciar a transação
    let scheduleValidation: any = null;
    let orderDurationMin = 30;

    if (data.scheduledAt && tenant.settings?.defaultSchedulingEnabled) {
      const scheduledDate = new Date(data.scheduledAt);
      orderDurationMin = await calculateOrderDuration(tenantId, data.items);

      scheduleValidation = await validateAppointmentSlot({
        tenantId,
        scheduledAt: scheduledDate,
        durationMin: orderDurationMin,
      });

      if (!scheduleValidation.valid) {
        return { error: scheduleValidation.error };
      }
    }

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
        role: "CUSTOMER",
      },
    });

    const totalItemsAmount = data.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = data.orderType === "DELIVERY" ? tenant.settings?.defaultDeliveryFee || 0 : 0;
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
        },
      });

      for (const item of data.items) {
        // Create OrderItem
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            observation: item.observation || null,
          },
        });

        // Update Stock and create Log
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.stockLog.create({
          data: {
            tenantId,
            productId: item.id,
            quantityChange: -Math.abs(item.quantity),
            type: "SALE",
            justification: `Venda via Vitrine #${order.id}`,
          },
        });

        // Deduct Raw Material Ingredients (BOM)
        const productWithRecipe = await tx.product.findUnique({
          where: { id: item.id },
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
                justification: `Consumo de insumo na receita de "${productWithRecipe.name}" (Pedido #${order.id})`
              }
            });
          }
        }
      }


      // Se houver agendamento validado, cria o appointment
      if (data.scheduledAt && scheduleValidation && scheduleValidation.valid) {
        // Calcula valor da comissão se aplicável
        let commissionValue = 0;
        if (tenant.settings?.enableCommissions && scheduleValidation.commissionRate > 0) {
          commissionValue = Math.round((totalItemsAmount * (scheduleValidation.commissionRate / 100)) * 100) / 100;
        }

        await tx.appointment.create({
          data: {
            tenantId,
            userId: user.id,
            orderId: order.id,
            staffId: scheduleValidation.staffId,
            startTime: scheduleValidation.startTime,
            endTime: scheduleValidation.endTime,
            status: "SCHEDULED", // Aguardando aceite do lojista
            commission: commissionValue,
          },
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

