"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Background Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 transition-opacity duration-300 z-[60]",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside 
        className={cn(
          "fixed inset-y-0 right-0 bg-white shadow-2xl transition-transform duration-300 ease-in-out z-[70]",
          "w-full sm:max-w-2xl lg:max-w-3xl", // Mobile: Full, Desktop: Large enough
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Edição Rápida</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </aside>
    </>
  );
}
