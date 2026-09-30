"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/supabase/server";

export async function adjustStock(productId: string, quantityChange: number, justification: string) {
  if (!justification || justification.length < 5) {
    return { error: "Justificativa muito curta ou obrigatória." };
  }

  try {
    const tenantId = await requireTenant();
    const result = await prisma.$transaction(async (tx) => {
      // 1. Atualizar o estoque do produto
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stock: { increment: quantityChange }
        }
      });

      // 2. Criar o log de movimentação
      await tx.stockLog.create({
        data: {
          tenantId,
          productId,
          quantityChange,
          type: "MANUAL",
          justification
        }
      });

      return updatedProduct;
    });

    revalidatePath("/admin/produtos");
    revalidatePath("/"); // Dashboard
    return { success: true, product: result };
  } catch (err) {
    console.error(err);
    return { error: "Erro ao processar o ajuste de estoque." };
  }
}

export async function getStockLogs(productId: string) {
  return await prisma.stockLog.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
}

export interface BatchAdjustmentItem {
  productId: string;
  quantityChange: number;
  costPrice?: number;
  justification: string;
}

export async function batchAdjustStock(adjustments: BatchAdjustmentItem[]) {
  if (!adjustments || adjustments.length === 0) {
    return { error: "Nenhum item informado para entrada." };
  }

  try {
    const tenantId = await requireTenant();

    await prisma.$transaction(async (tx) => {
      for (const item of adjustments) {
        if (!item.productId || !item.quantityChange) continue;

        // Atualizar estoque e preço de custo (se fornecido)
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantityChange },
            ...(item.costPrice && item.costPrice > 0 ? { costPrice: item.costPrice } : {})
          }
        });

        // Registrar Log
        await tx.stockLog.create({
          data: {
            tenantId,
            productId: item.productId,
            quantityChange: item.quantityChange,
            type: "SCAN_BATCH",
            justification: item.justification || "Entrada via Scan / Lote"
          }
        });
      }
    });

    revalidatePath("/admin/produtos");
    revalidatePath("/");
    return { success: true, count: adjustments.length };
  } catch (err) {
    console.error("Erro no batchAdjustStock:", err);
    return { error: "Erro ao registrar as entradas de estoque em lote." };
  }
}

