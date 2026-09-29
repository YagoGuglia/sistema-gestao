"use client";

import { ProductCard } from "./ProductCard";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { useCart } from "./CartContext";
import { useParams, useRouter } from "next/navigation";
import { createWhatsAppLink } from "@/lib/whatsapp";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isService?: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  user: { name: string };
  createdAt: Date;
}

export function StorefrontClient({ 
  products, 
  settings, 
  reviews 
}: { 
  products: Product[]; 
  settings?: any; 
  tenantId: string;
  reviews?: Review[];
}) {
  const { cartCount, cartTotal, addToCart } = useCart();
  const params = useParams();
  const router = useRouter();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const businessType = settings?.businessType || "BOTH";
  
  const physicalProducts = products.filter(p => !p.isService);
  const services = products.filter(p => p.isService);

  return (
    <div className="px-4 mt-8 pb-8 max-w-3xl mx-auto space-y-12">
      {/* SEÇÃO DE PRODUTOS */}
      {(businessType === "BOTH" || businessType === "PRODUCTS") && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--brand-color)]/10 text-[var(--brand-color)] flex items-center justify-center">🛍️</span>
            Catálogo de Produtos
          </h2>
          
          {physicalProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100">
              Nenhum produto físico cadastrado.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {physicalProducts.map(product => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  imageUrl={product.image}
                  onAdd={() => handleAddToCart(product)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* SEÇÃO DE SERVIÇOS */}
      {(businessType === "BOTH" || businessType === "SERVICES") && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--brand-color)]/10 text-[var(--brand-color)] flex items-center justify-center">✂️</span>
            Serviços Disponíveis
          </h2>
          
          {services.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100">
              Nenhum serviço cadastrado.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {services.map(product => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  imageUrl={product.image}
                  onAdd={() => handleAddToCart(product)}
                  isService={true}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* SEÇÃO DE AVALIAÇÕES */}
      {reviews && reviews.length > 0 && (
        <section className="pt-4 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">O que dizem nossos clientes</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {reviews.map(review => (
              <div key={review.id} className="min-w-[280px] bg-white p-5 rounded-3xl border border-gray-100 shadow-sm snap-start">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} className={`w-4 h-4 ${star <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm italic mb-4">"{review.comment}"</p>
                <div className="text-xs font-bold text-gray-900">{review.user.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Botão Flutuante de WhatsApp / Acompanhamento de Pedido */}
      {settings?.whatsappNumber && (
        <a
          href={createWhatsAppLink(settings.whatsappNumber, `Olá! Gostaria de tirar uma dúvida ou acompanhar meu pedido.`)}
          target="_blank"
          rel="noopener noreferrer"
          className={`fixed z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl shadow-emerald-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${
            cartCount > 0 ? "bottom-24 right-4" : "bottom-6 right-4"
          }`}
          title="Falar no WhatsApp / Acompanhar Pedido"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden sm:inline text-xs font-bold pr-1">Acompanhar Pedido</span>
        </a>
      )}

      {/* Sticky Cart Bottom Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent z-50 pointer-events-none">
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={() => router.push(`/loja/${params.slug}/checkout`)}
              className="w-full text-white font-bold rounded-2xl py-4 px-6 flex items-center justify-between shadow-lg hover:brightness-95 transition-all pointer-events-auto active:scale-[0.98]"
              style={{ backgroundColor: "var(--brand-color)" }}
            >
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  {cartCount}
                </div>
                <span>Ver Sacola</span>
              </div>
              <span>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
