import { prisma } from "../lib/prisma"

async function main() {
  console.log("🌱 Criando projeto para teste de aprovação...")

  // Buscar o usuário client@scalebeam.com
  const clientUser = await prisma.user.findUnique({
    where: { email: "client@scalebeam.com" },
    include: { organizations: true },
  })

  if (!clientUser || clientUser.organizations.length === 0) {
    throw new Error("Usuário client@scalebeam.com não encontrado ou sem organizações")
  }

  const organization = clientUser.organizations[0]
  console.log(`✓ Organização encontrada: ${organization.name}`)

  // Buscar ou criar uma marca
  let brand = await prisma.brand.findFirst({
    where: { organizationId: organization.id },
  })

  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        name: "Marca Demo",
        organizationId: organization.id,
      },
    })
    console.log(`✓ Marca criada: ${brand.name}`)
  } else {
    console.log(`✓ Marca encontrada: ${brand.name}`)
  }

  // Buscar um template
  const template = await prisma.template.findFirst({
    where: { isActive: true },
  })

  if (!template) {
    throw new Error("Nenhum template ativo encontrado")
  }

  console.log(`✓ Template encontrado: ${template.name}`)

  // Criar projeto em status READY (pronto para aprovar)
  const project = await prisma.project.create({
    data: {
      name: "Campanha Black Friday 2025",
      status: "READY",
      brandId: brand.id,
      templateId: template.id,
      estimatedCreatives: 3,
    },
  })

  console.log(`✓ Projeto criado: ${project.name} (Status: ${project.status})`)

  // Criar 3 criativos de exemplo
  const creatives = await Promise.all([
    prisma.creative.create({
      data: {
        projectId: project.id,
        name: "Banner Principal - Desktop",
        url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=630",
        format: "jpg",
        width: 1200,
        height: 630,
      },
    }),
    prisma.creative.create({
      data: {
        projectId: project.id,
        name: "Story Instagram",
        url: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1080&h=1920",
        format: "jpg",
        width: 1080,
        height: 1920,
      },
    }),
    prisma.creative.create({
      data: {
        projectId: project.id,
        name: "Feed Post Quadrado",
        url: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1080&h=1080",
        format: "jpg",
        width: 1080,
        height: 1080,
      },
    }),
  ])

  console.log(`✓ ${creatives.length} criativos criados`)

  // Adicionar um comentário de exemplo
  await prisma.comment.create({
    data: {
      projectId: project.id,
      userId: clientUser.id,
      content: "Criativos prontos para revisão. Aguardando aprovação!",
    },
  })

  console.log("✓ Comentário de exemplo adicionado")

  console.log("\n🎉 Projeto de teste criado com sucesso!")
  console.log("\n📋 Resumo:")
  console.log(`   Projeto: ${project.name}`)
  console.log(`   Status: ${project.status} (Pronto para Aprovar)`)
  console.log(`   Marca: ${brand.name}`)
  console.log(`   Template: ${template.name}`)
  console.log(`   Criativos: ${creatives.length}`)
  console.log(`   URL: /client/projects/${project.id}`)
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
