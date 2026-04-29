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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const supabase = createClient();
  const searchParams = useSearchParams();
  const plano = (searchParams.get("plano") as "free" | "pro") || null;
  const plan = plano ? PLANS[plano] : null;
  const error = searchParams.get("error");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${plano ? `?plano=${plano}` : ""}`,
      },
    });
    if (error) {
      console.error(error);
      setLoading(false);
      setMessage({ type: "error", text: "Erro ao tentar fazer login com o Google." });
    }
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: "error", text: "E-mail ou senha incorretos." });
        setLoading(false);
      } else {
        // Redirecionamento é tratado pelo Supabase/Next.js middleware ou callback
        // Mas podemos forçar o redirecionamento aqui para o callback processar as regras de negócio
        window.location.href = `/auth/callback${plano ? `?plano=${plano}` : ""}`;
      }
    } else {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback${plano ? `?plano=${plano}` : ""}`,
        }
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
      } else if (data.session) {
        // Logado imediatamente
        window.location.href = `/auth/callback${plano ? `?plano=${plano}` : ""}`;
      } else {
        setMessage({ type: "success", text: "Verifique seu e-mail para confirmar o cadastro!" });
        setLoading(false);
      }
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
          {!plan && mode === "signup" && (
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-center">
              <p className="text-xs text-amber-700 font-medium">
                Sem plano selecionado.{" "}
                <a href="/#planos" className="font-black underline">Ver planos</a>
              </p>
            </div>
          )}

          {/* Card de Login */}
          <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-gray-100">
            {error === "auth-failed" && !message && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-center text-sm text-red-600">
                Ops! Não conseguimos fazer login. Tente novamente.
              </div>
            )}

            {message && (
              <div className={`mb-4 p-3 rounded-xl text-center text-sm ${message.type === 'error' ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-green-50 border border-green-100 text-green-600'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleEmailAction} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-vitrinia-purple focus:ring-2 focus:ring-vitrinia-purple/20 transition outline-none text-sm font-medium"
                  placeholder="exemplo@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-vitrinia-purple focus:ring-2 focus:ring-vitrinia-purple/20 transition outline-none text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-vitrinia-purple hover:bg-vitrinia-purple/90 text-white rounded-xl shadow-lg shadow-vitrinia-purple/20 text-sm font-black transition disabled:opacity-50"
              >
                {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar Minha Conta"}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
                <span className="bg-white px-4 text-gray-300 italic">ou</span>
              </div>
            </div>

            <button
              id="btn-google-login"
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition focus:outline-none disabled:opacity-50"
            >
              <img
                className="h-5 w-5"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
              />
              Continuar com o Google
            </button>

            <div className="mt-8 text-center space-y-4">
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-sm font-bold text-vitrinia-purple hover:underline"
              >
                {mode === "login" ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Faça login"}
              </button>
              
              <div>
                <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition font-medium">
                  ← Voltar para a página inicial
                </Link>
              </div>
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

