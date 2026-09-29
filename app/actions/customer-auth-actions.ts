"use server";

import { prisma } from "@/lib/prisma";

export interface CustomerData {
  id: string;
  name: string;
  phone: string;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
}

// Limpa caracteres especiais mantendo apenas números
function cleanPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

// Busca ou registra o cliente pelo número de WhatsApp na loja específica (tenant)
export async function customerLoginOrRegister({
  slug,
  phone,
  name,
  address,
  neighborhood,
  city,
}: {
  slug: string;
  phone: string;
  name?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
}) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: { settings: true },
    });

    if (!tenant) {
      return { error: "Loja não encontrada." };
    }

    const cleanPhone = cleanPhoneDigits(phone);
    if (cleanPhone.length < 10) {
      return { error: "Número de WhatsApp inválido. Digite DDD + número (ex: 11999999999)." };
    }

    // Procura usuário existente nessa loja
    const existingUser = await prisma.user.findUnique({
      where: {
        tenantId_phone: {
          tenantId: tenant.id,
          phone: cleanPhone,
        },
      },
    });

    if (existingUser) {
      // Se passou novos dados de endereço ou nome, atualiza
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: name?.trim() || existingUser.name,
          address: address !== undefined ? address : existingUser.address,
          neighborhood: neighborhood !== undefined ? neighborhood : existingUser.neighborhood,
          city: city !== undefined ? city : existingUser.city,
        },
      });

      return {
        success: true,
        isNew: false,
        customer: {
          id: updatedUser.id,
          name: updatedUser.name,
          phone: updatedUser.phone,
          address: updatedUser.address,
          neighborhood: updatedUser.neighborhood,
          city: updatedUser.city,
        },
      };
    }

    // Se usuário não existe, exige nome para criar
    if (!name || name.trim().length < 2) {
      return {
        needName: true,
        phone: cleanPhone,
        message: "Por favor, informe seu nome para concluir seu primeiro acesso.",
      };
    }

    const newUser = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        phone: cleanPhone,
        name: name.trim(),
        address: address?.trim() || null,
        neighborhood: neighborhood?.trim() || null,
        city: city?.trim() || null,
        role: "CUSTOMER",
      },
    });

    return {
      success: true,
      isNew: true,
      customer: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        address: newUser.address,
        neighborhood: newUser.neighborhood,
        city: newUser.city,
      },
    };
  } catch (error: any) {
    console.error("Erro no login do cliente:", error);
    return { error: "Não foi possível conectar. Tente novamente." };
  }
}

// Busca histórico de pedidos do cliente na loja
export async function getCustomerOrders(slug: string, phone: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: { settings: true },
    });

    if (!tenant) return { error: "Loja não encontrada." };

    const cleanPhone = cleanPhoneDigits(phone);

    const user = await prisma.user.findUnique({
      where: {
        tenantId_phone: {
          tenantId: tenant.id,
          phone: cleanPhone,
        },
      },
    });

    if (!user) {
      return { orders: [], storeWhatsApp: tenant.settings?.whatsappNumber || null };
    }

    const orders = await prisma.order.findMany({
      where: {
        tenantId: tenant.id,
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return {
      orders: orders.map((o) => ({
        id: o.id,
        totalAmount: o.totalAmount,
        status: o.status,
        orderType: o.orderType,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i) => ({
          id: i.id,
          name: i.product?.name || "Produto",
          quantity: i.quantity,
          price: i.price,
        })),
      })),
      storeWhatsApp: tenant.settings?.whatsappNumber || null,
      storeName: tenant.settings?.companyName || tenant.name,
    };
  } catch (error: any) {
    console.error("Erro ao buscar pedidos do cliente:", error);
    return { error: "Não foi possível carregar seus pedidos." };
  }
}

// Informações públicas da loja para WhatsApp
export async function getStoreWhatsAppInfo(slug: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: { settings: true },
    });
    if (!tenant) return null;
    return {
      whatsappNumber: tenant.settings?.whatsappNumber || null,
      companyName: tenant.settings?.companyName || tenant.name,
    };
  } catch (e) {
    return null;
  }
}
