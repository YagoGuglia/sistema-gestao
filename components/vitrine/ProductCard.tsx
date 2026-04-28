"use client";

import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  onAdd?: () => void;
}

export function ProductCard({ id, name, description, price, imageUrl, onAdd }: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      {/* Product Image / Placeholder */}
      <div className="w-full aspect-square rounded-xl bg-vitrinia-bg/50 mb-3 flex items-center justify-center overflow-hidden relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <ShoppingBag className="w-10 h-10 text-vitrinia-purple/20" />
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-gray-800 text-base leading-tight mb-1">{name}</h3>
        {description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2 flex-1">
            {description}
          </p>
        )}
      </div>

      {/* Price & Action */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
        <span className="font-extrabold text-vitrinia-purple">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
        </span>
        <button
          onClick={onAdd}
          className="bg-vitrinia-orange/10 text-vitrinia-orange hover:bg-vitrinia-orange hover:text-white transition-colors p-2 rounded-lg"
          aria-label="Adicionar"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
