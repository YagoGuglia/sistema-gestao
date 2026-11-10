"use client";

import { useState, useTransition } from "react";
import {
  Store,
  Users,
  ShoppingCart,
  Package,
  ExternalLink,
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Ban,
  ShieldCheck,
  Star,
  Loader2,
} from "lucide-react";
import {
  createPlatformCoupon,
  deletePlatformCoupon,
  toggleTenantStatus,
  updateTenantPlan,
} from "@/app/actions/superadmin-actions";

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

export function SuperAdminClient({ tenants: initialTenants, platformCoupons: initialCoupons }: Props) {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [loadingTenantId, setLoadingTenantId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalLojas = tenants.length;
  const totalPedidos = tenants.reduce((acc, t) => acc + t._count.orders, 0);
  const totalClientes = tenants.reduce((acc, t) => acc + t._count.users, 0);

  const handleToggleStatus = (tenant: Tenant) => {
    const isBlocking = tenant.status === "ACTIVE";
    const actionLabel = isBlocking ? "bloquear" : "liberar";
    if (!confirm(`Deseja realmente ${actionLabel} a loja "${tenant.settings?.companyName || tenant.name}"?`)) {
      return;
    }

    setLoadingTenantId(tenant.id);
    startTransition(async () => {
      try {
        const res = await toggleTenantStatus(tenant.id);
        if (res.success) {
          setTenants((prev) =>
            prev.map((t) => (t.id === tenant.id ? { ...t, status: res.status } : t))
          );
        }
      } catch (err: any) {
        alert(err.message || "Erro ao alterar status da loja.");
      } finally {
        setLoadingTenantId(null);
      }
    });
  };

  const handlePlanChange = (tenantId: string, newPlan: "FREE" | "PRO") => {
    setLoadingTenantId(tenantId);
    startTransition(async () => {
      try {
        const res = await updateTenantPlan(tenantId, newPlan);
        if (res.success) {
          setTenants((prev) =>
            prev.map((t) => (t.id === tenantId ? { ...t, plan: res.plan } : t))
          );
        }
      } catch (err: any) {
        alert(err.message || "Erro ao alterar plano da loja.");
      } finally {
        setLoadingTenantId(null);
      }
    });
  };

  const handleCreateCoupon = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createPlatformCoupon(formData);
      if (result?.error) {
        setFormError(result.error);
      } else {
        setShowForm(false);
        window.location.reload();
      }
    });
  };

  const handleDeleteCoupon = (id: string) => {
    if (!confirm("Excluir este cupom de plataforma?")) return;
    startTransition(() => deletePlatformCoupon(id));
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Master</h1>
        <p className="text-gray-500 mt-1">
          Visão geral, moderação de lojas e gestão de planos da plataforma Vitrinia.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Lojas Cadastradas",
            value: totalLojas,
            icon: Store,
            color: "text-vitrinia-purple bg-vitrinia-purple/10",
          },
          {
            label: "Pedidos Totais",
            value: totalPedidos,
            icon: ShoppingCart,
            color: "text-vitrinia-orange bg-vitrinia-orange/10",
          },
          {
            label: "Clientes Registrados",
            value: totalClientes,
            icon: Users,
            color: "text-vitrinia-green bg-vitrinia-green/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lista de Lojas com Bloqueio e Alteração de Plano */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">Lojas e Prestadores de Serviço</h2>
          <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
            {tenants.length} lojas
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {tenants.map((t) => {
            const isBlocked = t.status === "BLOCKED" || t.status === "SUSPENDED";
            const isLoading = loadingTenantId === t.id;

            return (
              <div
                key={t.id}
                className={`p-5 lg:px-6 lg:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                  isBlocked ? "bg-red-50/40" : "hover:bg-gray-50/60"
                }`}
              >
                {/* Dados da Loja */}
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
                      isBlocked
                        ? "bg-red-100 text-red-600"
                        : "bg-vitrinia-purple/10 text-vitrinia-purple"
                    }`}
                  >
                    {(t.settings?.companyName || t.name).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-base truncate">
                        {t.settings?.companyName || t.name}
                      </p>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isBlocked
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {isBlocked ? "Bloqueada" : "Ativa"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      /{t.slug} · Criada em {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                {/* Métricas e Controles */}
                <div className="flex items-center gap-3 lg:gap-4 flex-wrap justify-between md:justify-end">
                  {/* Estatísticas */}
                  <div className="hidden lg:flex items-center gap-3 text-xs text-gray-500 mr-2">
                    <span className="flex items-center gap-1 font-medium" title="Produtos/Serviços">
                      <Package className="w-3.5 h-3.5 text-gray-400" /> {t._count.products}
                    </span>
                    <span className="flex items-center gap-1 font-medium" title="Pedidos">
                      <ShoppingCart className="w-3.5 h-3.5 text-gray-400" /> {t._count.orders}
                    </span>
                    <span className="flex items-center gap-1 font-medium" title="Clientes">
                      <Users className="w-3.5 h-3.5 text-gray-400" /> {t._count.users}
                    </span>
                  </div>

                  {/* Alterar Plano */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handlePlanChange(t.id, "FREE")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        t.plan === "FREE"
                          ? "bg-white text-gray-800 shadow-sm"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      FREE
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handlePlanChange(t.id, "PRO")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                        t.plan === "PRO"
                          ? "bg-gradient-to-r from-vitrinia-purple to-indigo-600 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <Star size={11} className={t.plan === "PRO" ? "fill-white" : ""} />
                      PRO
                    </button>
                  </div>

                  {/* Botão Bloquear / Liberar Loja */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleToggleStatus(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border disabled:opacity-50 ${
                      isBlocked
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                        : "bg-white hover:bg-red-50 text-red-600 border-red-200"
                    }`}
                    title={isBlocked ? "Liberar acesso da loja" : "Bloquear acesso da loja"}
                  >
                    {isLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : isBlocked ? (
                      <ShieldCheck size={13} />
                    ) : (
                      <Ban size={13} />
                    )}
                    <span>{isBlocked ? "Liberar Loja" : "Bloquear"}</span>
                  </button>

                  {/* Link da Vitrine */}
                  <a
                    href={`/loja/${t.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-vitrinia-purple hover:bg-vitrinia-purple/10 rounded-xl transition"
                    title="Ver Vitrine Pública"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}

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
            className="flex items-center gap-2 bg-vitrinia-purple text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-vitrinia-purple/90 transition shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> Novo Cupom
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateCoupon} className="p-6 bg-gray-50 border-b border-gray-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Código</label>
                <input
                  name="code"
                  required
                  placeholder="EX: LAUNCH50"
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm uppercase font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
                <select name="type" className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm font-medium">
                  <option value="PERCENTAGE">Porcentagem (%)</option>
                  <option value="FIXED">Valor Fixo (R$)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Desconto</label>
                <input
                  name="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="Ex: 50"
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Validade (Opcional)</label>
                <input
                  name="expiresAt"
                  type="date"
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm"
                />
              </div>
            </div>
            {formError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle size={14} /> {formError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="bg-vitrinia-orange text-white font-bold px-5 py-2.5 rounded-xl hover:bg-vitrinia-orange/90 transition disabled:opacity-50 text-sm"
              >
                {isPending ? "Criando..." : "Criar Cupom"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500 px-5 py-2.5 rounded-xl hover:bg-gray-100 transition text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-gray-50">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-black tracking-widest text-gray-900 font-mono">{coupon.code}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {coupon.type === "PERCENTAGE"
                    ? `${coupon.discount}% de desconto no plano`
                    : `R$ ${coupon.discount.toFixed(2)} de desconto`}
                  {coupon.expiresAt && ` · Até ${new Date(coupon.expiresAt).toLocaleDateString("pt-BR")}`}
                </p>
              </div>
              <button
                onClick={() => handleDeleteCoupon(coupon.id)}
                className="text-gray-300 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50"
                title="Excluir cupom"
              >
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
