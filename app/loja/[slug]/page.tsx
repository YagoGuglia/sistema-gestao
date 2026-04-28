import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StoreHeader } from "@/components/vitrine/StoreHeader";
import { StorefrontClient } from "@/components/vitrine/StorefrontClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug: resolvedParams.slug },
    include: { settings: true }
  });

  if (!tenant) return { title: "Loja não encontrada" };

  const storeName = tenant.settings?.companyName || tenant.name;
  return {
    title: `${storeName} | Vitrinia`,
    description: `Faça seu pedido em ${storeName}`,
  };
}

export default async function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const tenant = await prisma.tenant.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      settings: true,
      products: {
        where: { isRawMaterial: false },
        orderBy: { name: 'asc' }
      }
    }
  });

  if (!tenant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-vitrinia-bg pb-24 font-sans">
      <StoreHeader 
        storeName={tenant.settings?.companyName || tenant.name} 
        logoUrl={tenant.settings?.companyLogoUrl}
      />
      <StorefrontClient products={tenant.products} />
    </main>
  );
}
