// lib/auth.ts - Utilitário central de autorização e verificação de Super Admin

/**
 * Retorna a lista de e-mails de Super Admin configurados na variável de ambiente SUPERADMIN_EMAILS.
 * Não utiliza e-mails hardcoded no código.
 */
export function getSuperAdminEmails(): string[] {
  const envVal = process.env.SUPERADMIN_EMAILS || "";
  return envVal
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Verifica se um determinado e-mail pertence a um Super Administrador da plataforma.
 */
export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const emails = getSuperAdminEmails();
  return emails.includes(email.trim().toLowerCase());
}

