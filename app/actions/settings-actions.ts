"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/supabase/server";
import { z } from "zod";

const VisualSettingsSchema = z.object({
  storeFontFamily: z.string().default("Inter"),
  storeSlogan: z
    .string()
    .max(45, "A frase de efeito / slogan deve ter no máximo 45 caracteres.")
    .nullable()
    .optional(),
  bannerOpacity: z.number().min(0.1).max(1.0).default(1.0),
  useSolidColorForHeader: z.boolean().default(false),
  primaryColor: z.string().default("#7C3AED"),
  storeNameColor: z.string().optional(),
  storeSloganColor: z.string().optional(),
  storeAddress: z.string().nullable().optional(),
  breakInterval: z.string().nullable().optional(),
  showHoursInCard: z.boolean().default(true),
  showSchedulingHoursInCard: z.boolean().default(false),
  showAddressInCard: z.boolean().default(true),
  showBreakIntervalInCard: z.boolean().default(false),
  showRatingInCard: z.boolean().default(true),
});

export async function updateStoreVisualSettings(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await requireTenant();

    const rawData = {
      storeFontFamily: (formData.get("storeFontFamily") as string) || "Inter",
      storeSlogan: (formData.get("storeSlogan") as string)?.trim() || null,
      bannerOpacity: parseFloat(formData.get("bannerOpacity") as string) || 1.0,
      useSolidColorForHeader: formData.get("useSolidColorForHeader") === "true" || formData.get("useSolidColorForHeader") === "on",
      primaryColor: (formData.get("primaryColor") as string) || "#7C3AED",
      storeNameColor: (formData.get("storeNameColor") as string) || "#FFFFFF",
      storeSloganColor: (formData.get("storeSloganColor") as string) || "#FFFFFF",
      storeAddress: (formData.get("storeAddress") as string)?.trim() || null,
      breakInterval: (formData.get("breakInterval") as string)?.trim() || "12:00 - 13:30",
      showHoursInCard: formData.get("showHoursInCard") === "true" || formData.get("showHoursInCard") === "on",
      showSchedulingHoursInCard: formData.get("showSchedulingHoursInCard") === "true" || formData.get("showSchedulingHoursInCard") === "on",
      showAddressInCard: formData.get("showAddressInCard") === "true" || formData.get("showAddressInCard") === "on",
      showBreakIntervalInCard: formData.get("showBreakIntervalInCard") === "true" || formData.get("showBreakIntervalInCard") === "on",
      showRatingInCard: formData.get("showRatingInCard") === "true" || formData.get("showRatingInCard") === "on",
    };

    const parsed = VisualSettingsSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Dados visuais inválidos." };
    }

    await prisma.globalSettings.update({
      where: { tenantId },
      data: {
        storeFontFamily: parsed.data.storeFontFamily,
        storeSlogan: parsed.data.storeSlogan,
        bannerOpacity: parsed.data.bannerOpacity,
        useSolidColorForHeader: parsed.data.useSolidColorForHeader,
        primaryColor: parsed.data.primaryColor,
        storeNameColor: parsed.data.storeNameColor,
        storeSloganColor: parsed.data.storeSloganColor,
        storeAddress: parsed.data.storeAddress,
        breakInterval: parsed.data.breakInterval,
        showHoursInCard: parsed.data.showHoursInCard,
        showSchedulingHoursInCard: parsed.data.showSchedulingHoursInCard,
        showAddressInCard: parsed.data.showAddressInCard,
        showBreakIntervalInCard: parsed.data.showBreakIntervalInCard,
        showRatingInCard: parsed.data.showRatingInCard,
      },
    });

    revalidatePath("/admin/empresa");
    revalidatePath("/admin/config");
    revalidatePath("/loja", "layout");

    return { success: true };
  } catch (err: any) {
    console.error("Erro ao salvar configurações visuais:", err);
    return { success: false, error: err?.message || "Falha ao salvar configurações visuais." };
  }
}

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
  const rawLogo = (formData.get("logoUrl") as string) || (formData.get("companyLogoUrl") as string) || null;
  const companyLogoUrl = rawLogo;
  const logoUrl = rawLogo;
  const bannerUrl = formData.get("bannerUrl") as string || null;
  const superBannerUrl = formData.get("superBannerUrl") as string || null;
  const promoBannerUrl = formData.get("promoBannerUrl") as string || null;
  const primaryColor = (formData.get("primaryColor") as string) || "#7C3AED";
  const storeFontFamily = (formData.get("storeFontFamily") as string) || undefined;
  const storeSlogan = formData.has("storeSlogan") ? (formData.get("storeSlogan") as string)?.slice(0, 45) : undefined;
  const bannerOpacity = formData.has("bannerOpacity") ? (parseFloat(formData.get("bannerOpacity") as string) || 1.0) : undefined;
  const useSolidColorForHeader = formData.has("useSolidColorForHeader") ? (formData.get("useSolidColorForHeader") === "on" || formData.get("useSolidColorForHeader") === "true") : undefined;
  const businessType = (formData.get("businessType") as string) || "BOTH";

  // Horários e Intervalos
  const openingTime = (formData.get("openingTime") as string) || "08:00";
  const closingTime = (formData.get("closingTime") as string) || "18:00";
  const workDays = (formData.get("workDays") as string) || "DOM,SEG,TER,QUA,QUI,SEX,SAB";
  const operatingHours = (formData.get("operatingHours") as string) || JSON.stringify([{ start: openingTime, end: closingTime }]);

  // Agendamento & Cancelamento
  const defaultSchedulingEnabled = formData.get("defaultSchedulingEnabled") === "on";
  const schedulingAppliesTo = formData.get("schedulingAppliesTo") as string || "BOTH";
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
  const notificationAudioInterval = parseInt(formData.get("notificationAudioInterval") as string) || 0;
  const whatsappTemplates = formData.get("whatsappTemplates") as string || null;

  // Construção segura dos dados para não sobrescrever configurações visuais mantidas em /admin/empresa
  const dataToUpdate: any = {
    // Legacy & Geral
    defaultMinStock,
    decimalSeparator,
    defaultDeliveryFee,
    businessType: (businessType || "BOTH") as any,
    // Horários
    openingTime,
    closingTime,
    workDays,
    operatingHours,
    // Agendamento
    defaultSchedulingEnabled,
    schedulingAppliesTo,
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
    // Gateway & Integrações
    gatewayProvider: gatewayProvider ? (gatewayProvider as any) : null,
    gatewayAccessToken,
    pixKey,
    whatsappNumber,
    autoWhatsappEnabled,
    notificationAudioInterval,
    whatsappTemplates,
  };

  // Se vier companyName no formData, atualiza
  if (formData.has("companyName") && formData.get("companyName")) {
    dataToUpdate.companyName = formData.get("companyName") as string;
  }
  // Se vier primaryColor no formData, atualiza
  if (formData.has("primaryColor") && formData.get("primaryColor")) {
    dataToUpdate.primaryColor = formData.get("primaryColor") as string;
  }

  await prisma.globalSettings.update({
    where: { tenantId },
    data: dataToUpdate,
  });

  revalidatePath("/admin/config");
  revalidatePath("/admin/pedidos/novo");
  revalidatePath("/admin/empresa");
  revalidatePath("/admin");
  revalidatePath("/loja/[slug]", "layout");
}
