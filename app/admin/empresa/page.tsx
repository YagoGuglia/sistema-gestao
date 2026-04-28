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

  const vitrineUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://seusite.com"}/loja/${tenant.slug}`;

  return (
    <EmpresaClient
      tenant={{ id: tenant.id, name: tenant.name, slug: tenant.slug, plan: tenant.plan, status: tenant.status }}
      settings={{ companyName: settings?.companyName || tenant.name, companyLogoUrl: settings?.companyLogoUrl || null }}
      coupons={coupons}
      vitrineUrl={vitrineUrl}
    />
  );
}
