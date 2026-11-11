"use client";

import { useState } from "react";
import { User, Package, LogOut, MessageCircle } from "lucide-react";
import { useCustomerAuth } from "./CustomerAuthContext";
import { createWhatsAppLink } from "@/lib/whatsapp";

interface StoreHeaderProps {
  storeName: string;
  logoUrl?: string | null;
  superBannerUrl?: string | null;
  bannerUrl?: string | null;
  slogan?: string | null;
  fontFamily?: string;
  bannerOpacity?: number;
  useSolidColorForHeader?: boolean;
  primaryColor?: string;
  isOpen?: boolean;
  whatsappNumber?: string | null;
}

export function StoreHeader({
  storeName,
  logoUrl,
  superBannerUrl,
  bannerUrl,
  slogan = "O SEU PEDIDO EM UM CLIQUE",
  fontFamily = "Inter",
  bannerOpacity = 1.0,
  useSolidColorForHeader = false,
  primaryColor = "#7C3AED",
  isOpen = true,
  whatsappNumber,
}: StoreHeaderProps) {
  const { customer, isLoggedIn, openLoginModal, openOrdersModal, logout } = useCustomerAuth();
  const [showMenu, setShowMenu] = useState(false);

  const headerBanner = useSolidColorForHeader ? null : (superBannerUrl || bannerUrl);
  const firstName = customer?.name ? customer.name.split(" ")[0] : "";
  const whatsappHelpUrl = whatsappNumber 
    ? createWhatsAppLink(whatsappNumber, `Olá ${storeName}! Gostaria de tirar uma dúvida sobre a loja e acompanhar meus pedidos.`)
    : null;

  return (
    <header className="w-full relative shadow-xs">
      {/* Container do Superbanner / Banner de Cabeçalho */}
      <div 
        className="w-full relative rounded-b-[2rem] sm:rounded-b-[2.5rem] overflow-hidden transition-all min-h-[220px] sm:min-h-[250px] flex flex-col justify-between"
        style={{
          backgroundColor: primaryColor,
        }}
      >
        {/* Imagem do Banner com Translucidez Ajustável (sem overlay escuro forçado) */}
        {headerBanner && (
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-300"
            style={{
              backgroundImage: `url(${headerBanner})`,
              opacity: bannerOpacity,
            }}
          />
        )}

        {/* Barra Superior Flutuante (Navbar com Ações) */}
        <div className="relative z-10 w-full px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="font-black text-sm tracking-wider bg-white/20 backdrop-blur-md text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-xs">
              V
            </div>
            <span className="font-extrabold text-xs tracking-tight text-white/95 drop-shadow-xs">
              vitrinia
            </span>
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
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-bold transition backdrop-blur-md active:scale-95"
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
                className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-gray-900 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm active:scale-95"
              >
                <User className="w-3.5 h-3.5 text-vitrinia-purple" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Centro do Cabeçalho: Logo Circular da Empresa + Nome da Loja + Slogan + Status */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-1 pb-6 text-center">
          {/* Logo da Empresa (Circular, com moldura branca elegante) */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full p-1 shadow-xl flex items-center justify-center overflow-hidden border-2 border-white/90">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center text-vitrinia-purple font-black text-2xl">
                {storeName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Nome da Loja com Tipografia Personalizada */}
          <h1 
            className="mt-3 text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight drop-shadow-sm"
            style={{ fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : "inherit" }}
          >
            {storeName}
          </h1>

          {/* Frase de Efeito / Slogan Customizado (máx 45 caracteres) */}
          <p className="text-xs sm:text-sm text-white/95 font-medium tracking-wide uppercase mt-1 drop-shadow-xs max-w-md truncate px-2">
            {slogan || "O SEU PEDIDO EM UM CLIQUE"}
          </p>

          {/* Status Aberto/Fechado */}
          <div className="mt-2.5">
            {isOpen ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Aberto agora
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-500/90 text-white shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white" />
                Fechado no momento
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
