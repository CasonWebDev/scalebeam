"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, X, Download, Zap } from "lucide-react"
import { CreativeDownloadButton } from "@/components/creative-download-button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Creative {
  id: string
  name: string
  url: string
  thumbnailUrl: string | null
  width: number | null
  height: number | null
  format: string
  lista: string | null
  modelo: string | null
}

interface CreativeApprovalGridProps {
  creatives: Creative[]
  projectId: string
  projectName: string
  canApprove: boolean
}

export function CreativeApprovalGrid({
  creatives,
  projectId,
  projectName,
  canApprove,
}: CreativeApprovalGridProps) {
  const [selectedCreatives, setSelectedCreatives] = useState<Set<string>>(new Set())
  const [showRevisionDialog, setShowRevisionDialog] = useState(false)
  const [revisionNotes, setRevisionNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Filters
  const [selectedLista, setSelectedLista] = useState<string | null>(null)
  const [selectedFormato, setSelectedFormato] = useState<string | null>(null)
  const [selectedModelo, setSelectedModelo] = useState<string | null>(null)

  // Get unique values for filters
  const listas = Array.from(new Set(creatives.map(c => c.lista).filter(Boolean))) as string[]
  const formatos = Array.from(new Set(creatives.map(c => c.format).filter(Boolean))) as string[]
  const modelos = Array.from(new Set(creatives.map(c => c.modelo).filter(Boolean))) as string[]

  // Filter creatives based on selections
  const filteredCreatives = creatives.filter(creative => {
    if (selectedLista && creative.lista !== selectedLista) return false
    if (selectedFormato && creative.format !== selectedFormato) return false
    if (selectedModelo && creative.modelo !== selectedModelo) return false
    return true
  })

  const allSelected = selectedCreatives.size === filteredCreatives.length && filteredCreatives.length > 0
  const someSelected = selectedCreatives.size > 0 && selectedCreatives.size < filteredCreatives.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedCreatives(new Set())
    } else {
      setSelectedCreatives(new Set(filteredCreatives.map(c => c.id)))
    }
  }

  const selectByFilter = (filterType: 'lista' | 'formato' | 'modelo', value: string) => {
    const creativesToSelect = creatives.filter(c => {
      if (filterType === 'lista') return c.lista === value
      if (filterType === 'formato') return c.format === value
      if (filterType === 'modelo') return c.modelo === value
      return false
    })
    setSelectedCreatives(new Set(creativesToSelect.map(c => c.id)))
  }

  const toggleCreative = (id: string) => {
    const newSelected = new Set(selectedCreatives)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCreatives(newSelected)
  }

  const handleRequestRevision = () => {
    if (selectedCreatives.size === 0) {
      toast.error("Selecione pelo menos um criativo para solicitar ajustes")
      return
    }
    setShowRevisionDialog(true)
  }

  const confirmRevision = async () => {
    console.log('[CONFIRM REVISION] Starting revision request')
    console.log('[CONFIRM REVISION] Revision notes:', revisionNotes)
    console.log('[CONFIRM REVISION] Project ID:', projectId)

    if (!revisionNotes.trim() || revisionNotes.length < 10) {
      console.log('[CONFIRM REVISION] Validation failed - notes too short')
      toast.error("Por favor, descreva os ajustes necessários (mínimo 10 caracteres)")
      return
    }

    setIsProcessing(true)
    console.log('[CONFIRM REVISION] Calling API...')

    try {
      const response = await fetch(`/api/projects/${projectId}/request-revision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: revisionNotes,
        }),
      })

      console.log('[CONFIRM REVISION] Response status:', response.status)

      if (!response.ok) {
        const data = await response.json()
        console.log('[CONFIRM REVISION] Error response:', data)
        throw new Error(data.error || "Falha ao solicitar revisão")
      }

      const responseData = await response.json()
      console.log('[CONFIRM REVISION] Success response:', responseData)

      const count = selectedCreatives.size
      toast.success("Solicitação enviada com sucesso!", {
        description: `Nossa IA está analisando seus feedbacks e processando os ajustes solicitados.`,
      })

      setShowRevisionDialog(false)
      setRevisionNotes("")
      setSelectedCreatives(new Set())

      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      toast.error("Erro ao solicitar revisão", {
        description: error.message,
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border">
        <h3 className="text-sm font-semibold mb-3">Filtrar Criativos</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Lista Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Por Lista
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLista(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedLista === null
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/50"
                }`}
              >
                Todas
              </button>
              {listas.map((lista) => (
                <button
                  key={lista}
                  onClick={() => setSelectedLista(lista)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedLista === lista
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  {lista}
                </button>
              ))}
            </div>
          </div>

          {/* Formato Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Por Formato
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFormato(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedFormato === null
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/50"
                }`}
              >
                Todos
              </button>
              {formatos.map((formato) => (
                <button
                  key={formato}
                  onClick={() => setSelectedFormato(formato)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedFormato === formato
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  {formato.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Modelo Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Por Modelo
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedModelo(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedModelo === null
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/50"
                }`}
              >
                Todos
              </button>
              {modelos.map((modelo) => (
                <button
                  key={modelo}
                  onClick={() => setSelectedModelo(modelo)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedModelo === modelo
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  {modelo}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Results */}
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Mostrando <span className="font-semibold text-foreground">{filteredCreatives.length}</span> de{" "}
            <span className="font-semibold text-foreground">{creatives.length}</span> criativos
          </p>
        </div>
      </div>

      {/* Action Bar */}
      {canApprove && (
        <div className="flex items-center justify-between mb-4 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleSelectAll}
              className={someSelected ? "data-[state=checked]:bg-blue-500" : ""}
            />
            <span className="text-sm font-medium">
              {selectedCreatives.size > 0
                ? `${selectedCreatives.size} de ${creatives.length} selecionados`
                : "Selecionar todos"}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleRequestRevision}
              disabled={selectedCreatives.size === 0}
            >
              <Zap className="h-4 w-4 mr-2" />
              Solicitar Ajustes à IA
            </Button>
          </div>
        </div>
      )}

      {/* Creatives Grid */}
      {filteredCreatives.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCreatives.map((creative) => {
            const isSelected = selectedCreatives.has(creative.id)
            return (
              <div
                key={creative.id}
                onClick={() => canApprove && toggleCreative(creative.id)}
                className={`group relative overflow-hidden rounded-lg border transition-all ${
                  canApprove ? "cursor-pointer" : ""
                } ${
                  isSelected
                    ? "border-primary ring-2 ring-primary ring-offset-2 bg-primary/5"
                    : "border-border bg-muted hover:border-primary/50"
                }`}
              >
              {canApprove && (
                <div
                  className="absolute top-3 left-3 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleCreative(creative.id)}
                    className="bg-white border-2 shadow-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>
              )}

              {isSelected && canApprove && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs font-semibold shadow-lg">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
              )}

              <div
                className="relative aspect-square"
                onClick={(e) => {
                  // Se clicar no botão de download, não seleciona
                  const target = e.target as HTMLElement
                  if (target.closest('button')) {
                    e.stopPropagation()
                  }
                }}
              >
                <Image
                  src={creative.thumbnailUrl || creative.url}
                  alt={creative.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div onClick={(e) => e.stopPropagation()}>
                    <CreativeDownloadButton
                      creativeId={creative.id}
                      creativeName={creative.name}
                      creativeUrl={creative.url}
                      variant="secondary"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
              <div className="p-3 bg-card">
                <p className="text-sm font-medium truncate">{creative.name}</p>
                <p className="text-xs text-muted-foreground">
                  {creative.width} × {creative.height} · {creative.format.toUpperCase()}
                </p>
              </div>
            </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">Nenhum criativo encontrado com os filtros selecionados</p>
          <button
            onClick={() => {
              setSelectedLista(null)
              setSelectedFormato(null)
              setSelectedModelo(null)
            }}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Revision Dialog */}
      <AlertDialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>💬 Solicitar Ajustes à IA</AlertDialogTitle>
            <AlertDialogDescription>
              Você selecionou {selectedCreatives.size} criativo{selectedCreatives.size > 1 ? 's' : ''}.
              Descreva as mudanças que deseja e nossa IA irá gerar novas versões otimizadas instantaneamente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4">
            <label className="text-sm font-medium mb-2 block">
              O que você gostaria de ajustar?
            </label>
            <textarea
              className="w-full min-h-[120px] rounded-lg border border-border bg-background p-3 text-sm resize-none"
              placeholder="Ex: 'Deixar o CTA mais destacado', 'Aumentar o tamanho do logo', 'Mudar a cor de fundo para azul'..."
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              💡 Seja específico! Quanto mais detalhes, melhores serão os novos criativos gerados pela IA.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              onClick={confirmRevision}
              disabled={isProcessing || !revisionNotes.trim()}
            >
              {isProcessing ? "Processando..." : "Gerar Novas Versões"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
