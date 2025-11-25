import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Zap } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export const dynamic = "force-dynamic"

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

      {/* Campaigns List */}
      {campaigns.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
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
  return (
    <Link href={`/client/campaigns/${campaign.id}`}>
      <Card className="p-6 hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer h-full">
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-1">{campaign.name}</h3>
          <p className="text-sm text-muted-foreground">{campaign.brand.name}</p>
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
      </Card>
    </Link>
  )
}
