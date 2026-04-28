"use client";

import { createClient } from "@/lib/supabase/client";
import { Package, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PLANS = {
  free: {
    label: "Gratuito",
    price: "R$ 0",
    color: "border-gray-200 bg-gray-50",
    badge: "text-gray-600 bg-gray-100",
    perks: ["Até 20 produtos", "Pedidos manuais", "Dashboard básico"],
  },
  pro: {
    label: "Pro",
    price: "R$ 29/mês",
    color: "border-blue-500 bg-blue-50",
    badge: "text-blue-700 bg-blue-100",
    perks: ["Produtos ilimitados", "Vitrine digital", "WhatsApp + Agendamentos"],
  },
};

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const plano = (searchParams.get("plano") as "free" | "pro") || null;
  const plan = plano ? PLANS[plano] : null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${plano ? `?plano=${plano}` : ""}`,
      },
    });

    if (error) {
      console.error(error);
      setLoading(false);
      alert("Erro ao tentar fazer login com o Google.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Package size={32} className="text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          SIS PqEmp
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Gerencie seu negócio com inteligência
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md space-y-4">

        {/* Plano selecionado */}
        {plan && (
          <div className={`rounded-2xl border-2 p-4 ${PLANS[plano].color}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Plano selecionado</p>
                  <p className="font-black text-gray-900">{plan.label} — {plan.price}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${PLANS[plano].badge}`}>
                {plano}
              </span>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {plan.perks.map((p) => (
                <li key={p} className="text-[10px] font-medium text-gray-600 bg-white/70 border border-gray-200 px-2 py-1 rounded-lg">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Card de Login */}
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
          {!plan && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
              <p className="text-xs text-amber-700 font-medium">
                Você não selecionou um plano.{" "}
                <a href="/#planos" className="font-bold underline">Escolher agora</a>
              </p>
            </div>
          )}

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400 font-medium">
                Acesse com sua conta Google
              </span>
            </div>
          </div>

          <button
            id="btn-google-login"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <img
              className="h-5 w-5"
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
            />
            {loading ? "Conectando..." : "Continuar com o Google"}
          </button>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition font-medium"
            >
              ← Voltar para a página inicial
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 px-4">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
