"use client";

import { ShoppingBag, CalendarPlus } from "lucide-react";

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
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
        <span className="font-extrabold" style={{ color: "var(--brand-color)" }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
        </span>
        <button
          onClick={onAdd}
          className="p-2 rounded-lg transition-colors flex items-center justify-center"
          style={{ backgroundColor: "var(--brand-color)", color: "white" }}
          aria-label={isService ? "Agendar" : "Adicionar"}
        >
          {isService ? <CalendarPlus className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
