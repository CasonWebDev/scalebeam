"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link as LinkIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface UploadAssetModalProps {
  brandId: string
  brandName: string
}

export function UploadAssetModal({ brandId, brandName }: UploadAssetModalProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Link externo
  const [linkName, setLinkName] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [addingLink, setAddingLink] = useState(false)

  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo")
      return
    }

    // Verificar limite de 10MB do Supabase
    const SUPABASE_LIMIT = 10 * 1024 * 1024 // 10MB
    if (file.size > SUPABASE_LIMIT) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      setError(`Arquivo muito grande. O tamanho máximo permitido é 10MB. Seu arquivo tem ${fileSizeMB}MB.`)
      toast.error("Arquivo muito grande", {
        description: `Tamanho máximo: 10MB. Seu arquivo: ${fileSizeMB}MB`,
      })
      return
    }

    setUploading(true)
    setError(null)

    try {
      const FILE_SIZE_LIMIT = 4 * 1024 * 1024 // 4MB

      // Para arquivos maiores que 4MB, usar upload direto
      if (file.size > FILE_SIZE_LIMIT) {
        // 1. Obter URL assinada
        const signedUrlResponse = await fetch(
          `/api/brands/${brandId}/assets/signed-upload`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            }),
          }
        )

        if (!signedUrlResponse.ok) {
          throw new Error("Erro ao preparar upload")
        }

        const { uploadUrl, path, fileName } = await signedUrlResponse.json()

        // 2. Upload direto para Supabase
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
        })

        if (!uploadResponse.ok) {
          throw new Error("Erro ao fazer upload do arquivo")
        }

        // 3. Confirmar upload no banco de dados
        const confirmResponse = await fetch(
          `/api/brands/${brandId}/assets/confirm`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            }),
          }
        )

        if (!confirmResponse.ok) {
          throw new Error("Erro ao registrar arquivo")
        }
      } else {
        // Para arquivos menores, usar método tradicional
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(`/api/brands/${brandId}/assets`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Erro ao fazer upload")
        }
      }

      toast.success("Arquivo enviado com sucesso!")
      setOpen(false)
      setFile(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload")
      toast.error("Erro ao fazer upload")
    } finally {
      setUploading(false)
    }
  }

  const handleAddLink = async () => {
    if (!linkName.trim() || !linkUrl.trim()) {
      setError("Por favor, preencha o nome e a URL")
      return
    }

    // Validar URL
    try {
      new URL(linkUrl)
    } catch {
      setError("Por favor, insira uma URL válida")
      return
    }

    setAddingLink(true)
    setError(null)

    try {
      const response = await fetch(`/api/brands/${brandId}/assets/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: linkName,
          url: linkUrl,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao adicionar link")
      }

      toast.success("Link adicionado com sucesso!")
      setOpen(false)
      setLinkName("")
      setLinkUrl("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar link")
      toast.error("Erro ao adicionar link")
    } finally {
      setAddingLink(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Adicionar Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Asset</DialogTitle>
          <DialogDescription>
            Faça upload de arquivos ou adicione links para bancos de imagem externos
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="link">
              <LinkIcon className="h-4 w-4 mr-2" />
              Link Externo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="file-upload" className="text-sm font-medium mb-2 block">
                Selecione um arquivo
              </Label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,video/*"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                  cursor-pointer"
              />
              {file && (
                <p className="text-sm text-muted-foreground mt-2">
                  Arquivo selecionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? "Enviando..." : "Upload"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="link-name" className="text-sm font-medium mb-2 block">
                Nome do Asset
              </Label>
              <Input
                id="link-name"
                type="text"
                placeholder="Ex: Banco de Imagens Google Drive"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="link-url" className="text-sm font-medium mb-2 block">
                URL
              </Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://drive.google.com/..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cole o link para Google Drive, OneDrive, Dropbox, ou outro serviço
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={addingLink}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddLink}
                disabled={!linkName.trim() || !linkUrl.trim() || addingLink}
              >
                {addingLink ? "Adicionando..." : "Adicionar Link"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
