// Script para promover o usuário a SUPERADMIN
// Rode com: node --env-file=.env prisma/set-superadmin.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EMAIL = "yagoguglia@gmail.com"; // Seu e-mail

async function main() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });

  if (!user) {
    // Usuário ainda não existe na tabela local (só no Supabase Auth), cria sem tenantId
    const created = await prisma.user.create({
      data: {
        name: "Yago Guglia",
        email: EMAIL,
        phone: "00000000000",
        role: "SUPERADMIN",
      },
    });
    console.log("✅ Usuário SUPERADMIN criado:", created.email);
  } else {
    const updated = await prisma.user.update({
      where: { email: EMAIL },
      data: { role: "SUPERADMIN" },
    });
    console.log("✅ Usuário atualizado para SUPERADMIN:", updated.email);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
