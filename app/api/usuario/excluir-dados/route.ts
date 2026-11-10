import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Autenticação obrigatória para solicitar exclusão de dados." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Solicitação de exclusão pelo titular (Art. 18 LGPD)";

    // Busca usuário no banco
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { addresses: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Registro de usuário não encontrado." },
        { status: 404 }
      );
    }

    // Anonimiza dados do usuário para preservar integridade fiscal e histórico de pedidos sem expor PII
    await prisma.$transaction(async (tx) => {
      // Remove endereços salvos
      await tx.customerAddress.deleteMany({
        where: { userId: dbUser.id },
      });

      // Anonimiza dados sensíveis (PII)
      await tx.user.update({
        where: { id: dbUser.id },
        data: {
          name: "Usuário Anonimizado (LGPD)",
          phone: "00000000000",
          document: null,
          avatarUrl: null,
          address: null,
          neighborhood: null,
          city: null,
          tradeName: null,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Seus dados pessoais foram removidos e anonimizados com sucesso conforme a LGPD.",
    });
  } catch (error: any) {
    console.error("Erro na solicitação de exclusão LGPD:", error);
    return NextResponse.json(
      { error: "Falha ao processar solicitação de exclusão de dados." },
      { status: 500 }
    );
  }
}

