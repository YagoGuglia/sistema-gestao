"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function adjustStock(productId: string, quantityChange: number, justification: string) {
  if (!justification || justification.length < 5) {
    return { error: "Justificativa muito curta ou obrigatória." };
  }

  try {
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
