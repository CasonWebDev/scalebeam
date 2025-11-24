import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Eye, Upload, Edit2, AlertTriangle, Clock, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AdminCampaignViewModal } from "@/components/admin-campaign-view-modal"
import { UploadCreativesModal } from "@/components/upload-creatives-modal"
import { ProjectStatusChange } from "@/components/project-status-change"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

export const dynamic = "force-dynamic"

const STATUS_CONFIG = {
  DRAFT: {
    label: "Rascunho",
    variant: "secondary" as const,
    icon: Clock,
    color: "bg-gray-100 text-gray-700"
  },
  IN_PRODUCTION: {
    label: "IA Gerando",
    variant: "default" as const,
    icon: Zap,
    color: "bg-blue-100 text-blue-700"
  },
  READY: {
    label: "Revisar",
    variant: "destructive" as const,
    icon: AlertTriangle,
    color: "bg-amber-100 text-amber-700"
  },
  APPROVED: {
    label: "Aprovado",
    variant: "default" as const,
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700"
  },
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
      { updatedAt: "desc" },
    ],
  })

  // Estatísticas
  const stats = {
    total: campaigns.length,
    needsReview: campaigns.filter(c => c.status === "READY").length,
    generating: campaigns.filter(c => c.status === "IN_PRODUCTION").length,
    approved: campaigns.filter(c => c.status === "APPROVED").length,
  }

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
                Gerencie todas as campanhas dos clientes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <Zap className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-amber-200 bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Precisa Revisar</p>
              <p className="text-2xl font-bold text-amber-700">{stats.needsReview}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-blue-200 bg-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IA Gerando</p>
              <p className="text-2xl font-bold text-blue-700">{stats.generating}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-green-200 bg-green-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aprovadas</p>
              <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Campanha
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Template
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Progresso
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Atualizado
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((campaign) => {
                // Se o status for REVISION (antigo), tratar como IN_PRODUCTION
                const statusToUse = campaign.status === "REVISION" ? "IN_PRODUCTION" : campaign.status
                const config = STATUS_CONFIG[statusToUse as keyof typeof STATUS_CONFIG]
                const Icon = config.icon
                const progress = campaign.estimatedCreatives > 0
                  ? Math.round((campaign._count.creatives / campaign.estimatedCreatives) * 100)
                  : 0

                return (
                  <tr key={campaign.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.estimatedCreatives} criativos solicitados
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium">{campaign.brand.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.brand.organization.name}
                        </p>
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
                      <Badge variant={config.variant} className={config.color}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold">
                            {campaign._count.creatives}/{campaign.estimatedCreatives}
                          </p>
                          <p className="text-xs text-muted-foreground">({progress}%)</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(campaign.updatedAt, {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <AdminCampaignViewModal campaignId={campaign.id}>
                          <Button variant="ghost" size="icon" title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </AdminCampaignViewModal>
                        <UploadCreativesModal
                          projectId={campaign.id}
                          projectName={campaign.name}
                        >
                          <Button variant="ghost" size="icon" title="Upload Criativos">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </UploadCreativesModal>
                        <ProjectStatusChange
                          projectId={campaign.id}
                          projectName={campaign.name}
                          currentStatus={campaign.status}
                        >
                          <Button variant="ghost" size="icon" title="Alterar Status">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </ProjectStatusChange>
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
              Campanhas aparecerão aqui quando os clientes criarem projetos
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
