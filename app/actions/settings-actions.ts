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
      defaultSchedulingEnabled: false
    }
  });
  return settings;
}

export async function updateGlobalSettings(formData: FormData) {
  const defaultMinStock = parseFloat(formData.get("defaultMinStock") as string) || 10;
  const decimalSeparator = formData.get("decimalSeparator") as string || ".";
  
  // Como temos o separador dinâmico, vamos tentar parsear a taxa também:
  const rawDeliveryFee = formData.get("defaultDeliveryFee") as string;
  const cleanFee = decimalSeparator === "," ? rawDeliveryFee?.replace(",", ".") : rawDeliveryFee;
  const defaultDeliveryFee = parseFloat(cleanFee) || 0;

  const defaultSchedulingEnabled = formData.get("defaultSchedulingEnabled") === "on";

  const tenantId = await requireTenant();

  await prisma.globalSettings.update({
    where: { tenantId },
    data: { defaultMinStock, decimalSeparator, defaultDeliveryFee, defaultSchedulingEnabled }
  });

  revalidatePath("/admin/config");
  revalidatePath("/admin/pedidos/novo");
}
