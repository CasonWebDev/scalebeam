import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Building2,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

export const dynamic = "force-dynamic"

const planLabels = {
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  AGENCY: "Agency",
}

const planPrices: Record<string, string> = {
  STARTER: "R$ 497/mês",
  PROFESSIONAL: "R$ 997/mês",
  AGENCY: "R$ 1.997/mês",
}

const planFeatures: Record<string, string[]> = {
  STARTER: [
    "Até 300 criativos/mês",
    "3 templates/mês",
    "Suporte por e-mail",
  ],
  PROFESSIONAL: [
    "Até 750 criativos/mês",
    "10 templates/mês",
    "Suporte prioritário",
  ],
  AGENCY: [
    "Até 2.000 criativos/mês",
    "30 templates/mês",
    "Suporte dedicado",
  ],
}

const paymentStatusConfig: Record<string, {
  label: string
  variant: "default" | "destructive" | "secondary"
  icon: typeof CheckCircle
  message: string
}> = {
  active: {
    label: "Ativo",
    variant: "default",
    icon: CheckCircle,
    message: "Seu pagamento está em dia. Obrigado!",
  },
  overdue: {
    label: "Atrasado",
    variant: "destructive",
    icon: AlertCircle,
    message: "Seu pagamento está atrasado. Por favor, regularize para evitar suspensão.",
  },
  suspended: {
    label: "Suspenso",
    variant: "secondary",
    icon: Clock,
    message: "Sua conta está suspensa por falta de pagamento. Regularize para restaurar o acesso.",
  },
}

export default async function ClientBillingPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "CLIENT") {
    redirect("/admin")
  }

  // Get the first organization for the client
  const organizationId = session.user.organizationIds[0]
  if (!organizationId) {
    redirect("/client")
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      _count: {
        select: {
          brands: true,
        },
      },
    },
  })

  if (!organization) {
    redirect("/client")
  }

  const statusConfig = paymentStatusConfig[organization.paymentStatus]
  const StatusIcon = statusConfig.icon

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Faturamento</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie sua assinatura e pagamentos
            </p>
          </div>
        </div>
      </div>

      {/* Payment Status Alert */}
      {organization.paymentStatus !== "active" && (
        <Card className={`p-4 border-2 ${
          organization.paymentStatus === "overdue"
            ? "border-red-500 bg-red-500/5"
            : "border-gray-500 bg-gray-500/5"
        }`}>
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${
              organization.paymentStatus === "overdue" ? "text-red-500" : "text-gray-500"
            }`} />
            <p className="text-sm font-medium">{statusConfig.message}</p>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Seu Plano</h2>
                <p className="text-sm text-muted-foreground">
                  {organization.name}
                </p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-1">
                {planLabels[organization.plan]}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Valor Mensal</p>
                <p className="text-2xl font-bold">{planPrices[organization.plan]}</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant={statusConfig.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Recursos inclusos:</p>
              <ul className="space-y-2">
                {planFeatures[organization.plan].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Payment Dates */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Histórico de Pagamento</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Último Pagamento</p>
                  <p className="font-medium">
                    {organization.lastPaymentDate
                      ? format(organization.lastPaymentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : "Nenhum registro"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Próximo Vencimento</p>
                  <p className="font-medium">
                    {organization.nextBillingDate ? (
                      <>
                        {format(organization.nextBillingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({formatDistanceToNow(organization.nextBillingDate, { addSuffix: true, locale: ptBR })})
                        </span>
                      </>
                    ) : (
                      "Não definido"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Action */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Realizar Pagamento</h2>
            {organization.billingUrl ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Clique no botão abaixo para acessar sua página de pagamento segura.
                </p>
                <Button className="w-full" asChild>
                  <a
                    href={organization.billingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Pagar Agora
                  </a>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Link de pagamento ainda não configurado.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Entre em contato com o suporte para mais informações.
                </p>
              </div>
            )}
          </Card>

          {/* Organization Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Sua Conta</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{organization.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{organization._count.brands} marca(s) cadastrada(s)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Limite: {organization.maxCreatives} criativos/mês</span>
              </div>
            </div>
          </Card>

          {/* Support */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Precisa de Ajuda?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Entre em contato com nosso suporte para dúvidas sobre faturamento.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:suporte@scalebeam.ai">
                Contatar Suporte
              </a>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
