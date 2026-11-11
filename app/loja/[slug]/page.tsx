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
        bannerUrl={tenant.settings?.bannerUrl}
        isOpen={(tenant.settings as any)?.isStoreOpen ?? true}
        whatsappNumber={tenant.settings?.whatsappNumber}
      />

      {/* Superbanner (Destaque Principal) */}
      <section className="max-w-3xl mx-auto px-4 mt-6">
        {tenant.settings?.superBannerUrl ? (
          <div className="relative w-full aspect-[3/1] sm:aspect-[3.2/1] rounded-3xl overflow-hidden shadow-sm border border-gray-100 group bg-gray-100">
            <img
              src={tenant.settings.superBannerUrl}
              alt={`${storeName} - Superbanner`}
              className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.01]"
            />
          </div>
        ) : (
          <div className="relative w-full py-6 px-6 sm:px-8 rounded-3xl overflow-hidden shadow-sm bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-800">
            <div className="space-y-1 text-center sm:text-left z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white">
                ⭐ Destaque Especial
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                Seja bem-vindo(a) à {storeName}!
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-md">
                Explore nosso catálogo digital completo e faça seu pedido direto pelo WhatsApp com total agilidade e segurança.
              </p>
            </div>
            <div className="hidden sm:flex shrink-0 w-16 h-16 rounded-2xl bg-white/10 items-center justify-center backdrop-blur-xs text-3xl">
              🛍️
            </div>
          </div>
        )}
      </section>

      <StorefrontClient 
        products={tenant.products} 
        settings={tenant.settings} 
        tenantId={tenant.id}
        reviews={tenant.reviews}
      />
    </main>
  );
}
