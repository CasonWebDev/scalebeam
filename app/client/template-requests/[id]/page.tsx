import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Clock, XCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export const dynamic = 'force-dynamic'

const statusConfig = {
  DRAFT: { label: "Rascunho", icon: Clock, color: "bg-gray-500" },
  IN_PRODUCTION: { label: "Em Análise", icon: Clock, color: "bg-blue-500" },
  READY: { label: "Template Criado", icon: CheckCircle, color: "bg-green-500" },
  APPROVED: { label: "Aprovado", icon: CheckCircle, color: "bg-green-600" },
  REVISION: { label: "Revisão Necessária", icon: XCircle, color: "bg-amber-500" },
}

const templateStatusConfig = {
  PENDING_APPROVAL: { label: "Aguardando Aprovação", variant: "secondary" as const },
  APPROVED: { label: "Aprovado", variant: "default" as const },
  REJECTED: { label: "Rejeitado", variant: "destructive" as const },
}

export default async function TemplateRequestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) {
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
      template: true,
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

  // Verificar permissão
  if (
    session.user.role === "CLIENT" &&
    !session.user.organizationIds.includes(project.brand.organizationId)
  ) {
    redirect("/client")
  }

  // Verificar se é realmente uma solicitação de template
  if (project.projectType !== "TEMPLATE_CREATION") {
    redirect(`/client/campaigns/${id}`)
  }

  const statusCfg = statusConfig[project.status]
  const StatusIcon = statusCfg.icon

  // Parse platforms and formats if available
  let platforms: string[] = []
  let formats: string[] = []

  if (project.template?.platforms) {
    try {
      platforms = JSON.parse(project.template.platforms as string)
    } catch {}
  }

  if (project.template?.formats) {
    try {
      formats = JSON.parse(project.template.formats as string)
    } catch {}
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

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/client/templates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
                <p className="text-muted-foreground mt-1">
                  Solicitação de Template · {project.brand.name}
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
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Informações da Solicitação</h2>
            <div className="grid gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Criado</span>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Última Atualização</span>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(project.updatedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Template Info */}
          {project.template && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Template Solicitado</h2>
                <Badge variant={templateStatusConfig[project.template.templateStatus].variant}>
                  {templateStatusConfig[project.template.templateStatus].label}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Nome do Template</span>
                  <p className="font-medium">{project.template.name}</p>
                </div>

                {project.template.description && (
                  <div>
                    <span className="text-sm text-muted-foreground block mb-2">Descrição</span>
                    <p className="text-sm">{project.template.description}</p>
                  </div>
                )}

                {project.template.imageUrl && (
                  <div>
                    <span className="text-sm text-muted-foreground block mb-2">Key Visual (Referência)</span>
                    <div className="relative aspect-video rounded-lg border border-border overflow-hidden bg-muted">
                      <Image
                        src={project.template.imageUrl}
                        alt={project.template.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                {platforms.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground block mb-2">Plataformas</span>
                    <div className="flex flex-wrap gap-2">
                      {platforms.map((p) => (
                        <Badge key={p} variant="outline">
                          {platformLabels[p] || p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formats.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground block mb-2">Formatos</span>
                    <div className="flex flex-wrap gap-2">
                      {formats.map((f) => (
                        <Badge key={f} variant="outline">
                          {formatLabels[f] || f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Process Explanation */}
          <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Processo de Criação
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-400 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Análise do Key Visual</p>
                  <p className="text-muted-foreground text-xs">
                    Nossa equipe analisa o material enviado e especificações
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-400 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Criação do Template</p>
                  <p className="text-muted-foreground text-xs">
                    Desenvolvemos o template baseado nas suas necessidades
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-400 text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Aprovação</p>
                  <p className="text-muted-foreground text-xs">
                    Você receberá uma notificação quando o template estiver pronto para aprovação
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Pronto para Usar</p>
                  <p className="text-muted-foreground text-xs">
                    Após aprovação, você poderá criar campanhas usando este template
                  </p>
                </div>
              </div>
            </div>
          </Card>

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
        </div>
      </div>
    </div>
  )
}
