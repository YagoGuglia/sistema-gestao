"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("vitrinia_cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("vitrinia_cookie_consent", "accepted");
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem("vitrinia_cookie_consent", "rejected");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl shadow-2xl border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-2xl bg-purple-100 text-vitrinia-purple shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="text-sm font-bold text-gray-900">Privacidade & Cookies (LGPD)</h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            Utilizamos cookies essenciais para garantir o funcionamento seguro da sua sessão, carrinho e processamento de pedidos conforme nossa{" "}
            <Link href="/privacidade" className="text-vitrinia-purple font-semibold hover:underline">
              Política de Privacidade
            </Link>{" "}
            e{" "}
            <Link href="/termos" className="text-vitrinia-purple font-semibold hover:underline">
              Termos de Uso
            </Link>.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleAccept}
              className="flex-1 py-2 px-3.5 bg-vitrinia-purple hover:bg-vitrinia-purple/90 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
            >
              Aceitar Todos
            </button>
            <button
              onClick={handleReject}
              className="py-2 px-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-medium transition"
            >
              Apenas Essenciais
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

