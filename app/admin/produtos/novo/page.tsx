import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/ProductForm";
import { getGlobalSettings } from "@/app/actions/settings-actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NovoProdutoPage() {
  const availableInsumos = await prisma.product.findMany({
    where: { isRawMaterial: true },
    select: { id: true, name: true, stock: true },
    orderBy: { name: 'asc' }
  });

  const settings = await getGlobalSettings();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <header className="flex items-center gap-4">
        <Link 
          href="/admin/produtos"
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novo Item no Estoque</h1>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <ProductForm 
          availableInsumos={availableInsumos} 
          defaultMinStock={settings.defaultMinStock}
        />
      </div>
    </div>
  );
}
