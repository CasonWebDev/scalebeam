"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface CreativeDownloadButtonProps {
  creativeId: string
  creativeName: string
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  showText?: boolean
}

export function CreativeDownloadButton({
  creativeId,
  creativeName,
  variant = "secondary",
  size = "sm",
  showText = false,
}: CreativeDownloadButtonProps) {
  const handleDownload = () => {
    // Simulate download
    toast.success("Download iniciado!", {
      description: `${creativeName} será baixado em instantes.`,
    })

    // In a real app, this would trigger actual download
    console.log(`Downloading creative ${creativeId}`)
  }

  return (
    <Button variant={variant} size={size} onClick={handleDownload}>
      <Download className="h-4 w-4" />
      {showText && <span className="ml-2">Download</span>}
    </Button>
  )
}

interface DownloadAllButtonProps {
  projectName: string
  creativesCount: number
}

export function DownloadAllButton({
  projectName,
  creativesCount,
}: DownloadAllButtonProps) {
  const handleDownloadAll = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: `Preparando download de ${creativesCount} criativos...`,
        success: "Download iniciado com sucesso!",
        error: "Erro ao preparar download",
      }
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownloadAll}>
      <Download className="h-4 w-4 mr-2" />
      Baixar Todos
    </Button>
  )
}
