import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/client/templates
 * Lista templates do cliente (suas organizações)
 */
export async function GET(request: NextRequest) {
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  try {
    // Buscar templates das marcas das organizações do usuário
    const templates = await prisma.template.findMany({
      where: {
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
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: [
        { templateStatus: "asc" }, // APPROVED primeiro
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json({
      success: true,
      templates,
    })
  } catch (error: any) {
    console.error("Error fetching templates:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch templates" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/client/templates
 * Cria uma solicitação de novo template
 */
export async function POST(request: NextRequest) {
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  try {
    const body = await request.json()
    const { name, brandId, newTemplateRequest } = body

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

    // Criar projeto de solicitação de template
    const project = await prisma.project.create({
      data: {
        name,
        brandId,
        projectType: "TEMPLATE_CREATION",
        status: "IN_PRODUCTION",
        estimatedCreatives: 0,
      },
    })

    // Criar template pendente vinculado ao projeto
    const template = await prisma.template.create({
      data: {
        name: newTemplateRequest.name,
        description: newTemplateRequest.description,
        imageUrl: newTemplateRequest.keyVisualUrl,
        preliminaryContent: newTemplateRequest.preliminaryContent,
        restrictions: newTemplateRequest.restrictions,
        brandId,
        projectId: project.id,
        templateStatus: "PENDING_APPROVAL",
        isActive: false,
      },
    })

    return NextResponse.json({
      success: true,
      project,
      template,
    })
  } catch (error: any) {
    console.error("Error creating template request:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create template request" },
      { status: 500 }
    )
  }
}
