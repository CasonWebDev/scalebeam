# 🚀 GUIA DE DESENVOLVIMENTO - SCALEBEAM (PARTE 2)
## Fases 2 a 8 - Continuação

> **IMPORTANTE:** Este documento é a continuação do `GUIA_DESENVOLVIMENTO.md`.
> Certifique-se de ter completado a **Fase 0** e **Fase 1** antes de continuar.

---

# <a name="fase-2"></a>📄 FASE 2: PÁGINAS FALTANTES

**Duração estimada:** 1 semana
**Prioridade:** ALTA

## Objetivo

Completar todas as páginas e rotas referenciadas mas que ainda não existem ou estão incompletas.

---

## PASSO 1: Criar página de listagem de projetos (Cliente)

### 1.1 Criar arquivo

**Criar:** `app/client/projects/page.tsx`

```typescript
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, LogOut, FileText } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export const dynamic = "force-dynamic"

const statusConfig = {
  DRAFT: { label: "Rascunho", color: "bg-slate-500" },
  IN_PRODUCTION: { label: "Em Produção", color: "bg-blue-500" },
  READY: { label: "Pronto", color: "bg-purple-500" },
  APPROVED: { label: "Aprovado", color: "bg-green-500" },
  REVISION: { label: "Revisão", color: "bg-amber-500" },
} as const

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
          <h1 className="text-3xl font-semibold tracking-tight">Meus Projetos</h1>
          <p className="text-muted-foreground mt-1">
            {projects.length} projeto(s) encontrado(s)
          </p>
        </div>
        <Button asChild>
          <Link href="/client/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-2 border rounded-lg px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              className="border-0 shadow-none focus-visible:ring-0"
              defaultValue={params.search}
              name="search"
            />
          </div>

          <Select defaultValue={params.status || "all"} name="status">
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="IN_PRODUCTION">Em Produção</SelectItem>
              <SelectItem value="READY">Pronto</SelectItem>
              <SelectItem value="APPROVED">Aprovado</SelectItem>
              <SelectItem value="REVISION">Revisão</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue={params.brand || "all"} name="brand">
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as marcas</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-6 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {project.brand.name}
                  </p>
                </div>
                <Badge className={statusConfig[project.status].color}>
                  {statusConfig[project.status].label}
                </Badge>
              </div>

              {project.template && (
                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{project.template.name}</span>
                </div>
              )}

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

              <div className="text-xs text-muted-foreground mb-4">
                Criado{" "}
                {formatDistanceToNow(new Date(project.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </div>

              <Button asChild className="w-full">
                <Link href={`/client/projects/${project.id}`}>Ver Detalhes</Link>
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nenhum projeto encontrado</p>
            <p className="text-sm text-muted-foreground mb-4">
              {params.search || params.status || params.brand
                ? "Tente ajustar os filtros"
                : "Crie seu primeiro projeto para começar"}
            </p>
            <Button asChild>
              <Link href="/client/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                Criar Projeto
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
```

### 1.2 Adicionar filtros funcionais com URL params

**Criar:** `app/client/projects/filters-form.tsx`

```typescript
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { useTransition } from "react"

interface Brand {
  id: string
  name: string
}

export function ProjectsFiltersForm({ brands }: { brands: Brand[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    startTransition(() => {
      router.push(`/client/projects?${params.toString()}`)
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="flex items-center gap-2 border rounded-lg px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar projetos..."
          className="border-0 shadow-none focus-visible:ring-0"
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => updateFilters("search", e.target.value)}
        />
      </div>

      <Select
        defaultValue={searchParams.get("status") || "all"}
        onValueChange={(value) => updateFilters("status", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="DRAFT">Rascunho</SelectItem>
          <SelectItem value="IN_PRODUCTION">Em Produção</SelectItem>
          <SelectItem value="READY">Pronto</SelectItem>
          <SelectItem value="APPROVED">Aprovado</SelectItem>
          <SelectItem value="REVISION">Revisão</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("brand") || "all"}
        onValueChange={(value) => updateFilters("brand", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por marca" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as marcas</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

---

## PASSO 2: Criar página de listagem de projetos (Admin)

**Criar:** `app/admin/projects/page.tsx`

```typescript
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, FileText, Building2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export const dynamic = "force-dynamic"

const statusConfig = {
  DRAFT: { label: "Rascunho", color: "bg-slate-500" },
  IN_PRODUCTION: { label: "Em Produção", color: "bg-blue-500" },
  READY: { label: "Pronto", color: "bg-purple-500" },
  APPROVED: { label: "Aprovado", color: "bg-green-500" },
  REVISION: { label: "Revisão", color: "bg-amber-500" },
} as const

async function getAllProjects() {
  const projects = await prisma.project.findMany({
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
    take: 50, // Limitar a 50 projetos (adicionar paginação depois)
  })

  return projects
}

export default async function AdminProjectsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/client")
  }

  const projects = await getAllProjects()

  // Agrupar por status
  const projectsByStatus = {
    DRAFT: projects.filter((p) => p.status === "DRAFT"),
    IN_PRODUCTION: projects.filter((p) => p.status === "IN_PRODUCTION"),
    READY: projects.filter((p) => p.status === "READY"),
    APPROVED: projects.filter((p) => p.status === "APPROVED"),
    REVISION: projects.filter((p) => p.status === "REVISION"),
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* User Header */}
      <div className="flex items-start justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Todos os Projetos
          </h1>
          <p className="text-muted-foreground mt-1">
            {projects.length} projetos totais
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

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(projectsByStatus).map(([status, items]) => (
          <Card key={status} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge className={statusConfig[status as keyof typeof statusConfig].color}>
                {statusConfig[status as keyof typeof statusConfig].label}
              </Badge>
              <span className="text-2xl font-bold">{items.length}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {Object.entries(projectsByStatus).map(([status, items]) => {
          if (items.length === 0) return null

          return (
            <div key={status}>
              <h2 className="text-lg font-semibold mb-4">
                {statusConfig[status as keyof typeof statusConfig].label} (
                {items.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((project) => (
                  <Card
                    key={project.id}
                    className="p-6 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {project.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {project.brand.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span>{project.brand.organization.name}</span>
                        </div>
                      </div>
                    </div>

                    {project.template && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{project.template.name}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mb-4">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Criativos
                        </span>
                        <p className="text-lg font-semibold">
                          {project._count.creatives}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Comentários
                        </span>
                        <p className="text-lg font-semibold">
                          {project._count.comments}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mb-4">
                      Criado{" "}
                      {formatDistanceToNow(new Date(project.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/admin/projects/${project.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {projects.length === 0 && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum projeto criado ainda</p>
          </div>
        </Card>
      )}
    </div>
  )
}
```

---

## PASSO 3: Criar página de detalhes da marca (Cliente)

**Criar:** `app/client/brands/[id]/page.tsx`

```typescript
import { prisma } from "@/lib/prisma"
import { auth, signOut } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, Upload, FileText, Image as ImageIcon, Palette } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const dynamic = "force-dynamic"

async function getBrandDetails(brandId: string, organizationIds: string[]) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          plan: true,
        },
      },
      assets: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      templates: {
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      },
      projects: {
        include: {
          _count: {
            select: {
              creatives: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      _count: {
        select: {
          projects: true,
          assets: true,
          templates: true,
        },
      },
    },
  })

  if (!brand) {
    return null
  }

  // Verificar acesso
  if (!organizationIds.includes(brand.organization.id)) {
    return null
  }

  return brand
}

export default async function BrandDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "CLIENT") {
    redirect("/admin")
  }

  const { id } = await params
  const brand = await getBrandDetails(id, session.user.organizationIds)

  if (!brand) {
    notFound()
  }

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

      {/* Brand Header */}
      <div className="flex items-start gap-6">
        {brand.logoUrl && (
          <div className="relative h-24 w-24 flex-shrink-0 rounded-lg border border-border overflow-hidden bg-muted">
            <Image
              src={brand.logoUrl}
              alt={brand.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight">{brand.name}</h1>
          <p className="text-muted-foreground mt-1">{brand.organization.name}</p>
          {brand.toneOfVoice && (
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              {brand.toneOfVoice}
            </p>
          )}
        </div>
        <Button asChild>
          <Link href={`/client/brands/${brand.id}/assets`}>
            <Upload className="h-4 w-4 mr-2" />
            Gerenciar Assets
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projetos</p>
              <p className="text-2xl font-bold">{brand._count.projects}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <ImageIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assets</p>
              <p className="text-2xl font-bold">{brand._count.assets}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Palette className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Templates</p>
              <p className="text-2xl font-bold">{brand._count.templates}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Brand Colors */}
      {(brand.primaryColor || brand.secondaryColor) && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Cores da Marca</h2>
          <div className="flex gap-4">
            {brand.primaryColor && (
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-lg border border-border"
                  style={{ backgroundColor: brand.primaryColor }}
                />
                <div>
                  <p className="text-sm font-medium">Cor Primária</p>
                  <p className="text-sm text-muted-foreground">
                    {brand.primaryColor}
                  </p>
                </div>
              </div>
            )}
            {brand.secondaryColor && (
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-lg border border-border"
                  style={{ backgroundColor: brand.secondaryColor }}
                />
                <div>
                  <p className="text-sm font-medium">Cor Secundária</p>
                  <p className="text-sm text-muted-foreground">
                    {brand.secondaryColor}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Projetos Recentes</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/client/projects">Ver Todos</Link>
          </Button>
        </div>
        {brand.projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {brand.projects.map((project) => (
              <Card key={project.id} className="p-4">
                <h3 className="font-medium mb-2">{project.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {project._count.creatives} criativos
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href={`/client/projects/${project.id}`}>Ver Projeto</Link>
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              Nenhum projeto criado ainda
            </p>
          </Card>
        )}
      </div>

      {/* Templates */}
      {brand.templates.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Templates Disponíveis</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {brand.templates.map((template) => (
              <Card key={template.id} className="p-4">
                {template.imageUrl && (
                  <div className="relative h-32 w-full mb-3 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={template.imageUrl}
                      alt={template.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="font-medium text-sm mb-1">{template.name}</h3>
                {template.category && (
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Assets */}
      {brand.assets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Assets Recentes</h2>
            <Button asChild variant="outline" size="sm">
              <Link href={`/client/brands/${brand.id}/assets`}>
                Ver Todos Assets
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
            {brand.assets.slice(0, 6).map((asset) => (
              <Card key={asset.id} className="p-3">
                <div className="relative h-24 w-full mb-2 rounded-lg overflow-hidden bg-muted">
                  {asset.type.startsWith("image/") && asset.url ? (
                    <Image
                      src={asset.url}
                      alt={asset.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium truncate">{asset.name}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## PASSO 4: Criar página de assets da marca

**Criar:** `app/client/brands/[id]/assets/page.tsx`

```typescript
import { prisma } from "@/lib/prisma"
import { auth, signOut } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, Upload, Download, Trash2, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const dynamic = "force-dynamic"

async function getBrandAssets(brandId: string, organizationIds: string[]) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      assets: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!brand) {
    return null
  }

  // Verificar acesso
  if (!organizationIds.includes(brand.organization.id)) {
    return null
  }

  return brand
}

export default async function BrandAssetsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "CLIENT") {
    redirect("/admin")
  }

  const { id } = await params
  const brand = await getBrandAssets(id, session.user.organizationIds)

  if (!brand) {
    notFound()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* User Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">
            <Link href={`/client/brands/${brand.id}`} className="hover:underline">
              {brand.name}
            </Link>
            {" / Assets"}
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
          <h1 className="text-3xl font-semibold tracking-tight">Assets da Marca</h1>
          <p className="text-muted-foreground mt-1">
            {brand.assets.length} arquivo(s)
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Assets
        </Button>
      </div>

      {/* Assets Grid */}
      {brand.assets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {brand.assets.map((asset) => (
            <Card key={asset.id} className="p-4">
              <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden bg-muted">
                {asset.type.startsWith("image/") && asset.url ? (
                  <Image
                    src={asset.url}
                    alt={asset.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              <h3 className="font-medium mb-1 truncate">{asset.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {formatFileSize(asset.size)}
              </p>

              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <a href={asset.url} download target="_blank" rel="noopener">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nenhum asset ainda</p>
            <p className="text-sm text-muted-foreground mb-4">
              Faça upload de logos, fotos e outros arquivos da sua marca
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Primeiro Asset
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
```

---

## ✅ CHECKLIST FASE 2

- [ ] `/client/projects` criada (lista com filtros)
- [ ] `/admin/projects` criada (lista agrupada por status)
- [ ] `/client/brands/[id]` criada (detalhes da marca)
- [ ] `/client/brands/[id]/assets` criada (gestão de assets)
- [ ] Filtros funcionais com URL params
- [ ] Links entre páginas funcionando
- [ ] Teste: Navegação completa funciona
- [ ] Teste: Dados exibidos corretamente

---

## Continua...

O guia está ficando muito extenso. Vou criar mais arquivos separados para as próximas fases (3-8).

**Quer que eu continue com as próximas fases ou prefere começar a implementar estas primeiras?**

As próximas fases serão:
- **Fase 3:** Registro e Onboarding
- **Fase 4:** Templates
- **Fase 5:** Multi-tenant e Organizações
- **Fase 6:** Comentários
- **Fase 7:** Melhorias de UX
- **Fase 8:** Notificações Email

Cada uma será igualmente detalhada com código completo e explicações passo a passo.
