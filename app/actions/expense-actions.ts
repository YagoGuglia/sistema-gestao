"use server";

import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getExpenses() {
  const tenantId = await requireTenant();
  return prisma.expense.findMany({
    where: { tenantId },
    orderBy: { dueDate: "asc" },
  });
}

export async function createExpense(formData: FormData) {
  const tenantId = await requireTenant();
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const dueDate = formData.get("dueDate") as string;
  
  // Settings to handle decimal separator
  const settings = await prisma.globalSettings.findUnique({ where: { tenantId } });
  const sep = settings?.decimalSeparator || ".";
  
  const rawAmount = formData.get("amount") as string;
  const cleanAmount = sep === "," ? rawAmount.replace(",", ".") : rawAmount;
  const amount = parseFloat(cleanAmount) || 0;

  if (!description || !category || !dueDate || amount <= 0) {
    return { error: "Preencha todos os campos corretamente." };
  }

  try {
    await prisma.expense.create({
      data: {
        tenantId,
        description,
        amount,
        category,
        dueDate: new Date(dueDate),
        paidAt: formData.get("isPaid") === "on" ? new Date() : null,
      },
    });
    revalidatePath("/admin/financeiro");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao registrar despesa." };
  }
}

export async function markExpensePaid(id: string, isPaid: boolean) {
  const tenantId = await requireTenant();
  try {
    await prisma.expense.update({
      where: { id, tenantId },
      data: { paidAt: isPaid ? new Date() : null },
    });
    revalidatePath("/admin/financeiro");
  } catch (error) {
    console.error(error);
  }
}

export async function deleteExpense(id: string) {
  const tenantId = await requireTenant();
  try {
    await prisma.expense.delete({
      where: { id, tenantId },
    });
    revalidatePath("/admin/financeiro");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao excluir despesa." };
  }
}
