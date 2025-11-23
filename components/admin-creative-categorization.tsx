"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Check, X, Edit2 } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Creative {
  id: string
  name: string
  url: string
  thumbnailUrl: string | null
  format: string
  lista: string | null
  modelo: string | null
}

interface AdminCreativeCategorizationProps {
  creatives: Creative[]
  formatVariations: Record<string, number>
  selectedFormats: string[]
  onUpdate: () => void
}

// Formatos disponíveis na plataforma
const formatLabels: Record<string, string> = {
  feed: "Feed",
  stories: "Stories",
  banner: "Banner",
  carrossel: "Carrossel",
  video: "Vídeo",
  display: "Display Ads",
}

// Dimensões/aspectos de formato disponíveis
const dimensionOptions = [
  { value: "1:1", label: "1:1 (Quadrado - 1080x1080)" },
  { value: "4:5", label: "4:5 (Vertical Feed - 1080x1350)" },
  { value: "9:16", label: "9:16 (Stories/Reels - 1080x1920)" },
  { value: "16:9", label: "16:9 (Horizontal - 1920x1080)" },
  { value: "1200:628", label: "1200x628 (Facebook Link)" },
  { value: "1080:1080", label: "1080x1080 (Instagram Feed)" },
  { value: "google-display", label: "Google Display Ads" },
  { value: "google-search", label: "Google Search Ads" },
  { value: "linkedin-feed", label: "LinkedIn Feed" },
  { value: "tiktok-video", label: "TikTok Video" },
]

export function AdminCreativeCategorization({
  creatives,
  formatVariations,
  selectedFormats,
  onUpdate,
}: AdminCreativeCategorizationProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ lista: string; modelo: string }>({ lista: "", modelo: "" })
  const [saving, setSaving] = useState(false)

  // Lista de formatos selecionados na campanha para o dropdown
  const listaOptions = selectedFormats.map((format) => ({
    value: format,
    label: formatLabels[format] || format,
  }))

  const startEdit = (creative: Creative) => {
    setEditingId(creative.id)
    setEditValues({
      lista: creative.lista || "",
      modelo: creative.modelo || "",
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({ lista: "", modelo: "" })
  }

  const saveEdit = async (creativeId: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/creatives/${creativeId}/categorize`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lista: editValues.lista || null,
          modelo: editValues.modelo || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao salvar categorização")
      }

      toast.success("Categorização salva com sucesso!")
      setEditingId(null)
      onUpdate()
    } catch (error) {
      toast.error("Erro ao salvar categorização")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  // Group creatives by formato for better organization
  const groupedByFormat = creatives.reduce((acc, creative) => {
    const key = creative.format || "outros"
    if (!acc[key]) acc[key] = []
    acc[key].push(creative)
    return acc
  }, {} as Record<string, Creative[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Categorização de Criativos</h3>
        <p className="text-sm text-muted-foreground">
          Total: {creatives.length} criativos
        </p>
      </div>

      {Object.entries(groupedByFormat).map(([format, creativesInFormat]) => (
        <div key={format} className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm uppercase">{format}</h4>
            <Badge variant="secondary">{creativesInFormat.length} criativos</Badge>
          </div>

          <div className="grid gap-4">
            {creativesInFormat.map((creative) => {
              const isEditing = editingId === creative.id

              return (
                <div
                  key={creative.id}
                  className="flex gap-4 p-3 rounded-lg border border-border bg-muted/30"
                >
                  {/* Preview */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
                    <Image
                      src={creative.thumbnailUrl || creative.url}
                      alt={creative.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info and Categorization */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate mb-2">{creative.name}</p>

                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`lista-${creative.id}`} className="text-xs mb-1 block">
                            Tipo de Conteúdo
                          </Label>
                          <Select
                            value={editValues.lista}
                            onValueChange={(value) => setEditValues({ ...editValues, lista: value })}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {listaOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`modelo-${creative.id}`} className="text-xs mb-1 block">
                            Formato/Dimensão
                          </Label>
                          <Select
                            value={editValues.modelo}
                            onValueChange={(value) => setEditValues({ ...editValues, modelo: value })}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Selecione a dimensão" />
                            </SelectTrigger>
                            <SelectContent>
                              {dimensionOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>{" "}
                          <span className="font-medium">
                            {creative.lista ? (formatLabels[creative.lista] || creative.lista) : "Não definido"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Formato:</span>{" "}
                          <span className="font-medium">
                            {creative.modelo ? (dimensionOptions.find(d => d.value === creative.modelo)?.label || creative.modelo) : "Não definido"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-1">
                    {isEditing ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => saveEdit(creative.id)}
                          disabled={saving}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => startEdit(creative)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "secondary" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
        variant === "secondary"
          ? "bg-secondary text-secondary-foreground"
          : "bg-primary text-primary-foreground"
      }`}
    >
      {children}
    </span>
  )
}
