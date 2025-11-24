import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

export async function GET(
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

    const campaign = await prisma.project.findUnique({
      where: { id },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
          },
        },
        creatives: {
          orderBy: { createdAt: "desc" },
        },
        comments: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            creatives: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json({ campaign })
  } catch (error: any) {
    console.error("Error fetching campaign:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch campaign" },
      { status: 500 }
    )
  }
}
