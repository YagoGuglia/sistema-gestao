"use server";

import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getAvailableSlotsForDate } from "@/lib/scheduling";

export async function getAppointments() {
  const tenantId = await requireTenant();
  return prisma.appointment.findMany({
    where: { tenantId },
    include: {
      user: { select: { name: true, phone: true } },
      staff: { select: { id: true, name: true } },
      order: {
        select: {
          id: true,
          totalAmount: true,
          depositAmount: true,
          status: true,
          pixPaymentId: true,
          orderType: true,
          items: {
            select: {
              quantity: true,
              product: { select: { name: true, isService: true } },
            },
          },
        },
      },
    },
    orderBy: { startTime: "asc" },
  });
}

/**
 * Consulta pública de horários disponíveis chamada pelo checkout da loja
 */
export async function getStoreAvailableSlots(slug: string, dateStr: string, durationMin: number) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!tenant) {
      return { error: "Loja não encontrada." };
    }

    const result = await getAvailableSlotsForDate({
      tenantId: tenant.id,
      dateStr,
      durationMin,
    });

    return result;
  } catch (error: any) {
    console.error("Erro ao buscar horários disponíveis:", error);
    return { error: "Falha ao calcular horários disponíveis." };
  }
}

/**
 * Lojista aceita o agendamento
 */
export async function acceptAppointment(id: string) {
  const tenantId = await requireTenant();
  try {
    const apt = await prisma.appointment.update({
      where: { id, tenantId },
      data: { status: "CONFIRMED" },
      include: { order: true },
    });

    if (apt.orderId) {
      await prisma.order.update({
        where: { id: apt.orderId },
        data: { status: "PREPARING" },
      });
    }

    revalidatePath("/admin/agenda");
    revalidatePath("/admin/pedidos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao aceitar agendamento:", error);
    return { error: "Falha ao aceitar agendamento." };
  }
}

/**
 * Lojista recusa o agendamento (libera o horário imediatamente)
 */
export async function rejectAppointment(id: string, reason?: string) {
  const tenantId = await requireTenant();
  try {
    const justification = reason?.trim() || "Horário indisponível no momento";

    const apt = await prisma.appointment.update({
      where: { id, tenantId },
      data: {
        status: "CANCELED",
        notes: `Recusado pelo lojista: ${justification}`,
      },
      include: { order: true },
    });

    if (apt.orderId) {
      await prisma.order.update({
        where: { id: apt.orderId },
        data: {
          status: "CANCELLED",
          observation: `[RECUSADO] ${justification}`,
        },
      });
    }

    revalidatePath("/admin/agenda");
    revalidatePath("/admin/pedidos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao recusar agendamento:", error);
    return { error: "Falha ao recusar agendamento." };
  }
}

export async function updateAppointmentStatus(id: string, status: string, notes?: string) {
  const tenantId = await requireTenant();
  try {
    await prisma.appointment.update({
      where: { id, tenantId },
      data: { status, notes },
    });
    revalidatePath("/admin/agenda");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao atualizar agendamento." };
  }
}

export async function cancelAppointment(id: string, reason: string) {
  const tenantId = await requireTenant();
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id, tenantId },
      include: { order: true },
    });

    if (!appointment) return { error: "Agendamento não encontrado." };

    const settings = await prisma.globalSettings.findUnique({ where: { tenantId } });
    const limitHours = settings?.cancellationHoursLimit || 2;

    const now = new Date();
    const diffHours = (appointment.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let willRefund = false;

    // Se o cliente pagou sinal e cancelou dentro do prazo, nós estornamos
    if (appointment.order && appointment.order.depositAmount > 0) {
      if (diffHours >= limitHours) {
        willRefund = true;
        // TODO: Chamar API do Gateway (Mercado Pago/Asaas) passando appointment.order.pixPaymentId para estorno automático
        console.log("ESTORNO AUTOMÁTICO INICIADO PARA PIX ID:", appointment.order.pixPaymentId);

        await prisma.order.update({
          where: { id: appointment.order.id },
          data: { status: "REFUNDED", observation: `Cancelado e Estornado: ${reason}` },
        });
      } else {
        // Fora do prazo: retém o sinal
        await prisma.order.update({
          where: { id: appointment.order.id },
          data: { observation: `Cancelamento tardio (Sem estorno). Motivo: ${reason}` },
        });
      }
    }

    await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELED",
        notes: `Cancelado: ${reason} ${willRefund ? "(Estornado)" : "(Sem Estorno)"}`,
      },
    });

    revalidatePath("/admin/agenda");
    return { success: true, refunded: willRefund };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao cancelar agendamento." };
  }
}
