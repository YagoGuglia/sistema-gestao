import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/supabase/server";
import { getTenantCoupons } from "@/app/actions/coupon-actions";
import { EmpresaClient } from "./EmpresaClient";

export const metadata = { title: "Empresa | Vitrinia" };

export default async function EmpresaPage() {
  const tenantId = await requireTenant();

  const [tenant, settings, coupons] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.globalSettings.findUnique({ where: { tenantId } }),
    getTenantCoupons(),
  ]);

  if (!tenant) return <div>Loja não encontrada.</div>;

  return (
    <EmpresaClient
      tenant={{ id: tenant.id, name: tenant.name, slug: tenant.slug, plan: tenant.plan, status: tenant.status }}
      settings={{
        companyName: settings?.companyName || tenant.name,
        companyLogoUrl: settings?.companyLogoUrl || null,
        bannerUrl: settings?.bannerUrl || null,
        primaryColor: settings?.primaryColor || "#7C3AED",
        businessType: settings?.businessType || "BOTH",
        openingTime: settings?.openingTime || "08:00",
        closingTime: settings?.closingTime || "18:00",
        workDays: settings?.workDays || "DOM,SEG,TER,QUA,QUI,SEX,SAB",
        defaultSchedulingEnabled: settings?.defaultSchedulingEnabled ?? true,
        gatewayProvider: settings?.gatewayProvider || null,
        whatsappNumber: settings?.whatsappNumber || null,
      }}
      coupons={coupons}
    />
  );
}
