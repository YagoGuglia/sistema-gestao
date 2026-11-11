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

  if (tenant.status === "BLOCKED" || tenant.status === "SUSPENDED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
          </div>
          <h2 className="text-xl font-black text-gray-900">{tenant.settings?.companyName || tenant.name}</h2>
          <p className="text-sm text-gray-500">
            Esta loja está temporariamente indisponível no momento. Por favor, volte mais tarde ou contate o estabelecimento.
          </p>
        </div>
      </div>
    );
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
        logoUrl={tenant.settings?.logoUrl || tenant.settings?.companyLogoUrl}
        superBannerUrl={tenant.settings?.superBannerUrl}
        bannerUrl={tenant.settings?.bannerUrl}
        slogan={tenant.settings?.storeSlogan}
        fontFamily={tenant.settings?.storeFontFamily || "Inter"}
        bannerOpacity={tenant.settings?.bannerOpacity ?? 1.0}
        useSolidColorForHeader={tenant.settings?.useSolidColorForHeader ?? false}
        primaryColor={primaryColor}
        nameColor={tenant.settings?.storeNameColor || "#FFFFFF"}
        sloganColor={tenant.settings?.storeSloganColor || "#FFFFFF"}
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
