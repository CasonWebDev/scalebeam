"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Download } from "lucide-react"
import Image from "next/image"

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

interface AdminCampaignViewModalProps {
  campaignId: string
  children: React.ReactNode
}

export function AdminCampaignViewModal({
  campaignId,
  children,
}: AdminCampaignViewModalProps) {
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && !campaign) {
      fetchCampaign()
    }
  }, [open])

  const fetchCampaign = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}`)
      if (res.ok) {
        const data = await res.json()
        setCampaign(data.campaign)
      }
    } catch (error) {
      console.error("Error fetching campaign:", error)
    } finally {
      setLoading(false)
    }
  }

  let selectedPlatforms: string[] = []
  let selectedFormats: string[] = []
  let formatVariations: Record<string, number> = {}

  if (campaign?.briefingData) {
    try {
      const data = JSON.parse(campaign.briefingData)
      selectedPlatforms = data.selectedPlatforms || []
      selectedFormats = data.selectedFormats || []
      formatVariations = data.formatVariations || {}
    } catch {}
  }

  // Fallback
  if (selectedPlatforms.length === 0 && campaign?.selectedPlatforms) {
    try {
      selectedPlatforms = JSON.parse(campaign.selectedPlatforms)
    } catch {}
  }

  if (selectedFormats.length === 0 && campaign?.selectedFormats) {
    try {
      selectedFormats = JSON.parse(campaign.selectedFormats)
    } catch {}
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign?.name || "Carregando..."}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : campaign ? (
          <div className="space-y-6">
            {/* Template Used */}
            {campaign.template && (
              <div className="p-4 border border-primary/30 bg-primary/5 rounded-lg">
                <div className="flex gap-4">
                  {campaign.template.imageUrl && (
                    <div className="relative w-24 h-24 rounded border overflow-hidden bg-white flex-shrink-0">
                      <Image
                        src={campaign.template.imageUrl}
                        alt={campaign.template.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Template Utilizado</p>
                    <h3 className="font-semibold text-lg">{campaign.template.name}</h3>
                    {campaign.template.description && (
                      <p className="text-sm text-muted-foreground mt-1">{campaign.template.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Campaign Details Grid */}
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground block mb-1">
                    Marca
                  </span>
                  <p className="text-sm font-medium">{campaign.brand.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.brand.organization.name}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-muted-foreground block mb-1">
                    Status
                  </span>
                  <Badge>
                    {campaign.status === "DRAFT"
                      ? "Rascunho"
                      : campaign.status === "IN_PRODUCTION"
                      ? "Em Produção"
                      : campaign.status === "READY"
                      ? "Pronto"
                      : campaign.status === "APPROVED"
                      ? "Aprovado"
                      : "Em Revisão"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">
                    Criativos Estimados
                  </span>
                  <p className="text-2xl font-bold">{campaign.estimatedCreatives}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">
                    Criativos Produzidos
                  </span>
                  <p className="text-2xl font-bold text-primary">{campaign._count.creatives}</p>
                </div>
              </div>

              {selectedPlatforms.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground block mb-2">
                    Plataformas Selecionadas
                  </span>
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
                  <span className="text-sm font-medium text-muted-foreground block mb-2">
                    Formatos e Variações
                  </span>
                  <div className="space-y-2">
                    {selectedFormats.map((f) => (
                      <div key={f} className="flex items-center justify-between p-3 rounded-lg border">
                        <span className="font-medium text-sm">{formatLabels[f] || f}</span>
                        <Badge variant="secondary">
                          {formatVariations[f] || 0} variações
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {campaign.briefingContent && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground block mb-1">
                    Briefing de Conteúdo
                  </span>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{campaign.briefingContent}</p>
                  </div>
                </div>
              )}

              {campaign.briefingUrl && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground block mb-2">
                    Arquivo de Briefing
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={campaign.briefingUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Briefing
                    </a>
                  </Button>
                </div>
              )}

              {campaign.observations && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground block mb-1">
                    Observações e Restrições
                  </span>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{campaign.observations}</p>
                  </div>
                </div>
              )}

              {/* Creatives Preview */}
              {campaign.creatives && campaign.creatives.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground block mb-2">
                    Criativos ({campaign.creatives.length})
                  </span>
                  <div className="grid grid-cols-4 gap-3">
                    {campaign.creatives.slice(0, 8).map((creative: any) => (
                      <div key={creative.id} className="relative aspect-square rounded border overflow-hidden bg-muted group">
                        <Image
                          src={creative.thumbnailUrl || creative.url}
                          alt={creative.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm" asChild>
                            <a href={creative.url} target="_blank" rel="noopener noreferrer">
                              Ver
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {campaign.creatives.length > 8 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      +{campaign.creatives.length - 8} criativos adicionais
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
