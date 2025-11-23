"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload, ArrowLeft, CheckCircle2, Eye, Sparkles, FileImage, Info } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { Lightbox } from "@/components/lightbox"

const PLATFORMS = [
  { id: "facebook", name: "Facebook" },
  { id: "instagram", name: "Instagram" },
  { id: "google", name: "Google Ads" },
  { id: "tiktok", name: "TikTok" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "youtube", name: "YouTube" },
]

const FORMATS = [
  { id: "feed", name: "Feed", dimensions: "1080x1080" },
  { id: "stories", name: "Stories", dimensions: "1080x1920" },
  { id: "banner", name: "Banner", dimensions: "1200x628" },
  { id: "carrossel", name: "Carrossel", dimensions: "Múltiplo" },
  { id: "video", name: "Vídeo", dimensions: "Variado" },
  { id: "display", name: "Display Ads", dimensions: "Variado" },
]

interface Template {
  id: string
  name: string
  description: string | null
  imageUrl: string
  category: string | null
  templateStatus: string
  platforms: string | null
  formats: string | null
}

interface Brand {
  id: string
  name: string
}

interface FormatVariations {
  [formatId: string]: number
}

export default function NewCampaignPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [campaignName, setCampaignName] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [formatVariations, setFormatVariations] = useState<FormatVariations>({})
  const [briefingContent, setBriefingContent] = useState("")
  const [briefingFile, setBriefingFile] = useState<File | null>(null)
  const [observations, setObservations] = useState("")
  const [additionalFile, setAdditionalFile] = useState<File | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Fetch brands
    fetch('/api/client/brands')
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    // Fetch ONLY APPROVED templates when brand is selected
    if (selectedBrandId) {
      fetch(`/api/templates?brandId=${selectedBrandId}&status=APPROVED`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Filtrar apenas templates aprovados no client-side também
            setTemplates(data.filter((t: Template) => t.templateStatus === 'APPROVED'))
          } else {
            setTemplates([])
          }
        })
        .catch(console.error)
    } else {
      setTemplates([])
    }
  }, [selectedBrandId])

  // Atualizar template selecionado e resetar seleções
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId)
      setSelectedTemplate(template || null)
      // Reset platform and format selections
      setSelectedPlatforms([])
      setSelectedFormats([])
      setFormatVariations({})
    } else {
      setSelectedTemplate(null)
    }
  }, [selectedTemplateId, templates])

  // Calcular total de criativos baseado nas variações
  const totalCreatives = Object.values(formatVariations).reduce((sum, count) => sum + count, 0)

  // Get available platforms and formats from selected template
  const availablePlatforms = selectedTemplate?.platforms
    ? JSON.parse(selectedTemplate.platforms)
    : []
  const availableFormats = selectedTemplate?.formats
    ? JSON.parse(selectedTemplate.formats)
    : []

  const handleFormatVariationChange = (formatId: string, value: string) => {
    const numValue = parseInt(value) || 0
    setFormatVariations(prev => ({
      ...prev,
      [formatId]: numValue
    }))
  }

  const handleSubmit = async () => {
    // Validações
    if (!campaignName.trim()) {
      toast.error("Por favor, insira o nome da campanha")
      return
    }
    if (!selectedBrandId) {
      toast.error("Por favor, selecione uma marca")
      return
    }
    if (!selectedTemplateId) {
      toast.error("Por favor, selecione um template aprovado")
      return
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Por favor, selecione pelo menos uma plataforma")
      return
    }
    if (selectedFormats.length === 0) {
      toast.error("Por favor, selecione pelo menos um formato")
      return
    }
    if (totalCreatives === 0) {
      toast.error("Por favor, defina a quantidade de variações para os formatos selecionados")
      return
    }
    if (!briefingContent.trim() && !briefingFile) {
      toast.error("Por favor, forneça o briefing de conteúdo (texto ou arquivo)")
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Upload de briefing file (se houver)
      let briefingUrl = null
      if (briefingFile) {
        const formData = new FormData()
        formData.append("file", briefingFile)
        formData.append("bucket", "briefings")
        formData.append("folder", selectedBrandId)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Falha ao fazer upload do briefing")
        }

        const uploadData = await uploadResponse.json()
        briefingUrl = uploadData.url
      }

      // 2. Upload de arquivo adicional (se houver)
      let additionalFileUrl = null
      if (additionalFile) {
        const formData = new FormData()
        formData.append("file", additionalFile)
        formData.append("bucket", "briefings")
        formData.append("folder", `${selectedBrandId}/additional`)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Falha ao fazer upload do arquivo adicional")
        }

        const uploadData = await uploadResponse.json()
        additionalFileUrl = uploadData.url
      }

      // 3. Criar campanha
      const campaignData = {
        name: campaignName,
        brandId: selectedBrandId,
        templateId: selectedTemplateId,
        briefingUrl,
        briefingContent: briefingContent.trim() || null,
        estimatedCreatives: totalCreatives,
        selectedPlatforms,
        selectedFormats,
        formatVariations,
        observations: observations.trim() || null,
        additionalFileUrl,
      }

      const campaignResponse = await fetch("/api/client/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      })

      if (!campaignResponse.ok) {
        const errorData = await campaignResponse.json()
        throw new Error(errorData.error || "Falha ao criar campanha")
      }

      const { project } = await campaignResponse.json()

      toast.success("Campanha criada com sucesso!", {
        description: "Nossa IA ScaleBeam está processando sua solicitação e criará os criativos em breve.",
      })

      // Redirecionar para a página da campanha
      setTimeout(() => {
        window.location.href = `/client/campaigns/${project.id}`
      }, 1500)
    } catch (error: any) {
      console.error("Error creating campaign:", error)
      toast.error(error.message || "Erro ao criar campanha")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/client/campaigns">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight">Nova Campanha</h1>
          <p className="text-muted-foreground mt-1">Crie criativos aplicando conteúdo em um template aprovado</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/client/templates/new">
            <Sparkles className="h-4 w-4 mr-2" />
            Solicitar Novo Template
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome da Campanha *</label>
                <Input
                  placeholder="Ex: Campanha Black Friday 2024"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

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
              </div>
            </div>
          </Card>

          {/* Template Selection */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Template Aprovado *</h2>
            </div>

            {templates.length === 0 && selectedBrandId && (
              <div className="p-8 text-center border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">
                  Nenhum template aprovado encontrado para esta marca.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Você precisa de um template aprovado para criar uma campanha.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/client/templates/new">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Solicitar Novo Template
                  </Link>
                </Button>
              </div>
            )}
            {templates.length === 0 && !selectedBrandId && (
              <div className="p-8 text-center border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">
                  Selecione uma marca para ver os templates disponíveis.
                </p>
              </div>
            )}
            {templates.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {templates.map((template, index) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`group relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                      selectedTemplateId === template.id
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="relative h-32 bg-muted">
                      {!imageErrors.has(template.id) && template.imageUrl ? (
                        <>
                          <Image
                            src={template.imageUrl}
                            alt={template.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            onError={() => {
                              setImageErrors(prev => new Set(prev).add(template.id))
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                setLightboxIndex(index)
                                setLightboxOpen(true)
                              }}
                            >
                              <Eye className="h-6 w-6" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                          <FileImage className="h-12 w-12 mb-2" />
                          <p className="text-xs">Preview indisponível</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-card">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{template.name}</p>
                          {template.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          )}
                        </div>
                        {selectedTemplateId === template.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Platforms & Formats - Only show if template is selected */}
          {selectedTemplate && (
            <>
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Plataformas de Mídia *</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione onde os criativos serão veiculados
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PLATFORMS.filter(p => availablePlatforms.length === 0 || availablePlatforms.includes(p.id)).map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlatforms(prev =>
                          prev.includes(platform.id)
                            ? prev.filter(p => p !== platform.id)
                            : [...prev, platform.id]
                        )
                      }}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedPlatforms.includes(platform.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {platform.name}
                    </button>
                  ))}
                </div>
                {availablePlatforms.length === 0 && (
                  <p className="text-sm text-muted-foreground italic mt-2">
                    Este template não especifica plataformas. Todas estão disponíveis.
                  </p>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Formatos e Variações *</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione os formatos e defina quantas variações deseja para cada
                </p>
                <div className="space-y-3">
                  {FORMATS.filter(f => availableFormats.length === 0 || availableFormats.includes(f.id)).map((format) => (
                    <div
                      key={format.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedFormats.includes(format.id)
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedFormats.includes(format.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFormats(prev => [...prev, format.id])
                                setFormatVariations(prev => ({ ...prev, [format.id]: 1 }))
                              } else {
                                setSelectedFormats(prev => prev.filter(f => f !== format.id))
                                setFormatVariations(prev => {
                                  const newVars = { ...prev }
                                  delete newVars[format.id]
                                  return newVars
                                })
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <div>
                            <p className="font-medium text-sm">{format.name}</p>
                            <p className="text-xs text-muted-foreground">{format.dimensions}</p>
                          </div>
                        </div>
                        {selectedFormats.includes(format.id) && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground">Variações:</label>
                            <Input
                              type="number"
                              min="1"
                              value={formatVariations[format.id] || 1}
                              onChange={(e) => handleFormatVariationChange(format.id, e.target.value)}
                              className="w-20"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {availableFormats.length === 0 && (
                  <p className="text-sm text-muted-foreground italic mt-3">
                    Este template não especifica formatos. Todos estão disponíveis.
                  </p>
                )}
              </Card>
            </>
          )}

          {/* Briefing Content */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Briefing de Conteúdo *</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Forneça as informações que devem ser aplicadas nas peças criativas
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Conteúdo do Briefing (texto)
                </label>
                <Textarea
                  placeholder="Descreva o conteúdo que deve aparecer nos criativos. Ex: Título: 'Black Friday 2024', Descrição: 'Até 70% de desconto', CTA: 'Compre Agora'..."
                  value={briefingContent}
                  onChange={(e) => setBriefingContent(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ou faça upload de um arquivo com os dados estruturados abaixo
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Upload de Briefing (CSV, Excel, DOC, PDF)
                </label>
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-secondary/20 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('briefing-upload')?.click()}
                >
                  <Upload className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium mb-1">
                    {briefingFile ? briefingFile.name : "Clique para selecionar ou arraste o arquivo"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CSV, XLSX, DOC, DOCX, PDF
                  </p>
                  <input
                    id="briefing-upload"
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls,.doc,.docx,.pdf"
                    onChange={(e) => setBriefingFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Observations & Additional Files */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Informações Adicionais</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Observações, Restrições ou Obrigatoriedades (opcional)
                </label>
                <Textarea
                  placeholder="Especifique regras específicas, restrições visuais, elementos obrigatórios, etc."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Documento Adicional (opcional)
                </label>
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-secondary/20 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('additional-upload')?.click()}
                >
                  <Upload className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium mb-1">
                    {additionalFile ? additionalFile.name : "Clique para anexar documento"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qualquer arquivo de referência adicional
                  </p>
                  <input
                    id="additional-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => setAdditionalFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Resumo da Campanha</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Campanha:</span>
                <span className="font-medium">{campaignName || "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Marca:</span>
                <span className="font-medium">
                  {brands.find(b => b.id === selectedBrandId)?.name || "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Template:</span>
                <span className="font-medium">
                  {selectedTemplateId
                    ? templates.find(t => t.id === selectedTemplateId)?.name
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plataformas:</span>
                <span className="font-medium">{selectedPlatforms.length || "0"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Formatos:</span>
                <span className="font-medium">{selectedFormats.length || "0"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Criativos:</span>
                <span className="font-medium text-primary">{totalCreatives || "0"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Briefing:</span>
                <span className="font-medium">
                  {briefingContent || briefingFile ? "✓ Fornecido" : "Pendente"}
                </span>
              </div>
            </div>

            <div className="border-t border-border my-4"></div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
              <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
                <strong className="flex items-center gap-1 mb-2">
                  <Info className="h-3.5 w-3.5" />
                  Como funciona:
                </strong>
                Nossa IA aplicará o conteúdo do briefing no template selecionado, gerando {totalCreatives || "N"} criativos nos formatos escolhidos. Você será notificado quando estiverem prontos para aprovação.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Criando campanha..." : "Criar Campanha"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                asChild
                disabled={isSubmitting}
              >
                <Link href="/client/campaigns">Cancelar</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && templates.length > 0 && (
        <Lightbox
          images={templates.map(t => ({
            url: t.imageUrl,
            name: t.name,
            alt: t.description || t.name
          }))}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={() => setLightboxIndex((prev) => Math.min(prev + 1, templates.length - 1))}
          onPrevious={() => setLightboxIndex((prev) => Math.max(prev - 1, 0))}
          showNavigation={true}
        />
      )}
    </div>
  )
}
