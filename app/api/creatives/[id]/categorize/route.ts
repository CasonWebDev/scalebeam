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

    const { lista, modelo } = body

    const creative = await prisma.creative.update({
      where: { id },
      data: {
        lista: lista || null,
        modelo: modelo || null,
      },
    })

    return NextResponse.json({ creative })
  } catch (error: any) {
    console.error("Error updating creative categorization:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update creative categorization" },
      { status: 500 }
    )
  }
}
