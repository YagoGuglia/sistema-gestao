"use server";

import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getStaffList() {
  const tenantId = await requireTenant();
  return prisma.staff.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createStaff(formData: FormData) {
  const tenantId = await requireTenant();
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string || null;
  const roleTitle = formData.get("roleTitle") as string;
  const commissionRate = parseFloat(formData.get("commissionRate") as string) || 0;
  const isActive = formData.get("isActive") === "on";

  if (!name || !roleTitle) return { error: "Nome e Cargo são obrigatórios." };

  try {
    await prisma.staff.create({
      data: {
        tenantId,
        name,
        phone,
        roleTitle,
        commissionRate,
        isActive,
      },
    });
    revalidatePath("/admin/equipe");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao cadastrar profissional." };
  }
}

export async function updateStaff(id: string, formData: FormData) {
  const tenantId = await requireTenant();
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string || null;
  const roleTitle = formData.get("roleTitle") as string;
  const commissionRate = parseFloat(formData.get("commissionRate") as string) || 0;
  const isActive = formData.get("isActive") === "on";

  if (!name || !roleTitle) return { error: "Nome e Cargo são obrigatórios." };

  try {
    await prisma.staff.update({
      where: { id, tenantId },
      data: {
        name,
        phone,
        roleTitle,
        commissionRate,
        isActive,
      },
    });
    revalidatePath("/admin/equipe");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao atualizar profissional." };
  }
}

export async function toggleStaffActive(id: string, current: boolean) {
  const tenantId = await requireTenant();
  try {
    await prisma.staff.update({
      where: { id, tenantId },
      data: { isActive: !current },
    });
    revalidatePath("/admin/equipe");
  } catch (error) {
    console.error(error);
  }
}

export async function deleteStaff(id: string) {
  const tenantId = await requireTenant();
  try {
    await prisma.staff.delete({
      where: { id, tenantId },
    });
    revalidatePath("/admin/equipe");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Não é possível excluir um profissional que possui agendamentos. Desative-o em vez disso." };
  }
}
