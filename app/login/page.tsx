"use client";

import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, KeyRound, ArrowLeft, ShieldAlert, Check, X, Lock } from "lucide-react";
import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { authenticateUser, registerUser, requestPasswordReset } from "@/app/actions/auth-actions";

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
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "forgot_password">("login");
  const [message, setMessage] = useState<{ type: "success" | "error" | "rate_limit"; text: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  
  // Timer de Rate Limit (Too Many Requests - 429)
  const [rateLimitTimer, setRateLimitTimer] = useState<number>(0);

  const supabase = createClient();
  const searchParams = useSearchParams();
  const plano = (searchParams.get("plano") as "free" | "pro") || null;
  const plan = plano ? PLANS[plano] : null;
  const error = searchParams.get("error");

  // Contagem regressiva do Rate Limit
  useEffect(() => {
    if (rateLimitTimer <= 0) return;
    const interval = setInterval(() => {
      setRateLimitTimer((prev) => {
        if (prev <= 1) {
          setMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitTimer]);

  // Regras de validação de senha para o modo Cadastro
  const passwordCriteria = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleGoogleLogin = async () => {
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${plano ? `?plano=${plano}` : ""}`,
      },
    });
    if (error) {
      console.error(error);
      setMessage({ type: "error", text: "Erro ao tentar fazer login com o Google." });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimitTimer > 0) return;
    setMessage(null);

    // Validação de senha no frontend antes de enviar
    if (mode === "signup" && !isPasswordValid) {
      setMessage({
        type: "error",
        text: "A senha deve conter ao menos 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (turnstileToken) {
      formData.append("turnstileToken", turnstileToken);
    }
    if (plano) {
      formData.append("plano", plano);
    }

    startTransition(async () => {
      try {
        if (mode === "forgot_password") {
          const res = await requestPasswordReset(formData);
          if (res.error === "RATE_LIMIT") {
            setRateLimitTimer(res.retryAfterSeconds || 60);
            setMessage({ type: "rate_limit", text: res.message || "Muitas tentativas. Aguarde antes de tentar novamente." });
          } else if (res.success) {
            setMessage({ type: "success", text: res.message || "Instruções enviadas para o seu e-mail!" });
          } else {
            setMessage({ type: "error", text: res.message || "Erro ao processar solicitação." });
          }
          return;
        }

        if (mode === "signup") {
          const res = await registerUser(formData);
          if (res.error === "RATE_LIMIT") {
            setRateLimitTimer(res.retryAfterSeconds || 60);
            setMessage({ type: "rate_limit", text: res.message || "Muitas tentativas. Aguarde antes de tentar novamente." });
          } else if (!res.success) {
            setMessage({ type: "error", text: res.message || "Erro ao criar conta." });
          } else if (res.redirectTo) {
            window.location.href = res.redirectTo;
          } else {
            setMessage({ type: "success", text: res.message || "Verifique seu e-mail para confirmar seu cadastro!" });
          }
          return;
        }

        // Modo Login
        const res = await authenticateUser(formData);
        if (res.error === "RATE_LIMIT") {
          setRateLimitTimer(res.retryAfterSeconds || 60);
          setMessage({
            type: "rate_limit",
            text: res.message || "Muitas tentativas falhas. Por segurança, aguarde alguns minutos antes de tentar novamente.",
          });
        } else if (!res.success) {
          // Anti-enumeração: feedback unificado e genérico
          setMessage({
            type: "error",
            text: res.message || "E-mail ou senha incorretos.",
          });
        } else if (res.redirectTo) {
          window.location.href = res.redirectTo;
        } else {
          window.location.href = "/admin";
        }
      } catch (err: any) {
        setMessage({ type: "error", text: "Erro ao autenticar. Verifique sua conexão e tente novamente." });
      }
    });
  };

  return (
    <div className="min-h-screen bg-vitrinia-bg font-sans flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition mb-4">
            <div className="w-12 h-12 bg-vitrinia-purple rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">V</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-gray-900">vitrinia</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium text-center">
            {mode === "forgot_password"
              ? "Recupere o acesso à sua conta com segurança"
              : plan
              ? `Você está assinando o plano ${plan.label}`
              : "Acesso unificado para lojistas e clientes"}
          </p>
        </div>

        <div className="space-y-4">
          {/* Plano selecionado (apenas login/signup) */}
          {plan && mode !== "forgot_password" && (
            <div
              className={`rounded-2xl border-2 p-4 ${
                plano === "pro" ? "border-vitrinia-purple bg-vitrinia-purple/5" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 size={18} className="text-vitrinia-purple shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                    Plano selecionado
                  </p>
                  <p className="font-black text-gray-900">
                    {plan.label} —{" "}
                    <span className="font-medium text-sm text-gray-500">{plan.price}</span>
                  </p>
                </div>
              </div>
              <ul className="flex flex-wrap gap-2 mt-2">
                {plan.perks.map((p) => (
                  <li
                    key={p}
                    className="text-[11px] font-medium text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-lg"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Aviso se sem plano no signup */}
          {!plan && mode === "signup" && (
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-center">
              <p className="text-xs text-amber-700 font-medium">
                Deseja criar uma loja?{" "}
                <a href="/#planos" className="font-black underline">
                  Conheça nossos planos para lojistas
                </a>
              </p>
            </div>
          )}

          {/* Card Principal */}
          <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-gray-100 sm:px-8">
            {mode === "forgot_password" && (
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-vitrinia-purple/10 text-vitrinia-purple rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Esqueceu a senha?</h2>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Digite seu e-mail cadastrado e enviaremos um link seguro para você redefinir sua senha.
                </p>
              </div>
            )}

            {error === "auth-failed" && !message && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-center text-sm text-red-600 font-medium">
                Ops! Não conseguimos autenticar sua sessão. Tente novamente.
              </div>
            )}

            {/* Alerta de Rate Limit com Bloqueio Visual */}
            {message?.type === "rate_limit" && (
              <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Muitas tentativas de acesso</span>
                </div>
                <p className="text-xs leading-relaxed">{message.text}</p>
                {rateLimitTimer > 0 && (
                  <p className="text-xs font-mono font-bold text-amber-700 pt-1">
                    Liberando em: {rateLimitTimer}s
                  </p>
                )}
              </div>
            )}

            {/* Mensagens de Sucesso ou Erro Genérico (Anti-Enumeração) */}
            {message && message.type !== "rate_limit" && (
              <div
                className={`mb-4 p-3.5 rounded-2xl text-center text-xs font-semibold leading-relaxed ${
                  message.type === "error"
                    ? "bg-red-50 border border-red-100 text-red-600"
                    : "bg-emerald-50 border border-emerald-100 text-emerald-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-vitrinia-purple focus:ring-2 focus:ring-vitrinia-purple/20 transition outline-none text-sm font-medium"
                  placeholder="exemplo@email.com"
                  autoComplete="email"
                />
              </div>

              {mode !== "forgot_password" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                      Senha
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot_password");
                          setMessage(null);
                        }}
                        className="text-xs font-bold text-vitrinia-purple hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-vitrinia-purple focus:ring-2 focus:ring-vitrinia-purple/20 transition outline-none text-sm font-medium"
                      placeholder="••••••••"
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    />
                  </div>

                  {/* Checklist Dinâmico de Segurança de Senha no Cadastro */}
                  {mode === "signup" && password.length > 0 && (
                    <div className="mt-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5 text-[11px]">
                      <span className="font-bold text-gray-600 block mb-1">Requisitos de segurança da senha:</span>
                      <div className="grid grid-cols-2 gap-1 text-gray-500">
                        <span className={`flex items-center gap-1 ${passwordCriteria.minLength ? "text-emerald-600 font-bold" : ""}`}>
                          {passwordCriteria.minLength ? <Check size={12} /> : <X size={12} />} 8+ caracteres
                        </span>
                        <span className={`flex items-center gap-1 ${passwordCriteria.hasUppercase ? "text-emerald-600 font-bold" : ""}`}>
                          {passwordCriteria.hasUppercase ? <Check size={12} /> : <X size={12} />} 1 letra maiúscula
                        </span>
                        <span className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? "text-emerald-600 font-bold" : ""}`}>
                          {passwordCriteria.hasNumber ? <Check size={12} /> : <X size={12} />} 1 número
                        </span>
                        <span className={`flex items-center gap-1 ${passwordCriteria.hasSpecial ? "text-emerald-600 font-bold" : ""}`}>
                          {passwordCriteria.hasSpecial ? <Check size={12} /> : <X size={12} />} 1 caractere especial (!@#)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Widget Cloudflare Turnstile Anti-bot */}
              <div className="pt-1">
                <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />
              </div>

              <button
                type="submit"
                disabled={isPending || rateLimitTimer > 0 || (mode === "signup" && !isPasswordValid)}
                className="w-full py-3.5 px-4 bg-vitrinia-purple hover:bg-vitrinia-purple/90 text-white rounded-xl shadow-lg shadow-vitrinia-purple/20 text-sm font-black transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {rateLimitTimer > 0 ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Aguarde {rateLimitTimer}s para tentar novamente</span>
                  </>
                ) : isPending ? (
                  "Processando..."
                ) : mode === "forgot_password" ? (
                  "Enviar Link de Recuperação"
                ) : mode === "login" ? (
                  "Entrar"
                ) : (
                  "Criar Minha Conta"
                )}
              </button>
            </form>

            {mode !== "forgot_password" && (
              <>
                <div className="relative my-6">
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
                  disabled={isPending || rateLimitTimer > 0}
                  className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-200 rounded-xl shadow-xs bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition focus:outline-none disabled:opacity-50"
                >
                  <img
                    className="h-4 w-4"
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                  />
                  Continuar com o Google
                </button>
              </>
            )}

            <div className="mt-8 text-center space-y-4">
              {mode === "forgot_password" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setMessage(null);
                  }}
                  className="text-xs font-bold text-gray-600 hover:text-vitrinia-purple transition inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para o Login</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setMessage(null);
                  }}
                  className="text-sm font-bold text-vitrinia-purple hover:underline"
                >
                  {mode === "login" ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Faça login"}
                </button>
              )}

              <div>
                <Link
                  href="/"
                  className="text-xs text-gray-400 hover:text-gray-600 transition font-medium"
                >
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
