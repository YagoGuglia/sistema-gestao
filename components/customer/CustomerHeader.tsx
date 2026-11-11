"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogOut, User, Store } from "lucide-react";
import { useState } from "react";

interface CustomerHeaderProps {
  userName: string;
  userEmail: string;
  hasTenant?: boolean;
}

export function CustomerHeader({ userName, userEmail, hasTenant }: CustomerHeaderProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const firstName = userName ? userName.split(" ")[0] : "Cliente";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo Vitrinia */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition">
          <div className="w-8 h-8 bg-vitrinia-purple rounded-xl flex items-center justify-center shadow-xs">
            <span className="text-white font-black text-sm">V</span>
          </div>
          <div>
            <span className="text-lg font-black text-vitrinia-purple tracking-tight leading-none">vitrinia</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-full">
              Portal do Cliente
            </span>
          </div>
        </Link>

        {/* Ações do Usuário */}
        <div className="flex items-center gap-3">
          {hasTenant && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-vitrinia-purple hover:bg-purple-100 rounded-xl text-xs font-bold transition border border-purple-100"
            >
              <Store size={14} />
              <span>Painel do Lojista</span>
            </Link>
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
            <div className="w-8 h-8 rounded-full bg-vitrinia-purple/10 text-vitrinia-purple flex items-center justify-center font-bold text-xs">
              <User size={15} />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-gray-900 leading-tight">Olá, {firstName}</p>
              <p className="text-[10px] text-gray-400 font-mono truncate max-w-[140px]">{userEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition border border-red-100 active:scale-95 disabled:opacity-50"
            title="Sair da conta"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">{loggingOut ? "Saindo..." : "Sair"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

