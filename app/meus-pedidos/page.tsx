import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { 
  Store, 
  ShoppingBag, 
  Calendar, 
  ExternalLink, 
  Clock, 
  Receipt, 
  ChevronRight,
  PackageCheck,
  Building2,
  AlertCircle
} from "lucide-react";

export const metadata = {
  title: "Meus Pedidos & Lojas | Vitrinia",
  description: "Acompanhe seus pedidos, agendamentos e acesse as lojas que você frequenta na Vitrinia.",
};

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Aguardando Confirmação", color: "bg-amber-50 text-amber-700 border-amber-200" },
  CONFIRMED: { label: "Confirmado", color: "bg-blue-50 text-blue-700 border-blue-200" },
  PREPARING: { label: "Em Preparo", color: "bg-purple-50 text-purple-700 border-purple-200" },
  READY_FOR_PICKUP: { label: "Pronto para Retirada", color: "bg-orange-50 text-orange-700 border-orange-200" },
  IN_TRANSIT: { label: "Em Entrega", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  COMPLETED: { label: "Concluído", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELED: { label: "Cancelado", color: "bg-red-50 text-red-700 border-red-200" },
  REFUNDED: { label: "Reembolsado", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

const APPOINTMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Agendado", color: "bg-blue-50 text-blue-700 border-blue-200" },
  CONFIRMED: { label: "Confirmado", color: "bg-purple-50 text-purple-700 border-purple-200" },
  IN_PROGRESS: { label: "Em Atendimento", color: "bg-amber-50 text-amber-700 border-amber-200" },
  COMPLETED: { label: "Realizado", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELED: { label: "Cancelado", color: "bg-red-50 text-red-700 border-red-200" },
};

export default async function CustomerPortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login?next=/meus-pedidos");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              settings: {
                select: {
                  companyName: true,
                  logoUrl: true,
                  companyLogoUrl: true,
                  primaryColor: true,
                },
              },
            },
          },
          items: {
            include: {
              product: {
                select: { name: true, image: true },
              },
            },
          },
        },
      },
      appointments: {
        orderBy: { startTime: "desc" },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              settings: {
                select: {
                  companyName: true,
                  logoUrl: true,
                  companyLogoUrl: true,
                  primaryColor: true,
                },
              },
            },
          },
          staff: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const orders = dbUser.orders || [];
  const appointments = dbUser.appointments || [];

  // Mapeamento e agregação das Lojas que o usuário acompanha
  interface StoreInfo {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    primaryColor: string;
    totalOrders: number;
    totalAppointments: number;
    lastInteraction: Date;
  }

  const storesMap = new Map<string, StoreInfo>();

  orders.forEach((order) => {
    if (!order.tenant) return;
    const tId = order.tenant.id;
    const current = storesMap.get(tId);
    const logo = order.tenant.settings?.logoUrl || order.tenant.settings?.companyLogoUrl || null;
    const name = order.tenant.settings?.companyName || order.tenant.name;
    const primaryColor = order.tenant.settings?.primaryColor || "#7C3AED";

    if (!current) {
      storesMap.set(tId, {
        id: tId,
        name,
        slug: order.tenant.slug,
        logoUrl: logo,
        primaryColor,
        totalOrders: 1,
        totalAppointments: 0,
        lastInteraction: order.createdAt,
      });
    } else {
      current.totalOrders += 1;
      if (order.createdAt > current.lastInteraction) {
        current.lastInteraction = order.createdAt;
      }
    }
  });

  appointments.forEach((app) => {
    if (!app.tenant) return;
    const tId = app.tenant.id;
    const current = storesMap.get(tId);
    const logo = app.tenant.settings?.logoUrl || app.tenant.settings?.companyLogoUrl || null;
    const name = app.tenant.settings?.companyName || app.tenant.name;
    const primaryColor = app.tenant.settings?.primaryColor || "#7C3AED";

    if (!current) {
      storesMap.set(tId, {
        id: tId,
        name,
        slug: app.tenant.slug,
        logoUrl: logo,
        primaryColor,
        totalOrders: 0,
        totalAppointments: 1,
        lastInteraction: app.startTime,
      });
    } else {
      current.totalAppointments += 1;
      if (app.startTime > current.lastInteraction) {
        current.lastInteraction = app.startTime;
      }
    }
  });

  const stores = Array.from(storesMap.values()).sort(
    (a, b) => b.lastInteraction.getTime() - a.lastInteraction.getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <CustomerHeader
        userName={dbUser.name}
        userEmail={dbUser.email || ""}
        hasTenant={Boolean(dbUser.tenantId || dbUser.role === "TENANT")}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Banner de Boas-vindas */}
        <section className="bg-gradient-to-r from-vitrinia-purple to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
              Área do Cliente
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight">
              Acompanhe suas compras e agendamentos
            </h1>
            <p className="text-sm text-purple-100 mt-2 font-medium">
              Aqui você encontra os links diretos para as lojas que você já comprou e o histórico completo de pedidos.
            </p>
          </div>
          <div className="absolute right-4 bottom-[-20px] opacity-10 hidden sm:block pointer-events-none">
            <ShoppingBag size={200} />
          </div>
        </section>

        {/* ── SESSÃO 1: LOJAS QUE VOCÊ ACOMPANHA ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-vitrinia-purple/10 text-vitrinia-purple flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Lojas que você acompanha</h2>
                <p className="text-xs text-gray-500">Acesse com um clique as vitrines onde você já fez pedidos</p>
              </div>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-200/60 px-2.5 py-1 rounded-full">
              {stores.length} {stores.length === 1 ? "loja" : "lojas"}
            </span>
          </div>

          {stores.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center shadow-xs">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-700">Nenhuma loja visitada ainda</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Quando você realizar um pedido ou agendamento em qualquer loja da plataforma, ela aparecerá aqui para fácil acesso.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                      {store.logoUrl ? (
                        <img
                          src={store.logoUrl}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-6 h-6 text-vitrinia-purple" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-vitrinia-purple transition">
                        {store.name}
                      </h3>
                      <p className="text-[11px] font-mono text-gray-400 truncate">/loja/{store.slug}</p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-500 font-medium">
                        {store.totalOrders > 0 && (
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold">
                            {store.totalOrders} {store.totalOrders === 1 ? "pedido" : "pedidos"}
                          </span>
                        )}
                        {store.totalAppointments > 0 && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                            {store.totalAppointments} {store.totalAppointments === 1 ? "agendamento" : "agendamentos"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/loja/${store.slug}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-purple-50 hover:bg-vitrinia-purple text-vitrinia-purple hover:text-white rounded-xl text-xs font-bold transition duration-150 active:scale-95 shadow-2xs"
                  >
                    <span>Acessar Loja</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SESSÃO 2: HISTÓRICO GERAL DE PEDIDOS ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Histórico Geral de Pedidos</h2>
                <p className="text-xs text-gray-500">Acompanhe o status e recibos de todas as suas compras</p>
              </div>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-200/60 px-2.5 py-1 rounded-full">
              {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center shadow-xs">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-700">Nenhum pedido realizado ainda</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Assim que você concluir uma compra em qualquer vitrine Vitrinia, o status em tempo real aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const storeName = order.tenant?.settings?.companyName || order.tenant?.name || "Loja";
                const storeSlug = order.tenant?.slug;
                const statusInfo = ORDER_STATUS_LABELS[order.status] || {
                  label: order.status,
                  color: "bg-gray-100 text-gray-700 border-gray-200",
                };
                const formattedDate = new Date(order.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs hover:border-purple-200 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-vitrinia-purple flex items-center justify-center font-bold text-xs shrink-0">
                          #{order.id.slice(0, 6).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{storeName}</span>
                            {storeSlug && (
                              <Link
                                href={`/loja/${storeSlug}`}
                                className="text-xs text-vitrinia-purple hover:underline inline-flex items-center gap-0.5"
                                title="Ir para a loja"
                              >
                                <ExternalLink size={11} />
                              </Link>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={11} />
                            {formattedDate} · {order.orderType === "DELIVERY" ? "Entrega" : "Retirada"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Resumo de itens */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="text-xs text-gray-600 space-y-0.5 max-w-xl">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <p key={idx} className="truncate">
                            <span className="font-bold text-gray-800">{item.quantity}x</span> {item.product?.name || "Item"}
                          </p>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-[11px] text-gray-400 italic">
                            + {order.items.length - 3} outros itens...
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                            Total
                          </span>
                          <span className="text-base font-black text-gray-900">
                            R$ {order.totalAmount.toFixed(2).replace(".", ",")}
                          </span>
                        </div>

                        <Link
                          href={`/recibo/${order.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition active:scale-95"
                          title="Ver recibo do pedido"
                        >
                          <Receipt size={14} />
                          <span>Recibo</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── SESSÃO 3: AGENDAMENTOS (SE HOUVER) ── */}
        {appointments.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">Meus Agendamentos de Serviços</h2>
                  <p className="text-xs text-gray-500">Histórico de horários e atendimentos agendados</p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-200/60 px-2.5 py-1 rounded-full">
                {appointments.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {appointments.map((app) => {
                const storeName = app.tenant?.settings?.companyName || app.tenant?.name || "Loja";
                const statusInfo = APPOINTMENT_STATUS_LABELS[app.status] || {
                  label: app.status,
                  color: "bg-gray-100 text-gray-700 border-gray-200",
                };
                const formattedDate = new Date(app.startTime).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{storeName}</span>
                        {app.tenant?.slug && (
                          <Link href={`/loja/${app.tenant.slug}`} className="text-vitrinia-purple">
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {formattedDate}
                        {app.staff?.name && ` · Profissional: ${app.staff.name}`}
                      </p>
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
