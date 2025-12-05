import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ExternalLink, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const dynamic = "force-dynamic"

const planLabels = {
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  AGENCY: "Agency",
}

const planPricesInCents: Record<string, number> = {
  STARTER: 800000,
  PROFESSIONAL: 1000000,
  AGENCY: 1500000,
}

function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`
}

export default async function ClientBillingPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "CLIENT") {
    redirect("/admin")
  }

  const organizationId = session.user.organizationIds[0]
  if (!organizationId) {
    redirect("/client")
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  })

  if (!organization) {
    redirect("/client")
  }

  const isOverdue = organization.paymentStatus === "overdue"
  const isSuspended = organization.paymentStatus === "suspended"
  const hasIssue = isOverdue || isSuspended

  return (
    <div className="flex flex-col gap-6 p-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Faturamento</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie sua assinatura
        </p>
      </div>

      {/* Alert if payment issue */}
      {hasIssue && (
        <Card className="p-4 border-red-500/50 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-500">
                {isOverdue ? "Pagamento atrasado" : "Conta suspensa"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isOverdue
                  ? "Regularize seu pagamento para continuar utilizando a plataforma."
                  : "Sua conta está suspensa. Regularize o pagamento para restaurar o acesso."
                }
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Plan Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Seu Plano</span>
          </div>
          <Badge variant="outline">{planLabels[organization.plan]}</Badge>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-muted-foreground">Valor mensal</span>
            <div className="text-right">
              <span className="font-semibold text-lg">
                {formatPrice(organization.customBillingValue || planPricesInCents[organization.plan])}/mês
              </span>
              {organization.billingNotes && (
                <p className="text-xs text-muted-foreground">{organization.billingNotes}</p>
              )}
            </div>
          </div>

          {organization.nextBillingDate && (
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-muted-foreground">Próximo vencimento</span>
              <span>{format(organization.nextBillingDate, "dd 'de' MMMM", { locale: ptBR })}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={hasIssue ? "destructive" : "default"}>
              {organization.paymentStatus === "active" ? "Em dia" :
               organization.paymentStatus === "overdue" ? "Atrasado" : "Suspenso"}
            </Badge>
          </div>
        </div>

        {/* Payment Button */}
        {organization.billingUrl ? (
          <Button className="w-full mt-6" size="lg" asChild>
            <a href={organization.billingUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              {hasIssue ? "Regularizar Pagamento" : "Acessar Pagamento"}
            </a>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground text-center mt-6">
            Link de pagamento não disponível. Entre em contato com o suporte.
          </p>
        )}
      </Card>

      {/* Support */}
      <p className="text-sm text-muted-foreground text-center">
        Dúvidas? Entre em contato: <a href="mailto:suporte@scalebeam.ai" className="underline">suporte@scalebeam.ai</a>
      </p>
    </div>
  )
}
