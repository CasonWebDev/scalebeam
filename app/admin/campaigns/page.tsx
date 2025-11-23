import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { AdminCampaignViewModal } from "@/components/admin-campaign-view-modal"

export const dynamic = "force-dynamic"

const statusConfig = {
  DRAFT: { label: "Rascunho", variant: "secondary" as const },
  IN_PRODUCTION: { label: "Em Produção", variant: "default" as const },
  READY: { label: "Pronto", variant: "default" as const },
  APPROVED: { label: "Aprovado", variant: "default" as const },
  REVISION: { label: "Em Revisão", variant: "destructive" as const },
}

export default async function AdminCampaignsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const campaigns = await prisma.project.findMany({
    where: {
      projectType: "CAMPAIGN",
    },
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
        },
      },
      _count: {
        select: {
          creatives: true,
          comments: true,
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
  })

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Campanhas</h1>
              <p className="text-muted-foreground mt-1">
                {campaigns.length} campanha(s) cadastrada(s)
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Marca</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Template</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Criativos</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Criado</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((campaign) => {
                const statusCfg = statusConfig[campaign.status]

                return (
                  <tr key={campaign.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.estimatedCreatives} criativos estimados
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium">{campaign.brand.name}</p>
                        <p className="text-xs text-muted-foreground">{campaign.brand.organization.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {campaign.template ? (
                        <span className="text-sm">{campaign.template.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusCfg.variant}>
                        {statusCfg.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold">{campaign._count.creatives}</p>
                        <p className="text-xs text-muted-foreground">
                          {campaign._count.comments} comentário(s)
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(campaign.createdAt, { addSuffix: true, locale: ptBR })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <AdminCampaignViewModal campaignId={campaign.id}>
                          <Button variant="ghost" size="icon" title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </AdminCampaignViewModal>
                        <DeleteConfirmationDialog
                          resourceType="Campanha"
                          resourceName={campaign.name}
                          endpoint={`/api/admin/projects/${campaign.id}`}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {campaigns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhuma campanha cadastrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Campanhas aparecerão aqui quando os clientes criarem projetos baseados em templates
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
