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
