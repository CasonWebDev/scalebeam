import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderOpen, Eye, Edit2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

export const dynamic = "force-dynamic"

export default async function AdminBrandsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const brands = await prisma.brand.findMany({
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      projects: {
        select: {
          id: true,
          projectType: true,
        },
      },
      _count: {
        select: {
          assets: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Marcas</h1>
              <p className="text-muted-foreground mt-1">
                {brands.length} marca(s) cadastrada(s)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Marca
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Campanhas
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Templates
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Assets
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brands.map((brand) => {
                const totalCampaigns = brand.projects.filter(p => p.projectType === "CAMPAIGN").length
                const totalTemplates = brand.projects.filter(p => p.projectType === "TEMPLATE_CREATION").length

                return (
                  <tr key={brand.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {brand.logoUrl && (
                          <div className="relative h-10 w-10 shrink-0 rounded-lg border border-border overflow-hidden bg-muted">
                            <Image
                              src={brand.logoUrl}
                              alt={brand.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <p className="font-medium">{brand.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{brand.organization.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">{totalCampaigns}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">{totalTemplates}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">{brand._count.assets}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Visualizar" asChild>
                          <Link href={`/admin/brands/${brand.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" title="Editar" asChild>
                          <Link href={`/admin/brands/${brand.id}/edit`}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteConfirmationDialog
                          resourceType="Marca"
                          resourceName={brand.name}
                          endpoint={`/api/admin/brands/${brand.id}`}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {brands.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhuma marca cadastrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Marcas aparecerão aqui quando os clientes as criarem
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
