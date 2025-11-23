import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Building2, FileText } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PROJECT_STATUS_CONFIG } from "@/lib/constants"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

export const dynamic = "force-dynamic"

async function getAllCampaigns() {
  const campaigns = await prisma.project.findMany({
    where: {
      projectType: "CAMPAIGN",
    },
    include: {
      brand: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
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
          imageUrl: true,
        },
      },
      _count: {
        select: {
          creatives: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return campaigns
}

export default async function AdminCampaignsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/client")
  }

  const campaigns = await getAllCampaigns()

  // Agrupar por status
  const campaignsByStatus = {
    DRAFT: campaigns.filter((p) => p.status === "DRAFT"),
    IN_PRODUCTION: campaigns.filter((p) => p.status === "IN_PRODUCTION"),
    READY: campaigns.filter((p) => p.status === "READY"),
    APPROVED: campaigns.filter((p) => p.status === "APPROVED"),
    REVISION: campaigns.filter((p) => p.status === "REVISION"),
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Campanhas
              </h1>
              <p className="text-muted-foreground mt-1">
                {campaigns.length} campanhas totais
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(campaignsByStatus).map(([status, items]) => (
          <Card key={status} className="p-4">
            <div className="flex flex-col gap-2">
              <Badge className={PROJECT_STATUS_CONFIG[status as keyof typeof PROJECT_STATUS_CONFIG].color}>
                {PROJECT_STATUS_CONFIG[status as keyof typeof PROJECT_STATUS_CONFIG].label}
              </Badge>
              <span className="text-3xl font-bold">{items.length}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Campaigns List */}
      <div className="space-y-6">
        {Object.entries(campaignsByStatus).map(([status, items]) => {
          if (items.length === 0) return null

          return (
            <div key={status}>
              <h2 className="text-lg font-semibold mb-4">
                {PROJECT_STATUS_CONFIG[status as keyof typeof PROJECT_STATUS_CONFIG].label} (
                {items.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((campaign) => {
                  return (
                    <Card
                      key={campaign.id}
                      className="p-6 hover:bg-secondary/50 transition-colors border-primary/30 bg-primary/5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-lg">
                              {campaign.name}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {campaign.brand.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span>{campaign.brand.organization.name}</span>
                          </div>
                        </div>
                      </div>

                      {campaign.template && (
                        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>Template: {campaign.template.name}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mb-4">
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Criativos
                          </span>
                          <p className="text-lg font-semibold">
                            {campaign._count.creatives}/{campaign.estimatedCreatives}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Comentários
                          </span>
                          <p className="text-lg font-semibold">
                            {campaign._count.comments}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mb-4">
                        Criado{" "}
                        {formatDistanceToNow(new Date(campaign.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </div>

                      <div className="flex gap-2">
                        <Button asChild className="flex-1">
                          <Link href={`/admin/campaigns/${campaign.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                        <DeleteConfirmationDialog
                          resourceType="Campanha"
                          resourceName={campaign.name}
                          endpoint={`/api/admin/projects/${campaign.id}`}
                          variant="outline"
                        />
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {campaigns.length === 0 && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Zap className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhuma campanha criada ainda</p>
            <p className="text-sm text-muted-foreground mt-2">
              Campanhas aparecerão aqui quando os clientes criarem projetos baseados em templates
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
