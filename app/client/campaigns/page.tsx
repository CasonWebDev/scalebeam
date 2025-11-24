import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Zap, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export const dynamic = "force-dynamic"

const STATUS_CONFIG = {
  DRAFT: {
    label: "Rascunho",
    icon: Clock,
    color: "bg-gray-100 text-gray-700 border-gray-300",
    description: "Campanha em preparação"
  },
  IN_PRODUCTION: {
    label: "Em Produção",
    icon: Zap,
    color: "bg-blue-100 text-blue-700 border-blue-300",
    description: "Criativos sendo gerados pela IA"
  },
  APPROVED: {
    label: "Aprovado",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700 border-green-300",
    description: "Campanha aprovada e pronta"
  },
}

async function getCampaigns(organizationIds: string[]) {
  return prisma.project.findMany({
    where: {
      brand: {
        organizationId: { in: organizationIds },
      },
      projectType: "CAMPAIGN",
    },
    include: {
      brand: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
      template: {
        select: {
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
    orderBy: [
      { status: "asc" },
      { updatedAt: "desc" },
    ],
  })
}

export default async function ClientCampaignsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "CLIENT") {
    redirect("/admin")
  }

  const campaigns = await getCampaigns(session.user.organizationIds)

  // Agrupar por status
  const inProgress = campaigns.filter(c => c.status === "IN_PRODUCTION")
  const completed = campaigns.filter(c => c.status === "APPROVED")
  const drafts = campaigns.filter(c => c.status === "DRAFT")

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Minhas Campanhas</h1>
          <p className="text-muted-foreground mt-1">
            {campaigns.length} campanha{campaigns.length !== 1 ? "s" : ""} no total
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/client/campaigns/new">
            <Plus className="h-5 w-5 mr-2" />
            Nova Campanha
          </Link>
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 border-blue-200 bg-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Produção</p>
              <p className="text-2xl font-bold text-blue-700">{inProgress.length}</p>
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
              <p className="text-2xl font-bold text-green-700">{completed.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rascunhos</p>
              <p className="text-2xl font-bold text-gray-700">{drafts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaigns List */}
      {campaigns.length > 0 ? (
        <div className="space-y-6">
          {/* In Progress Section */}
          {inProgress.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Em Produção ({inProgress.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inProgress.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {completed.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Campanhas Aprovadas ({completed.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completed.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          )}

          {/* Drafts Section */}
          {drafts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                Rascunhos ({drafts.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {drafts.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Zap className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma campanha ainda</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Crie sua primeira campanha e deixe nossa IA gerar criativos incríveis para você
            </p>
            <Button asChild size="lg">
              <Link href="/client/campaigns/new">
                <Plus className="h-5 w-5 mr-2" />
                Criar Primeira Campanha
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: any }) {
  // Se o status for REVISION (antigo), tratar como IN_PRODUCTION
  const statusToUse = campaign.status === "REVISION" ? "IN_PRODUCTION" : campaign.status
  const config = STATUS_CONFIG[statusToUse as keyof typeof STATUS_CONFIG]
  const Icon = config.icon

  return (
    <Link href={`/client/campaigns/${campaign.id}`}>
      <Card className="p-6 hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{campaign.name}</h3>
            <p className="text-sm text-muted-foreground">{campaign.brand.name}</p>
          </div>
          <div className={`p-2 rounded-lg ${config.color.split(" ")[0]}`}>
            <Icon className={`h-5 w-5 ${config.color.split(" ")[1]}`} />
          </div>
        </div>

        <div className={`px-3 py-2 rounded-lg border mb-4 ${config.color}`}>
          <p className="text-xs font-medium">{config.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Criativos</p>
            <p className="text-lg font-semibold">
              {campaign._count.creatives}/{campaign.estimatedCreatives}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Atualizado</p>
            <p className="text-xs font-medium">
              {formatDistanceToNow(new Date(campaign.updatedAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Badge variant={config.color.includes("amber") ? "destructive" : "default"} className="w-full justify-center">
            {config.label}
          </Badge>
        </div>
      </Card>
    </Link>
  )
}
