"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Plus, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Template {
  id: string
  name: string
  description: string | null
  imageUrl: string
  templateStatus: "PENDING_APPROVAL" | "APPROVED" | "REJECTED"
  brand: {
    name: string
  }
  project?: {
    id: string
    status: string
  }
  createdAt: Date
  _count: {
    projects: number
  }
}

const templateStatusConfig = {
  PENDING_APPROVAL: { label: "Aguardando Aprovação", variant: "secondary" as const },
  APPROVED: { label: "Aprovado", variant: "default" as const },
  REJECTED: { label: "Rejeitado", variant: "destructive" as const },
}

export default function ClientTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      const response = await fetch("/api/client/templates")
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setLoading(false)
    }
  }

  // Separar templates por status
  const approvedTemplates = templates.filter((t) => t.templateStatus === "APPROVED")
  const pendingTemplates = templates.filter((t) => t.templateStatus === "PENDING_APPROVAL")
  const rejectedTemplates = templates.filter((t) => t.templateStatus === "REJECTED")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Meus Templates</h1>
              <p className="text-muted-foreground mt-1">
                {approvedTemplates.length} aprovado(s) · {pendingTemplates.length} aguardando aprovação
              </p>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href="/client/templates/new">
            <Plus className="h-4 w-4 mr-2" />
            Solicitar Novo Template
          </Link>
        </Button>
      </div>

      {/* Templates Aprovados */}
      {approvedTemplates.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Templates Aprovados</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {approvedTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video bg-muted">
                  <Image
                    src={template.imageUrl}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.brand.name}</p>
                    </div>
                    <Badge variant={templateStatusConfig[template.templateStatus].variant}>
                      {templateStatusConfig[template.templateStatus].label}
                    </Badge>
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{template._count.projects} campanha(s)</span>
                    <span>
                      {formatDistanceToNow(new Date(template.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/client/campaigns/new?templateId=${template.id}`}>
                      Criar Campanha
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Templates Pendentes */}
      {pendingTemplates.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Aguardando Aprovação</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingTemplates.map((template) => (
              <Card
                key={template.id}
                className="overflow-hidden border-2 border-primary/30 bg-primary/5"
              >
                <div className="relative aspect-video bg-muted">
                  <Image
                    src={template.imageUrl}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {template.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{template.brand.name}</p>
                    </div>
                    <Badge variant={templateStatusConfig[template.templateStatus].variant}>
                      {templateStatusConfig[template.templateStatus].label}
                    </Badge>
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mb-3">
                    Solicitado{" "}
                    {formatDistanceToNow(new Date(template.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                  {template.project && (
                    <Button asChild className="w-full" variant="outline">
                      <Link href={`/client/template-requests/${template.project.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Solicitação
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Templates Rejeitados */}
      {rejectedTemplates.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Rejeitados</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rejectedTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden opacity-60">
                <div className="relative aspect-video bg-muted">
                  <Image
                    src={template.imageUrl}
                    alt={template.name}
                    fill
                    className="object-cover grayscale"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.brand.name}</p>
                    </div>
                    <Badge variant={templateStatusConfig[template.templateStatus].variant}>
                      {templateStatusConfig[template.templateStatus].label}
                    </Badge>
                  </div>
                  {template.project && (
                    <Button asChild className="w-full mt-3" variant="outline">
                      <Link href={`/client/template-requests/${template.project.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {templates.length === 0 && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Sparkles className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium mb-2">Nenhum template ainda</p>
            <p className="text-sm text-muted-foreground mb-6">
              Comece solicitando um novo template para sua marca
            </p>
            <Button asChild>
              <Link href="/client/templates/new">
                <Plus className="h-4 w-4 mr-2" />
                Solicitar Primeiro Template
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
