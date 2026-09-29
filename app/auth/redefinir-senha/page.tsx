"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

export default function RedefinirSenhaPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  // Verifica se o usuário tem uma sessão ativa (veio do link de recuperação)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasSession(true);
        } else {
          setHasSession(false);
        }
      } catch {
        setHasSession(false);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  // Valida força da senha
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { level: 0, label: "", color: "" };
    if (pass.length < 6) return { level: 1, label: "Muito fraca", color: "bg-red-500" };
    
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { level: 2, label: "Fraca", color: "bg-orange-500" };
    if (score === 2) return { level: 3, label: "Boa", color: "bg-yellow-500" };
    return { level: 4, label: "Forte", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setMessage({ type: "error", text: "A nova senha deve ter no mínimo 6 caracteres." });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem. Digite a mesma senha nos dois campos." });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        const errorMsg = error.message?.includes("same_password")
          ? "A nova senha não pode ser igual à senha anterior. Escolha uma senha diferente."
          : error.message?.includes("session")
          ? "Sua sessão expirou. Solicite um novo link de recuperação na tela de login."
          : error.message || "Erro ao atualizar a senha. O link pode ter expirado.";

        setMessage({ type: "error", text: errorMsg });
        setLoading(false);
      } else {
        setMessage({
          type: "success",
          text: "Senha redefinida com sucesso! Você já pode acessar sua conta.",
        });
        setLoading(false);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Ocorreu um erro inesperado. Tente novamente." });
      setLoading(false);
    }
  };

  // Loading state enquanto verifica sessão
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-vitrinia-bg font-sans flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-vitrinia-purple rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <span className="text-white font-black text-xl">V</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Verificando sessão...</span>
        </div>
      </div>
    );
  }

  // Se não tem sessão, mostra mensagem de link expirado
  if (!hasSession) {
    return (
      <div className="min-h-screen bg-vitrinia-bg font-sans flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition mb-4">
              <div className="w-12 h-12 bg-vitrinia-purple rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl">V</span>
              </div>
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">vitrinia</h1>
          </div>

          <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-gray-100 sm:px-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Link expirado ou inválido</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                O link de recuperação de senha expirou ou já foi utilizado. 
                Solicite um novo link na tela de login.
              </p>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-vitrinia-purple hover:bg-vitrinia-purple/90 text-white rounded-xl shadow-lg shadow-vitrinia-purple/20 text-sm font-bold transition"
              >
                <span>Voltar para o Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">vitrinia</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Redefinição de Senha
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-gray-100 sm:px-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-vitrinia-purple/10 text-vitrinia-purple flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Crie sua nova senha</h2>
            <p className="text-xs text-gray-500 mt-1">
              Digite e confirme sua nova senha para acessar sua conta.
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                message.type === "error"
                  ? "bg-red-50 border border-red-100 text-red-600"
                  : "bg-emerald-50 border border-emerald-100 text-emerald-700"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {message?.type === "success" ? (
            <div className="text-center space-y-4 pt-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Sua senha foi alterada com sucesso!
              </p>
              <Link
                href="/admin"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-vitrinia-purple hover:bg-vitrinia-purple/90 text-white rounded-xl shadow-lg shadow-vitrinia-purple/20 text-sm font-bold transition"
              >
                <span>Gerenciar meu Negócio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold transition"
              >
                <span>Ir para o Login</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Mínimo de 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 focus:border-vitrinia-purple focus:ring-2 focus:ring-vitrinia-purple/20 outline-none transition text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Indicador de força da senha */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            level <= strength.level ? strength.color : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[11px] font-semibold ${
                      strength.level <= 2 ? "text-red-500" : strength.level === 3 ? "text-yellow-600" : "text-emerald-600"
                    }`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Confirmar Nova Senha
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition text-sm font-medium ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        : "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-vitrinia-purple focus:ring-2 focus:ring-vitrinia-purple/20"
                  }`}
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">As senhas não coincidem</p>
                )}
                {passwordsMatch && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Senhas coincidem
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password.length < 6 || !passwordsMatch}
                className="w-full mt-2 py-3.5 px-4 bg-vitrinia-purple hover:bg-vitrinia-purple/90 text-white rounded-xl shadow-lg shadow-vitrinia-purple/20 text-sm font-bold transition disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando nova senha...
                  </span>
                ) : (
                  "Salvar Nova Senha"
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link
              href="/login"
              className="text-xs font-bold text-gray-500 hover:text-vitrinia-purple transition"
            >
              ← Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
