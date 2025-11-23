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
          <h2 className="text-lg font-semibold">Campanhas Recentes</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/client/campaigns">Ver Todas</Link>
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
                  <Link href={`/client/campaigns/${project.id}`}>Ver Campanha</Link>
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              Nenhuma campanha criada ainda
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
