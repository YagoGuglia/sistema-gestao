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
  Store
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Estoque", href: "/admin/produtos", icon: Package },
  { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
  { name: "Agenda", href: "/admin/agenda", icon: Calendar },
  { name: "Clientes", href: "/admin/clientes", icon: Users },
  { name: "Empresa", href: "/admin/empresa", icon: Building2 },
  { name: "Configurações", href: "/admin/config", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botão Mobile */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-blue-600 text-white rounded-md shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Principal */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-10">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-7 h-7 bg-vitrinia-purple rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">V</span>
              </div>
              <h1 className="text-2xl font-bold text-vitrinia-purple tracking-tight">vitrinia</h1>
            </Link>
            <p className="text-xs text-gray-500 font-medium mt-1">Gestão para Pequenos Negócios</p>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive 
                      ? "bg-blue-50 text-blue-600 shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon size={20} className={cn(isActive ? "text-blue-600" : "text-gray-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <Link 
              href="/admin/produtos/novo"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-bold shadow-md hover:bg-blue-700 transition active:scale-95"
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
