"use client";

import { Search, Bell, MapPin } from "lucide-react";

interface StoreHeaderProps {
  storeName: string;
  logoUrl?: string | null;
  bannerColor?: string;
  category?: string;
}

export function StoreHeader({
  storeName,
  logoUrl,
  bannerColor = "bg-vitrinia-purple",
  category = "Vitrinia",
}: StoreHeaderProps) {
  return (
    <div className="w-full relative">
      {/* Top Navbar */}
      <div className={`w-full ${bannerColor} text-white px-4 py-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          {/* Logo do sistema simplificado ou ícone de menu se desejar */}
          <div className="font-bold text-lg tracking-wider">V</div>
          <span className="font-semibold text-sm">vitrinia</span>
        </div>
        <div className="flex items-center space-x-4">
          <button aria-label="Pesquisar" className="text-white hover:text-gray-200">
            <Search className="w-5 h-5" />
          </button>
          <button aria-label="Notificações" className="text-white hover:text-gray-200">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Profile Section (Cover + Avatar) */}
      <div className={`w-full ${bannerColor} h-24 rounded-b-3xl relative flex justify-center`} />
      
      {/* Container do Avatar subindo para o banner */}
      <div className="flex flex-col items-center -mt-12 px-4">
        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md z-10 flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full bg-vitrinia-bg rounded-full flex items-center justify-center text-vitrinia-purple text-2xl font-bold">
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
