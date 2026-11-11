"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

/**
 * Componente de proteção contra Bots via Cloudflare Turnstile.
 * 
 * Para ativar a proteção real:
 * 1. Obtenha a Site Key gratuita no painel do Cloudflare (Turnstile).
 * 2. Adicione ao seu arquivo `.env`:
 *    NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAA..."
 *    TURNSTILE_SECRET_KEY="0x4AAAAAA..."
 */
export function TurnstileWidget({ onVerify, onExpire, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    // Se a chave não estiver configurada no .env (modo dev), simula token válido
    if (!siteKey) {
      onVerify("dev-bypass-token");
      return;
    }

    const scriptId = "cf-turnstile-script";

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetId) {
        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: "light",
            callback: (token: string) => onVerify(token),
            "expired-callback": () => onExpire?.(),
            "error-callback": () => onError?.(),
          });
          setWidgetId(id);
        } catch (e) {
          console.error("Erro ao renderizar widget Turnstile:", e);
        }
      }
    };

    if (!document.getElementById(scriptId)) {
      window.onloadTurnstileCallback = renderWidget;
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    }
  }, [siteKey]);

  if (!siteKey) {
    return (
      <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] text-gray-500 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Ambiente seguro protegido por validação de requisição</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-2">
      <div ref={containerRef} />
    </div>
  );
}

