"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGlobalSettings() {
  const settings = await prisma.globalSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
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

  await prisma.globalSettings.update({
    where: { id: "default" },
    data: { defaultMinStock, decimalSeparator, defaultDeliveryFee, defaultSchedulingEnabled }
  });

  revalidatePath("/admin/config");
  revalidatePath("/admin/pedidos/novo");
}
