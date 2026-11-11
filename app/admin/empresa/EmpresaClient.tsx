"use client";

import { useState, useTransition } from "react";
import { Store, Tag, Plus, Trash2, ToggleLeft, ToggleRight, Eye, ExternalLink, Image as ImageIcon, Sparkles } from "lucide-react";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/app/actions/coupon-actions";
import { StoreShareModal } from "@/components/admin/StoreShareModal";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: string;
  isActive: boolean;
  expiresAt: Date | null;
}

interface Props {
  tenant: { id: string; name: string; slug: string; plan: string; status: string };
  settings: {
    companyName: string;
    companyLogoUrl: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    superBannerUrl?: string | null;
    promoBannerUrl?: string | null;
    primaryColor?: string;
    businessType?: string;
    openingTime?: string;
    closingTime?: string;
    workDays?: string;
    defaultSchedulingEnabled?: boolean;
    gatewayProvider?: string | null;
    whatsappNumber?: string | null;
  };
  coupons: Coupon[];
}

export function EmpresaClient({ tenant, settings, coupons: initialCoupons }: Props) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState("");

  // Estados locais reativos para refletir as imagens instantaneamente no preview
  const [logoUrl, setLogoUrl] = useState<string | null>(
    settings.logoUrl || settings.companyLogoUrl || null
  );
  const [superBannerUrl, setSuperBannerUrl] = useState<string | null>(
    settings.superBannerUrl || null
  );
  const [promoBannerUrl, setPromoBannerUrl] = useState<string | null>(
    settings.promoBannerUrl || null
  );

  const handleCreateCoupon = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createCoupon(formData);
      if (result?.error) { setFormError(result.error); }
      else { setShowForm(false); window.location.reload(); }
    });
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(() => toggleCoupon(id, !current));
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c));
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;
    startTransition(() => deleteCoupon(id));
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minha Empresa</h1>
        <p className="text-gray-500 text-sm mt-1">Informações da sua loja, identidade visual e banners da vitrine.</p>
      </div>

      {/* Info da Loja */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-vitrinia-purple/10 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
            {logoUrl ? (
              <img src={logoUrl} className="w-full h-full object-cover rounded-2xl" alt="Logo" />
            ) : (
              <Store className="w-8 h-8 text-vitrinia-purple" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{settings.companyName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tenant.plan === 'PRO' || tenant.plan === 'pro' ? 'bg-purple-100 text-purple-700 font-extrabold border border-purple-200' : 'bg-gray-100 text-gray-500'}`}>
                Plano {tenant.plan.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400 font-mono">/loja/{tenant.slug}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload de Banners e Logo (Supabase Storage) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-vitrinia-purple" />
              Identidade Visual & Banners da Vitrine
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Envie suas imagens para personalizar a vitrine pública e seus comprovantes térmicos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {/* 1. Logo da Loja */}
          <ImageUploader
            type="logo"
            label="1. Logo da Loja"
            description="Exibida no topo da vitrine pública e no topo do comprovante térmico POS58."
            recommendation="Formato quadrado (PNG/JPG), mín. 400x400px"
            initialUrl={logoUrl}
            onUploaded={(url) => setLogoUrl(url)}
            onRemoved={() => setLogoUrl(null)}
          />

          {/* 2. Superbanner */}
          <ImageUploader
            type="superBanner"
            label="2. Superbanner (Destaque Principal)"
            description="Banner grande e horizontal posicionado com destaque logo abaixo do cabeçalho da loja."
            recommendation="1200x400px ou proporção 3:1 (máx. 5MB)"
            aspectRatioClass="aspect-[3/1]"
            initialUrl={superBannerUrl}
            onUploaded={(url) => setSuperBannerUrl(url)}
            onRemoved={() => setSuperBannerUrl(null)}
          />

          {/* 3. Banner de Promoção */}
          <ImageUploader
            type="promoBanner"
            label="3. Banner de Promoção (Ofertas & Destaques)"
            description="Banner secundário / card de destaque exibido estrategicamente acima da listagem de produtos."
            recommendation="800x350px ou proporção 2:1 (máx. 5MB)"
            aspectRatioClass="aspect-[2.4/1]"
            initialUrl={promoBannerUrl}
            onUploaded={(url) => setPromoBannerUrl(url)}
            onRemoved={() => setPromoBannerUrl(null)}
          />
        </div>
      </div>

      {/* Preview Read-Only da Vitrine do Cliente Final */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <Eye className="w-5 h-5 text-vitrinia-purple" />
            <h2 className="text-lg">Preview da Vitrine em Tempo Real</h2>
          </div>
          <a
            href={`/loja/${tenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-vitrinia-purple hover:underline bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100"
          >
            Abrir Vitrine Real
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mockup do Topo da Vitrine */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 shadow-inner">
          {/* Header Bar */}
          <div
            className="h-20 w-full relative flex items-center justify-center transition-colors"
            style={{
              backgroundColor: settings.primaryColor || "#7C3AED",
            }}
          >
            <div className="text-white/80 font-bold text-xs uppercase tracking-widest">
              Cabeçalho ({settings.companyName})
            </div>
          </div>

          {/* Dados Resumidos e Avatar */}
          <div className="p-4 bg-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl border-2 border-white overflow-hidden bg-white -mt-10 shadow-md shrink-0 flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{settings.companyName}</p>
                <p className="text-[11px] text-gray-400 font-mono">/loja/{tenant.slug}</p>
              </div>
            </div>

            {/* Mockup do Superbanner */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Visualização do Superbanner
              </span>
              {superBannerUrl ? (
                <div className="w-full aspect-[3/1] rounded-xl overflow-hidden border border-gray-200 shadow-xs">
                  <img src={superBannerUrl} alt="Superbanner" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full py-4 px-3 rounded-xl border border-dashed border-purple-200 bg-purple-50/50 text-center">
                  <p className="text-xs font-semibold text-purple-700">Placeholder elegante do Superbanner ativo</p>
                  <p className="text-[10px] text-purple-400 mt-0.5">Faça o upload acima para substituir por sua arte personalizada</p>
                </div>
              )}
            </div>

            {/* Mockup do Promo Banner */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Visualização do Banner de Promoção
              </span>
              {promoBannerUrl ? (
                <div className="w-full aspect-[2.4/1] rounded-xl overflow-hidden border border-gray-200 shadow-xs">
                  <img src={promoBannerUrl} alt="Banner de Promoção" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full py-3 px-3 rounded-xl border border-dashed border-orange-200 bg-orange-50/50 text-center">
                  <p className="text-xs font-semibold text-orange-700">Placeholder elegante de Ofertas ativo</p>
                  <p className="text-[10px] text-orange-400 mt-0.5">Banner secundário exibido no topo da listagem de produtos</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-xs">
              <div className="p-2 rounded-xl bg-gray-50">
                <span className="block text-[10px] font-bold uppercase text-gray-400">Atendimento</span>
                <span className="font-bold text-gray-800">
                  {settings.businessType === "SERVICES" ? "Apenas Serviços" : settings.businessType === "PRODUCTS" ? "Apenas Produtos" : "Produtos & Serviços"}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-gray-50">
                <span className="block text-[10px] font-bold uppercase text-gray-400">Horário</span>
                <span className="font-bold text-gray-800">
                  {settings.openingTime || "08:00"} às {settings.closingTime || "18:00"}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-gray-50 col-span-2 sm:col-span-1">
                <span className="block text-[10px] font-bold uppercase text-gray-400">Agendamento</span>
                <span className="font-bold text-emerald-700">
                  {settings.defaultSchedulingEnabled ? "Ativo" : "Desativado"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divulgação, Link e QR Code da Loja */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <StoreShareModal
          slug={tenant.slug}
          storeName={settings.companyName}
          logoUrl={logoUrl}
        />
      </div>

      {/* Cupons da Loja */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-vitrinia-orange" />
            <h2 className="text-lg font-bold text-gray-900">Cupons de Desconto</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-vitrinia-purple text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-vitrinia-purple/90 transition"
          >
            <Plus className="w-4 h-4" />
            Novo Cupom
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateCoupon} className="bg-gray-50 rounded-xl p-4 mb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Código do Cupom</label>
                <input name="code" required placeholder="EX: DESCONTO10" className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm uppercase" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
                <select name="type" className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm">
                  <option value="PERCENTAGE">Porcentagem (%)</option>
                  <option value="FIXED">Valor Fixo (R$)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Desconto</label>
                <input name="discount" type="number" min="0" step="0.01" required placeholder="Ex: 10" className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Validade (Opcional)</label>
                <input name="expiresAt" type="date" className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm" />
              </div>
            </div>
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={isPending} className="bg-vitrinia-orange text-white font-bold px-5 py-2.5 rounded-xl hover:bg-vitrinia-orange/90 transition disabled:opacity-50">
                {isPending ? "Criando..." : "Criar Cupom"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-100 transition">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {coupons.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum cupom criado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map(coupon => (
              <div key={coupon.id} className={`flex items-center justify-between p-4 rounded-xl border transition ${coupon.isActive ? 'border-gray-100 bg-gray-50' : 'border-gray-100 bg-white opacity-50'}`}>
                <div>
                  <p className="font-black text-gray-900 tracking-widest text-sm">{coupon.code}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {coupon.type === 'PERCENTAGE' ? `${coupon.discount}% de desconto` : `R$ ${coupon.discount.toFixed(2)} de desconto`}
                    {coupon.expiresAt && ` · Válido até ${new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggle(coupon.id, coupon.isActive)} className="text-gray-400 hover:text-vitrinia-purple transition">
                    {coupon.isActive ? <ToggleRight className="w-6 h-6 text-vitrinia-green" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button onClick={() => handleDelete(coupon.id)} className="text-gray-300 hover:text-red-500 transition p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
