"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useTabAlert } from "@/hooks/useTabAlert";

interface DashboardClientProps {
  pendingCount: number;
  ordersToday: number;
  totalOrders: number;
  totalProducts: number;
  totalClients: number;
  revenueToday: number;
  revenueMonth: number;
  lowStockCount: number;
  audioIntervalSeconds: number;
  storeName: string;
  recentOrders: {
    id: string;
    shortCode: string;
    userName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
}

export function DashboardClient({
  pendingCount,
  ordersToday,
  totalOrders,
  totalProducts,
  totalClients,
  revenueToday,
  revenueMonth,
  lowStockCount,
  audioIntervalSeconds,
  storeName,
  recentOrders,
}: DashboardClientProps) {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Persiste preferências no localStorage
  useEffect(() => {
    const saved = localStorage.getItem("vitrinia_dashboard_alerts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAlertsEnabled(parsed.alertsEnabled ?? true);
        setAudioEnabled(parsed.audioEnabled ?? true);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "vitrinia_dashboard_alerts",
      JSON.stringify({ alertsEnabled, audioEnabled })
    );
  }, [alertsEnabled, audioEnabled]);

  // Hook de piscar aba + áudio quando minimizado
  useTabAlert({
    pendingCount: alertsEnabled ? pendingCount : 0,
    audioEnabled: alertsEnabled && audioEnabled,
    audioIntervalSeconds,
    storeName,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/NewNotification.mp3");
    }
  }, []);

  // Loop de áudio sonoro baseado em notificationAudioInterval
  useEffect(() => {
    if (pendingCount <= 0 || !alertsEnabled || !audioEnabled) return;

    const playSound = () => {
      try {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((err) => {
            console.log("Autoplay aguardando interação do usuário:", err);
          });
        }
      } catch (err) {
        console.error("Erro ao tocar áudio:", err);
      }
    };

    // Toca imediatamente
    playSound();

    // Se o intervalo for > 0, repete a cada X segundos
    if (audioIntervalSeconds > 0) {
      const interval = setInterval(playSound, audioIntervalSeconds * 1000);
      return () => clearInterval(interval);
    }
  }, [pendingCount, alertsEnabled, audioEnabled, audioIntervalSeconds]);

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    if (next) {
      // Toca na hora para dar feedback e destravar permissão de áudio do navegador
      try {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      } catch {}
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const statusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
      case "RECEIVED":
        return { label: "Aguardando", cls: "bg-amber-100 text-amber-800" };
      case "PREPARING":
        return { label: "Preparando", cls: "bg-blue-100 text-blue-800" };
      case "DONE":
      case "COMPLETED":
        return { label: "Concluído", cls: "bg-emerald-100 text-emerald-800" };
      case "CANCELLED":
      case "CANCELED":
        return { label: "Cancelado", cls: "bg-red-100 text-red-800" };
      case "REFUNDED":
        return { label: "Estornado", cls: "bg-purple-100 text-purple-800" };
      default:
        return { label: status, cls: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="space-y-6">
      {/* ── BARRA STICKY DE ALERTA & CONTROLE ── */}
      <div className="sticky top-0 z-30 -mx-4 lg:-mx-8 px-4 lg:px-8 py-3 bg-gray-50/95 backdrop-blur-md border-b border-gray-200/60 space-y-3 transition-all shadow-sm">
        {pendingCount > 0 && alertsEnabled && (
          <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center animate-bounce shadow-md shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                  {pendingCount}{" "}
                  {pendingCount === 1
                    ? "pedido aguardando sua confirmação"
                    : "pedidos aguardando sua confirmação"}
                  !
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                </h4>
                <p className="text-xs text-amber-800">
                  Acesse a tela de pedidos para aceitar ou gerenciar.
                </p>
              </div>
            </div>
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition active:scale-95 shadow-md shrink-0"
            >
              <ShoppingCart size={16} />
              Ver Pedidos
            </Link>
          </div>
        )}

        {/* ── TOGGLE DE ALERTAS ── */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm ${
              alertsEnabled
                ? "bg-vitrinia-purple/10 text-vitrinia-purple border-vitrinia-purple/20 hover:bg-vitrinia-purple/15"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {alertsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
            {alertsEnabled ? "Alertas Visuais Ativos" : "Alertas Visuais Desligados"}
          </button>

          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm ${
              audioEnabled
                ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {audioEnabled ? "Som Ativo" : "Som Desligado"}
          </button>

          {pendingCount > 0 && (
            <span className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 font-black text-xs px-3 py-1.5 rounded-full animate-pulse">
              <AlertCircle size={12} />
              {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
        <KpiCard
          title="Pedidos Hoje"
          value={ordersToday.toString()}
          subtitle="Recebidos hoje"
          icon={<ShoppingCart size={20} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          highlight={ordersToday > 0}
        />
        <KpiCard
          title="Faturamento Hoje"
          value={formatCurrency(revenueToday)}
          subtitle="Vendas do dia"
          icon={<DollarSign size={20} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <KpiCard
          title="Faturamento Mês"
          value={formatCurrency(revenueMonth)}
          subtitle="Acumulado mensal"
          icon={<TrendingUp size={20} />}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <KpiCard
          title="Total de Clientes"
          value={totalClients.toString()}
          subtitle="Clientes cadastrados"
          icon={<Users size={20} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* ── CARDS MENORES: Produtos, Vendas Totais, Estoque Baixo ── */}
      <div className="grid grid-cols-3 gap-3 lg:gap-5">
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Package size={16} className="text-blue-600" />
            </div>
            <span className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider">
              Produtos
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-black text-gray-900">{totalProducts}</p>
        </div>

        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <ArrowUpRight size={16} className="text-emerald-600" />
            </div>
            <span className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider">
              Vendas Total
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-black text-gray-900">{totalOrders}</p>
        </div>

        <div
          className={`p-4 lg:p-5 rounded-2xl border shadow-sm ${
            lowStockCount > 0
              ? "bg-red-50 border-red-200"
              : "bg-white border-gray-100"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`p-1.5 rounded-lg ${
                lowStockCount > 0 ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              <AlertCircle size={16} />
            </div>
            <span className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider">
              Estoque Baixo
            </span>
          </div>
          <p
            className={`text-2xl lg:text-3xl font-black ${
              lowStockCount > 0 ? "text-red-600" : "text-gray-900"
            }`}
          >
            {lowStockCount}
          </p>
          {lowStockCount > 0 && (
            <Link
              href="/admin/produtos"
              className="text-[10px] font-bold text-red-700 hover:underline mt-1 flex items-center gap-1"
            >
              Ver alertas <ArrowUpRight size={10} />
            </Link>
          )}
        </div>
      </div>

      {/* ── ÚLTIMOS PEDIDOS ── */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-base lg:text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            Últimos Pedidos
          </h2>
          <Link
            href="/admin/pedidos"
            className="text-xs font-bold text-vitrinia-purple hover:underline"
          >
            Ver todos
          </Link>
        </div>

        <div className="bg-white rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-gray-400">
                Nenhum pedido ainda.
              </p>
              <p className="text-[10px] mt-1 text-gray-300">
                As vendas aparecerão aqui após o primeiro pedido.
              </p>
              <Link
                href="/admin/pedidos"
                className="mt-4 inline-flex items-center gap-2 text-xs font-black bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition shadow-md"
              >
                Lançar Primeira Venda
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <table className="hidden md:table w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                  <tr>
                    <th className="px-5 py-3">Pedido</th>
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Valor</th>
                    <th className="px-5 py-3 text-right">Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((o) => {
                    const st = statusLabel(o.status);
                    const isPending =
                      o.status === "PENDING" || o.status === "RECEIVED";
                    return (
                      <tr
                        key={o.id}
                        className={`transition ${
                          isPending
                            ? "bg-amber-50/40 animate-pulse"
                            : "hover:bg-gray-50/50"
                        }`}
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/recibo/${o.id}`}
                            className="font-mono text-xs font-bold text-vitrinia-purple hover:underline"
                          >
                            #{o.shortCode}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-gray-800 truncate max-w-[160px]">
                          {o.userName}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${st.cls}`}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-sm font-bold text-gray-900">
                          {formatCurrency(o.totalAmount)}
                        </td>
                        <td className="px-5 py-3 text-right text-xs text-gray-400">
                          {new Date(o.createdAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-50">
                {recentOrders.map((o) => {
                  const st = statusLabel(o.status);
                  const isPending =
                    o.status === "PENDING" || o.status === "RECEIVED";
                  return (
                    <Link
                      key={o.id}
                      href={`/recibo/${o.id}`}
                      className={`block p-4 transition ${
                        isPending ? "bg-amber-50/40 animate-pulse" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-vitrinia-purple">
                              #{o.shortCode}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${st.cls}`}
                            >
                              {st.label}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 truncate mt-0.5">
                            {o.userName}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(o.totalAmount)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(o.createdAt).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── KPI Card Component ──
function KpiCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
  highlight,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border shadow-sm hover:shadow-md transition-all ${
        highlight ? "border-vitrinia-purple/30 ring-2 ring-vitrinia-purple/10" : "border-gray-100"
      }`}
    >
      <div className={`p-1.5 lg:p-2 ${iconBg} rounded-lg lg:rounded-xl w-fit mb-2 lg:mb-3 ${iconColor}`}>
        {icon}
      </div>
      <h3 className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-xl lg:text-2xl font-black text-gray-900 my-0.5">{value}</p>
      <p className="text-[10px] lg:text-xs text-gray-400 font-medium hidden sm:block">
        {subtitle}
      </p>
    </div>
  );
}

