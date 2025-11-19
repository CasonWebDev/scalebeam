"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload } from "lucide-react"
import { toast } from "sonner"

interface UploadCreativesModalProps {
  projectId: string
  projectName: string
}

export function UploadCreativesModal({
  projectId,
  projectName,
}: UploadCreativesModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Por favor, selecione pelo menos um arquivo")
      return
    }

    setIsUploading(true)

    // Simulate upload progress
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2500)),
      {
        loading: `Fazendo upload de ${selectedFiles.length} arquivo(s)...`,
        success: `${selectedFiles.length} criativo(s) adicionado(s) com sucesso!`,
        error: "Erro ao fazer upload",
      }
    )

    await new Promise(resolve => setTimeout(resolve, 2500))

    setIsUploading(false)
    setIsOpen(false)
    setSelectedFiles(null)

    // Simulate page reload
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Fazer Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload de Criativos</DialogTitle>
          <DialogDescription>
            Faça upload dos criativos finalizados para o projeto &quot;{projectName}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Selecione os arquivos
            </label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-secondary/20 transition-colors">
              <Upload className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium mb-1">
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Formatos aceitos: JPG, PNG, MP4, GIF
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" size="sm" asChild>
                  <span>Selecionar Arquivos</span>
                </Button>
              </label>
            </div>
          </div>

          {selectedFiles && selectedFiles.length > 0 && (
            <div className="rounded-lg border border-border p-4 bg-muted">
              <p className="text-sm font-medium mb-2">
                {selectedFiles.length} arquivo(s) selecionado(s):
              </p>
              <ul className="space-y-1">
                {Array.from(selectedFiles).slice(0, 5).map((file, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground">
                    • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
                {selectedFiles.length > 5 && (
                  <li className="text-xs text-muted-foreground">
                    ... e mais {selectedFiles.length - 5} arquivo(s)
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false)
              setSelectedFiles(null)
            }}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFiles || selectedFiles.length === 0}
          >
            {isUploading ? "Enviando..." : "Fazer Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
