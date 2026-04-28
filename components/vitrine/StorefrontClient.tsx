"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
}

export function StorefrontClient({ products }: { products: Product[] }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  const handleAddToCart = (product: Product) => {
    setCartCount(prev => prev + 1);
    setCartTotal(prev => prev + product.price);
  };

  return (
    <div className="px-4 mt-8 pb-8 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Catálogo de Produtos</h2>
      
      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          Nenhum produto cadastrado nesta loja ainda.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {products.map(product => (
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

      {/* Sticky Cart Bottom Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent z-50 pointer-events-none">
          <div className="max-w-3xl mx-auto">
            <button className="w-full bg-vitrinia-green text-white font-bold rounded-2xl py-4 px-6 flex items-center justify-between shadow-lg shadow-vitrinia-green/30 hover:bg-[#00a382] transition-colors pointer-events-auto active:scale-[0.98]">
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
