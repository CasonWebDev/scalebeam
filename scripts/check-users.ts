import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("📊 Verificando usuários no banco...\n")

  const users = await prisma.user.findMany({
    include: {
      organizations: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  console.log(`Total de usuários: ${users.length}\n`)

  users.forEach((user) => {
    console.log(`👤 ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Organizações: ${user.organizations.map((org) => org.name).join(", ")}`)
    console.log("")
  })

  console.log("\n📊 Verificando organizações...\n")

  const organizations = await prisma.organization.findMany({
    include: {
      brands: {
        select: {
          name: true,
        },
      },
    },
  })

  organizations.forEach((org) => {
    console.log(`🏢 ${org.name}`)
    console.log(`   Plano: ${org.plan}`)
    console.log(`   Marcas: ${org.brands.map((b) => b.name).join(", ")}`)
    console.log("")
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
