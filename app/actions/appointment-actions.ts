"use server";

import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAppointments() {
  const tenantId = await requireTenant();
  return prisma.appointment.findMany({
    where: { tenantId },
    include: {
      user: { select: { name: true, phone: true } },
      staff: { select: { name: true } },
      order: { select: { totalAmount: true, depositAmount: true, status: true, pixPaymentId: true } }
    },
    orderBy: { startTime: "asc" },
  });
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
      include: { order: true }
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
          data: { status: "REFUNDED", observation: `Cancelado e Estornado: ${reason}` }
        });
      } else {
        // Fora do prazo: retém o sinal
        await prisma.order.update({
          where: { id: appointment.order.id },
          data: { observation: `Cancelamento tardio (Sem estorno). Motivo: ${reason}` }
        });
      }
    }

    await prisma.appointment.update({
      where: { id },
      data: { 
        status: "CANCELED", 
        notes: `Cancelado: ${reason} ${willRefund ? '(Estornado)' : '(Sem Estorno)'}`
      }
    });

    revalidatePath("/admin/agenda");
    return { success: true, refunded: willRefund };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao cancelar agendamento." };
  }
}
