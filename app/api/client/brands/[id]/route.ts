import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        assets: {
          orderBy: { createdAt: "desc" },
        },
        templates: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
        projects: {
          include: {
            _count: {
              select: { creatives: true },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    })

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    // Verificar acesso: CLIENTs só podem ver suas próprias marcas
    if (session.user.role === "CLIENT") {
      const hasAccess = session.user.organizationIds.includes(brand.organization.id)

      if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }
    // ADMINs podem ver todas as marcas

    return NextResponse.json(brand)
  } catch (error) {
    console.error("Error fetching brand:", error)
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 })
  }
}
