"use server";

import { prisma } from "@/lib/prisma";

export interface CustomerData {
  id: string;
  name: string;
  phone: string;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  addresses?: any[];
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
      include: {
        addresses: true
      }
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
        include: {
          addresses: true
        }
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
          addresses: updatedUser.addresses,
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
        addresses: [],
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

// ----------------------------------------------------------------------------
// GERENCIAMENTO DE ENDEREÇOS DO CLIENTE
// ----------------------------------------------------------------------------

export async function getCustomerAddresses(userId: string) {
  try {
    const addresses = await prisma.customerAddress.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    return { success: true, addresses };
  } catch (error) {
    console.error("Erro ao buscar endereços:", error);
    return { error: "Erro ao carregar endereços salvos." };
  }
}

export async function addCustomerAddress(userId: string, data: {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  label?: string;
  isDefault?: boolean;
}) {
  try {
    // Se for marcado como default, remove o default dos outros
    if (data.isDefault) {
      await prisma.customerAddress.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    // Se é o primeiro endereço, força a ser o default
    const count = await prisma.customerAddress.count({ where: { userId } });
    const isDefault = data.isDefault || count === 0;

    const address = await prisma.customerAddress.create({
      data: {
        userId,
        zipCode: data.zipCode,
        street: data.street,
        number: data.number,
        complement: data.complement || "",
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        label: data.label || "Casa",
        isDefault
      }
    });

    return { success: true, address };
  } catch (error) {
    console.error("Erro ao adicionar endereço:", error);
    return { error: "Erro ao salvar o endereço." };
  }
}

export async function deleteCustomerAddress(userId: string, addressId: string) {
  try {
    const addr = await prisma.customerAddress.findFirst({
      where: { id: addressId, userId }
    });

    if (!addr) return { error: "Endereço não encontrado." };

    await prisma.customerAddress.delete({
      where: { id: addressId }
    });

    // Se deletou o default, elege o mais recente como default
    if (addr.isDefault) {
      const latest = await prisma.customerAddress.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      
      if (latest) {
        await prisma.customerAddress.update({
          where: { id: latest.id },
          data: { isDefault: true }
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar endereço:", error);
    return { error: "Erro ao remover o endereço." };
  }
}
