"use client";

import { useState, useTransition } from "react";
import { 
  Store, 
  Tag, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Eye, 
  ExternalLink, 
  Palette, 
  Type, 
  Sliders, 
  Sparkles, 
  Save, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/app/actions/coupon-actions";
import { updateStoreVisualSettings } from "@/app/actions/settings-actions";
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
    storeFontFamily?: string;
    storeSlogan?: string | null;
    bannerOpacity?: number;
    useSolidColorForHeader?: boolean;
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

const AVAILABLE_FONTS = [
  { id: "Inter", label: "Inter (Moderna & Padrão)" },
  { id: "Playfair Display", label: "Playfair Display (Elegante com Serifa)" },
  { id: "Roboto", label: "Roboto (Neutra & Versátil)" },
  { id: "Montserrat", label: "Montserrat (Geométrica & Marcante)" },
  { id: "Poppins", label: "Poppins (Amigável & Arredondada)" },
];

export function EmpresaClient({ tenant, settings, coupons: initialCoupons }: Props) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState("");

  // Estados locais reativos para LIVE PREVIEW em tempo real
  const [logoUrl, setLogoUrl] = useState<string | null>(
    settings.logoUrl || settings.companyLogoUrl || null
  );
  const [superBannerUrl, setSuperBannerUrl] = useState<string | null>(
    settings.superBannerUrl || settings.bannerUrl || null
  );
  const [promoBannerUrl, setPromoBannerUrl] = useState<string | null>(
    settings.promoBannerUrl || null
  );

  const [fontFamily, setFontFamily] = useState<string>(
    settings.storeFontFamily || "Inter"
  );
  const [slogan, setSlogan] = useState<string>(
    settings.storeSlogan || "O SEU PEDIDO EM UM CLIQUE"
  );
  const [bannerOpacity, setBannerOpacity] = useState<number>(
    settings.bannerOpacity ?? 1.0
  );
  const [useSolidColor, setUseSolidColor] = useState<boolean>(
    settings.useSolidColorForHeader ?? false
  );
  const [primaryColor, setPrimaryColor] = useState<string>(
    settings.primaryColor || "#7C3AED"
  );

  const [savingVisuals, setSavingVisuals] = useState(false);
  const [visualSuccess, setVisualSuccess] = useState(false);
  const [visualError, setVisualError] = useState<string | null>(null);

  const handleSaveVisualSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setVisualError(null);
    setVisualSuccess(false);
    setSavingVisuals(true);

    const formData = new FormData();
    formData.append("storeFontFamily", fontFamily);
    formData.append("storeSlogan", slogan);
    formData.append("bannerOpacity", bannerOpacity.toString());
    formData.append("useSolidColorForHeader", useSolidColor ? "true" : "false");
    formData.append("primaryColor", primaryColor);

    try {
      const res = await updateStoreVisualSettings(formData);
      if (res.success) {
        setVisualSuccess(true);
        setTimeout(() => setVisualSuccess(false), 4000);
      } else {
        setVisualError(res.error || "Erro ao salvar alterações visuais.");
      }
    } catch (err: any) {
      setVisualError(err?.message || "Erro inesperado ao salvar.");
    } finally {
      setSavingVisuals(false);
    }
  };

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
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minha Empresa</h1>
        <p className="text-gray-500 text-sm mt-1">
          Identidade visual, banners da vitrine e configurações públicas da sua loja.
        </p>
      </div>

      {/* Info da Loja */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 bg-vitrinia-purple/10 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
            {logoUrl ? (
              <img src={logoUrl} className="w-full h-full object-cover" alt="Logo" />
            ) : (
              <Store className="w-7 h-7 text-vitrinia-purple" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{settings.companyName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[11px] font-bold px-2 py-0.2 rounded-full ${tenant.plan === 'PRO' || tenant.plan === 'pro' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-500'}`}>
                Plano {tenant.plan.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400 font-mono">/loja/{tenant.slug}</span>
            </div>
          </div>
        </div>

        <a
          href={`/loja/${tenant.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-vitrinia-purple hover:underline bg-purple-50 px-3 py-2 rounded-xl border border-purple-100 shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ver Vitrine Online</span>
        </a>
      </div>

      {/* FORMULÁRIO DE CUSTOMIZAÇÃO VISUAL & LIVE PREVIEW */}
      <div className="space-y-6">
        {/* Bloco 1: Uploads de Imagens Compactos (Shadcn UI style) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <Palette className="w-4 h-4 text-vitrinia-purple" />
              Uploads de Imagens da Loja
            </h3>
            <span className="text-[11px] text-gray-400">Design compacto e direto</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <ImageUploader
              type="logo"
              label="1. Logo da Empresa"
              recommendation="Formato quadrado (PNG/JPG), mín. 400x400px"
              initialUrl={logoUrl}
              onUploaded={(url) => setLogoUrl(url)}
              onRemoved={() => setLogoUrl(null)}
            />

            <ImageUploader
              type="superBanner"
              label="2. Superbanner (Banner de Cabeçalho)"
              recommendation="1200x500px horizontal (máx. 5MB)"
              initialUrl={superBannerUrl}
              onUploaded={(url) => setSuperBannerUrl(url)}
              onRemoved={() => setSuperBannerUrl(null)}
            />

            <ImageUploader
              type="promoBanner"
              label="3. Banner de Promoção (Acima dos Produtos)"
              recommendation="800x400px proporção 2:1 (sem cortes indesejados)"
              initialUrl={promoBannerUrl}
              onUploaded={(url) => setPromoBannerUrl(url)}
              onRemoved={() => setPromoBannerUrl(null)}
            />
          </div>
        </div>

        {/* Bloco 2: Tipografia, Slogan, Translucidez e Cor Sólida */}
        <form onSubmit={handleSaveVisualSettings} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-vitrinia-purple" />
                Estilo, Tipografia & Cabeçalho
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Altere em tempo real e visualize as mudanças instantaneamente no preview abaixo.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingVisuals}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-vitrinia-purple hover:bg-vitrinia-purple/90 px-4 py-2 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {savingVisuals ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>

          {visualError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{visualError}</span>
            </div>
          )}

          {visualSuccess && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Configurações visuais salvas com sucesso!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipografia da Loja */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-vitrinia-purple" />
                Fonte do Nome da Loja
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-vitrinia-purple/20 focus:border-vitrinia-purple outline-none transition"
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font.id} value={font.id} style={{ fontFamily: font.id }}>
                    {font.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400">
                A fonte escolhida será aplicada ao título da sua loja na vitrine.
              </p>
            </div>

            {/* Slogan com Limite de 45 Caracteres */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700">
                  Frase de Efeito / Slogan
                </label>
                <span className={`text-[10px] font-mono font-semibold ${slogan.length > 40 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                  {slogan.length}/45
                </span>
              </div>
              <input
                type="text"
                maxLength={45}
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="Ex: O seu presente está aqui"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-vitrinia-purple/20 focus:border-vitrinia-purple outline-none transition"
              />
              <p className="text-[10px] text-gray-400">
                Máximo de 45 caracteres para perfeita harmonia no cabeçalho.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            {/* Opção de Cor Sólida */}
            <div className="space-y-2 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">
                    Cor Sólida no Cabeçalho
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Oculta a imagem e usa preenchimento sólido
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseSolidColor(!useSolidColor)}
                  className="text-gray-400 hover:text-vitrinia-purple transition"
                >
                  {useSolidColor ? (
                    <ToggleRight className="w-7 h-7 text-vitrinia-purple" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-gray-300" />
                  )}
                </button>
              </div>

              {/* Seletor de Cor Primária */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  title="Escolha a cor do cabeçalho"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-700 w-24 text-center uppercase"
                />
                <span className="text-[11px] text-gray-400">Cor do tema</span>
              </div>
            </div>

            {/* Controle Deslizante de Translucidez (Slider) */}
            <div className={`space-y-2 p-3 rounded-xl border border-gray-100 transition ${useSolidColor ? 'opacity-40 pointer-events-none bg-gray-50/30' : 'bg-gray-50/50'}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 block">
                  Opacidade do Banner de Cabeçalho
                </label>
                <span className="text-xs font-bold text-vitrinia-purple bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                  {Math.round(bannerOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                disabled={useSolidColor}
                value={Math.round(bannerOpacity * 100)}
                onChange={(e) => setBannerOpacity(parseInt(e.target.value) / 100)}
                className="w-full accent-vitrinia-purple cursor-pointer h-2 bg-gray-200 rounded-lg"
              />
              <p className="text-[10px] text-gray-400">
                Ajuste a intensidade da foto sobre o fundo colorido.
              </p>
            </div>
          </div>
        </form>

        {/* Bloco 3: Live Preview em Tempo Real */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-900 font-bold">
              <Eye className="w-5 h-5 text-vitrinia-purple" />
              <h2 className="text-sm sm:text-base">Live Preview da Vitrine (Visão do Cliente)</h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              ● Atualização em Tempo Real
            </span>
          </div>

          {/* Container do Mockup com estilo idêntico à vitrine pública */}
          <div className="rounded-3xl border border-gray-200 overflow-hidden bg-gray-50 shadow-inner">
            {/* CABEÇALHO DO MOCKUP (Sem overlay escuro forçado) */}
            <div
              className="w-full relative rounded-b-[2rem] overflow-hidden transition-all min-h-[190px] sm:min-h-[220px] flex flex-col justify-between p-4"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              {/* Superbanner com Opacidade Controlada */}
              {!useSolidColor && superBannerUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-200"
                  style={{
                    backgroundImage: `url(${superBannerUrl})`,
                    opacity: bannerOpacity,
                  }}
                />
              )}

              {/* Barra Superior do Mockup */}
              <div className="relative z-10 flex items-center justify-between text-white/95 text-xs">
                <span className="font-extrabold tracking-tight bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg">
                  vitrinia
                </span>
                <span className="text-[10px] bg-emerald-500 font-bold px-2 py-0.5 rounded-full shadow-xs">
                  Aberto agora
                </span>
              </div>

              {/* Centro do Cabeçalho: Logo Circular + Nome (Fonte Escolhida) + Slogan (máx 45 chars) */}
              <div className="relative z-10 flex flex-col items-center justify-center my-2 text-center">
                <div className="w-16 h-16 bg-white rounded-full p-0.5 shadow-xl flex items-center justify-center overflow-hidden border-2 border-white/95">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Store className="w-7 h-7 text-vitrinia-purple" />
                  )}
                </div>

                <h3 
                  className="text-white font-black text-lg sm:text-xl mt-2 drop-shadow-sm tracking-tight transition-all"
                  style={{ fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : "inherit" }}
                >
                  {settings.companyName}
                </h3>

                <p className="text-[11px] sm:text-xs text-white/95 font-medium tracking-wide uppercase mt-0.5 drop-shadow-xs max-w-sm truncate px-2">
                  {slogan || "O SEU PEDIDO EM UM CLIQUE"}
                </p>
              </div>
            </div>

            {/* CONTEÚDO DO MOCKUP: BANNER PROMOCIONAL ADAPTADO (SEM CORTE) */}
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Banner de Promoção (Proporção 2:1 sem corte)
                </span>
                {promoBannerUrl ? (
                  <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden border border-gray-200 shadow-xs bg-white flex items-center justify-center">
                    <img
                      src={promoBannerUrl}
                      alt="Banner de Promoção"
                      className="w-full h-full object-contain transition duration-200"
                    />
                  </div>
                ) : (
                  <div className="w-full p-4 rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 text-center">
                    <p className="text-xs font-semibold text-orange-700">Banner de Promoção (Placeholder)</p>
                    <p className="text-[10px] text-orange-400 mt-0.5">
                      Envie um banner promocional (ex: 800x400px) para aparecer em destaque aqui
                    </p>
                  </div>
                )}
              </div>

              {/* Categorias & Produtos de Exemplo */}
              <div className="pt-2 border-t border-gray-200 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Exemplo da Listagem de Produtos
                </span>
                <div className="flex gap-2">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-vitrinia-purple text-white shadow-2xs">
                    Todos
                  </span>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gray-200 text-gray-700">
                    Destaques
                  </span>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gray-200 text-gray-700">
                    Ofertas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divulgação, Link e QR Code da Loja */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
        <StoreShareModal
          slug={tenant.slug}
          storeName={settings.companyName}
          logoUrl={logoUrl}
        />
      </div>

      {/* Cupons da Loja */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
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
