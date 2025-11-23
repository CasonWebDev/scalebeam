"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
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

interface AdminTemplateViewModalProps {
  template: any
  children: React.ReactNode
}

export function AdminTemplateViewModal({
  template,
  children,
}: AdminTemplateViewModalProps) {
  let platforms: string[] = []
  let formats: string[] = []

  if (template.platforms) {
    try {
      platforms = JSON.parse(template.platforms)
    } catch {}
  }

  if (template.formats) {
    try {
      formats = JSON.parse(template.formats)
    } catch {}
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="relative w-full h-64 rounded-lg border border-border overflow-hidden bg-muted">
            <Image
              src={template.imageUrl}
              alt={template.name}
              fill
              className="object-contain"
            />
          </div>

          {/* Details Grid */}
          <div className="grid gap-4">
            {template.description && (
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  Descrição
                </span>
                <p className="text-sm">{template.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  Marca
                </span>
                <p className="text-sm font-medium">{template.brand.name}</p>
                <p className="text-xs text-muted-foreground">
                  {template.brand.organization.name}
                </p>
              </div>

              {template.category && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground block mb-1">
                    Categoria
                  </span>
                  <p className="text-sm">{template.category}</p>
                </div>
              )}
            </div>

            {platforms.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-2">
                  Plataformas
                </span>
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
                <span className="text-sm font-medium text-muted-foreground block mb-2">
                  Formatos
                </span>
                <div className="flex flex-wrap gap-2">
                  {formats.map((f) => (
                    <Badge key={f} variant="outline">
                      {formatLabels[f] || f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {template.preliminaryContent && (
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  Conteúdo Preliminar
                </span>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {template.preliminaryContent}
                  </p>
                </div>
              </div>
            )}

            {template.restrictions && (
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  Restrições e Obrigatoriedades
                </span>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {template.restrictions}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  Status
                </span>
                <Badge
                  variant={
                    template.templateStatus === "APPROVED"
                      ? "default"
                      : template.templateStatus === "REJECTED"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {template.templateStatus === "APPROVED"
                    ? "Aprovado"
                    : template.templateStatus === "REJECTED"
                    ? "Rejeitado"
                    : "Pendente"}
                </Badge>
              </div>

              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  Ativo
                </span>
                <Badge variant={template.isActive ? "default" : "outline"}>
                  {template.isActive ? "Sim" : "Não"}
                </Badge>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-muted-foreground block mb-1">
                Projetos Usando Este Template
              </span>
              <p className="text-lg font-semibold">{template._count.projects}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
