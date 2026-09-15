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
      workDays: "MON,TUE,WED,THU,FRI,SAT",
      depositType: "OFF",
      depositPercentage: 0,
      cancellationHoursLimit: 2,
      enableCommissions: false,
      autoWhatsappEnabled: true,
    }
  });
  return settings;
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

  // Horários
  const openingTime = (formData.get("openingTime") as string) || "08:00";
  const closingTime = (formData.get("closingTime") as string) || "18:00";
  const workDays = (formData.get("workDays") as string) || "MON,TUE,WED,THU,FRI,SAT";

  // Agendamento & Cancelamento
  const defaultSchedulingEnabled = formData.get("defaultSchedulingEnabled") === "on";
  const depositType = (formData.get("depositType") as string) || "OFF";
  const depositPercentage = parseFloat(formData.get("depositPercentage") as string) || 0;
  const cancellationHoursLimit = parseInt(formData.get("cancellationHoursLimit") as string) || 2;

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
      // Agendamento
      defaultSchedulingEnabled,
      depositType,
      depositPercentage,
      cancellationHoursLimit,
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
}
