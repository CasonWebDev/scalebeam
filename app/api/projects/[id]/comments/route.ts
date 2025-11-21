import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  try {
    const { id: projectId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      )
    }

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        brand: {
          select: {
            organizationId: true,
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

    // Criar comentário
    const comment = await prisma.comment.create({
      data: {
        projectId,
        userId: session!.user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      comment,
    })
  } catch (error: any) {
    console.error("Create comment error:", error)

    return NextResponse.json(
      { error: error.message || "Failed to create comment" },
      { status: 500 }
    )
  }
}
