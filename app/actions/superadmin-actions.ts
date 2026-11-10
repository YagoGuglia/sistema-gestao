"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isSuperAdmin } from "@/lib/auth";

async function assertSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) throw new Error("Não autorizado");

  const emailIsSuper = isSuperAdmin(user.email);
  if (emailIsSuper) return;

  const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
  if (dbUser?.role !== "SUPERADMIN") throw new Error("Não autorizado");
}

export async function createPlatformCoupon(formData: FormData) {
  await assertSuperAdmin();

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
  await assertSuperAdmin();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/superadmin");
}

export async function toggleTenantStatus(tenantId: string) {
  await assertSuperAdmin();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { status: true }
  });

  if (!tenant) throw new Error("Loja não encontrada");

  const newStatus = tenant.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { status: newStatus }
  });

  revalidatePath("/superadmin");
  return { success: true, status: newStatus };
}

export async function updateTenantPlan(tenantId: string, plan: "FREE" | "PRO") {
  await assertSuperAdmin();

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { plan: plan as any }
  });

  revalidatePath("/superadmin");
  return { success: true, plan };
}

export async function suspendTenant(tenantId: string) {
  await assertSuperAdmin();
  await prisma.tenant.update({ where: { id: tenantId }, data: { status: "BLOCKED" } });
  revalidatePath("/superadmin");
}
