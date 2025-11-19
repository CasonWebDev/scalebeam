import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🔐 Verificando senhas no banco...\n")

  const users = await prisma.user.findMany({
    select: {
      email: true,
      passwordHash: true,
    },
  })

  for (const user of users) {
    console.log(`📧 ${user.email}`)
    console.log(`   Hash: ${user.passwordHash.substring(0, 30)}...`)

    // Testar senhas comuns
    const testPasswords = ["admin123", "client123", "temp123"]

    for (const password of testPasswords) {
      const match = await bcrypt.compare(password, user.passwordHash)
      if (match) {
        console.log(`   ✅ Senha correta: ${password}`)
        break
      }
    }
    console.log("")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
