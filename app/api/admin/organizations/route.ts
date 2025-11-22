import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  if (session!.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ organizations })
  } catch (error: any) {
    console.error("Error fetching organizations:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch organizations" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  if (session!.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()

    const organization = await prisma.organization.create({
      data: {
        name: body.name,
        plan: body.plan,
        maxCreatives: body.maxCreatives,
        maxBrands: body.maxBrands,
        paymentStatus: body.paymentStatus,
      },
    })

    return NextResponse.json({ organization }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating organization:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create organization" },
      { status: 500 }
    )
  }
}
