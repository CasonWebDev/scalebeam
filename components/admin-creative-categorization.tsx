"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X, Edit2 } from "lucide-react"
import { toast } from "sonner"

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
  onUpdate: () => void
}

export function AdminCreativeCategorization({
  creatives,
  formatVariations,
  onUpdate,
}: AdminCreativeCategorizationProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ lista: string; modelo: string }>({ lista: "", modelo: "" })
  const [saving, setSaving] = useState(false)

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
                          <Label htmlFor={`lista-${creative.id}`} className="text-xs">
                            Lista/Variação
                          </Label>
                          <Input
                            id={`lista-${creative.id}`}
                            value={editValues.lista}
                            onChange={(e) => setEditValues({ ...editValues, lista: e.target.value })}
                            placeholder="Ex: Lista 1, Variação A"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`modelo-${creative.id}`} className="text-xs">
                            Modelo/Template
                          </Label>
                          <Input
                            id={`modelo-${creative.id}`}
                            value={editValues.modelo}
                            onChange={(e) => setEditValues({ ...editValues, modelo: e.target.value })}
                            placeholder="Ex: Modelo 1, Template A"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Lista:</span>{" "}
                          <span className="font-medium">{creative.lista || "Não definida"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Modelo:</span>{" "}
                          <span className="font-medium">{creative.modelo || "Não definido"}</span>
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
