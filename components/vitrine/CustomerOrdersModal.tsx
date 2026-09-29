"use client";

import { useEffect, useState } from "react";
import { useCustomerAuth } from "./CustomerAuthContext";
import { getCustomerOrders } from "@/app/actions/customer-auth-actions";
import { X, Package, MessageCircle, ExternalLink, Calendar, RefreshCw } from "lucide-react";
import { createWhatsAppLink, getOrderStatusLabel } from "@/lib/whatsapp";
import Link from "next/link";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  totalAmount: number;
  status: string;
  orderType: string;
  createdAt: string;
  items: OrderItem[];
}

export function CustomerOrdersModal() {
  const { isOrdersModalOpen, closeOrdersModal, customer, storeSlug } = useCustomerAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [storeWhatsApp, setStoreWhatsApp] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>("Loja");
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    if (!customer?.phone) return;
    setLoading(true);
    const res = await getCustomerOrders(storeSlug, customer.phone);
    setLoading(false);
    if (res && res.orders) {
      setOrders(res.orders as OrderData[]);
      setStoreWhatsApp(res.storeWhatsApp || null);
      if (res.storeName) setStoreName(res.storeName);
    }
  };

  useEffect(() => {
    if (isOrdersModalOpen && customer) {
      fetchOrders();
    }
  }, [isOrdersModalOpen, customer]);

  if (!isOrdersModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 max-h-[88vh] flex flex-col shadow-2xl border border-gray-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vitrinia-purple/10 text-vitrinia-purple flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Meus Pedidos</h3>
              <p className="text-xs text-gray-500">
                Acompanhe o andamento dos seus pedidos em tempo real.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              disabled={loading}
              title="Atualizar lista"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={closeOrdersModal}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {loading && orders.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-vitrinia-purple" />
              Carregando seus pedidos...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-800 text-base mb-1">Nenhum pedido encontrado</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Você ainda não realizou pedidos nesta loja com o número {customer?.phone}.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const statusInfo = getOrderStatusLabel(order.status);
              const formattedDate = new Date(order.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });
              const shortId = order.id.slice(-6).toUpperCase();

              // Mensagem para acompanhamento no WhatsApp
              const whatsappMessage = `Olá ${storeName}! 👋\n\nGostaria de acompanhar o andamento do meu pedido *#${shortId}* (Total: R$ ${order.totalAmount.toFixed(2)}) realizado em ${formattedDate}.\n\nPoderia me informar o status? Obrigado!`;
              const trackingUrl = storeWhatsApp ? createWhatsAppLink(storeWhatsApp, whatsappMessage) : null;

              return (
                <div
                  key={order.id}
                  className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 hover:border-gray-300 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-gray-900 text-sm">Pedido #{shortId}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{order.orderType === "DELIVERY" ? "Entrega" : "Retirada"}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Resumo de Itens */}
                  <div className="text-xs text-gray-600 bg-white rounded-xl p-3 border border-gray-100 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="truncate pr-2">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-semibold text-gray-800 shrink-0">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 mt-1 border-t border-gray-100 flex justify-between font-bold text-gray-900 text-xs">
                      <span>Total:</span>
                      <span className="text-vitrinia-purple">R$ {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {trackingUrl ? (
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-sm transition active:scale-95"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Acompanhar no WhatsApp
                      </a>
                    ) : (
                      <button
                        onClick={() =>
                          alert(
                            "O lojista ainda não cadastrou o número de WhatsApp nas configurações."
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-600 font-bold py-2.5 px-3 rounded-xl text-xs"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Acompanhar no WhatsApp
                      </button>
                    )}

                    <Link
                      href={`/recibo/${order.id}`}
                      target="_blank"
                      className="flex items-center justify-center gap-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold py-2.5 px-3 rounded-xl text-xs transition"
                    >
                      <span>Recibo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <span>
            Conectado como <strong>{customer?.name}</strong>
          </span>
          <button
            onClick={closeOrdersModal}
            className="text-vitrinia-purple font-bold hover:underline"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
