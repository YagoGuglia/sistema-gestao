"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/supabase/server";

export async function getGlobalSettings() {
  const tenantId = await requireTenant();
  const settings = await prisma.globalSettings.upsert({
    where: { tenantId },
    update: {},
    create: {
      tenantId,
      companyName: "Minha Loja",
      defaultMinStock: 10,
      decimalSeparator: ".",
      defaultDeliveryFee: 0,
      defaultSchedulingEnabled: true,
      primaryColor: "#7C3AED",
      businessType: "BOTH",
      openingTime: "08:00",
      closingTime: "18:00",
      workDays: "DOM,SEG,TER,QUA,QUI,SEX,SAB",
      operatingHours: JSON.stringify([{ start: "08:00", end: "18:00" }]),
      isStoreOpen: true,
      isRegisterOpen: false,
      schedulingDays: "SEG,TER,QUA,QUI,SEX,SAB",
      schedulingStartTime: "08:00",
      schedulingEndTime: "18:00",
      schedulingPeriod: "ALWAYS",
      depositType: "OFF",
      depositPercentage: 0,
      cancellationHoursLimit: 2,
      enableCommissions: false,
      autoWhatsappEnabled: true,
    }
  });
  return settings;
}

export async function updateStoreAndRegisterStatus({
  isStoreOpen,
  isRegisterOpen,
}: {
  isStoreOpen?: boolean;
  isRegisterOpen?: boolean;
}) {
  const tenantId = await requireTenant();

  const dataToUpdate: Record<string, any> = {};
  if (typeof isStoreOpen === "boolean") {
    dataToUpdate.isStoreOpen = isStoreOpen;
  }
  if (typeof isRegisterOpen === "boolean") {
    dataToUpdate.isRegisterOpen = isRegisterOpen;
  }

  await prisma.globalSettings.update({
    where: { tenantId },
    data: dataToUpdate,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/config");
  revalidatePath("/loja/[slug]", "layout");
  revalidatePath("/");

  return { success: true };
}

export async function updateGlobalSettings(formData: FormData) {
  const tenantId = await requireTenant();

  // Legacy fields
  const defaultMinStock = parseFloat(formData.get("defaultMinStock") as string) || 10;
  const decimalSeparator = formData.get("decimalSeparator") as string || ".";
  const rawDeliveryFee = formData.get("defaultDeliveryFee") as string;
  const cleanFee = decimalSeparator === "," ? rawDeliveryFee?.replace(",", ".") : rawDeliveryFee;
  const defaultDeliveryFee = parseFloat(cleanFee) || 0;

  // Marca & Identidade
  const companyName = (formData.get("companyName") as string) || "Minha Loja";
  const companyLogoUrl = formData.get("companyLogoUrl") as string || null;
  const bannerUrl = formData.get("bannerUrl") as string || null;
  const primaryColor = (formData.get("primaryColor") as string) || "#7C3AED";
  const businessType = (formData.get("businessType") as string) || "BOTH";

  // Horários e Intervalos
  const openingTime = (formData.get("openingTime") as string) || "08:00";
  const closingTime = (formData.get("closingTime") as string) || "18:00";
  const workDays = (formData.get("workDays") as string) || "DOM,SEG,TER,QUA,QUI,SEX,SAB";
  const operatingHours = (formData.get("operatingHours") as string) || JSON.stringify([{ start: openingTime, end: closingTime }]);

  // Agendamento & Cancelamento
  const defaultSchedulingEnabled = formData.get("defaultSchedulingEnabled") === "on";
  const deliverySchedulingEnabled = formData.get("deliverySchedulingEnabled") === "on";
  const slotIntervalMin = parseInt(formData.get("slotIntervalMin") as string) || 30;
  const depositType = (formData.get("depositType") as string) || "OFF";
  const depositPercentage = parseFloat(formData.get("depositPercentage") as string) || 0;
  const cancellationHoursLimit = parseInt(formData.get("cancellationHoursLimit") as string) || 2;
  const schedulingDays = (formData.get("schedulingDays") as string) || "SEG,TER,QUA,QUI,SEX,SAB";
  const schedulingStartTime = (formData.get("schedulingStartTime") as string) || "08:00";
  const schedulingEndTime = (formData.get("schedulingEndTime") as string) || "18:00";
  const schedulingPeriod = (formData.get("schedulingPeriod") as string) || "ALWAYS";

  // Comissões
  const enableCommissions = formData.get("enableCommissions") === "on";

  // Gateway & Integrações
  const gatewayProvider = formData.get("gatewayProvider") as string || null;
  const gatewayAccessToken = formData.get("gatewayAccessToken") as string || null;
  const pixKey = formData.get("pixKey") as string || null;
  const whatsappNumber = formData.get("whatsappNumber") as string || null;
  const autoWhatsappEnabled = formData.get("autoWhatsappEnabled") === "on";

  await prisma.globalSettings.update({
    where: { tenantId },
    data: {
      // Legacy
      defaultMinStock,
      decimalSeparator,
      defaultDeliveryFee,
      // Marca
      companyName,
      companyLogoUrl,
      bannerUrl,
      primaryColor,
      businessType,
      // Horários
      openingTime,
      closingTime,
      workDays,
      operatingHours,
      // Agendamento
      defaultSchedulingEnabled,
      deliverySchedulingEnabled,
      slotIntervalMin,
      depositType,
      depositPercentage,
      cancellationHoursLimit,
      schedulingDays,
      schedulingStartTime,
      schedulingEndTime,
      schedulingPeriod,
      // Comissões
      enableCommissions,
      // Gateway
      gatewayProvider,
      gatewayAccessToken,
      pixKey,
      whatsappNumber,
      autoWhatsappEnabled,
    }
  });

  revalidatePath("/admin/config");
  revalidatePath("/admin/pedidos/novo");
  revalidatePath("/admin/empresa");
  revalidatePath("/admin");
  revalidatePath("/loja/[slug]", "layout");
}
