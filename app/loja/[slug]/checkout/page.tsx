"use client";

import { useState, use } from "react";
import { useCart } from "@/components/vitrine/CartContext";
import { processCheckout } from "@/app/actions/checkout-actions";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { items, cartTotal, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const [orderType, setOrderType] = useState<"RETIRADA" | "DELIVERY">("RETIRADA");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    neighborhood: "",
    city: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsLoading(true);
    setError("");

    const result = await processCheckout({
      slug,
      items: items.map(i => ({ id: i.id, price: i.price, quantity: i.quantity })),
      customer,
      orderType,
      scheduledAt: scheduledAt || null
    });

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      clearCart();
      alert("Pronto! O pedido foi registrado com sucesso!");
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
    <div className="min-h-screen bg-vitrinia-bg pb-24 font-sans">
      <div className="bg-vitrinia-purple text-white p-4 flex items-center">
        <Link href={`/loja/${slug}`} className="mr-4">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Finalizar Pedido</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4 space-y-6">
        
        {/* Resumo da Sacola */}
        <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
          <h2 className="font-bold text-gray-800 mb-4">Resumo da Sacola</h2>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity}x de R$ {item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-vitrinia-purple">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-gray-500 font-semibold">Total em produtos:</span>
            <span className="text-lg font-bold text-gray-900">R$ {cartTotal.toFixed(2)}</span>
          </div>
        </section>

        {/* Formulário */}
        <form onSubmit={handleCheckout} className="space-y-6">
          <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
            <h2 className="font-bold text-gray-800 mb-4">Seus Dados</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input required type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-gray-50" placeholder="João da Silva" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input required type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-gray-50" placeholder="(11) 99999-9999" />
              </div>
            </div>
          </section>

          <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
            <h2 className="font-bold text-gray-800 mb-4">Entrega ou Retirada?</h2>
            <div className="flex gap-4 mb-4">
              <label className={`flex-1 p-3 border rounded-xl text-center cursor-pointer font-medium transition-colors ${orderType === 'RETIRADA' ? 'border-vitrinia-purple bg-vitrinia-purple/5 text-vitrinia-purple' : 'border-gray-200 text-gray-600'}`}>
                <input type="radio" name="orderType" value="RETIRADA" className="hidden" checked={orderType === 'RETIRADA'} onChange={() => setOrderType('RETIRADA')} />
                Vou Retirar
              </label>
              <label className={`flex-1 p-3 border rounded-xl text-center cursor-pointer font-medium transition-colors ${orderType === 'DELIVERY' ? 'border-vitrinia-purple bg-vitrinia-purple/5 text-vitrinia-purple' : 'border-gray-200 text-gray-600'}`}>
                <input type="radio" name="orderType" value="DELIVERY" className="hidden" checked={orderType === 'DELIVERY'} onChange={() => setOrderType('DELIVERY')} />
                Delivery
              </label>
            </div>

            {orderType === 'DELIVERY' && (
              <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço de Entrega</label>
                  <input required type="text" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-white" placeholder="Rua das Flores, 123" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                    <input required type="text" value={customer.neighborhood} onChange={e => setCustomer({...customer, neighborhood: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-white" placeholder="Centro" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input required type="text" value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-white" placeholder="São Paulo" />
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
            <h2 className="font-bold text-gray-800 mb-4">Agendar Pedido (Opcional)</h2>
            <p className="text-sm text-gray-500 mb-3">Deseja agendar um horário específico para o seu pedido?</p>
            <input 
              type="datetime-local" 
              value={scheduledAt} 
              onChange={e => setScheduledAt(e.target.value)} 
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-gray-50" 
            />
          </section>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>}

          {/* Botão flutuante para manter o padrão */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50">
            <div className="max-w-2xl mx-auto flex gap-4 items-center">
              <div className="flex-1">
                <span className="text-xs text-gray-500 block">Total a Pagar</span>
                <span className="text-xl font-black text-vitrinia-purple">R$ {cartTotal.toFixed(2)}</span>
              </div>
              <button disabled={isLoading} type="submit" className="flex-[2] bg-vitrinia-green text-white font-bold rounded-2xl py-4 px-6 shadow-lg shadow-vitrinia-green/30 hover:bg-[#00a382] transition-colors active:scale-[0.98] disabled:opacity-50">
                {isLoading ? "Processando..." : "Confirmar Pedido"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
