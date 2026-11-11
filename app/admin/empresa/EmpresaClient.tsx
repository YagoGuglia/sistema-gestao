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
  Save, 
  Check, 
  AlertCircle,
  Info,
  Clock,
  Calendar,
  MapPin,
  Coffee,
  Star
} from "lucide-react";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/app/actions/coupon-actions";
import { updateStoreVisualSettings } from "@/app/actions/settings-actions";
import { StoreShareModal } from "@/components/admin/StoreShareModal";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { StoreInfoBar } from "@/components/vitrine/StoreInfoBar";

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
    storeNameColor?: string | null;
    storeSloganColor?: string | null;
    storeAddress?: string | null;
    breakInterval?: string | null;
    showHoursInCard?: boolean;
    showSchedulingHoursInCard?: boolean;
    showAddressInCard?: boolean;
    showBreakIntervalInCard?: boolean;
    showRatingInCard?: boolean;
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

  // ── ESTADOS LOCAIS REATIVOS PARA LIVE PREVIEW EM TEMPO REAL ──
  const [logoUrl, setLogoUrl] = useState<string | null>(
    settings.logoUrl || settings.companyLogoUrl || null
  );
  const [superBannerUrl, setSuperBannerUrl] = useState<string | null>(
    settings.superBannerUrl || settings.bannerUrl || null
  );
  const [promoBannerUrl, setPromoBannerUrl] = useState<string | null>(
    settings.promoBannerUrl || null
  );

  // Tipografia, Textos e Cores
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
  const [nameColor, setNameColor] = useState<string>(
    settings.storeNameColor || "#FFFFFF"
  );
  const [sloganColor, setSloganColor] = useState<string>(
    settings.storeSloganColor || "#FFFFFF"
  );

  // Card de Informações Adicionais (Info Bar)
  const [storeAddress, setStoreAddress] = useState<string>(
    settings.storeAddress || ""
  );
  const [breakInterval, setBreakInterval] = useState<string>(
    settings.breakInterval || "12:00 - 13:30"
  );
  const [showHours, setShowHours] = useState<boolean>(
    settings.showHoursInCard ?? true
  );
  const [showSchedulingHours, setShowSchedulingHours] = useState<boolean>(
    settings.showSchedulingHoursInCard ?? false
  );
  const [showAddress, setShowAddress] = useState<boolean>(
    settings.showAddressInCard ?? true
  );
  const [showBreakInterval, setShowBreakInterval] = useState<boolean>(
    settings.showBreakIntervalInCard ?? false
  );
  const [showRating, setShowRating] = useState<boolean>(
    settings.showRatingInCard ?? true
  );

  // Estado Global de Salvamento
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── FUNÇÃO DE SALVAMENTO GLOBAL DE TODA A PÁGINA ──
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    setSavingGlobal(true);

    const formData = new FormData();
    formData.append("storeFontFamily", fontFamily);
    formData.append("storeSlogan", slogan);
    formData.append("bannerOpacity", bannerOpacity.toString());
    formData.append("useSolidColorForHeader", useSolidColor ? "true" : "false");
    formData.append("primaryColor", primaryColor);
    formData.append("storeNameColor", nameColor);
    formData.append("storeSloganColor", sloganColor);
    formData.append("storeAddress", storeAddress);
    formData.append("breakInterval", breakInterval);
    formData.append("showHoursInCard", showHours ? "true" : "false");
    formData.append("showSchedulingHoursInCard", showSchedulingHours ? "true" : "false");
    formData.append("showAddressInCard", showAddress ? "true" : "false");
    formData.append("showBreakIntervalInCard", showBreakInterval ? "true" : "false");
    formData.append("showRatingInCard", showRating ? "true" : "false");

    try {
      const res = await updateStoreVisualSettings(formData);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4500);
      } else {
        setSaveError(res.error || "Erro ao salvar alterações da empresa.");
      }
    } catch (err: any) {
      setSaveError(err?.message || "Erro inesperado ao salvar.");
    } finally {
      setSavingGlobal(false);
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
    <div className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto pb-24">
      {/* ── HEADER DA PÁGINA COM BOTÃO DE SALVAR GLOBAL ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Minha Empresa</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Identidade visual, banners, informações públicas e vitrine da sua loja.
          </p>
        </div>

        {/* Botão de Salvar Global no Topo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={savingGlobal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-vitrinia-purple hover:bg-vitrinia-purple/90 text-white rounded-xl text-xs font-bold shadow-md shadow-vitrinia-purple/20 transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingGlobal ? "Salvando Alterações..." : "Salvar Alterações"}</span>
          </button>
        </div>
      </div>

      {/* Alertas de Notificação Global */}
      {saveError && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">Todas as configurações visuais e informações da vitrine foram salvas com sucesso!</span>
        </div>
      )}

      {/* Info Rápida da Loja */}
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
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${tenant.plan === 'PRO' || tenant.plan === 'pro' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-500'}`}>
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-vitrinia-purple hover:underline bg-purple-50 px-3.5 py-2 rounded-xl border border-purple-100 shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ver Vitrine Online</span>
        </a>
      </div>

      {/* ── CARD 1: UPLOADS DE IMAGENS COMPACTOS (SHADCN UI STYLE) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
            <Palette className="w-4 h-4 text-vitrinia-purple" />
            Banners & Logotipo da Loja
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">Design compacto com pré-visualização</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <ImageUploader
            type="logo"
            label="1. Logotipo da Empresa"
            recommendation="Formato quadrado (PNG/JPG), mín. 400x400px"
            initialUrl={logoUrl}
            onUploaded={(url) => setLogoUrl(url)}
            onRemoved={() => setLogoUrl(null)}
          />

          <ImageUploader
            type="superBanner"
            label="2. Superbanner (Fundo do Cabeçalho da Loja)"
            recommendation="1200x500px horizontal (máx. 5MB)"
            initialUrl={superBannerUrl}
            onUploaded={(url) => setSuperBannerUrl(url)}
            onRemoved={() => setSuperBannerUrl(null)}
          />

          <ImageUploader
            type="promoBanner"
            label="3. Banner de Promoção (Destaque Acima dos Produtos)"
            recommendation="800x400px proporção 2:1 sem cortes indesejados"
            initialUrl={promoBannerUrl}
            onUploaded={(url) => setPromoBannerUrl(url)}
            onRemoved={() => setPromoBannerUrl(null)}
          />
        </div>
      </div>

      {/* ── CARD 2: ESTILO, TIPOGRAFIA & CABEÇALHO (AGRUPAMENTO LÓGICO) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
            <Sliders className="w-4 h-4 text-vitrinia-purple" />
            Estilo, Tipografia & Cores do Cabeçalho
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure fontes, textos e cores agrupadas logicamente. As alterações refletem no Live Preview abaixo.
          </p>
        </div>

        <div className="space-y-5">
          {/* GRUPO 1: NOME DA LOJA (FONTE + COR DO NOME JUNTOS) */}
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-3">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-vitrinia-purple" />
              1. Identidade do Nome da Loja
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fonte do Nome */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">Fonte da Loja</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-vitrinia-purple/20 focus:border-vitrinia-purple outline-none transition"
                >
                  {AVAILABLE_FONTS.map((font) => (
                    <option key={font.id} value={font.id} style={{ fontFamily: font.id }}>
                      {font.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400">Tipografia aplicada ao título na vitrine.</p>
              </div>

              {/* Cor do Nome */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">Cor do Nome</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={nameColor}
                    onChange={(e) => setNameColor(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border-0 bg-transparent p-0"
                    title="Selecione a cor do nome da loja"
                  />
                  <input
                    type="text"
                    value={nameColor}
                    onChange={(e) => setNameColor(e.target.value)}
                    className="p-2 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-700 w-28 text-center uppercase"
                  />
                  <span className="text-[11px] text-gray-400">Texto</span>
                </div>
                <p className="text-[10px] text-gray-400">Garanta contraste com o fundo escolhido.</p>
              </div>
            </div>
          </div>

          {/* GRUPO 2: FRASE DE EFEITO / SLOGAN (TEXTO + COR DO SLOGAN JUNTOS) */}
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-vitrinia-purple" />
                2. Frase de Efeito (Slogan)
              </span>
              <span className={`text-[10px] font-mono font-semibold ${slogan.length > 40 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                {slogan.length}/45
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Texto do Slogan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">Texto do Slogan</label>
                <input
                  type="text"
                  maxLength={45}
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Ex: O seu presente está aqui"
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:ring-2 focus:ring-vitrinia-purple/20 focus:border-vitrinia-purple outline-none transition"
                />
                <p className="text-[10px] text-gray-400">Limite de 45 caracteres para perfeita harmonia.</p>
              </div>

              {/* Cor do Slogan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">Cor do Slogan</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sloganColor}
                    onChange={(e) => setSloganColor(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border-0 bg-transparent p-0"
                    title="Selecione a cor do slogan"
                  />
                  <input
                    type="text"
                    value={sloganColor}
                    onChange={(e) => setSloganColor(e.target.value)}
                    className="p-2 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-700 w-28 text-center uppercase"
                  />
                  <span className="text-[11px] text-gray-400">Slogan</span>
                </div>
                <p className="text-[10px] text-gray-400">Cor do subtítulo e frases de impacto.</p>
              </div>
            </div>
          </div>

          {/* GRUPO 3: CABEÇALHO, COR SÓLIDA & OPACIDADE */}
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-3">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-vitrinia-purple" />
              3. Fundo do Cabeçalho & Translucidez
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cor Sólida e Cor Primária */}
              <div className="space-y-2 p-3 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Usar Cor Sólida</span>
                    <span className="text-[10px] text-gray-500">Oculta a imagem e usa fundo sólido</span>
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
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-700 w-24 text-center uppercase"
                  />
                  <span className="text-[11px] text-gray-400">Cor do Cabeçalho</span>
                </div>
              </div>

              {/* Slider de Translucidez */}
              <div className={`space-y-2 p-3 bg-white rounded-xl border border-gray-100 transition ${useSolidColor ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 block">Opacidade do Banner</label>
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
                <p className="text-[10px] text-gray-400">Ajusta a intensidade da foto sobre o fundo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 3: INFORMAÇÕES ADICIONAIS DA VITRINE (INFO BAR COM TOGGLES) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-vitrinia-purple" />
            Informações Adicionais da Vitrine (Barra de Destaque)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Ative os itens que deseja destacar para os clientes entre o cabeçalho e os produtos da sua loja.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Toggle Horário de Funcionamento */}
          <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-vitrinia-purple flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={15} />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-800 block">Horário de Funcionamento</span>
                <span className="text-[10px] text-gray-500">
                  {settings.openingTime && settings.closingTime ? `${settings.openingTime} às ${settings.closingTime}` : "Exibe turnos configurados"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHours(!showHours)}
              className="text-gray-400 hover:text-vitrinia-purple transition shrink-0"
            >
              {showHours ? (
                <ToggleRight className="w-7 h-7 text-vitrinia-purple" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-gray-300" />
              )}
            </button>
          </div>

          {/* 2. Toggle Horário de Agendamento */}
          <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Calendar size={15} />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-800 block">Horário de Agendamento</span>
                <span className="text-[10px] text-gray-500">Indica disponibilidade para serviços</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSchedulingHours(!showSchedulingHours)}
              className="text-gray-400 hover:text-vitrinia-purple transition shrink-0"
            >
              {showSchedulingHours ? (
                <ToggleRight className="w-7 h-7 text-vitrinia-purple" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-gray-300" />
              )}
            </button>
          </div>

          {/* 3. Toggle Endereço Físico + Input */}
          <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin size={15} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Endereço Físico</span>
                  <span className="text-[10px] text-gray-500">Facilita retirada no balcão e localização</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddress(!showAddress)}
                className="text-gray-400 hover:text-vitrinia-purple transition shrink-0"
              >
                {showAddress ? (
                  <ToggleRight className="w-7 h-7 text-vitrinia-purple" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-gray-300" />
                )}
              </button>
            </div>
            {showAddress && (
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo"
                className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:ring-2 focus:ring-vitrinia-purple/20 focus:border-vitrinia-purple outline-none transition"
              />
            )}
          </div>

          {/* 4. Toggle Intervalo de Pausa + Input */}
          <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Coffee size={15} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Intervalo de Pausa / Almoço</span>
                  <span className="text-[10px] text-gray-500">Informa horário de fechamento temporário</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBreakInterval(!showBreakInterval)}
                className="text-gray-400 hover:text-vitrinia-purple transition shrink-0"
              >
                {showBreakInterval ? (
                  <ToggleRight className="w-7 h-7 text-vitrinia-purple" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-gray-300" />
                )}
              </button>
            </div>
            {showBreakInterval && (
              <input
                type="text"
                value={breakInterval}
                onChange={(e) => setBreakInterval(e.target.value)}
                placeholder="Ex: 12:00 - 13:30"
                className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:ring-2 focus:ring-vitrinia-purple/20 focus:border-vitrinia-purple outline-none transition"
              />
            )}
          </div>

          {/* 5. Toggle Nota Média / Avaliações */}
          <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <Star size={15} className="fill-amber-400 text-amber-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-800 block">Nota Média & Avaliações</span>
                <span className="text-[10px] text-gray-500">Exibe a reputação da loja calculada</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowRating(!showRating)}
              className="text-gray-400 hover:text-vitrinia-purple transition shrink-0"
            >
              {showRating ? (
                <ToggleRight className="w-7 h-7 text-vitrinia-purple" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── CARD 4: LIVE PREVIEW EM TEMPO REAL COM A INFO BAR ── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <Eye className="w-5 h-5 text-vitrinia-purple" />
            <h2 className="text-sm sm:text-base">Live Preview da Vitrine (Visão do Cliente em Tempo Real)</h2>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            ● Atualização em Tempo Real
          </span>
        </div>

        {/* Mockup da Vitrine */}
        <div className="rounded-3xl border border-gray-200 overflow-hidden bg-gray-50 shadow-inner">
          {/* CABEÇALHO DO MOCKUP */}
          <div
            className="w-full relative rounded-b-[2rem] overflow-hidden transition-all min-h-[190px] sm:min-h-[220px] flex flex-col justify-between p-4"
            style={{ backgroundColor: primaryColor }}
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

            {/* Centro do Cabeçalho: Logo + Nome (Fonte e Cor) + Slogan (Texto e Cor) */}
            <div className="relative z-10 flex flex-col items-center justify-center my-2 text-center">
              <div className="w-16 h-16 bg-white rounded-full p-0.5 shadow-xl flex items-center justify-center overflow-hidden border-2 border-white/95">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <Store className="w-7 h-7 text-vitrinia-purple" />
                )}
              </div>

              <h3 
                className="font-black text-lg sm:text-xl mt-2 drop-shadow-sm tracking-tight transition-all"
                style={{ 
                  fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : "inherit",
                  color: nameColor,
                }}
              >
                {settings.companyName}
              </h3>

              <p 
                className="text-[11px] sm:text-xs font-medium tracking-wide uppercase mt-0.5 drop-shadow-xs max-w-sm truncate px-2"
                style={{ color: sloganColor }}
              >
                {slogan || "O SEU PEDIDO EM UM CLIQUE"}
              </p>
            </div>
          </div>

          {/* BARRA DE INFORMAÇÕES ADICIONAIS (INFO BAR NO MOCKUP) */}
          <StoreInfoBar
            showHours={showHours}
            hoursText={settings.openingTime && settings.closingTime ? `${settings.openingTime} às ${settings.closingTime}` : "08:00 às 18:00"}
            showSchedulingHours={showSchedulingHours}
            schedulingHoursText="Agendamentos disponíveis"
            showAddress={showAddress}
            addressText={storeAddress || "Rua das Flores, 123 - Centro"}
            showBreakInterval={showBreakInterval}
            breakIntervalText={`Pausa: ${breakInterval || "12:00 - 13:30"}`}
            showRating={showRating}
            ratingAverage={5.0}
            totalReviews={12}
          />

          {/* BANNER PROMOCIONAL ADAPTADO (SEM CORTE) */}
          <div className="p-4 sm:p-5 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Banner de Promoção (Proporção 2:1 sem cortes)
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
                    Envie um banner de oferta para aparecer com destaque aqui
                  </p>
                </div>
              )}
            </div>

            {/* Categorias & Produtos de Exemplo */}
            <div className="pt-2 border-t border-gray-200 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Exemplo de Categorias e Produtos
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

      {/* ── CARD 5: DIVULGAÇÃO & QR CODE DA LOJA ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
        <StoreShareModal
          slug={tenant.slug}
          storeName={settings.companyName}
          logoUrl={logoUrl}
        />
      </div>

      {/* ── CARD 6: CUPONS DA LOJA ── */}
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

      {/* ── BARRA FLUTUANTE DE SALVAMENTO GLOBAL NO RODAPÉ (STICKY FOOTER) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3.5 px-4 shadow-lg lg:pl-76">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium hidden sm:inline">Modo de edição da vitrine ativo</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={savingGlobal}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-vitrinia-purple hover:bg-vitrinia-purple/90 text-white rounded-xl text-xs font-bold shadow-md shadow-vitrinia-purple/20 transition active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingGlobal ? "Salvando Alterações..." : "Salvar Alterações"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
