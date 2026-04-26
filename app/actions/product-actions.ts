"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface IngredientInput {
  ingredientId: string;
  quantity: number;
}

export async function saveProduct(formData: FormData, ingredients: IngredientInput[]) {
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const isRawMaterial = formData.get("isRawMaterial") === "true";
  const image = formData.get("image") as string;

  // Buscar configurações para o separador decimal
  const settings = await prisma.globalSettings.findUnique({ where: { id: "default" } });
  const sep = settings?.decimalSeparator || ".";

  // Função para limpar e converter números independente do separador
  const parseNumeric = (val: string | null) => {
    if (!val) return 0;
    // Se o separador for vírgula, trocamos para ponto para o parseFloat entender
    const cleanStr = sep === "," ? val.replace(",", ".") : val;
    return parseFloat(cleanStr) || 0;
  };

  const rawPrice = parseNumeric(formData.get("price") as string);
  const price = Math.round(rawPrice * 100) / 100; // Garantir precisão de 2 casas
  
  const minStock = parseNumeric(formData.get("minStock") as string);
  const stock = parseNumeric(formData.get("stock") as string);

  if (!name) return { error: "Nome é obrigatório" };

  try {
    if (id) {
      // Editar
      await prisma.$transaction(async (tx) => {
        // 1. Atualizar dados básicos (EXCETO estoque para evitar zerar)
        await tx.product.update({
          where: { id },
          data: { 
            name, 
            description, 
            price, 
            minStock, 
            isRawMaterial, 
            image 
            // stock: stock - REMOVIDO para evitar bugs de campo disabled
          }
        });

        // 2. Remover ingredientes antigos
        await tx.productIngredient.deleteMany({
          where: { productId: id }
        });

        // 3. Adicionar novos ingredientes
        if (!isRawMaterial && ingredients.length > 0) {
          await tx.productIngredient.createMany({
            data: ingredients.map(ing => ({
              productId: id,
              ingredientId: ing.ingredientId,
              quantity: ing.quantity
            }))
          });
        }
      });
    } else {
      // Criar novo
      await prisma.product.create({
        data: { 
          name, 
          description, 
          price, 
          stock, 
          minStock: isNaN(minStock) ? (settings?.defaultMinStock || 10) : minStock,
          image,
          isRawMaterial,
          ingredients: !isRawMaterial && ingredients.length > 0 ? {
            create: ingredients.map(ing => ({
              ingredientId: ing.ingredientId,
              quantity: ing.quantity
            }))
          } : undefined
        }
      });
    }

    revalidatePath("/admin/produtos");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    return { error: "Erro interno ao salvar. Verifique se os insumos ainda existem." };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/produtos");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Não é possível excluir este produto pois ele está em uso (ex: é ingrediente de outro item)." };
  }
}

export async function getInsumos() {
  return await prisma.product.findMany({
    where: { isRawMaterial: true },
    select: { id: true, name: true, stock: true },
    orderBy: { name: 'asc' }
  });
}

export async function getProduct(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      ingredients: {
        include: { ingredient: true }
      }
    }
  });
}
