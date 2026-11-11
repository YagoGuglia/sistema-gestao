// lib/tenant.ts - Utilitário central de Tenant, RLS e Feature Flags de Planos (FREE / PRO)

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export interface TenantWithSettings {
  id: string;
  name: string;
  slug: string;
  plan: "FREE" | "PRO";
  status: string;
  settings: {
    primaryColor: string;
    companyName: string;
    companyLogoUrl: string | null;
    logoUrl?: string | null;
    bannerUrl: string | null;
    superBannerUrl?: string | null;
    promoBannerUrl?: string | null;
    storeFontFamily?: string | null;
    storeSlogan?: string | null;
    bannerOpacity?: number | null;
    useSolidColorForHeader?: boolean | null;
    storeNameColor?: string | null;
    storeSloganColor?: string | null;
    businessType: "PRODUCTS" | "SERVICES" | "BOTH";
    openingTime: string | null;
    closingTime: string | null;
    workDays: string | null;
    operatingHours: string | null;
    isStoreOpen: boolean;
    gatewayProvider: string | null;
    gatewayAccessToken: string | null;
    pixKey: string | null;
    whatsappNumber: string | null;
    autoWhatsappEnabled: boolean;
    notificationAudioInterval: number;
    cancellationHoursLimit: number;
    slotIntervalMin: number;
    deliveryFee: number;
  } | null;
}

/**
 * Retorna o tenant do usuário logado na sessão Supabase com isolamento estrito.
 * Lança erro caso o usuário não esteja autenticado ou não pertença a um Tenant.
 */
export async function requireCurrentTenant() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error("Não autorizado: Sessão não encontrada.");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: {
      tenant: {
        include: {
          settings: true,
        },
      },
    },
  });

  if (!dbUser || !dbUser.tenantId || !dbUser.tenant) {
    throw new Error("Acesso negado: Loja não encontrada para este usuário.");
  }

  return {
    tenantId: dbUser.tenantId,
    tenant: dbUser.tenant,
    user: dbUser,
  };
}

/**
 * Verifica se o Tenant associado à sessão atual possui o Plano PRO.
 */
export async function isCurrentTenantPro(): Promise<boolean> {
  try {
    const { tenant } = await requireCurrentTenant();
    return tenant.plan === "PRO";
  } catch {
    return false;
  }
}

/**
 * Validação de limite de produtos para conformidade com o Modelo de Negócios PLG:
 * Plano FREE: Máximo 30 produtos/serviços ativos.
 * Plano PRO: Ilimitado.
 */
export async function assertCanCreateProduct(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { plan: true },
  });

  if (!tenant) throw new Error("Tenant não encontrado");

  if (tenant.plan === "FREE") {
    const productCount = await prisma.product.count({
      where: { tenantId },
    });

    if (productCount >= 30) {
      throw new Error(
        "Limite atingido: O Plano Gratuito permite cadastrar até 30 produtos ou serviços. Faça o upgrade para o Plano PRO para cadastros ilimitados!"
      );
    }
  }
}

