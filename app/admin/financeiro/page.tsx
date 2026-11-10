import { FinanceiroClient } from "./FinanceiroClient";
import { getExpenses } from "@/app/actions/expense-actions";
import { getGlobalSettings } from "@/app/actions/settings-actions";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/supabase/server";

export default async function FinanceiroPage() {
  const tenantId = await requireTenant();
  
  const [expenses, settings, tenant, orders] = await Promise.all([
    getExpenses(),
    getGlobalSettings(),
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    }),
    prisma.order.findMany({
      where: { tenantId },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            costPrice: true,
            quantity: true,
          },
        },
      },
    }),
  ]);

  const isPro = tenant?.plan === "PRO";

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <FinanceiroClient 
        expenses={expenses}
        orders={orders}
        decimalSeparator={settings.decimalSeparator}
        isPro={isPro}
      />
    </div>
  );
}
