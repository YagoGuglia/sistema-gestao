"use client";

import { useState } from "react";
import { useCustomerAuth } from "./CustomerAuthContext";
import { X, Lock, Phone, User, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { formatPhoneDisplay } from "@/lib/whatsapp";

export function CustomerLoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useCustomerAuth();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isLoginModalOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 11) {
      setPhone(formatPhoneDisplay(raw));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setErrorMsg("Digite um número de WhatsApp válido com DDD.");
      setLoading(false);
      return;
    }

    const res = await login({
      phone: cleanDigits,
      name: needsName ? name : undefined,
    });

    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.needName) {
      setNeedsName(true);
      setErrorMsg("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
        <button
          onClick={closeLoginModal}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900">
            {needsName ? "Complete seu Cadastro" : "Acesse com seu WhatsApp"}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            {needsName
              ? "Notamos que este é o seu primeiro pedido nesta loja. Qual é o seu nome?"
              : "Login obrigatório para fazer o pedido e acompanhar o status pelo WhatsApp."}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-xs font-semibold text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              WhatsApp / Celular
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={handlePhoneChange}
                disabled={needsName || loading}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-semibold text-gray-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition disabled:opacity-60"
              />
            </div>
          </div>

          {needsName && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Seu Nome Completo
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Maria Oliveira"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-semibold text-gray-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-[0.98] disabled:opacity-50 text-sm"
          >
            {loading ? (
              <span>Conectando...</span>
            ) : needsName ? (
              <>
                <span>Concluir e Entrar</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Seus dados são protegidos e vinculados exclusivamente a esta loja.
          </p>
        </div>
      </div>
    </div>
  );
}
