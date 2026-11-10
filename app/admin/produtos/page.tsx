import { prisma } from "@/lib/prisma";
import { ProductListClient } from "@/components/ProductListClient";
import { getGlobalSettings } from "@/app/actions/settings-actions";
import { requireTenant } from "@/lib/supabase/server";

export default async function ProdutosPage() {
  const tenantId = await requireTenant();

  // Busca todos os produtos do tenant
  const products = await prisma.product.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });

  // Busca apenas insumos (matérias-primas) do tenant
  const availableInsumos = await prisma.product.findMany({
    where: { tenantId, isRawMaterial: true },
    select: { id: true, name: true, stock: true, unit: true, costPrice: true },
    orderBy: { name: "asc" },
  });

  const settings = await getGlobalSettings();

  return (
    <ProductListClient
      initialProducts={products}
      availableInsumos={availableInsumos}
      defaultMinStock={settings.defaultMinStock}
      decimalSeparator={settings.decimalSeparator}
    />
  );
}
