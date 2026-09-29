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
      },
      reviews: {
        where: { isPublished: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!tenant) {
    notFound();
  }
  
  const primaryColor = tenant.settings?.primaryColor || "#7C3AED";
  const storeName = tenant.settings?.companyName || tenant.name;

  return (
    <main 
      className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-brand/20"
      style={{ "--brand-color": primaryColor } as React.CSSProperties}
    >
      <StoreHeader 
        storeName={storeName} 
        logoUrl={tenant.settings?.companyLogoUrl}
        bannerUrl={tenant.settings?.bannerUrl}
        isOpen={(tenant.settings as any)?.isStoreOpen ?? true}
        whatsappNumber={tenant.settings?.whatsappNumber}
      />
      <StorefrontClient 
        products={tenant.products} 
        settings={tenant.settings} 
        tenantId={tenant.id}
        reviews={tenant.reviews}
      />
    </main>
  );
}
