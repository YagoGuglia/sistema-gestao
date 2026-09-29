"use client";

import { useState } from "react";
import { Search, Bell, MapPin, User, Package, LogOut, MessageCircle } from "lucide-react";
import { useCustomerAuth } from "./CustomerAuthContext";
import { createWhatsAppLink } from "@/lib/whatsapp";

interface StoreHeaderProps {
  storeName: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  category?: string;
  isOpen?: boolean;
  whatsappNumber?: string | null;
}

export function StoreHeader({
  storeName,
  logoUrl,
  bannerUrl,
  category = "Vitrinia",
  isOpen = true,
  whatsappNumber,
}: StoreHeaderProps) {
  const { customer, isLoggedIn, openLoginModal, openOrdersModal, logout } = useCustomerAuth();
  const [showMenu, setShowMenu] = useState(false);

  const firstName = customer?.name ? customer.name.split(" ")[0] : "";
  const whatsappHelpUrl = whatsappNumber 
    ? createWhatsAppLink(whatsappNumber, `Olá ${storeName}! Gostaria de tirar uma dúvida sobre a loja e acompanhar meus pedidos.`)
    : null;

  return (
    <div className="w-full relative">
      {/* Top Navbar */}
      <div className="w-full bg-[var(--brand-color)] text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="font-black text-base tracking-wider bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center">
            V
          </div>
          <span className="font-black text-sm tracking-tight">vitrinia</span>
        </div>

        <div className="flex items-center space-x-2 relative">
          {whatsappHelpUrl && (
            <a
              href={whatsappHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full transition shadow-sm active:scale-95"
              title="Acompanhar pelo WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">Olá, {firstName}</span>
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-40 text-gray-800 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-gray-100 text-gray-400 font-normal">
                      Conectado como <strong className="text-gray-700 block truncate">{customer?.name}</strong>
                    </div>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        openOrdersModal();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-bold"
                    >
                      <Package className="w-4 h-4 text-vitrinia-purple" />
                      Meus Pedidos
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-2 font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => openLoginModal()}
              className="flex items-center gap-1.5 bg-white text-gray-900 px-3.5 py-1.5 rounded-full text-xs font-bold hover:bg-gray-100 transition shadow-sm active:scale-95"
            >
              <User className="w-3.5 h-3.5 text-vitrinia-purple" />
              <span>Entrar</span>
            </button>
          )}
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

        <div className="mt-2">
          {isOpen ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Aberto agora
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Fechado no momento
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
