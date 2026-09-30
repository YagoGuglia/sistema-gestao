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
    return { success: true };
  } catch (err: any) {
    console.error("Erro no ajuste em lote:", err);
    return { error: "Erro ao processar lote de estoque." };
  }
}

export async function produceProductBatch(
  productId: string, 
  quantityToProduce: number, 
  justification?: string
) {
  if (!productId || quantityToProduce <= 0) {
    return { error: "Informe um produto válido e a quantidade a ser produzida." };
  }

  try {
    const tenantId = await requireTenant();

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        ingredients: {
          include: {
            ingredient: {
              select: { id: true, name: true, stock: true, unit: true, costPrice: true }
            }
          }
        }
      }
    });

    if (!product) {
      return { error: "Produto não encontrado." };
    }

    if (!product.ingredients || product.ingredients.length === 0) {
      return { error: `O produto "${product.name}" não possui Ficha Técnica (Receita) vinculada para montagem.` };
    }

    // Check raw material stock availability
    for (const item of product.ingredients) {
      const requiredQty = item.quantity * quantityToProduce;
      const rawInsumo = item.ingredient;

      if (rawInsumo.stock < requiredQty) {
        return { 
          error: `Estoque insuficiente do insumo "${rawInsumo.name}". Necessário: ${requiredQty} ${rawInsumo.unit || 'UN'}, Disponível: ${rawInsumo.stock} ${rawInsumo.unit || 'UN'}.` 
        };
      }
    }

    // Execute Production Transaction
    await prisma.$transaction(async (tx) => {
      // 1. Deduct raw materials
      for (const item of product.ingredients) {
        const requiredQty = item.quantity * quantityToProduce;

        await tx.product.update({
          where: { id: item.ingredientId },
          data: { stock: { decrement: requiredQty } }
        });

        await tx.stockLog.create({
          data: {
            tenantId,
            productId: item.ingredientId,
            quantityChange: -Math.abs(requiredQty),
            type: "PRODUCTION_CONSUMPTION",
            justification: justification || `Consumo para montagem de ${quantityToProduce} un de "${product.name}"`
          }
        });
      }

      // 2. Increment finished product stock
      await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: quantityToProduce } }
      });

      await tx.stockLog.create({
        data: {
          tenantId,
          productId,
          quantityChange: quantityToProduce,
          type: "PRODUCTION_ENTRY",
          justification: justification || `Entrada por montagem de lote de ${quantityToProduce} un`
        }
      });
    });

    revalidatePath("/admin/produtos");
    revalidatePath("/");
    return { success: true, productName: product.name, producedQty: quantityToProduce };
  } catch (err: any) {
    console.error("Erro na produção:", err);
    return { error: "Erro ao registrar a produção do produto." };
  }
}


