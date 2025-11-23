import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * PATCH /api/admin/templates/[id]/status
 * Altera o status de um template
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  if (session!.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    // Validar status
    const validStatuses = ["PENDING_APPROVAL", "APPROVED", "REJECTED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 }
      )
    }

    // Atualizar template
    const template = await prisma.template.update({
      where: { id },
      data: {
        templateStatus: status,
        // Se aprovado, ativar template
        isActive: status === "APPROVED",
      },
    })

    // Registrar atividade
    await prisma.activityLog.create({
      data: {
        action: "template_status_changed",
        description: `Status do template "${template.name}" alterado para ${status}`,
        userId: session!.user.id,
        organizationId: null,
      },
    })

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error: any) {
    console.error("Error updating template status:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update template status" },
      { status: 500 }
    )
  }
}
