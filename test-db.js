const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const count = await prisma.user.count()
    console.log('CONEXÃO SUCESSO! Total de usuários:', count)
  } catch (e) {
    console.error('ERRO NA CONEXÃO:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
