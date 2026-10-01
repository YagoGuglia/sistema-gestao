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
  const { items, cartTotal, removeFromCart, clearCart, updateQuantity, updateObservation } = useCart();
  const { customer, isLoggedIn, login, logout, openLoginModal } = useCustomerAuth();
  const router = useRouter();

  const [orderType, setOrderType] = useState<"RETIRADA" | "DELIVERY">("RETIRADA");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [isSchedulingEnabled, setIsSchedulingEnabled] = useState(false);
  const [showScheduling, setShowScheduling] = useState(false);
  
  useEffect(() => {
    async function fetchSettings() {
      const { getStoreSettingsForClient } = await import("@/app/actions/checkout-actions");
      const settings = await getStoreSettingsForClient(slug);
      if (settings?.defaultSchedulingEnabled) {
        setIsSchedulingEnabled(true);
      }
    }
    fetchSettings();
  }, [slug]);
  
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
      items: items.map(i => ({ id: i.id, price: i.price, quantity: i.quantity, observation: i.observation })),
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

      <div className="max-w-6xl mx-auto p-4 mt-2 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Identificação */}
        <div className="md:col-span-2 space-y-6">
          {/* Formulário com Login Obrigatório */}
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
            
            {/* Seção de Login / Identificação do Cliente */}
            <section className="bg-white p-5 lg:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Seus Dados</h2>
                    <p className="text-xs text-gray-500">Para identificarmos seu pedido</p>
                  </div>
                </div>

                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-red-500 transition"
                    title="Trocar de conta"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                )}
              </div>

              {isLoggedIn ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div className="text-sm flex-1">
                    <p className="text-emerald-900 font-bold">
                      Conectado como <span>{customer?.name}</span>
                    </p>
                    <p className="text-emerald-700 font-medium">
                      WhatsApp: {formatPhoneDisplay(customer?.phone || "")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-medium text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
                  <span>
                    Informe seu WhatsApp e Nome abaixo. Criaremos seu acesso para você acompanhar o pedido!
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    WhatsApp / Celular *
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      disabled={isLoggedIn}
                      className="w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-vitrinia-purple bg-gray-50 text-sm font-bold disabled:opacity-75 disabled:bg-gray-100 transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type="text"
                      placeholder="Ex: João da Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-vitrinia-purple bg-gray-50 text-sm font-bold transition-shadow"
                    />
                  </div>
                </div>
              </div>
            </section>

          </form>
        </div>

        {/* Lado Direito: Resumo do Pedido e Logística */}
        <div className="md:col-span-1">
          <div className="bg-[#111827] text-white p-5 lg:p-6 rounded-3xl shadow-2xl md:sticky md:top-6 flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-vitrinia-purple/20 text-vitrinia-purple flex items-center justify-center">🛍️</div>
                Sua Sacola
              </h3>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item, idx) => (
                  <div key={idx} className="group border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-800" />
                        )}
                        <div>
                          <p className="font-bold text-sm tracking-wide text-gray-100">{item.name}</p>
                          <p className="text-xs text-vitrinia-purple font-bold">R$ {item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-400 transition p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-800 rounded-lg p-1 shadow-inner w-fit">
                        <button type="button" onClick={() => updateQuantity(item.id, item.observation || "", Math.max(1, item.quantity - 1))} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition bg-gray-700/50 rounded-md font-bold">-</button>
                        <span className="text-sm font-black w-8 text-center">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.observation || "", item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition bg-gray-700/50 rounded-md font-bold">+</button>
                      </div>
                      
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="Ex: sem cebola..."
                          value={item.observation || ""}
                          onChange={(e) => updateObservation(item.id, item.observation || "", e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-vitrinia-purple focus:ring-1 focus:ring-vitrinia-purple transition-all placeholder:text-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 space-y-5">
              {/* Opções de Logística */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Como deseja receber?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setOrderType("RETIRADA")}
                    className={`py-2.5 text-xs font-bold rounded-xl transition border ${orderType === "RETIRADA" ? 'bg-vitrinia-purple text-white border-vitrinia-purple shadow-lg shadow-vitrinia-purple/20' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'}`}
                  >
                    Vou Retirar
                  </button>
                  <button 
                    type="button"
                    onClick={() => setOrderType("DELIVERY")}
                    className={`py-2.5 text-xs font-bold rounded-xl transition border ${orderType === "DELIVERY" ? 'bg-vitrinia-purple text-white border-vitrinia-purple shadow-lg shadow-vitrinia-purple/20' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'}`}
                  >
                    Entrega
                  </button>
                </div>
              </div>

              {/* Endereço Delivery (só mostra se for delivery) */}
              {orderType === 'DELIVERY' && (
                <div className="space-y-3 bg-gray-800 p-4 rounded-2xl border border-gray-700 animate-in fade-in">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Endereço de Entrega *</label>
                    <input
                      form="checkout-form"
                      required={orderType === 'DELIVERY'}
                      type="text"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-vitrinia-purple transition-all"
                      placeholder="Rua, Número, Complemento"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bairro *</label>
                      <input
                        form="checkout-form"
                        required={orderType === 'DELIVERY'}
                        type="text"
                        value={formData.neighborhood}
                        onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-vitrinia-purple transition-all"
                        placeholder="Centro"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cidade *</label>
                      <input
                        form="checkout-form"
                        required={orderType === 'DELIVERY'}
                        type="text"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-vitrinia-purple transition-all"
                        placeholder="São Paulo"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Agendamento no Sidebar */}
              {isSchedulingEnabled && (
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-200">Deseja agendar?</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowScheduling(!showScheduling);
                        if (showScheduling) setScheduledAt("");
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showScheduling ? 'bg-vitrinia-purple' : 'bg-gray-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showScheduling ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {showScheduling && (
                    <div className="mt-4">
                      <BookingCalendarPicker
                        slug={slug}
                        durationMin={30}
                        isDelivery={orderType === "DELIVERY"}
                        value={scheduledAt}
                        onChange={setScheduledAt}
                      />
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Total e Confirmação */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 font-bold text-sm">Total do Pedido</span>
                  <span className="text-3xl font-black text-white tracking-tight">R$ {cartTotal.toFixed(2)}</span>
                </div>

                <button
                  form="checkout-form"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    "Processando..."
                  ) : (
                    <>
                      Confirmar Pedido
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-gray-500 mt-3 font-medium">Você será redirecionado para o WhatsApp da loja.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
