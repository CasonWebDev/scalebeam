import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Clock, XCircle, Zap, FileText, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ProjectStatusChange } from "@/components/project-status-change"
import { UploadCreativesModal } from "@/components/upload-creatives-modal"
import { DownloadAllButton } from "@/components/creative-download-button"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

export const dynamic = 'force-dynamic'

const statusConfig = {
  DRAFT: { label: "Rascunho", icon: Clock, color: "bg-gray-500" },
  IN_PRODUCTION: { label: "Em Produção", icon: Clock, color: "bg-blue-500" },
  READY: { label: "Pronto", icon: CheckCircle, color: "bg-green-500" },
  APPROVED: { label: "Aprovado", icon: CheckCircle, color: "bg-green-600" },
  REVISION: { label: "Revisão Necessária", icon: XCircle, color: "bg-amber-500" },
}

const platformLabels: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  google: "Google Ads",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  youtube: "YouTube",
}

const formatLabels: Record<string, string> = {
  feed: "Feed (1080x1080)",
  stories: "Stories (1080x1920)",
  banner: "Banner (1200x628)",
  carrossel: "Carrossel",
  video: "Vídeo",
  display: "Display Ads",
}

export default async function AdminCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      brand: {
        include: {
          organization: true,
        },
      },
      template: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          description: true,
          preliminaryContent: true,
          restrictions: true,
        },
      },
      creatives: {
        orderBy: { createdAt: "desc" },
      },
      comments: {
        include: {
          user: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!project) {
    notFound()
  }

  // Verificar se é realmente uma campanha
  if (project.projectType !== "CAMPAIGN") {
    redirect(`/admin/template-requests/${id}`)
  }

  const statusCfg = statusConfig[project.status]
  const StatusIcon = statusCfg.icon

  // Parse campaign data
  let campaignData: any = {}
  let selectedPlatforms: string[] = []
  let selectedFormats: string[] = []
  let formatVariations: Record<string, number> = {}

  if (project.briefingData) {
    try {
      campaignData = JSON.parse(project.briefingData)
      selectedPlatforms = campaignData.selectedPlatforms || []
      selectedFormats = campaignData.selectedFormats || []
      formatVariations = campaignData.formatVariations || {}
    } catch {}
  }

  // Fallback to direct fields if briefingData is not structured
  if (selectedPlatforms.length === 0 && project.selectedPlatforms) {
    try {
      selectedPlatforms = JSON.parse(project.selectedPlatforms)
    } catch {}
  }

  if (selectedFormats.length === 0 && project.selectedFormats) {
    try {
      selectedFormats = JSON.parse(project.selectedFormats)
    } catch {}
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/campaigns">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
                <p className="text-muted-foreground mt-1">
                  Campanha · {project.brand.name} · {project.brand.organization.name}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusCfg.color} text-white`}>
            <StatusIcon className="h-5 w-5" />
            <span className="font-medium">{statusCfg.label}</span>
          </div>
          {project.creatives.length > 0 && (
            <DownloadAllButton
              projectId={project.id}
              projectName={project.name}
              creativesCount={project.creatives.length}
            />
          )}
          <UploadCreativesModal projectId={project.id} projectName={project.name} />
          <ProjectStatusChange
            projectId={project.id}
            projectName={project.name}
            currentStatus={project.status}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Used */}
          {project.template && (
            <Card className="p-6 border-2 border-primary/30 bg-primary/5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Template Utilizado
              </h2>
              <div className="flex gap-4">
                {project.template.imageUrl && (
                  <div className="relative w-32 h-32 rounded-lg border-2 border-border overflow-hidden bg-white flex-shrink-0">
                    <Image
                      src={project.template.imageUrl}
                      alt={project.template.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{project.template.name}</h3>
                  {project.template.description && (
                    <p className="text-sm text-muted-foreground mb-2">{project.template.description}</p>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/templates`}>
                      Ver Todos os Templates
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Campaign Specifications */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Especificações da Campanha</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Criativos Estimados</span>
                  <p className="text-2xl font-bold">{project.estimatedCreatives}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Criativos Produzidos</span>
                  <p className="text-2xl font-bold text-primary">{project.creatives.length}</p>
                </div>
              </div>

              {selectedPlatforms.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Plataformas Selecionadas</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlatforms.map((p) => (
                      <Badge key={p} variant="outline">
                        {platformLabels[p] || p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedFormats.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Formatos e Variações</span>
                  <div className="space-y-2">
                    {selectedFormats.map((f) => (
                      <div key={f} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <span className="font-medium">{formatLabels[f] || f}</span>
                        <Badge variant="secondary">
                          {formatVariations[f] || 0} variações
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {project.briefingContent && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Briefing de Conteúdo</span>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{project.briefingContent}</p>
                  </div>
                </div>
              )}

              {project.briefingUrl && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Arquivo de Briefing</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.briefingUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Briefing
                    </a>
                  </Button>
                </div>
              )}

              {project.observations && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Observações e Restrições</span>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{project.observations}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Creatives */}
          {project.creatives.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Criativos ({project.creatives.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.creatives.map((creative) => (
                  <div key={creative.id} className="group relative aspect-square rounded-lg border border-border overflow-hidden bg-muted">
                    <Image
                      src={creative.thumbnailUrl || creative.url}
                      alt={creative.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-center text-white p-4">
                        <p className="text-sm font-medium mb-2">{creative.name}</p>
                        <Button variant="secondary" size="sm" asChild>
                          <a href={creative.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3 w-3 mr-1" />
                            Baixar
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Comments */}
          {project.comments.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Comentários ({project.comments.length})
              </h2>
              <div className="space-y-4">
                {project.comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary text-xs font-medium text-primary-foreground flex items-center justify-center">
                          {comment.user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{comment.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Brand Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Informações da Marca</h2>
            <div className="space-y-4">
              {project.brand.logoUrl && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Logo</span>
                  <div className="relative h-24 w-24 rounded-lg border border-border overflow-hidden bg-muted">
                    <Image
                      src={project.brand.logoUrl}
                      alt={project.brand.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <div>
                <span className="text-sm text-muted-foreground block mb-1">Nome</span>
                <p className="font-medium">{project.brand.name}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground block mb-1">Organização</span>
                <p className="text-sm">{project.brand.organization.name}</p>
              </div>

              {project.brand.toneOfVoice && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Tom de Voz</span>
                  <p className="text-sm">{project.brand.toneOfVoice}</p>
                </div>
              )}

              {project.brand.primaryColor && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground block mb-2">
                      Cor Primária
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded border border-border"
                        style={{ backgroundColor: project.brand.primaryColor }}
                      />
                      <span className="text-xs font-mono">
                        {project.brand.primaryColor}
                      </span>
                    </div>
                  </div>
                  {project.brand.secondaryColor && (
                    <div>
                      <span className="text-sm text-muted-foreground block mb-2">
                        Cor Secundária
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded border border-border"
                          style={{ backgroundColor: project.brand.secondaryColor }}
                        />
                        <span className="text-xs font-mono">
                          {project.brand.secondaryColor}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Datas</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Criado</span>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Última Atualização</span>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(project.updatedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
