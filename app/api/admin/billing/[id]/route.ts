import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        paymentStatus: body.paymentStatus,
        billingUrl: body.billingUrl,
        lastPaymentDate: body.lastPaymentDate ? new Date(body.lastPaymentDate) : null,
        nextBillingDate: body.nextBillingDate ? new Date(body.nextBillingDate) : null,
      },
    })

    return NextResponse.json({ organization })
  } catch (error: any) {
    console.error("Error updating billing:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update billing" },
      { status: 500 }
    )
  }
}
