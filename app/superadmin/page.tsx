import { prisma } from "@/lib/prisma";
import { SuperAdminClient } from "./SuperAdminClient";

export const metadata = { title: "Super Admin | Vitrinia" };

export default async function SuperAdminPage() {
  const [tenants, platformCoupons] = await Promise.all([
    prisma.tenant.findMany({
      include: { settings: true, _count: { select: { orders: true, users: true, products: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.coupon.findMany({
      where: { tenantId: null }, // Cupons da plataforma
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <SuperAdminClient tenants={tenants} platformCoupons={platformCoupons} />;
}
