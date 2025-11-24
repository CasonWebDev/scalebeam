import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Clock, CheckCircle2, AlertTriangle, ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CreativeApprovalGrid } from "@/components/creative-approval-grid"
import { ProjectAutoRefresh } from "@/components/project-auto-refresh"
import { ProjectRefreshButton } from "@/components/project-refresh-button"
import { DownloadAllButton } from "@/components/creative-download-button"

export const dynamic = "force-dynamic"

const STATUS_CONFIG = {
  DRAFT: {
    label: "Rascunho",
    icon: Clock,
    color: "secondary",
    alertColor: "border-gray-300 bg-gray-50/50",
    message: "Campanha em preparação"
  },
  IN_PRODUCTION: {
    label: "Campanha em Produção",
    icon: Zap,
    color: "default",
    alertColor: "border-blue-300 bg-blue-50/50",
    message: "Criativos sendo gerados! Assim que os primeiros ficarem prontos, você já pode revisar e aprovar."
  },
  APPROVED: {
    label: "Campanha Aprovada",
    icon: CheckCircle2,
    color: "default",
    alertColor: "border-green-300 bg-green-50/50",
    message: "Campanha aprovada e pronta para suas veiculações"
  },
}

export default async function CampaignDetailPage({
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

  const campaign = await prisma.project.findUnique({
    where: { id },
    include: {
      brand: {
        include: {
          organization: true,
        },
      },
      template: {
        select: {
          name: true,
          description: true,
          imageUrl: true,
        },
      },
      creatives: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!campaign) {
    notFound()
  }

  // Verificar acesso
  if (!session.user.organizationIds.includes(campaign.brand.organization.id)) {
    notFound()
  }

  // Se o status for REVISION (antigo), tratar como IN_PRODUCTION
  const statusToUse = campaign.status === "REVISION" ? "IN_PRODUCTION" : campaign.status
  const config = STATUS_CONFIG[statusToUse as keyof typeof STATUS_CONFIG]
  const Icon = config.icon
  // Cliente pode aprovar quando houver criativos e não estiver aprovado
  const canApprove = campaign.status === "IN_PRODUCTION" && campaign.creatives.length > 0
  const isGenerating = campaign.status === "IN_PRODUCTION"
  const isApproved = campaign.status === "APPROVED"
  const hasCreatives = campaign.creatives.length > 0

  // Parse briefing data
  let briefingData: any[] = []
  if (campaign.briefingData) {
    try {
      briefingData = JSON.parse(campaign.briefingData)
    } catch (e) {
      console.error("Error parsing briefingData:", e)
    }
  }

  // Calcular progresso
  const progress = campaign.estimatedCreatives > 0
    ? Math.round((campaign.creatives.length / campaign.estimatedCreatives) * 100)
    : 0

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/client/campaigns">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">{campaign.name}</h1>
              <Badge variant={config.color as any}>
                <Icon className="h-4 w-4 mr-1" />
                {config.label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {campaign.brand.name} · {campaign.brand.organization.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ProjectAutoRefresh intervalSeconds={30} />
          <ProjectRefreshButton />
        </div>
      </div>

      {/* Status Alert */}
      <Card className={`p-5 border-2 ${config.alertColor}`}>
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${config.alertColor}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{config.label}</h3>
            <p className="text-sm text-muted-foreground">{config.message}</p>

            {isGenerating && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">Progresso da Geração</span>
                  <span className="font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{campaign.creatives.length} criativos gerados</span>
                  <span>{campaign.estimatedCreatives} solicitados</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Stats */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Informações da Campanha</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Criativos Solicitados</p>
                <p className="text-2xl font-bold">{campaign.estimatedCreatives}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Criativos Gerados</p>
                <p className="text-2xl font-bold text-primary">{campaign.creatives.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Última Atualização</p>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(campaign.updatedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Template Info */}
          {campaign.template && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Template Utilizado</h2>
              <div className="flex gap-4">
                {campaign.template.imageUrl && (
                  <div className="relative w-24 h-24 rounded-lg border overflow-hidden bg-white shrink-0">
                    <img
                      src={campaign.template.imageUrl}
                      alt={campaign.template.name}
                      className="object-contain w-full h-full"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{campaign.template.name}</h3>
                  {campaign.template.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {campaign.template.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Briefing Data */}
          {briefingData.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Briefing Enviado</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      {Object.keys(briefingData[0]).map((key) => (
                        <th
                          key={key}
                          className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {briefingData.map((row: Record<string, string>, idx: number) => (
                      <tr key={idx}>
                        {Object.values(row).map((value, vIdx) => (
                          <td key={vIdx} className="px-4 py-3">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Creatives Section */}
          {hasCreatives ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {isGenerating && "Criativos Gerados"}
                  {canApprove && "Criativos para Revisar"}
                  {isApproved && "Seus Criativos Aprovados"}
                </h2>
                {(canApprove || isApproved) && (
                  <DownloadAllButton
                    projectId={campaign.id}
                    projectName={campaign.name}
                    creativesCount={campaign.creatives.length}
                  />
                )}
              </div>

              {isGenerating && (
                <div className="mb-4 p-4 border-2 border-blue-300 bg-blue-50/50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Visualização Prévia:</strong> Estes criativos estão sendo gerados pela IA.
                    Você poderá revisar e aprovar quando a produção estiver completa.
                  </p>
                </div>
              )}

              {canApprove && (
                <div className="mb-4 p-4 border-2 border-amber-300 bg-amber-50/50 rounded-lg">
                  <p className="text-sm text-amber-900">
                    <strong>Revise os criativos:</strong> Analise cada criativo e aprove ou solicite ajustes conforme necessário.
                  </p>
                </div>
              )}

              {isApproved && (
                <div className="mb-4 p-4 border-2 border-green-300 bg-green-50/50 rounded-lg">
                  <p className="text-sm text-green-900">
                    <strong>Campanha aprovada!</strong> Seus criativos estão prontos para uso em suas campanhas de mídia.
                  </p>
                </div>
              )}

              <CreativeApprovalGrid
                creatives={campaign.creatives}
                projectId={campaign.id}
                projectName={campaign.name}
                canApprove={canApprove}
              />
            </Card>
          ) : (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-lg py-12">
                <Zap className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {campaign.status === "DRAFT"
                    ? "Campanha em rascunho"
                    : "Aguardando início da geração"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Os criativos aparecerão aqui quando a IA iniciar a produção
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/client/campaigns">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Campanhas
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
