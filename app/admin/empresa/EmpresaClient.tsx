"use client";

import { useState, useTransition } from "react";
import { Store, Tag, Plus, Trash2, ToggleLeft, ToggleRight, Eye, Clock, Sparkles, ExternalLink, Palette, CheckCircle2 } from "lucide-react";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/app/actions/coupon-actions";
import { StoreShareModal } from "@/components/admin/StoreShareModal";

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
    bannerUrl?: string | null;
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
        <p className="text-gray-500 text-sm mt-1">Informações da sua loja e configurações públicas.</p>
      </div>

      {/* Info da Loja */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-vitrinia-purple/10 rounded-2xl flex items-center justify-center">
            {settings.companyLogoUrl
              ? <img src={settings.companyLogoUrl} className="w-full h-full object-cover rounded-2xl" alt="Logo" />
              : <Store className="w-8 h-8 text-vitrinia-purple" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{settings.companyName}</h2>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${tenant.plan === 'PRO' || tenant.plan === 'pro' ? 'bg-purple-100 text-purple-700 font-extrabold border border-purple-200' : 'bg-gray-100 text-gray-500'}`}>
              Plano {tenant.plan.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Read-Only da Vitrine do Cliente Final */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <Eye className="w-5 h-5 text-vitrinia-purple" />
            <h2 className="text-lg">Preview da Loja (Como o cliente enxerga)</h2>
          </div>
          <a
            href={`/loja/${tenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-vitrinia-purple hover:underline bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100"
          >
            Abrir Vitrine
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mockup do Topo da Vitrine */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 shadow-inner">
          {/* Banner */}
          <div
            className="h-28 w-full bg-cover bg-center relative flex items-center justify-center"
            style={{
              backgroundColor: settings.primaryColor || "#7C3AED",
              backgroundImage: settings.bannerUrl ? `url(${settings.bannerUrl})` : undefined,
            }}
          >
            {!settings.bannerUrl && (
              <span className="text-white/80 font-bold text-xs uppercase tracking-widest">
                Cor Primária Configurada ({settings.primaryColor})
              </span>
            )}
          </div>

          {/* Dados Resumidos */}
          <div className="p-4 bg-white space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 -mt-8 shadow-md shrink-0 flex items-center justify-center">
                {settings.companyLogoUrl ? (
                  <img src={settings.companyLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{settings.companyName}</p>
                <p className="text-[11px] text-gray-400 font-mono">/loja/{tenant.slug}</p>
              </div>
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
          logoUrl={settings.companyLogoUrl}
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
