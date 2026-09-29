"use client";

import { useState, useEffect, use } from "react";
import { useCart } from "@/components/vitrine/CartContext";
import { useCustomerAuth } from "@/components/vitrine/CustomerAuthContext";
import { processCheckout } from "@/app/actions/checkout-actions";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Lock, User, Phone, CheckCircle2, AlertCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { BookingCalendarPicker } from "@/components/vitrine/BookingCalendarPicker";
import { formatPhoneDisplay } from "@/lib/whatsapp";

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { items, cartTotal, removeFromCart, clearCart } = useCart();
  const { customer, isLoggedIn, login, logout, openLoginModal } = useCustomerAuth();
  const router = useRouter();

  const [orderType, setOrderType] = useState<"RETIRADA" | "DELIVERY">("RETIRADA");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    neighborhood: "",
    city: ""
  });

  // Atualiza campos quando o cliente logar ou deslogar
  useEffect(() => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        name: customer.name || "",
        phone: formatPhoneDisplay(customer.phone) || "",
        address: customer.address || prev.address || "",
        neighborhood: customer.neighborhood || prev.neighborhood || "",
        city: customer.city || prev.city || "",
      }));
    }
  }, [customer]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, "");
    if (raw.length <= 11) {
      setFormData({ ...formData, phone: formatPhoneDisplay(raw) });
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsLoading(true);
    setError("");

    // LOGIN OBRIGATÓRIO: Se o cliente ainda não estiver logado, faz o login/registro agora
    let activeCustomer = customer;
    if (!isLoggedIn || !activeCustomer) {
      const cleanDigits = formData.phone.replace(/\D/g, "");
      if (cleanDigits.length < 10) {
        setError("Login obrigatório: Digite um número de WhatsApp válido com DDD.");
        setIsLoading(false);
        return;
      }
      if (!formData.name || formData.name.trim().length < 2) {
        setError("Login obrigatório: Por favor, informe seu nome completo.");
        setIsLoading(false);
        return;
      }

      const loginRes = await login({
        phone: cleanDigits,
        name: formData.name.trim(),
        address: formData.address,
        neighborhood: formData.neighborhood,
        city: formData.city,
      });

      if (loginRes.error) {
        setError(loginRes.error);
        setIsLoading(false);
        return;
      }

      if (loginRes.needName) {
        setError("Por favor, preencha seu nome para concluir o cadastro.");
        setIsLoading(false);
        return;
      }
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");

    const result = await processCheckout({
      slug,
      items: items.map(i => ({ id: i.id, price: i.price, quantity: i.quantity })),
      customer: {
        name: formData.name,
        phone: cleanPhone,
        address: formData.address,
        neighborhood: formData.neighborhood,
        city: formData.city,
      },
      orderType,
      scheduledAt: scheduledAt || null
    });

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.orderId) {
      clearCart();
      router.push(`/recibo/${result.orderId}?justOrdered=1`);
    } else {
      clearCart();
      router.push(`/loja/${slug}`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-vitrinia-bg flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Sua sacola está vazia</h1>
        <Link href={`/loja/${slug}`} className="bg-vitrinia-purple text-white px-6 py-3 rounded-full font-bold">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vitrinia-bg pb-32 font-sans">
      <div className="bg-vitrinia-purple text-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/loja/${slug}`} className="p-1 hover:bg-white/20 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold">Finalizar Pedido</h1>
        </div>

        {isLoggedIn && (
          <span className="text-xs font-medium text-purple-200">
            {customer?.name.split(" ")[0]}
          </span>
        )}
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-2 space-y-6">
        
        {/* Resumo da Sacola */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 text-base mb-4">Resumo da Sacola</h2>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity}x de R$ {item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-vitrinia-purple">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-gray-500 font-semibold text-sm">Total dos itens:</span>
            <span className="text-lg font-black text-gray-900">R$ {cartTotal.toFixed(2)}</span>
          </div>
        </section>

        {/* Formulário com Login Obrigatório */}
        <form onSubmit={handleCheckout} className="space-y-6">
          
          {/* Seção de Login / Identificação do Cliente */}
          <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">Identificação do Cliente</h2>
                  <p className="text-xs text-gray-400">Login obrigatório para acompanhamento via WhatsApp</p>
                </div>
              </div>

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition"
                  title="Trocar de conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Trocar</span>
                </button>
              )}
            </div>

            {isLoggedIn ? (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs flex-1">
                  <p className="text-emerald-900 font-bold">
                    Conectado como <span>{customer?.name}</span>
                  </p>
                  <p className="text-emerald-700">
                    WhatsApp: {formatPhoneDisplay(customer?.phone || "")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Informe seu WhatsApp e Nome abaixo. Criaremos seu acesso para você acompanhar o pedido!
                </span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  WhatsApp / Celular
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    disabled={isLoggedIn}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-gray-50 text-sm font-semibold disabled:opacity-75 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="text"
                    placeholder="João da Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-gray-50 text-sm font-semibold"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Tipo de Pedido */}
          <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 text-base mb-4">Entrega ou Retirada?</h2>
            <div className="flex gap-3 mb-4">
              <label className={`flex-1 p-3.5 border-2 rounded-2xl text-center cursor-pointer font-bold text-sm transition-all ${orderType === 'RETIRADA' ? 'border-vitrinia-purple bg-vitrinia-purple/5 text-vitrinia-purple' : 'border-gray-200 text-gray-600'}`}>
                <input type="radio" name="orderType" value="RETIRADA" className="hidden" checked={orderType === 'RETIRADA'} onChange={() => setOrderType('RETIRADA')} />
                Vou Retirar
              </label>
              <label className={`flex-1 p-3.5 border-2 rounded-2xl text-center cursor-pointer font-bold text-sm transition-all ${orderType === 'DELIVERY' ? 'border-vitrinia-purple bg-vitrinia-purple/5 text-vitrinia-purple' : 'border-gray-200 text-gray-600'}`}>
                <input type="radio" name="orderType" value="DELIVERY" className="hidden" checked={orderType === 'DELIVERY'} onChange={() => setOrderType('DELIVERY')} />
                Delivery (Entrega)
              </label>
            </div>

            {orderType === 'DELIVERY' && (
              <div className="space-y-3 mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Endereço de Entrega</label>
                  <input
                    required={orderType === 'DELIVERY'}
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-white text-sm"
                    placeholder="Rua das Flores, 123 - Apto 45"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Bairro</label>
                    <input
                      required={orderType === 'DELIVERY'}
                      type="text"
                      value={formData.neighborhood}
                      onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-white text-sm"
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Cidade</label>
                    <input
                      required={orderType === 'DELIVERY'}
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-white text-sm"
                      placeholder="São Paulo"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Agendamento */}
          <section>
            <BookingCalendarPicker
              slug={slug}
              durationMin={30}
              isDelivery={orderType === "DELIVERY"}
              value={scheduledAt}
              onChange={setScheduledAt}
            />
          </section>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botão flutuante para finalizar pedido */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 z-50">
            <div className="max-w-2xl mx-auto flex gap-4 items-center">
              <div className="flex-1">
                <span className="text-xs text-gray-400 block font-medium">Total a Pagar</span>
                <span className="text-2xl font-black text-vitrinia-purple">
                  R$ {cartTotal.toFixed(2)}
                </span>
              </div>
              <button
                disabled={isLoading}
                type="submit"
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl py-4 px-6 shadow-xl shadow-emerald-600/30 transition-all active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  "Processando..."
                ) : (
                  <>
                    <span>Confirmar Pedido</span>
                    <span className="text-xs opacity-90 font-normal">→ WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
