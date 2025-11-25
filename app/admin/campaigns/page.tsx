import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Eye, Upload, Edit2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { UploadCreativesModal } from "@/components/upload-creatives-modal"
import { ProjectStatusChange } from "@/components/project-status-change"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

export const dynamic = "force-dynamic"

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
    orderBy: { updatedAt: "desc" },
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
                        <Button variant="ghost" size="icon" title="Visualizar" asChild>
                          <Link href={`/admin/campaigns/${campaign.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
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
