import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Eventos de pagamento do Asaas
type AsaasPaymentEvent =
  | "PAYMENT_CREATED"
  | "PAYMENT_AWAITING_RISK_ANALYSIS"
  | "PAYMENT_APPROVED_BY_RISK_ANALYSIS"
  | "PAYMENT_REPROVED_BY_RISK_ANALYSIS"
  | "PAYMENT_UPDATED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_ANTICIPATED"
  | "PAYMENT_OVERDUE"
  | "PAYMENT_DELETED"
  | "PAYMENT_RESTORED"
  | "PAYMENT_REFUNDED"
  | "PAYMENT_RECEIVED_IN_CASH_UNDONE"
  | "PAYMENT_CHARGEBACK_REQUESTED"
  | "PAYMENT_CHARGEBACK_DISPUTE"
  | "PAYMENT_AWAITING_CHARGEBACK_REVERSAL"
  | "PAYMENT_DUNNING_RECEIVED"
  | "PAYMENT_DUNNING_REQUESTED"
  | "PAYMENT_BANK_SLIP_VIEWED"
  | "PAYMENT_CHECKOUT_VIEWED"

interface AsaasWebhookPayload {
  event: AsaasPaymentEvent
  payment: {
    id: string
    customer: string // ID do cliente no Asaas
    subscription?: string // ID da assinatura (se for recorrente)
    value: number
    netValue: number
    status: string
    billingType: string
    dueDate: string
    paymentDate?: string
    confirmedDate?: string
    invoiceUrl?: string
    bankSlipUrl?: string
    invoiceNumber?: string
  }
}

export async function POST(request: Request) {
  try {
    // Validar token de acesso (opcional, mas recomendado)
    const accessToken = request.headers.get("asaas-access-token")
    if (process.env.ASAAS_WEBHOOK_TOKEN && accessToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
      console.warn("Webhook Asaas: Token inválido")
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const payload: AsaasWebhookPayload = await request.json()
    console.log(`Webhook Asaas recebido: ${payload.event}`, JSON.stringify(payload, null, 2))

    const { event, payment } = payload

    // Buscar organization pelo asaasCustomerId
    const organization = await prisma.organization.findFirst({
      where: { asaasCustomerId: payment.customer },
    })

    if (!organization) {
      console.warn(`Webhook Asaas: Cliente não encontrado: ${payment.customer}`)
      // Retornar 200 para não reprocessar
      return NextResponse.json({ received: true, warning: "Customer not found" })
    }

    // Processar eventos de pagamento
    switch (event) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED":
        // Pagamento confirmado - atualizar status para ativo
        await prisma.organization.update({
          where: { id: organization.id },
          data: {
            paymentStatus: "active",
            lastPaymentDate: payment.confirmedDate
              ? new Date(payment.confirmedDate)
              : new Date(),
            // Próximo vencimento: 30 dias após o pagamento
            nextBillingDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ),
          },
        })
        console.log(`Organization ${organization.name}: pagamento confirmado`)
        break

      case "PAYMENT_OVERDUE":
        // Pagamento atrasado
        await prisma.organization.update({
          where: { id: organization.id },
          data: {
            paymentStatus: "overdue",
          },
        })
        console.log(`Organization ${organization.name}: pagamento atrasado`)
        break

      case "PAYMENT_REFUNDED":
      case "PAYMENT_DELETED":
        // Pagamento estornado ou cancelado - suspender conta
        await prisma.organization.update({
          where: { id: organization.id },
          data: {
            paymentStatus: "suspended",
          },
        })
        console.log(`Organization ${organization.name}: conta suspensa`)
        break

      default:
        console.log(`Evento não tratado: ${event}`)
    }

    return NextResponse.json({ received: true, event })
  } catch (error: any) {
    console.error("Erro no webhook Asaas:", error)
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}

// Asaas também pode enviar GET para verificar se o endpoint está ativo
export async function GET() {
  return NextResponse.json({ status: "ok", service: "asaas-webhook" })
}
