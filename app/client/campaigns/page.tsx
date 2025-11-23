import { prisma } from "@/lib/prisma"
import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, LogOut, FileText, Sparkles } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PROJECT_STATUS_CONFIG } from "@/lib/constants"
import { ProjectsFiltersForm } from "./filters-form"

export const dynamic = "force-dynamic"

interface ProjectsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    brand?: string
  }>
}

async function getClientProjects(
  organizationIds: string[],
  filters: { search?: string; status?: string; brand?: string }
) {
  const whereClause: any = {
    brand: {
      organizationId: { in: organizationIds },
    },
    // Apenas campanhas (não template requests)
    projectType: "CAMPAIGN",
  }

  if (filters.search) {
    whereClause.name = {
      contains: filters.search,
      mode: "insensitive",
    }
  }

  if (filters.status) {
    whereClause.status = filters.status
  }

  if (filters.brand) {
    whereClause.brandId = filters.brand
  }

  const projects = await prisma.project.findMany({
    where: whereClause,
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

  return projects
}

async function getClientBrands(organizationIds: string[]) {
  return prisma.brand.findMany({
    where: {
      organizationId: { in: organizationIds },
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  })
}

export default async function ClientProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "CLIENT") {
    redirect("/admin")
  }

  const params = await searchParams
  const projects = await getClientProjects(session.user.organizationIds, params)
  const brands = await getClientBrands(session.user.organizationIds)

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* User Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">
            Área do Cliente
          </h2>
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Minhas Campanhas</h1>
          <p className="text-muted-foreground mt-1">
            {projects.length} campanha(s) encontrada(s)
          </p>
        </div>
        <Button asChild>
          <Link href="/client/campaigns/new">
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <ProjectsFiltersForm brands={brands} />
      </Card>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const isTemplateRequest = project.projectType === "TEMPLATE_CREATION"
            const projectUrl = isTemplateRequest
              ? `/client/template-requests/${project.id}`
              : `/client/campaigns/${project.id}`

            return (
              <Card
                key={project.id}
                className={`p-6 hover:bg-secondary/50 transition-colors ${isTemplateRequest ? 'border-primary/50 bg-primary/5' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isTemplateRequest && <Sparkles className="h-4 w-4 text-primary" />}
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {project.brand.name}
                    </p>
                    {isTemplateRequest && (
                      <Badge variant="outline" className="mt-2 border-primary text-primary">
                        Solicitação de Template
                      </Badge>
                    )}
                  </div>
                  <Badge className={PROJECT_STATUS_CONFIG[project.status].color}>
                    {PROJECT_STATUS_CONFIG[project.status].label}
                  </Badge>
                </div>

                {project.template && !isTemplateRequest && (
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{project.template.name}</span>
                  </div>
                )}

                {!isTemplateRequest && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mb-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Criativos</span>
                      <p className="text-lg font-semibold">
                        {project._count.creatives}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Comentários</span>
                      <p className="text-lg font-semibold">
                        {project._count.comments}
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground mb-4">
                  Criado{" "}
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </div>

                <Button asChild className="w-full">
                  <Link href={projectUrl}>
                    {isTemplateRequest ? 'Ver Solicitação' : 'Ver Detalhes'}
                  </Link>
                </Button>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nenhuma campanha encontrada</p>
            <p className="text-sm text-muted-foreground mb-4">
              {params.search || params.status || params.brand
                ? "Tente ajustar os filtros"
                : "Crie sua primeira campanha para começar"}
            </p>
            <Button asChild>
              <Link href="/client/campaigns/new">
                <Plus className="h-4 w-4 mr-2" />
                Criar Campanha
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
