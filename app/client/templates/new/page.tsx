"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload, ArrowLeft, Info } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Brand {
  id: string
  name: string
}

export default function NewTemplatePage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState("")
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [keyVisualFile, setKeyVisualFile] = useState<File | null>(null)
  const [preliminaryContent, setPreliminaryContent] = useState("")
  const [restrictions, setRestrictions] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Fetch brands
    fetch('/api/client/brands')
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(console.error)
  }, [])

  const handleSubmit = async () => {
    // Validações
    if (!selectedBrandId) {
      toast.error("Por favor, selecione uma marca")
      return
    }
    if (!templateName.trim()) {
      toast.error("Por favor, insira o nome do template")
      return
    }
    if (!keyVisualFile) {
      toast.error("Por favor, faça upload do Key Visual")
      return
    }
    if (!preliminaryContent.trim()) {
      toast.error("Por favor, insira o conteúdo preliminar")
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Upload do Key Visual
      let keyVisualUrl = null
      const FILE_SIZE_LIMIT = 4 * 1024 * 1024 // 4MB

      if (keyVisualFile.size > FILE_SIZE_LIMIT) {
        // Upload direto para arquivos grandes
        const signedUrlResponse = await fetch(
          `/api/brands/${selectedBrandId}/assets/signed-upload`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: keyVisualFile.name,
              fileType: keyVisualFile.type,
              fileSize: keyVisualFile.size,
            }),
          }
        )

        if (!signedUrlResponse.ok) {
          throw new Error("Erro ao preparar upload do Key Visual")
        }

        const { uploadUrl, path } = await signedUrlResponse.json()

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: keyVisualFile,
          headers: {
            "Content-Type": keyVisualFile.type,
            "x-upsert": "true",
          },
        })

        if (!uploadResponse.ok) {
          throw new Error("Erro ao fazer upload do Key Visual")
        }

        const confirmResponse = await fetch(
          `/api/brands/${selectedBrandId}/assets/confirm`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path,
              fileName: keyVisualFile.name,
              fileType: keyVisualFile.type,
              fileSize: keyVisualFile.size,
            }),
          }
        )

        if (!confirmResponse.ok) {
          throw new Error("Erro ao registrar Key Visual")
        }

        const confirmData = await confirmResponse.json()
        keyVisualUrl = confirmData.url
      } else {
        // Upload tradicional para arquivos pequenos
        const kvFormData = new FormData()
        kvFormData.append("file", keyVisualFile)
        kvFormData.append("bucket", "assets")
        kvFormData.append("folder", `${selectedBrandId}/key-visuals`)

        const kvUploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: kvFormData,
        })

        if (!kvUploadResponse.ok) {
          throw new Error("Falha ao fazer upload do Key Visual")
        }

        const kvUploadData = await kvUploadResponse.json()
        keyVisualUrl = kvUploadData.url
      }

      // 2. Criar projeto de criação de template
      const projectData = {
        name: `Template: ${templateName}`, // Nome do projeto automaticamente gerado
        brandId: selectedBrandId,
        templateId: null, // Não tem template ainda - vai criar um novo
        estimatedCreatives: 0, // Templates não têm criativos estimados
        newTemplateRequest: {
          name: templateName,
          description: templateDescription || null,
          keyVisualUrl,
          preliminaryContent,
          restrictions: restrictions || null,
        },
      }

      const projectResponse = await fetch("/api/client/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!projectResponse.ok) {
        const errorData = await projectResponse.json()
        throw new Error(errorData.error || "Falha ao criar solicitação de template")
      }

      const { project } = await projectResponse.json()

      toast.success("Solicitação de template criada com sucesso!", {
        description: "Nossa equipe analisará o Key Visual e criará o template para aprovação.",
      })

      // Redirecionar para a página de solicitação de template
      setTimeout(() => {
        window.location.href = `/client/template-requests/${project.id}`
      }, 1500)
    } catch (error: any) {
      console.error("Error creating template request:", error)
      toast.error(error.message || "Erro ao criar solicitação de template")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/client/templates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Solicitar Novo Template</h1>
          <p className="text-muted-foreground mt-1">
            Envie um Key Visual para criar um novo template personalizado
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Marca de Referência *</label>
                <select
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                >
                  <option value="">Selecione uma marca</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  A marca que será utilizada como base para este template
                </p>
              </div>
            </div>
          </Card>

          {/* Template Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Detalhes do Template</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nome do Template *
                </label>
                <Input
                  placeholder="Ex: Banner Verão 2024"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Descrição (opcional)
                </label>
                <Textarea
                  placeholder="Descreva o estilo, propósito ou características deste template..."
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Key Visual (KV) * - Referência visual da campanha
                </label>
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-secondary/20 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('kv-upload')?.click()}
                >
                  <Upload className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium mb-1">
                    {keyVisualFile ? keyVisualFile.name : "Arraste o Key Visual aqui ou clique para selecionar"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG ou PDF até 50MB
                  </p>
                  {keyVisualFile && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Tamanho: {(keyVisualFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                  <input
                    id="kv-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => setKeyVisualFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Content & Restrictions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Conteúdo e Especificações</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Conteúdo Preliminar *
                </label>
                <Textarea
                  placeholder="Descreva o conteúdo que deve aparecer no template. Ex: Título, Subtítulo, CTA, Descrição do produto, etc."
                  value={preliminaryContent}
                  onChange={(e) => setPreliminaryContent(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Especifique os elementos de conteúdo que devem estar presentes no template
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Restrições ou Obrigatoriedades (opcional)
                </label>
                <Textarea
                  placeholder="Especifique restrições visuais, guidelines da marca, elementos obrigatórios, cores que não podem ser usadas, etc."
                  value={restrictions}
                  onChange={(e) => setRestrictions(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Informe regras específicas que devem ser seguidas na criação do template
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Resumo da Solicitação</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Marca:</span>
                <span className="font-medium">
                  {brands.find(b => b.id === selectedBrandId)?.name || "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nome do Template:</span>
                <span className="font-medium">{templateName || "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Key Visual:</span>
                <span className="font-medium">{keyVisualFile ? "✓ Anexado" : "Pendente"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conteúdo:</span>
                <span className="font-medium">{preliminaryContent ? "✓ Fornecido" : "Pendente"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Restrições:</span>
                <span className="font-medium">{restrictions ? "✓ Fornecido" : "Nenhuma"}</span>
              </div>
            </div>

            <div className="border-t border-border my-4"></div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
              <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
                <strong className="flex items-center gap-1 mb-2">
                  <Info className="h-3.5 w-3.5" />
                  Como funciona:
                </strong>
                Nossa equipe criará múltiplos formatos (Feed, Stories, Banners, etc.) baseados no seu Key Visual, mantendo a essência visual e estrutura do conteúdo. Você será notificado quando o template estiver pronto para aprovação.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando solicitação..." : "Solicitar Template"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/client/templates">Cancelar</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
