import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Plus,
  ArrowLeftRight,
  ArrowUpRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getGlobalSettings } from "@/app/actions/settings-actions";
import { StoreStatusWidget } from "@/components/admin/StoreStatusWidget";
import { StoreShareModal } from "@/components/admin/StoreShareModal";
import { requireTenant } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/admin/DashboardClient";

export default async function Dashboard() {
  const tenantId = await requireTenant();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [products, orders, settings, tenant, clients, recentOrdersRaw] =
    await Promise.all([
      prisma.product.findMany({
        where: { tenantId },
        select: { id: true, stock: true, minStock: true },
      }),
      prisma.order.findMany({
        where: { tenantId },
        select: {
          id: true,
          createdAt: true,
          status: true,
          totalAmount: true,
        },
      }),
      getGlobalSettings(),
      prisma.tenant.findUnique({ where: { id: tenantId } }),
      prisma.user.count({
        where: { tenantId, role: "CUSTOMER" },
      }),
      prisma.order.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          status: true,
          totalAmount: true,
          user: { select: { name: true } },
        },
      }),
    ]);

  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stock < p.minStock).length;
  const totalOrders = orders.length;

  const ordersToday = orders.filter(
    (o) => new Date(o.createdAt) >= todayStart
  ).length;

  const revenueToday = orders
    .filter(
      (o) =>
        new Date(o.createdAt) >= todayStart &&
        o.status !== "CANCELED" &&
        o.status !== "REFUNDED"
    )
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const revenueMonth = orders
    .filter(
      (o) =>
        new Date(o.createdAt) >= monthStart &&
        o.status !== "CANCELED" &&
        o.status !== "REFUNDED"
    )
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingCount = orders.filter(
    (o) => o.status === "PENDING"
  ).length;

  const recentOrders = recentOrdersRaw.map((o) => ({
    id: o.id,
    shortCode: o.id.slice(-6).toUpperCase(),
    userName: o.user?.name || "Cliente",
    totalAmount: o.totalAmount,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 lg:space-y-8 pb-20">
      <header className="space-y-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
            Dashboard de Gestão
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Resumo do seu negócio em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          {tenant && (
            <StoreShareModal
              asModal
              slug={tenant.slug}
              storeName={settings.companyName || tenant.name}
              logoUrl={settings.logoUrl || settings.companyLogoUrl}
            />
          )}
        </div>
      </header>

      {/* CONTROLE OPERACIONAL DA LOJA E DO CAIXA */}
      <StoreStatusWidget
        initialStoreOpen={(settings as any).isStoreOpen ?? true}
        initialRegisterOpen={(settings as any).isRegisterOpen ?? false}
      />

      {/* Client Component com KPIs, Alertas e Últimos Pedidos */}
      <DashboardClient
        pendingCount={pendingCount}
        ordersToday={ordersToday}
        totalOrders={totalOrders}
        totalProducts={totalProducts}
        totalClients={clients}
        revenueToday={revenueToday}
        revenueMonth={revenueMonth}
        lowStockCount={lowStockCount}
        audioIntervalSeconds={settings.notificationAudioInterval ?? 0}
        storeName={settings.companyName || "Vitrinia"}
        recentOrders={recentOrders}
      />

      {/* ── ATALHOS RÁPIDOS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 px-1">
            <Settings size={18} className="text-gray-400" />
            Atalhos Profissionais
          </h3>
          <div className="space-y-3">
            <QuickLink
              href="/admin/produtos/novo"
              label="Novo Cadastro"
              desc="Produto ou insumo"
              icon={<Plus size={14} className="text-blue-600" />}
              bgColor="bg-blue-50"
            />
            <QuickLink
              href="/admin/produtos"
              label="Ajuste Manual"
              desc="Entradas e perdas"
              icon={<ArrowLeftRight size={14} className="text-amber-600" />}
              bgColor="bg-amber-50"
            />
            <QuickLink
              href="/admin/pedidos"
              label="Lançar Pedido"
              desc="Venda direta/PDV"
              icon={<ArrowUpRight size={14} className="text-emerald-600" />}
              bgColor="bg-emerald-50"
            />
          </div>
        </div>

        {/* Dica motivacional */}
        <div className="lg:col-span-2 bg-gradient-to-br from-vitrinia-purple to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-60">
              Dica do Vitrinia
            </p>
            <p className="text-base font-medium leading-relaxed max-w-lg">
              &quot;Ative os alertas sonoros de pedido para nunca perder uma venda. Configure o
              intervalo em <strong>Configurações → Alertas Sonoros</strong>. Quando a aba estiver
              minimizada, o título pisca e o som toca até você voltar.&quot;
            </p>
            <Link
              href="/admin/config"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition"
            >
              <Settings size={14} />
              Ir para Configurações
            </Link>
          </div>
          <ArrowUpRight
            size={160}
            className="absolute -right-12 -bottom-12 opacity-10 rotate-12 transition-transform group-hover:scale-110 duration-500"
          />
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  desc,
  icon,
  bgColor,
}: {
  href: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition group border border-transparent hover:border-gray-100"
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          bgColor
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-800">{label}</p>
          <ArrowUpRight
            size={12}
            className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all outline-none"
          />
        </div>
        <p className="text-[10px] text-gray-400 truncate font-medium">{desc}</p>
      </div>
    </Link>
  );
}
