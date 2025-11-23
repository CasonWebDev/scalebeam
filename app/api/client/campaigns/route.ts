import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/client/campaigns
 * Lista campanhas do cliente (suas organizações)
 */
export async function GET(request: NextRequest) {
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  try {
    // Buscar campanhas das marcas das organizações do usuário
    const campaigns = await prisma.project.findMany({
      where: {
        projectType: "CAMPAIGN",
        brand: {
          organizationId: {
            in: session!.user.organizationIds,
          },
        },
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            creatives: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json({
      success: true,
      campaigns,
    })
  } catch (error: any) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch campaigns" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/client/campaigns
 * Cria uma nova campanha
 */
export async function POST(request: NextRequest) {
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  try {
    const body = await request.json()
    const {
      name,
      brandId,
      templateId,
      briefingUrl,
      briefingContent,
      estimatedCreatives,
      selectedPlatforms,
      selectedFormats,
      formatVariations,
      observations,
      additionalFileUrl,
    } = body

    // Validar brand access
    const brand = await prisma.brand.findFirst({
      where: {
        id: brandId,
        organizationId: {
          in: session!.user.organizationIds,
        },
      },
    })

    if (!brand) {
      return NextResponse.json(
        { error: "Marca não encontrada ou acesso negado" },
        { status: 404 }
      )
    }

    // Validar template access (deve ser APPROVED)
    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        brandId,
        templateStatus: "APPROVED",
        isActive: true,
      },
    })

    if (!template) {
      return NextResponse.json(
        { error: "Template não encontrado ou não aprovado" },
        { status: 404 }
      )
    }

    // Criar estrutura para armazenar os dados completos da campanha
    const campaignData = {
      selectedPlatforms,
      selectedFormats,
      formatVariations,
      additionalFileUrl: additionalFileUrl || null,
    }

    // Criar projeto de campanha
    const campaign = await prisma.project.create({
      data: {
        name,
        brandId,
        templateId,
        projectType: "CAMPAIGN",
        status: "IN_PRODUCTION",
        briefingUrl: briefingUrl || null,
        briefingContent: briefingContent || null,
        briefingData: JSON.stringify(campaignData), // Armazena dados estruturados da campanha
        estimatedCreatives,
        selectedPlatforms: JSON.stringify(selectedPlatforms),
        selectedFormats: JSON.stringify(selectedFormats),
        observations: observations || null,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      campaign,
    })
  } catch (error: any) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create campaign" },
      { status: 500 }
    )
  }
}
