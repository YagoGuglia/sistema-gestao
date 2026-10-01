"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Calendar, 
  Users, 
  Settings, 
  Menu, 
  X,
  PlusCircle,
  Building2,
  Wallet,
  Star,
  UsersRound
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Estoque", href: "/admin/produtos", icon: Package },
  { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
  { name: "Agenda", href: "/admin/agenda", icon: Calendar },
  { name: "Financeiro", href: "/admin/financeiro", icon: Wallet },
  { name: "Equipe", href: "/admin/equipe", icon: UsersRound },
  { name: "Clientes", href: "/admin/clientes", icon: Users },
  { name: "Avaliações", href: "/admin/avaliacoes", icon: Star },
  { name: "Empresa", href: "/admin/empresa", icon: Building2 },
  { name: "Configurações", href: "/admin/config", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Fecha sidebar ao navegar (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Impede scroll do body quando sidebar aberta no mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Header Mobile Fixo */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-vitrinia-purple rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">V</span>
            </div>
            <h1 className="text-lg font-bold text-vitrinia-purple tracking-tight">vitrinia</h1>
          </Link>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition active:scale-95"
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Principal */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6 pt-20 lg:pt-6">
          {/* Logo - só visível em desktop, no mobile usa o header fixo */}
          <div className="mb-10 hidden lg:block">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-7 h-7 bg-vitrinia-purple rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">V</span>
              </div>
              <h1 className="text-2xl font-bold text-vitrinia-purple tracking-tight">vitrinia</h1>
            </Link>
            <p className="text-xs text-gray-500 font-medium mt-1">Gestão para Pequenos Negócios</p>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 pb-4 -mr-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive 
                      ? "bg-vitrinia-purple/10 text-vitrinia-purple shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon size={20} className={cn(isActive ? "text-vitrinia-purple" : "text-gray-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <Link 
              href="/admin/produtos/novo"
              className="flex items-center justify-center gap-2 w-full bg-vitrinia-purple text-white py-3 px-4 rounded-xl font-bold shadow-md hover:bg-vitrinia-purple/90 transition active:scale-95"
            >
              <PlusCircle size={20} />
              Novo Produto
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
