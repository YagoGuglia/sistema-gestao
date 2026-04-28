"use server";

import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTenantCoupons() {
  const tenantId = await requireTenant();
  return prisma.coupon.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCoupon(formData: FormData) {
  const tenantId = await requireTenant();
  const code = (formData.get("code") as string)?.toUpperCase().trim();
  const discount = parseFloat(formData.get("discount") as string);
  const type = formData.get("type") as string;
  const expiresAt = formData.get("expiresAt") as string;

  if (!code || !discount || !type) return { error: "Preencha todos os campos obrigatórios." };

  try {
    await prisma.coupon.create({
      data: {
        tenantId,
        code,
        discount,
        type,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    revalidatePath("/admin/empresa");
    return { success: true };
  } catch {
    return { error: "Este código de cupom já existe. Escolha outro." };
  }
}

export async function toggleCoupon(id: string, isActive: boolean) {
  await requireTenant();
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/empresa");
}

export async function deleteCoupon(id: string) {
  await requireTenant();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/empresa");
}
