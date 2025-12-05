import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { BillingModal } from "@/components/billing-modal"

export const dynamic = 'force-dynamic'

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
  return `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}/mês`
}

const paymentStatusConfig: Record<string, {
  label: string
  variant: "default" | "destructive" | "secondary"
  icon: typeof CheckCircle
}> = {
  active: { label: "Ativo", variant: "default", icon: CheckCircle },
  overdue: { label: "Atrasado", variant: "destructive", icon: AlertCircle },
  suspended: { label: "Suspenso", variant: "secondary", icon: Clock },
}

export default async function BillingPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const organizations = await prisma.organization.findMany({
    orderBy: [
      { paymentStatus: "asc" },
      { nextBillingDate: "asc" },
    ],
  })

  // Stats
  const activeCount = organizations.filter(o => o.paymentStatus === "active").length
  const overdueCount = organizations.filter(o => o.paymentStatus === "overdue").length
  const suspendedCount = organizations.filter(o => o.paymentStatus === "suspended").length

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Faturamento</h1>
            <p className="text-muted-foreground mt-1">
              Gerenciar pagamentos e links de cobrança
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Pagamentos Ativos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdueCount}</p>
              <p className="text-sm text-muted-foreground">Pagamentos Atrasados</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-500/10">
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{suspendedCount}</p>
              <p className="text-sm text-muted-foreground">Contas Suspensas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Billing Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Plano
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Último Pagamento
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Próximo Vencimento
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Link de Cobrança
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {organizations.map((org) => {
                const paymentCfg = paymentStatusConfig[org.paymentStatus]
                const StatusIcon = paymentCfg.icon

                return (
                  <tr key={org.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium">{org.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <Badge variant="outline">{planLabels[org.plan]}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatPrice(org.customBillingValue || planPricesInCents[org.plan])}
                          {org.customBillingValue && (
                            <span className="text-orange-500 ml-1">(customizado)</span>
                          )}
                        </p>
                        {org.billingNotes && (
                          <p className="text-xs text-orange-500">{org.billingNotes}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={paymentCfg.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {paymentCfg.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {org.lastPaymentDate ? (
                        <span className="text-sm">
                          {format(org.lastPaymentDate, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {org.nextBillingDate ? (
                        <div>
                          <span className="text-sm">
                            {format(org.nextBillingDate, "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(org.nextBillingDate, { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {org.billingUrl ? (
                        <a
                          href={org.billingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline truncate block max-w-[200px]"
                        >
                          {new URL(org.billingUrl).hostname}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">Não configurado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <BillingModal organization={org} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {organizations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhuma organization cadastrada</p>
          </div>
        )}
      </Card>
    </div>
  )
}
