import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

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

    const updateData: any = {}

    // Atualizar apenas os campos fornecidos
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
    if (body.category !== undefined) updateData.category = body.category || null
    if (body.preliminaryContent !== undefined) updateData.preliminaryContent = body.preliminaryContent || null
    if (body.restrictions !== undefined) updateData.restrictions = body.restrictions || null
    if (body.platforms !== undefined) updateData.platforms = body.platforms || null
    if (body.formats !== undefined) updateData.formats = body.formats || null
    if (body.templateStatus !== undefined) updateData.templateStatus = body.templateStatus
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const template = await prisma.template.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ template })
  } catch (error: any) {
    console.error("Error updating template:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update template" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.template.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting template:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete template" },
      { status: 500 }
    )
  }
}
