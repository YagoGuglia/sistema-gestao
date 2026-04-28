"use server";

import { prisma } from "@/lib/prisma";

interface CreateTenantInput {
  storeName: string;
  slug: string;
  phone: string;
  email: string;
  name: string;
  plano?: string;
}

export async function createTenantAction(input: CreateTenantInput) {
  const { storeName, slug, phone, email, name, plano } = input;

  try {
    // Verificar se o slug já existe
    const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      return { error: "Este link já está em uso. Escolha outro nome para a loja." };
    }

    // Verificar se o email já está vinculado a um tenant
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser?.tenantId) {
      return { error: "Este e-mail já está associado a uma loja." };
    }

    // Criar o Tenant e o User lojista de forma atômica (transaction)
    await prisma.$transaction(async (tx) => {
      // 1. Criar o Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: storeName,
          slug,
          plan: plano ?? "free",
        },
      });

      // 2. Criar as configurações iniciais da loja
      await tx.globalSettings.create({
        data: {
          tenantId: tenant.id,
          companyName: storeName,
        },
      });

      // 3. Criar ou atualizar o User como TENANT
      if (existingUser) {
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            tenantId: tenant.id,
            role: "TENANT",
            phone,
          },
        });
      } else {
        await tx.user.create({
          data: {
            tenantId: tenant.id,
            name,
            email,
            phone,
            role: "TENANT",
          },
        });
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("[ONBOARDING_ERROR]", error);
    return { error: "Erro ao criar a loja. Por favor, tente novamente." };
  }
}
