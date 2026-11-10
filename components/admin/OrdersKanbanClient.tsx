"use client";

import { useEffect, useRef, useState } from "react";
import { 
  PackageSearch, 
  MapPin, 
  Calendar, 
  Bell, 
  BellOff, 
  Printer, 
  Sparkles,
  Volume2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { OrderActions } from "@/components/OrderActions";

export interface OrderItemData {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

export interface OrderData {
  id: string;
  createdAt: string | Date;
  status: string;
  orderType: string;
  totalAmount: number;
  observation?: string | null;
  scheduledAt?: string | Date | null;
  paymentMethod: string;
  paymentTiming: string;
  user: {
    name: string;
    phone: string;
  };
  items: OrderItemData[];
}

interface OrdersKanbanClientProps {
  initialOrders: OrderData[];
  audioIntervalSeconds: number; // 0 = 1x, 10, 30, 60...
}

export function OrdersKanbanClient({ initialOrders, audioIntervalSeconds = 0 }: OrdersKanbanClientProps) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filtra pedidos pendentes que requerem ação do lojista
  const pendingOrders = initialOrders.filter(
    (o) => o.status === "PENDING" || o.status === "RECEIVED"
  );
  const hasPending = pendingOrders.length > 0;

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/NewNotification.mp3");
    }
  }, []);

  // Loop de áudio sonoro baseado em notificationAudioInterval
  useEffect(() => {
    if (!hasPending || !audioEnabled) return;

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
  }, [hasPending, audioEnabled, audioIntervalSeconds]);

  return (
    <div className="space-y-4">
      {/* Barra de Notificações e Status */}
      {hasPending && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center animate-bounce shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                {pendingOrders.length} {pendingOrders.length === 1 ? "novo pedido aguardando" : "novos pedidos aguardando"}!
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              </h4>
              <p className="text-xs text-amber-800">
                Os pedidos em destaque abaixo estão piscando até receberem seu aceite.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border ${
                audioEnabled
                  ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                  : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
              }`}
              title="Ativar/Desativar alerta sonoro contínuo"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-amber-700" /> : <BellOff className="w-4 h-4 text-gray-400" />}
              {audioEnabled ? "Alerta Sonoro Ativo" : "Som Silenciado"}
            </button>
          </div>
        </div>
      )}

      {/* Lista de Pedidos */}
      <div className="grid grid-cols-1 gap-4">
        {initialOrders.map((order) => {
          const isPending = order.status === "PENDING" || order.status === "RECEIVED";

          return (
            <div
              key={order.id}
              className={`rounded-2xl p-4 lg:p-5 shadow-sm transition flex flex-col gap-3 lg:gap-4 relative overflow-hidden ${
                isPending
                  ? "bg-amber-50/60 border-2 border-amber-400 ring-4 ring-amber-200/50 animate-pulse"
                  : "bg-white border border-gray-100 hover:shadow-md"
              }`}
            >
              {isPending && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black uppercase px-3 py-0.5 rounded-bl-xl tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Ação Necessária
                </div>
              )}

              <div className="flex gap-3 lg:gap-4">
                <div
                  className={`flex flex-col items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-xl shrink-0 border ${
                    isPending
                      ? "border-amber-300 bg-amber-100/70"
                      : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                    Dia
                  </span>
                  <span
                    className={`text-base lg:text-lg font-black ${
                      isPending ? "text-amber-700" : "text-blue-600"
                    }`}
                  >
                    {new Date(order.createdAt).getDate().toString().padStart(2, "0")}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-base lg:text-lg">
                      {order.user.name}
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        isPending
                          ? "bg-amber-200 text-amber-900"
                          : order.status === "PREPARING"
                          ? "bg-orange-100 text-orange-700"
                          : order.status === "DONE" || order.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : order.status === "REFUNDED"
                          ? "bg-purple-100 text-purple-700 font-bold"
                          : order.status === "CANCELLED" || order.status === "CANCELED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {isPending
                        ? "Aguardando Confirmação"
                        : order.status === "PREPARING"
                        ? "Preparando"
                        : order.status === "DONE" || order.status === "COMPLETED"
                        ? "Finalizado"
                        : order.status === "REFUNDED"
                        ? "Estornado (Pix)"
                        : order.status === "CANCELLED" || order.status === "CANCELED"
                        ? "Cancelado"
                        : order.status}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        order.orderType === "DELIVERY"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.orderType === "DELIVERY" ? (
                        <MapPin size={10} />
                      ) : (
                        <PackageSearch size={10} />
                      )}
                      {order.orderType}
                    </span>

                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">
                      {order.paymentMethod}
                    </span>

                    {order.items.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} itens
                      </span>
                    )}
                  </div>

                  {order.observation && (
                    <p className="text-[11px] text-gray-500 mt-1 italic line-clamp-2">
                      📝 {order.observation}
                    </p>
                  )}
                </div>
              </div>

              {/* Linha de Ações e Totais */}
              <div className="flex flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 lg:border-0 lg:pt-0 lg:justify-end lg:gap-6 flex-wrap">
                {order.scheduledAt && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100/70 px-3 py-1.5 rounded-xl border border-amber-200">
                    <Calendar size={14} />
                    <span className="font-bold">
                      {new Date(order.scheduledAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}

                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Total
                  </p>
                  <p className="text-lg lg:text-xl font-black text-gray-900">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(order.totalAmount)}
                  </p>
                </div>

                {/* Botão de Impressão Térmica 58mm */}
                <Link
                  href={`/recibo/${order.id}/termica`}
                  target="_blank"
                  className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-2 rounded-xl transition shadow-sm border border-gray-200"
                  title="Imprimir Cupom Térmico 58mm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cupom 58mm</span>
                </Link>

                <OrderActions
                  orderId={order.id}
                  currentStatus={order.status}
                  userPhone={order.user.phone}
                  totalAmount={order.totalAmount}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

