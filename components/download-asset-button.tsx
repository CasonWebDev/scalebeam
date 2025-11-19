"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface DownloadAssetButtonProps {
  assetName: string
  assetUrl: string
}

export function DownloadAssetButton({
  assetName,
  assetUrl,
}: DownloadAssetButtonProps) {
  const handleDownload = () => {
    toast.success("Download iniciado!", {
      description: `${assetName} será baixado em instantes.`,
    })

    // In a real app, this would trigger actual download
    console.log(`Downloading asset ${assetUrl}`)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      <Download className="h-4 w-4" />
    </Button>
  )
}

interface DownloadBriefingButtonProps {
  projectName: string
}

export function DownloadBriefingButton({ projectName }: DownloadBriefingButtonProps) {
  const handleDownload = () => {
    toast.success("Download do CSV iniciado!", {
      description: `O briefing de ${projectName} será baixado em instantes.`,
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      <Download className="h-4 w-4 mr-2" />
      Download CSV
    </Button>
  )
}
