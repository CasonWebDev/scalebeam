"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Loader2 } from "lucide-react"
import { toast } from "sonner"

const STATUS_OPTIONS = [
  { value: "PENDING_APPROVAL", label: "Aguardando Aprovação" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "REJECTED", label: "Rejeitado" },
]

interface TemplateStatusChangeProps {
  templateId: string
  templateName: string
  currentStatus: string
}

export function TemplateStatusChange({
  templateId,
  templateName,
  currentStatus,
}: TemplateStatusChangeProps) {
  const router = useRouter()
  const [isChanging, setIsChanging] = useState(false)

  async function handleStatusChange(newStatus: string) {
    if (newStatus === currentStatus) return

    setIsChanging(true)

    try {
      const response = await fetch(`/api/admin/templates/${templateId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha ao alterar status")
      }

      const statusLabel = STATUS_OPTIONS.find((s) => s.value === newStatus)?.label

      toast.success(`Status alterado para "${statusLabel}"`)
      router.refresh()
    } catch (error: any) {
      console.error("Error changing template status:", error)
      toast.error(error.message || "Erro ao alterar status do template")
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isChanging}>
          {isChanging ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Alterar Status
              <ChevronDown className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={option.value === currentStatus}
          >
            {option.label}
            {option.value === currentStatus && " (atual)"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
