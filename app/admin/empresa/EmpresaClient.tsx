"use client";

import { useState, useTransition } from "react";
import { Store, Copy, Check, Tag, Plus, Trash2, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/app/actions/coupon-actions";

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
  settings: { companyName: string; companyLogoUrl: string | null };
  coupons: Coupon[];
  vitrineUrl: string;
}

export function EmpresaClient({ tenant, settings, coupons: initialCoupons, vitrineUrl }: Props) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState("");

  const copyLink = () => {
    navigator.clipboard.writeText(vitrineUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minha Empresa</h1>
        <p className="text-gray-500 text-sm mt-1">Informações da sua loja e configurações públicas.</p>
      </div>

      {/* Info da Loja */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-vitrinia-purple/10 rounded-2xl flex items-center justify-center">
            {settings.companyLogoUrl
              ? <img src={settings.companyLogoUrl} className="w-full h-full object-cover rounded-2xl" alt="Logo" />
              : <Store className="w-8 h-8 text-vitrinia-purple" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{settings.companyName}</h2>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${tenant.plan === 'pro' ? 'bg-vitrinia-purple/10 text-vitrinia-purple' : 'bg-gray-100 text-gray-500'}`}>
              Plano {tenant.plan.toUpperCase()}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Link da sua Vitrine Pública</p>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-sm text-gray-600 flex-1 truncate">{vitrineUrl}</p>
            <button
              onClick={copyLink}
              className="p-1.5 rounded-lg hover:bg-gray-200 transition text-gray-500"
              title="Copiar link"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <a href={vitrineUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-gray-200 transition text-gray-500" title="Abrir Vitrine">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
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
