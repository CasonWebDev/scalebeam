import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderOpen, Upload, LogOut, Zap } from "lucide-react"
import Link from "next/link"
import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { FirstTimeOnboarding } from "@/components/first-time-onboarding"
import { NoProjectsYet } from "@/components/no-projects-yet"

export const dynamic = 'force-dynamic'

async function getClientData(organizationIds: string[]) {
  const organizations = await prisma.organization.findMany({
    where: { id: { in: organizationIds } },
    include: {
      brands: {
        include: {
          _count: {
            select: { projects: true, assets: true },
          },
        },
      },
    },
  })

  if (organizations.length === 0) return null

  // Usar a primeira organização para o display principal
  const organization = organizations[0]

  const campaigns = await prisma.project.findMany({
    where: {
      brand: {
        organizationId: { in: organizationIds },
      },
      projectType: "CAMPAIGN",
    },
    include: {
      brand: true,
      _count: {
        select: { creatives: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  })

  const stats = {
    totalBrands: await prisma.brand.count({
      where: { organizationId: { in: organizationIds } },
    }),
    totalCampaigns: await prisma.project.count({
      where: {
        brand: { organizationId: { in: organizationIds } },
        projectType: "CAMPAIGN"
      },
    }),
    totalTemplateRequests: await prisma.project.count({
      where: {
        brand: { organizationId: { in: organizationIds } },
        projectType: "TEMPLATE_CREATION"
      },
    }),
    totalCreatives: await prisma.creative.count({
      where: {
        project: {
          brand: { organizationId: { in: organizationIds } },
        },
      },
    }),
  }

  const brands = await prisma.brand.findMany({
    where: { organizationId: { in: organizationIds } },
    select: {
      id: true,
      name: true,
    },
  })

  return { organization, campaigns, stats, brands }
}

export default async function ClientDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "CLIENT") {
    redirect("/admin")
  }

  const data = await getClientData(session.user.organizationIds)

  if (!data) {
    return <div className="p-8">Organização não encontrada</div>
  }

  const { organization, campaigns, stats, brands } = data

  // User Header Component (reused in all views)
  const UserHeader = () => (
    <div className="flex items-center justify-between pb-4 border-b border-border">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">Área do Cliente</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{session.user.name}</p>
          <p className="text-xs text-muted-foreground">{session.user.email}</p>
        </div>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
        >
          <Button type="submit" variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </form>
      </div>
    </div>
  )

  // Empty state: No brands yet
  if (stats.totalBrands === 0) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <UserHeader />
        <FirstTimeOnboarding />
      </div>
    )
  }

  // Empty state: Has brands but no projects
  if (stats.totalCampaigns === 0 && stats.totalTemplateRequests === 0) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <UserHeader />
        <NoProjectsYet brands={brands} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <UserHeader />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Bem-vindo, {organization.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Crie campanhas e gere criativos com IA
        </p>
      </div>

      {/* Quick Action - Primary CTA */}
      <Button asChild size="lg" className="w-fit">
        <Link href="/client/campaigns/new">
          <Upload className="h-5 w-5 mr-2" />
          Criar Nova Campanha
        </Link>
      </Button>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Marcas</p>
              <p className="text-3xl font-semibold mt-2">{stats.totalBrands}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Campanhas</p>
              <p className="text-3xl font-semibold mt-2">{stats.totalCampaigns}</p>
            </div>
            <Zap className="h-8 w-8 text-primary/50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Templates</p>
              <p className="text-3xl font-semibold mt-2">{stats.totalTemplateRequests}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Criativos</p>
              <p className="text-3xl font-semibold mt-2">{stats.totalCreatives}</p>
            </div>
            <Zap className="h-8 w-8 text-primary/50" />
          </div>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Minhas Campanhas</h2>
          <Link
            href="/client/campaigns"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Ver todas
            <Upload className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/client/campaigns/${campaign.id}`}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{campaign.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{campaign.brand.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-medium">{campaign._count.creatives}</p>
                  <p className="text-xs text-muted-foreground">criativos</p>
                </div>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
        {campaigns.length === 0 && (
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma campanha criada ainda</p>
          </div>
        )}
      </Card>
    </div>
  )
}
