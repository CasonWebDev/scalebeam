import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api-auth"

export async function GET() {
  // Verificar autenticação admin
  const { error, session } = await requireAdmin()
  if (error) return error

  try {
    const brands = await prisma.brand.findMany({
      include: {
        organization: {
          select: {
            name: true,
            plan: true,
            maxCreatives: true,
          },
        },
        _count: {
          select: {
            projects: true,
            assets: true,
          },
        },
        projects: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                creatives: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(brands)
  } catch (error) {
    console.error("Error fetching brands:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}
