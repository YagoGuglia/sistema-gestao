"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function searchUsersGlobal(query: string) {
  if (!query || query.length < 2) return [];
  
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { tradeName: { contains: query } },
          { phone: { contains: query } },
          { document: { contains: query } }
        ]
      },
      take: 10 // Limite para dropdown auto-complete
    });
    return users;
  } catch (error) {
    console.error("Erro ao buscar usuários globalmente:", error);
    return [];
  }
}

export async function searchUserByPhone(phone: string) {
  if (!phone || phone.length < 10) return null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { phone }
    });
    return user;
  } catch (error) {
    console.error("Erro ao buscar usuário por telefone:", error);
    return null;
  }
}

// Helper: Validador de CPF Simplificado
function isValidCPF(cpf: string) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0, rest;
  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  rest = (sum * 10) % 11;
  if ((rest == 10) || (rest == 11)) rest = 0;
  if (rest != parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if ((rest == 10) || (rest == 11)) rest = 0;
  if (rest != parseInt(cpf.substring(10, 11))) return false;
  return true;
}

// Helper: Validador de CNPJ Simplificado
function isValidCNPJ(cnpj: string) {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  let tamanho = cnpj.length - 2
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado != parseInt(digitos.charAt(0))) return false;
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado != parseInt(digitos.charAt(1))) return false;
  return true;
}

export async function upsertUser(data: {
  phone: string;
  name: string;
  personType?: string;
  document?: string;
  tradeName?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
}) {
  try {
    // Validação rígida do documento
    if (data.document && data.document.trim() !== '') {
       if (data.personType === "PJ" && !isValidCNPJ(data.document)) {
          return { error: "CNPJ inválido" };
       } else if (data.personType === "PF" && !isValidCPF(data.document)) {
          return { error: "CPF inválido" };
       }
    }

    const user = await prisma.user.upsert({
      where: { phone: data.phone },
      update: {
        name: data.name,
        personType: data.personType || "PF",
        document: data.document || null,
        tradeName: data.personType === "PJ" ? data.tradeName : null,
        address: data.address,
        neighborhood: data.neighborhood,
        city: data.city,
      },
      create: {
        phone: data.phone,
        name: data.name,
        personType: data.personType || "PF",
        document: data.document || null,
        tradeName: data.personType === "PJ" ? data.tradeName : null,
        address: data.address,
        neighborhood: data.neighborhood,
        city: data.city,
        role: "CLIENT"
      }
    });
    
    // Revalidando rotas de clientes
    revalidatePath("/admin/clientes");

    return { success: true, user };
  } catch (error: any) {
    console.error("Erro ao criar/atualizar usuário:", error);
    // Verificar se violou chave única de documento se decidirmos tornar único futuramente
    return { error: "Falha ao salvar dados do cliente." };
  }
}
