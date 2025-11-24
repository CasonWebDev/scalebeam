import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { requestRevisionSchema } from "@/lib/validations/project"
import { z } from "zod"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  try {
    const { id: projectId } = await params
    const body = await request.json()

    console.log('[REQUEST REVISION] Project ID:', projectId)
    console.log('[REQUEST REVISION] Request body:', body)

    // Validar input
    const validatedData = requestRevisionSchema.parse(body)
    console.log('[REQUEST REVISION] Validated data:', validatedData)

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        brand: {
          select: {
            organizationId: true,
            name: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Verificar acesso (apenas clientes da mesma organização ou admins)
    if (session!.user.role === "CLIENT") {
      if (!session!.user.organizationIds.includes(project.brand.organizationId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Verificar se projeto está em READY
    if (project.status !== "READY") {
      return NextResponse.json(
        { error: "Only projects with READY status can request revision" },
        { status: 400 }
      )
    }

    console.log('[REQUEST REVISION] Updating project status to REVISION')

    // Atualizar status
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "REVISION",
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
          },
        },
        _count: {
          select: {
            creatives: true,
            comments: true,
          },
        },
      },
    })

    console.log('[REQUEST REVISION] Project updated, creating comment')

    // Criar comentário
    await prisma.comment.create({
      data: {
        projectId,
        userId: session!.user.id,
        content: validatedData.comment,
      },
    })

    console.log('[REQUEST REVISION] Comment created, creating activity log')

    // Criar log de atividade
    await prisma.activityLog.create({
      data: {
        organizationId: project.brand.organizationId,
        userId: session!.user.id,
        action: "revision_requested",
        description: `Revisão solicitada para projeto "${project.name}" por ${session!.user.name}`,
      },
    })

    console.log('[REQUEST REVISION] All operations completed successfully')
    console.log('[REQUEST REVISION] Updated project status:', updatedProject.status)

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: "Revision requested successfully",
    })
  } catch (error: any) {
    console.error("Request revision error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to request revision" },
      { status: 500 }
    )
  }
}
