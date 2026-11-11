"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/auth";
import { loginSchema, signupSchema, forgotPasswordSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";

/**
 * Validação do token Cloudflare Turnstile / Bot challenge.
 * Para ativar em produção, adicione no seu arquivo .env:
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAA..."
 * TURNSTILE_SECRET_KEY="0x4AAAAAA..."
 */
async function verifyTurnstileToken(token?: string, remoteIp?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  // Se a chave não estiver configurada no ambiente (ex: desenvolvimento local), permite passar
  if (!secretKey) {
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return Boolean(data.success);
  } catch (err) {
    console.error("Erro ao validar Cloudflare Turnstile:", err);
    return false;
  }
}

export type AuthActionResult = {
  success: boolean;
  error?: "INVALID_CREDENTIALS" | "RATE_LIMIT" | "BOT_DETECTED" | "VALIDATION_ERROR" | "GENERAL_ERROR";
  message?: string;
  redirectTo?: string;
  retryAfterSeconds?: number;
};

/**
 * Server Action para Login Seguro com Zod, Turnstile e Anti-Enumeração
 */
export async function authenticateUser(formData: FormData): Promise<AuthActionResult> {
  const rawEmail = (formData.get("email") as string) || "";
  const rawPassword = (formData.get("password") as string) || "";
  const turnstileToken = (formData.get("turnstileToken") as string) || undefined;
  const plano = (formData.get("plano") as string) || null;

  // 1. Validação de formato via Zod
  const validation = loginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
    turnstileToken,
  });

  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      message: validation.error.issues[0]?.message || "E-mail ou senha em formato inválido.",
    };
  }

  const { email, password } = validation.data;

  // 2. Validação de Bot (Cloudflare Turnstile)
  const headerList = await headers();
  const remoteIp = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const isHuman = await verifyTurnstileToken(turnstileToken, remoteIp);

  if (!isHuman) {
    return {
      success: false,
      error: "BOT_DETECTED",
      message: "Falha na validação de segurança anti-bot. Por favor, atualize a página e tente novamente.",
    };
  }

  // 3. Autenticação via Supabase SSR
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    // 4. Detecção de Rate Limit (HTTP 429 ou mensagem de muitas tentativas)
    const isRateLimited = 
      authError.status === 429 || 
      authError.message.toLowerCase().includes("too many requests") ||
      authError.message.toLowerCase().includes("rate limit");

    if (isRateLimited) {
      return {
        success: false,
        error: "RATE_LIMIT",
        message: "Muitas tentativas falhas. Por segurança, aguarde alguns minutos antes de tentar novamente.",
        retryAfterSeconds: 60,
      };
    }

    // 5. Anti-Enumeração: mensagem sempre genérica para credenciais incorretas ou usuário não encontrado
    return {
      success: false,
      error: "INVALID_CREDENTIALS",
      message: "E-mail ou senha incorretos.",
    };
  }

  // 6. Roteamento Inteligente baseado no Papel (Role) do Usuário no Prisma
  try {
    let dbUser = await prisma.user.findUnique({
      where: { email },
      include: { tenant: { select: { id: true, slug: true } } },
    });

    if (isSuperAdmin(email)) {
      return { success: true, redirectTo: "/superadmin" };
    }

    if (!dbUser) {
      // Usuário existente no Supabase Auth mas ainda não sincronizado no Prisma
      dbUser = await prisma.user.create({
        data: {
          email,
          name: authData.user?.user_metadata?.full_name || email.split("@")[0],
          phone: authData.user?.user_metadata?.phone || "",
          role: plano ? "TENANT" : "CUSTOMER",
        },
        include: { tenant: { select: { id: true, slug: true } } },
      });
    }

    if (dbUser.role === "SUPERADMIN") {
      return { success: true, redirectTo: "/superadmin" };
    }

    if (dbUser.role === "TENANT" || dbUser.tenantId) {
      return { success: true, redirectTo: "/admin" };
    }

    if (dbUser.role === "CUSTOMER") {
      // Se veio com intenção de contratar plano de loja na landing page, redireciona ao onboarding
      if (plano) {
        return { success: true, redirectTo: `/onboarding?plano=${plano}` };
      }
      return { success: true, redirectTo: "/meus-pedidos" };
    }

    return { success: true, redirectTo: "/meus-pedidos" };
  } catch (err) {
    console.error("Erro ao verificar papel do usuário:", err);
    return { success: true, redirectTo: "/admin" };
  }
}

/**
 * Server Action para Cadastro Seguro com Zod, Turnstile e Regras de Senha Estritas
 */
export async function registerUser(formData: FormData): Promise<AuthActionResult> {
  const rawEmail = (formData.get("email") as string) || "";
  const rawPassword = (formData.get("password") as string) || "";
  const turnstileToken = (formData.get("turnstileToken") as string) || undefined;
  const plano = (formData.get("plano") as string) || null;

  // 1. Validação estrita com Zod (mínimo 8 caracteres, maiúscula, número e símbolo)
  const validation = signupSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
    turnstileToken,
  });

  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      message: validation.error.issues[0]?.message || "A senha deve conter ao menos 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial.",
    };
  }

  const { email, password } = validation.data;

  // 2. Validação Anti-bot Turnstile
  const headerList = await headers();
  const remoteIp = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const isHuman = await verifyTurnstileToken(turnstileToken, remoteIp);

  if (!isHuman) {
    return {
      success: false,
      error: "BOT_DETECTED",
      message: "Falha na validação de segurança anti-bot. Por favor, atualize a página e tente novamente.",
    };
  }

  // 3. Cadastro via Supabase
  const supabase = await createClient();
  const origin = headerList.get("origin") || "";
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback${plano ? `?plano=${plano}` : ""}`,
    },
  });

  if (signUpError) {
    const isRateLimited = 
      signUpError.status === 429 || 
      signUpError.message.toLowerCase().includes("too many requests") ||
      signUpError.message.toLowerCase().includes("rate limit");

    if (isRateLimited) {
      return {
        success: false,
        error: "RATE_LIMIT",
        message: "Muitas tentativas de cadastro. Por segurança, aguarde alguns minutos antes de tentar novamente.",
        retryAfterSeconds: 60,
      };
    }

    return {
      success: false,
      error: "GENERAL_ERROR",
      message: signUpError.message || "Erro ao criar conta. Tente novamente.",
    };
  }

  // 4. Criação no banco Prisma
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0],
          phone: "",
          role: plano ? "TENANT" : "CUSTOMER",
        },
      });
    }
  } catch (err) {
    console.error("Erro ao registrar usuário no Prisma:", err);
  }

  if (signUpData.session) {
    const redirectTo = plano ? `/onboarding?plano=${plano}` : "/meus-pedidos";
    return { success: true, redirectTo };
  }

  return {
    success: true,
    message: "Conta criada com sucesso! Verifique seu e-mail para confirmar seu cadastro.",
  };
}

/**
 * Server Action para Solicitação de Recuperação de Senha
 */
export async function requestPasswordReset(formData: FormData): Promise<AuthActionResult> {
  const rawEmail = (formData.get("email") as string) || "";
  const turnstileToken = (formData.get("turnstileToken") as string) || undefined;

  const validation = forgotPasswordSchema.safeParse({
    email: rawEmail,
    turnstileToken,
  });

  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      message: validation.error.issues[0]?.message || "Informe um e-mail válido.",
    };
  }

  const { email } = validation.data;
  const headerList = await headers();
  const origin = headerList.get("origin") || "";
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/redefinir-senha`,
  });

  if (error) {
    const isRateLimited = error.status === 429;
    if (isRateLimited) {
      return {
        success: false,
        error: "RATE_LIMIT",
        message: "Muitas solicitações recentes. Por segurança, aguarde alguns minutos antes de tentar novamente.",
        retryAfterSeconds: 60,
      };
    }
  }

  // Mensagem genérica mesmo se o e-mail não existir (Anti-enumeração)
  return {
    success: true,
    message: "Se o e-mail estiver cadastrado, enviamos as instruções para recuperação da sua senha.",
  };
}

