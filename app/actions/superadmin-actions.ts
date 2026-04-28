"use server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPlatformCoupon(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (dbUser?.role !== "SUPERADMIN") throw new Error("Não autorizado");

  const code = (formData.get("code") as string)?.toUpperCase().trim();
  const discount = parseFloat(formData.get("discount") as string);
  const type = formData.get("type") as string;
  const expiresAt = formData.get("expiresAt") as string;

  if (!code || !discount || !type) return { error: "Preencha todos os campos." };

  try {
    await prisma.coupon.create({
      data: { code, discount, type, expiresAt: expiresAt ? new Date(expiresAt) : null, tenantId: null },
    });
    revalidatePath("/superadmin");
    return { success: true };
  } catch {
    return { error: "Código já existe." };
  }
}

export async function deletePlatformCoupon(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (dbUser?.role !== "SUPERADMIN") throw new Error("Não autorizado");
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/superadmin");
}

export async function suspendTenant(tenantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (dbUser?.role !== "SUPERADMIN") throw new Error("Não autorizado");
  await prisma.tenant.update({ where: { id: tenantId }, data: { status: "SUSPENDED" } });
  revalidatePath("/superadmin");
}
