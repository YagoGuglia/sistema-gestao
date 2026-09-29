import { prisma } from "@/lib/prisma";

export const WEEK_DAYS_MAP: Record<number, string> = {
  0: "DOM",
  1: "SEG",
  2: "TER",
  3: "QUA",
  4: "QUI",
  5: "SEX",
  6: "SAB",
};

export const OLD_TO_NEW_DAYS: Record<string, string> = {
  SUN: "DOM",
  MON: "SEG",
  TUE: "TER",
  WED: "QUA",
  THU: "QUI",
  FRI: "SEX",
  SAT: "SAB",
};

/**
 * Normaliza lista de dias configurados
 */
export function normalizeDays(daysString?: string | null): string[] {
  if (!daysString) return ["SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
  return daysString
    .split(",")
    .map((d) => d.trim().toUpperCase())
    .map((d) => OLD_TO_NEW_DAYS[d] || d);
}

/**
 * Verifica se a data está dentro do período máximo permitido
 */
export function isWithinAllowedPeriod(date: Date, period?: string | null): boolean {
  const p = period || "ALWAYS";
  if (p === "ALWAYS") return true;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return false;

  if (p === "1_WEEK") return diffDays <= 7;
  if (p === "2_WEEKS") return diffDays <= 14;
  if (p === "3_WEEKS") return diffDays <= 21;
  if (p === "MONTH") {
    return target.getMonth() === now.getMonth() && target.getFullYear() === now.getFullYear();
  }

  return true;
}

/**
 * Calcula a duração total do pedido a partir dos itens
 */
export async function calculateOrderDuration(
  tenantId: string,
  items: { id: string; quantity: number }[]
): Promise<number> {
  const settings = await prisma.globalSettings.findUnique({
    where: { tenantId },
    select: { slotIntervalMin: true },
  });
  const defaultInterval = settings?.slotIntervalMin || 30;

  if (!items || items.length === 0) return defaultInterval;

  const products = await prisma.product.findMany({
    where: {
      tenantId,
      id: { in: items.map((i) => i.id) },
    },
    select: {
      id: true,
      isService: true,
      durationMin: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalServiceDuration = 0;
  let hasService = false;

  for (const item of items) {
    const prod = productMap.get(item.id);
    if (prod && prod.isService) {
      hasService = true;
      const duration = prod.durationMin || defaultInterval;
      totalServiceDuration += duration * item.quantity;
    }
  }

  if (hasService && totalServiceDuration > 0) {
    return totalServiceDuration;
  }

  // Para produtos físicos (entrega ou retirada agendada), utiliza o intervalo configurado pelo lojista
  return defaultInterval;
}

/**
 * Busca todos os horários livres de uma loja para um determinado dia
 */
export async function getAvailableSlotsForDate({
  tenantId,
  dateStr, // "YYYY-MM-DD"
  durationMin,
}: {
  tenantId: string;
  dateStr: string;
  durationMin: number;
}) {
  const settings = await prisma.globalSettings.findUnique({
    where: { tenantId },
  });

  if (!settings || !settings.defaultSchedulingEnabled) {
    return {
      enabled: false,
      availableSlots: [],
      reason: "Agendamentos desabilitados para esta loja.",
    };
  }

  // Constrói a data no fuso local
  const [year, month, day] = dateStr.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeekStr = WEEK_DAYS_MAP[targetDate.getDay()];
  const allowedDays = normalizeDays(settings.schedulingDays);

  if (!allowedDays.includes(dayOfWeekStr)) {
    return {
      enabled: true,
      isDayAllowed: false,
      availableSlots: [],
      reason: "A loja não realiza atendimentos ou entregas neste dia da semana.",
    };
  }

  if (!isWithinAllowedPeriod(targetDate, settings.schedulingPeriod)) {
    return {
      enabled: true,
      isDayAllowed: false,
      availableSlots: [],
      reason: "Data fora do limite de agendamento permitido.",
    };
  }

  const slotInterval = settings.slotIntervalMin || 30;
  const startTimeStr = settings.schedulingStartTime || "08:00";
  const endTimeStr = settings.schedulingEndTime || "18:00";

  const [startHour, startMin] = startTimeStr.split(":").map(Number);
  const [endHour, endMin] = endTimeStr.split(":").map(Number);

  const dayStartMinutes = startHour * 60 + startMin;
  const dayEndMinutes = endHour * 60 + endMin;

  // Busca equipe ativa
  const staffMembers = await prisma.staff.findMany({
    where: { tenantId, isActive: true },
    select: { id: true, name: true },
  });

  // Início e fim do dia para consulta de agendamentos
  const dayStartUtc = new Date(year, month - 1, day, 0, 0, 0);
  const dayEndUtc = new Date(year, month - 1, day, 23, 59, 59);

  // Busca agendamentos ativos no dia (SCHEDULED e CONFIRMED bloqueiam a grade; CANCELED libera!)
  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      status: { in: ["SCHEDULED", "CONFIRMED"] },
      startTime: { lte: dayEndUtc },
      endTime: { gte: dayStartUtc },
    },
    select: {
      id: true,
      staffId: true,
      startTime: true,
      endTime: true,
      status: true,
    },
  });

  const now = new Date();
  const availableSlots: string[] = [];

  for (let currentMinutes = dayStartMinutes; currentMinutes < dayEndMinutes; currentMinutes += slotInterval) {
    const slotStartHour = Math.floor(currentMinutes / 60);
    const slotStartMinute = currentMinutes % 60;

    const slotStartTime = new Date(year, month - 1, day, slotStartHour, slotStartMinute, 0);
    const slotEndTime = new Date(slotStartTime.getTime() + durationMin * 60000);

    // O slot não pode ultrapassar o horário de encerramento
    const endMinutesOfSlot = currentMinutes + durationMin;
    if (endMinutesOfSlot > dayEndMinutes) {
      continue;
    }

    // Não permite horários passados
    if (slotStartTime.getTime() <= now.getTime()) {
      continue;
    }

    // Checagem de Concorrência e Conflitos
    if (staffMembers.length > 0) {
      // Loja possui profissionais: verificar se há pelo menos um profissional livre
      const availableStaff = staffMembers.filter((staff) => {
        const hasConflict = appointments.some(
          (apt) =>
            apt.staffId === staff.id &&
            apt.startTime < slotEndTime &&
            apt.endTime > slotStartTime
        );
        return !hasConflict;
      });

      if (availableStaff.length > 0) {
        const formattedTime = `${String(slotStartHour).padStart(2, "0")}:${String(slotStartMinute).padStart(2, "0")}`;
        availableSlots.push(formattedTime);
      }
    } else {
      // Loja trabalha sem profissionais cadastrados (proprietário solo, capacidade = 1)
      const hasConflict = appointments.some(
        (apt) => apt.startTime < slotEndTime && apt.endTime > slotStartTime
      );

      if (!hasConflict) {
        const formattedTime = `${String(slotStartHour).padStart(2, "0")}:${String(slotStartMinute).padStart(2, "0")}`;
        availableSlots.push(formattedTime);
      }
    }
  }

  return {
    enabled: true,
    isDayAllowed: true,
    slotIntervalMin: slotInterval,
    durationMin,
    availableSlots,
  };
}

/**
 * Validação atômica de um agendamento antes de salvar o pedido
 */
export async function validateAppointmentSlot({
  tenantId,
  scheduledAt,
  durationMin,
}: {
  tenantId: string;
  scheduledAt: Date;
  durationMin: number;
}) {
  const settings = await prisma.globalSettings.findUnique({
    where: { tenantId },
  });

  if (!settings || !settings.defaultSchedulingEnabled) {
    return { valid: false, error: "Agendamentos estão desativados neste estabelecimento." };
  }

  const now = new Date();
  if (scheduledAt.getTime() <= now.getTime()) {
    return { valid: false, error: "O horário de agendamento não pode ser no passado." };
  }

  // Verifica período
  if (!isWithinAllowedPeriod(scheduledAt, settings.schedulingPeriod)) {
    return { valid: false, error: "A data escolhida ultrapassa o período de agendamento permitido." };
  }

  // Verifica dia da semana
  const dayOfWeekStr = WEEK_DAYS_MAP[scheduledAt.getDay()];
  const allowedDays = normalizeDays(settings.schedulingDays);
  if (!allowedDays.includes(dayOfWeekStr)) {
    return { valid: false, error: "O estabelecimento não realiza atendimentos neste dia da semana." };
  }

  // Verifica horário de funcionamento
  const startTimeStr = settings.schedulingStartTime || "08:00";
  const endTimeStr = settings.schedulingEndTime || "18:00";

  const [startHour, startMin] = startTimeStr.split(":").map(Number);
  const [endHour, endMin] = endTimeStr.split(":").map(Number);

  const slotMinutes = scheduledAt.getHours() * 60 + scheduledAt.getMinutes();
  const allowedStartMinutes = startHour * 60 + startMin;
  const allowedEndMinutes = endHour * 60 + endMin;

  if (slotMinutes < allowedStartMinutes || slotMinutes + durationMin > allowedEndMinutes) {
    return {
      valid: false,
      error: `Horário fora do expediente permitido (${startTimeStr} às ${endTimeStr}).`,
    };
  }

  const endTime = new Date(scheduledAt.getTime() + durationMin * 60000);

  // Busca equipe ativa
  const staffMembers = await prisma.staff.findMany({
    where: { tenantId, isActive: true },
    select: { id: true, name: true, commissionRate: true },
  });

  // Busca conflitos
  const overlappingAppointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      status: { in: ["SCHEDULED", "CONFIRMED"] },
      startTime: { lt: endTime },
      endTime: { gt: scheduledAt },
    },
    select: {
      id: true,
      staffId: true,
    },
  });

  let assignedStaffId: string | null = null;
  let commissionRate = 0;

  if (staffMembers.length > 0) {
    const freeStaff = staffMembers.filter(
      (s) => !overlappingAppointments.some((apt) => apt.staffId === s.id)
    );

    if (freeStaff.length === 0) {
      return {
        valid: false,
        error: "Todos os profissionais estão ocupados neste horário. Por favor, escolha outro horário.",
      };
    }

    assignedStaffId = freeStaff[0].id;
    commissionRate = freeStaff[0].commissionRate || 0;
  } else {
    // Capacidade = 1
    if (overlappingAppointments.length > 0) {
      return {
        valid: false,
        error: "Este horário já está reservado ou em processo de aprovação. Por favor, selecione outro horário.",
      };
    }
  }

  return {
    valid: true,
    startTime: scheduledAt,
    endTime,
    staffId: assignedStaffId,
    commissionRate,
    durationMin,
  };
}
