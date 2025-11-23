import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  if (session!.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id: brandId } = await params
    const body = await request.json()
    const { name, url } = body

    if (!name || !url) {
      return NextResponse.json(
        { error: "Nome e URL são obrigatórios" },
        { status: 400 }
      )
    }

    // Validar URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "URL inválida" },
        { status: 400 }
      )
    }

    // Verificar se o usuário tem acesso à marca
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: {
        organizationId: true,
      },
    })

    if (!brand) {
      return NextResponse.json({ error: "Marca não encontrada" }, { status: 404 })
    }

    if (!session!.user.organizationIds.includes(brand.organizationId)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Criar asset com link externo
    const asset = await prisma.asset.create({
      data: {
        name,
        url,
        type: "link",
        isExternalLink: true,
        brandId,
      },
    })

    return NextResponse.json({ asset })
  } catch (error: any) {
    console.error("Error adding external link:", error)
    return NextResponse.json(
      { error: error.message || "Failed to add link" },
      { status: 500 }
    )
  }
}
