import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Adicionando segundo cliente de teste...")

  // Verificar se organização já existe
  let org2 = await prisma.organization.findFirst({
    where: { name: "Fashion Brand Co" },
  })

  if (!org2) {
    org2 = await prisma.organization.create({
      data: {
        name: "Fashion Brand Co",
        plan: "PROFESSIONAL",
        maxCreatives: 500,
        paymentStatus: "active",
        lastPaymentDate: new Date("2025-01-15"),
        nextBillingDate: new Date("2025-02-15"),
      },
    })
    console.log("✅ Organização criada:", org2.name)
  } else {
    console.log("ℹ️  Organização já existe:", org2.name)
  }

  // Hash da senha (client123)
  const client2PasswordHash = await bcrypt.hash("client123", 10)

  // Criar segundo usuário CLIENT
  const user2 = await prisma.user.upsert({
    where: { email: "client2@scalebeam.com" },
    update: {
      passwordHash: client2PasswordHash,
      organizations: {
        connect: { id: org2.id },
      },
    },
    create: {
      email: "client2@scalebeam.com",
      name: "Maria Silva",
      passwordHash: client2PasswordHash,
      role: "CLIENT",
      organizations: {
        connect: { id: org2.id },
      },
    },
  })
  console.log("✅ Usuário criado:", user2.email, "(senha: client123)")

  // Verificar se marcas já existem
  let brand1 = await prisma.brand.findFirst({
    where: { name: "Luxe Fashion" },
  })

  if (!brand1) {
    brand1 = await prisma.brand.create({
      data: {
      name: "Luxe Fashion",
      organizationId: org2.id,
      logoUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop",
      toneOfVoice: "Sofisticado, elegante e aspiracional. Foco em qualidade premium e estilo atemporal.",
      primaryColor: "#000000",
      secondaryColor: "#D4AF37",
      },
    })
    console.log("✅ Marca criada:", brand1.name)
  } else {
    console.log("ℹ️  Marca já existe:", brand1.name)
  }

  let brand2 = await prisma.brand.findFirst({
    where: { name: "Street Style Wear" },
  })

  if (!brand2) {
    brand2 = await prisma.brand.create({
      data: {
      name: "Street Style Wear",
      organizationId: org2.id,
      logoUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop",
      toneOfVoice: "Jovem, urbano e descolado. Linguagem casual e autêntica para o público streetwear.",
      primaryColor: "#FF6B35",
      secondaryColor: "#004E89",
      },
    })
    console.log("✅ Marca criada:", brand2.name)
  } else {
    console.log("ℹ️  Marca já existe:", brand2.name)
  }

  // Criar alguns templates para as marcas
  await prisma.template.createMany({
    data: [
      {
        name: "Luxe Fashion - Instagram Feed",
        description: "Template elegante para posts de feed",
        imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop",
        category: "Instagram",
        brandId: brand1.id,
        isActive: true,
      },
      {
        name: "Luxe Fashion - Stories",
        description: "Template para stories premium",
        imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1400&fit=crop",
        category: "Instagram Stories",
        brandId: brand1.id,
        isActive: true,
      },
      {
        name: "Street Style - Instagram Feed",
        description: "Template urbano para feed",
        imageUrl: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&h=800&fit=crop",
        category: "Instagram",
        brandId: brand2.id,
        isActive: true,
      },
      {
        name: "Street Style - TikTok",
        description: "Template para TikTok vertical",
        imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=1400&fit=crop",
        category: "TikTok",
        brandId: brand2.id,
        isActive: true,
      },
    ],
  })
  console.log("✅ Templates criados para ambas as marcas")

  // Criar um projeto de exemplo
  const project1 = await prisma.project.create({
    data: {
      name: "Coleção Primavera 2025",
      brandId: brand1.id,
      status: "IN_PRODUCTION",
      briefingData: "Campanha para lançamento da coleção primavera com foco em elegância e sustentabilidade",
    },
  })
  console.log("✅ Projeto criado:", project1.name)

  const project2 = await prisma.project.create({
    data: {
      name: "Drop Streetwear Edição Limitada",
      brandId: brand2.id,
      status: "READY",
      briefingData: "Drop exclusivo com peças numeradas e colaboração com artista urbano",
    },
  })
  console.log("✅ Projeto criado:", project2.name)

  // Adicionar alguns criativos
  await prisma.creative.createMany({
    data: [
      {
        name: "Banner Principal - Coleção Primavera",
        projectId: project1.id,
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=800&fit=crop",
        format: "jpg",
        width: 1200,
        height: 800,
      },
      {
        name: "Stories Teaser - Primavera",
        projectId: project1.id,
        url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1080&h=1920&fit=crop",
        format: "jpg",
        width: 1080,
        height: 1920,
      },
      {
        name: "Feed Post 1 - Drop Limitado",
        projectId: project2.id,
        url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1080&h=1080&fit=crop",
        format: "jpg",
        width: 1080,
        height: 1080,
      },
      {
        name: "Feed Post 2 - Drop Limitado",
        projectId: project2.id,
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1080&h=1080&fit=crop",
        format: "jpg",
        width: 1080,
        height: 1080,
      },
    ],
  })
  console.log("✅ Criativos adicionados aos projetos")

  // Log de atividade
  await prisma.activityLog.createMany({
    data: [
      {
        organizationId: org2.id,
        userId: user2.id,
        action: "brand_created",
        description: `Marca "${brand1.name}" criada`,
      },
      {
        organizationId: org2.id,
        userId: user2.id,
        action: "brand_created",
        description: `Marca "${brand2.name}" criada`,
      },
      {
        organizationId: org2.id,
        userId: user2.id,
        action: "project_created",
        description: `Projeto "${project1.name}" criado`,
      },
    ],
  })
  console.log("✅ Logs de atividade criados")

  console.log("\n🎉 Segundo cliente de teste criado com sucesso!")
  console.log("\n📧 Credenciais:")
  console.log("   Email: client2@scalebeam.com")
  console.log("   Senha: qualquer valor")
  console.log("\n🏢 Organização: Fashion Brand Co")
  console.log("   - Luxe Fashion")
  console.log("   - Street Style Wear")
  console.log("\n✅ Agora você pode testar o isolamento de dados!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
