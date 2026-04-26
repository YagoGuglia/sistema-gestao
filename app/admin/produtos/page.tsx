import { prisma } from "@/lib/prisma";
import { ProductListClient } from "@/components/ProductListClient";
import { getGlobalSettings } from "@/app/actions/settings-actions";

export default async function ProdutosPage() {
    // Busca todos os produtos
    const products = await prisma.product.findMany({
        orderBy: { name: 'asc' },
    });

    // Busca apenas insumos (matérias-primas)
    const availableInsumos = await prisma.product.findMany({
        where: { isRawMaterial: true },
        select: { id: true, name: true, stock: true },
        orderBy: { name: 'asc' }
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