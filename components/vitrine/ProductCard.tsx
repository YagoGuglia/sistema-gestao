"use client";

import { ShoppingBag, CalendarPlus, Minus, Plus } from "lucide-react";
import { useCart } from "./CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isService?: boolean;
  onAdd?: () => void;
}

export function ProductCard({ id, name, description, price, imageUrl, isService, onAdd }: ProductCardProps) {
  const { items, updateQuantity, removeFromCart } = useCart();
  
  // Calculate total quantity of this specific product in the cart (across any observations)
  const productCartItems = items.filter(item => item.id === id);
  const totalQuantity = productCartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalQuantity <= 0) return;
    
    // Decrease from the first item found for this product
    const firstItem = productCartItems[0];
    if (firstItem.quantity > 1) {
      updateQuantity(firstItem.id, firstItem.observation || "", firstItem.quantity - 1);
    } else {
      removeFromCart(firstItem.id);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalQuantity === 0) {
      if (onAdd) onAdd();
    } else {
      const firstItem = productCartItems[0];
      updateQuantity(firstItem.id, firstItem.observation || "", firstItem.quantity + 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      {/* Product Image / Placeholder */}
      <div className="w-full aspect-square rounded-xl bg-gray-50 mb-3 flex items-center justify-center overflow-hidden relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          isService ? (
            <CalendarPlus className="w-10 h-10 text-[var(--brand-color)] opacity-20" />
          ) : (
            <ShoppingBag className="w-10 h-10 text-[var(--brand-color)] opacity-20" />
          )
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-tight mb-1">{name}</h3>
        {description && (
          <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2 mb-2 flex-1">
            {description}
          </p>
        )}
      </div>

      {/* Price & Action */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 h-10">
        <span className="font-extrabold" style={{ color: "var(--brand-color)" }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
        </span>
        
        {isService && totalQuantity === 0 ? (
          <button
            onClick={(e) => { e.stopPropagation(); if (onAdd) onAdd(); }}
            className="w-8 h-8 rounded-lg transition-colors flex items-center justify-center shadow-sm hover:brightness-110"
            style={{ backgroundColor: "var(--brand-color)", color: "white" }}
            aria-label="Agendar"
          >
            <CalendarPlus className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center rounded-lg overflow-hidden h-8" style={{ border: "1px solid var(--brand-color)" }}>
            <button 
              onClick={handleDecrease}
              disabled={totalQuantity <= 0}
              className={`w-8 h-full flex items-center justify-center transition-colors ${totalQuantity <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              style={{ color: "var(--brand-color)", backgroundColor: totalQuantity <= 0 ? "transparent" : "transparent" }}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-bold" style={{ color: "var(--brand-color)" }}>
              {totalQuantity}
            </span>
            <button 
              onClick={handleIncrease}
              className="w-8 h-full flex items-center justify-center transition-colors text-white hover:brightness-110"
              style={{ backgroundColor: "var(--brand-color)" }}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
