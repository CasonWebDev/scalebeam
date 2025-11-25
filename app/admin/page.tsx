import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Zap, FolderOpen, Plus, ArrowRight, LogOut } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

async function getMetrics() {
  const [
    totalCampaigns,
    totalTemplates,
    totalCreatives,
    totalOrganizations,
    recentProjects,
  ] = await Promise.all([
    prisma.project.count({ where: { projectType: "CAMPAIGN" } }),
    prisma.template.count(),
    prisma.creative.count(),
    prisma.organization.count(),
    prisma.project.findMany({
      where: { projectType: "CAMPAIGN" },
      take: 8,
      orderBy: { updatedAt: "desc" },
      include: {
        brand: {
          select: {
            name: true,
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: { creatives: true },
        },
      },
    }),
  ])

  return {
    totalCampaigns,
    totalTemplates,
    totalCreatives,
    totalOrganizations,
    recentProjects,
  }
}

export default async function AdminDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/client")
  }

  const metrics = await getMetrics()

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard Admin</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie clientes, campanhas e templates
          </p>
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

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/admin/organizations">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/templates">
            <FolderOpen className="h-4 w-4 mr-2" />
            Gerenciar Templates
          </Link>
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clientes</p>
              <p className="text-3xl font-semibold mt-2">{metrics.totalOrganizations}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Campanhas</p>
              <p className="text-3xl font-semibold mt-2">{metrics.totalCampaigns}</p>
            </div>
            <Zap className="h-8 w-8 text-primary/50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Templates</p>
              <p className="text-3xl font-semibold mt-2">{metrics.totalTemplates}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Criativos</p>
              <p className="text-3xl font-semibold mt-2">{metrics.totalCreatives}</p>
            </div>
            <Zap className="h-8 w-8 text-primary/50" />
          </div>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Campanhas Recentes</h2>
          <Link
            href="/admin/campaigns"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {metrics.recentProjects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/campaigns/${project.id}`}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{project.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {project.brand.name} · {project.brand.organization.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-medium">{project._count.creatives}</p>
                  <p className="text-xs text-muted-foreground">criativos</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
        {metrics.recentProjects.length === 0 && (
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma campanha ainda</p>
          </div>
        )}
      </Card>
    </div>
  )
}
