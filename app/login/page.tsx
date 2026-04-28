"use client";

import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

const PLANS = {
  free: {
    label: "Gratuito",
    price: "R$ 0",
    perks: ["Até 20 produtos", "Pedidos manuais", "Dashboard básico"],
  },
  pro: {
    label: "Pro ⭐",
    price: "R$ 29/mês",
    perks: ["Produtos ilimitados", "Vitrine digital", "WhatsApp + Agendamentos"],
  },
};

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const plano = (searchParams.get("plano") as "free" | "pro") || null;
  const plan = plano ? PLANS[plano] : null;
  const error = searchParams.get("error");

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
    <div className="min-h-screen bg-vitrinia-bg font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition mb-4">
            <div className="w-12 h-12 bg-vitrinia-purple rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">V</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-gray-900">vitrinia</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            {plan ? `Você está assinando o plano ${plan.label}` : "Gerencie seu negócio com inteligência"}
          </p>
        </div>

        <div className="space-y-4">
          {/* Plano selecionado */}
          {plan && (
            <div className={`rounded-2xl border-2 p-4 ${plano === 'pro' ? 'border-vitrinia-purple bg-vitrinia-purple/5' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 size={18} className="text-vitrinia-purple shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Plano selecionado</p>
                  <p className="font-black text-gray-900">{plan.label} — <span className="font-medium text-sm text-gray-500">{plan.price}</span></p>
                </div>
              </div>
              <ul className="flex flex-wrap gap-2 mt-2">
                {plan.perks.map(p => (
                  <li key={p} className="text-[11px] font-medium text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Aviso se sem plano */}
          {!plan && (
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-center">
              <p className="text-xs text-amber-700 font-medium">
                Sem plano selecionado.{" "}
                <a href="/#planos" className="font-black underline">Ver planos</a>
              </p>
            </div>
          )}

          {/* Card de Login */}
          <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-gray-100">
            {error === "auth-failed" && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-center text-sm text-red-600">
                Ops! Não conseguimos fazer login. Tente novamente.
              </div>
            )}

            <p className="text-center text-sm text-gray-500 font-medium mb-6">
              Continue com sua conta Google para {plan ? "criar sua loja" : "acessar o sistema"}.
            </p>

            <button
              id="btn-google-login"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition focus:outline-none disabled:opacity-50"
            >
              <img
                className="h-5 w-5"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
              />
              {loading ? "Conectando..." : "Continuar com o Google"}
            </button>

            <div className="mt-6 text-center">
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition font-medium">
                ← Voltar para a página inicial
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 px-4">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </div>
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
