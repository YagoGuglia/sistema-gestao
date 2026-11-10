"use client";

import { useState } from "react";
import { Lock, Sparkles } from "lucide-react";
import { UpgradeModal } from "./UpgradeModal";
import { cn } from "@/lib/utils";

interface ProPaywallBadgeProps {
  isPro?: boolean;
  featureName: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  asButton?: boolean;
}

export function ProPaywallBadge({
  isPro = false,
  featureName,
  children,
  className,
  onClick,
  asButton = false,
}: ProPaywallBadgeProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (isPro) {
    if (asButton) {
      return (
        <button onClick={onClick} className={className}>
          {children}
        </button>
      );
    }
    return <>{children}</>;
  }

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className={cn(
          "relative group cursor-pointer inline-flex items-center gap-1.5",
          className
        )}
        title="Recurso exclusivo do Plano PRO"
      >
        <span className="opacity-80 pointer-events-none">{children}</span>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase border border-amber-300 shadow-sm animate-pulse">
          <Lock className="w-2.5 h-2.5" />
          PRO
        </span>
      </div>

      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        featureName={featureName}
      />
    </>
  );
}

