"use client";

import { useState, useTransition } from "react";
import {
  Store, Users, ShoppingCart, Package, ExternalLink,
  Tag, Plus, Trash2, CheckCircle2, AlertCircle
} from "lucide-react";
import { createPlatformCoupon, deletePlatformCoupon } from "@/app/actions/superadmin-actions";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  createdAt: Date;
  settings: { companyName: string } | null;
  _count: { orders: number; users: number; products: number };
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: string;
  isActive: boolean;
  expiresAt: Date | null;
}

interface Props {
  tenants: Tenant[];
  platformCoupons: Coupon[];
}

export function SuperAdminClient({ tenants, platformCoupons: initialCoupons }: Props) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const totalLojas = tenants.length;
  const totalPedidos = tenants.reduce((acc, t) => acc + t._count.orders, 0);
  const totalClientes = tenants.reduce((acc, t) => acc + t._count.users, 0);

  const handleCreateCoupon = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createPlatformCoupon(formData);
      if (result?.error) { setFormError(result.error); }
      else { setShowForm(false); window.location.reload(); }
    });
  };

  const handleDeleteCoupon = (id: string) => {
    if (!confirm("Excluir este cupom de plataforma?")) return;
    startTransition(() => deletePlatformCoupon(id));
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Dashboard Master</h1>
        <p className="text-gray-500 mt-1">Visão geral de todas as lojas na plataforma Vitrinia.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Lojas Cadastradas", value: totalLojas, icon: Store, color: "text-vitrinia-purple bg-vitrinia-purple/10" },
          { label: "Pedidos Totais", value: totalPedidos, icon: ShoppingCart, color: "text-vitrinia-orange bg-vitrinia-orange/10" },
          { label: "Clientes Registrados", value: totalClientes, icon: Users, color: "text-vitrinia-green bg-vitrinia-green/10" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lista de Lojas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">Lojas Registradas</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {tenants.map(t => (
            <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-vitrinia-purple/10 rounded-xl flex items-center justify-center text-vitrinia-purple font-bold text-lg">
                  {(t.settings?.companyName || t.name).charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{t.settings?.companyName || t.name}</p>
                  <p className="text-xs text-gray-400">/{t.slug} · Plano {t.plan.toUpperCase()} · {new Date(t.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> {t._count.products}</span>
                  <span className="flex items-center gap-1"><ShoppingCart className="w-3.5 h-3.5" /> {t._count.orders}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t._count.users}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {t.status === 'ACTIVE' ? 'Ativa' : 'Suspensa'}
                </span>
                <a
                  href={`/loja/${t.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-vitrinia-purple hover:bg-vitrinia-purple/10 rounded-lg transition"
                  title="Ver Vitrine"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
          {tenants.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-400">
              Nenhuma loja cadastrada ainda.
            </div>
          )}
        </div>
      </div>

      {/* Cupons da Plataforma */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-vitrinia-orange" />
            <h2 className="font-bold text-gray-900 text-lg">Cupons Globais (Desconto nos Planos)</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-vitrinia-purple text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-vitrinia-purple/90 transition"
          >
            <Plus className="w-4 h-4" /> Novo Cupom
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateCoupon} className="p-6 bg-gray-50 border-b border-gray-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Código</label>
                <input name="code" required placeholder="EX: LAUNCH50" className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm uppercase" />
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
                <input name="discount" type="number" min="0" step="0.01" required placeholder="Ex: 50" className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm" />
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
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-5 py-2.5 rounded-xl hover:bg-gray-100 transition">
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-gray-50">
          {coupons.map(coupon => (
            <div key={coupon.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-black tracking-widest text-gray-900">{coupon.code}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {coupon.type === 'PERCENTAGE' ? `${coupon.discount}% de desconto no plano` : `R$ ${coupon.discount.toFixed(2)} de desconto`}
                  {coupon.expiresAt && ` · Até ${new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}`}
                </p>
              </div>
              <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-gray-300 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {coupons.length === 0 && (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              Nenhum cupom de plataforma criado ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
