"use client";

import { Search, Bell, MapPin } from "lucide-react";

interface StoreHeaderProps {
  storeName: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  category?: string;
}

export function StoreHeader({
  storeName,
  logoUrl,
  bannerUrl,
  category = "Vitrinia",
}: StoreHeaderProps) {
  return (
    <div className="w-full relative">
      {/* Top Navbar */}
      <div className="w-full bg-[var(--brand-color)] text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Logo do sistema simplificado ou ícone de menu se desejar */}
          <div className="font-bold text-lg tracking-wider">V</div>
          <span className="font-semibold text-sm">vitrinia</span>
        </div>
        <div className="flex items-center space-x-4">
          <button aria-label="Pesquisar" className="text-white hover:text-white/80">
            <Search className="w-5 h-5" />
          </button>
          <button aria-label="Notificações" className="text-white hover:text-white/80">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Profile Section (Cover + Avatar) */}
      <div 
        className="w-full h-24 rounded-b-3xl relative flex justify-center bg-cover bg-center"
        style={{
          backgroundColor: bannerUrl ? "transparent" : "var(--brand-color)",
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : "none"
        }}
      >
        {bannerUrl && <div className="absolute inset-0 bg-black/20 rounded-b-3xl"></div>}
      </div>
      
      {/* Container do Avatar subindo para o banner */}
      <div className="flex flex-col items-center -mt-12 px-4 relative z-10">
        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-[var(--brand-color)] text-2xl font-bold">
              {storeName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-bold text-gray-900 text-center">{storeName}</h1>
        <p className="text-sm text-gray-500 mt-1 flex items-center">
          <MapPin className="w-3 h-3 mr-1" />
          {category}
        </p>
      </div>
    </div>
  );
}
