"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CheckCircle2, X } from "lucide-react"
import { toast } from "sonner"

interface ProjectApprovalActionsProps {
  projectId: string
  projectName: string
}

export function ProjectApprovalActions({
  projectId,
  projectName,
}: ProjectApprovalActionsProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [revisionNotes, setRevisionNotes] = useState("")

  const handleApprove = async () => {
    setIsApproving(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to approve project")
      }

      toast.success("Criativos aprovados com sucesso!", {
        description: `O projeto "${projectName}" foi marcado como aprovado.`,
      })

      // Reload page after 1 second
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      console.error("Approval error:", error)
      toast.error(error.message || "Erro ao aprovar projeto")
      setIsApproving(false)
    }
  }

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim() || revisionNotes.length < 10) {
      toast.error("Por favor, descreva os ajustes necessários (mínimo 10 caracteres)")
      return
    }

    setIsRequesting(true)

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

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to request revision")
      }

      toast.success("Solicitação de ajustes enviada!", {
        description: "A equipe UXER foi notificada sobre as revisões necessárias.",
      })

      setRevisionNotes("")

      // Reload page after 1 second
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      console.error("Revision error:", error)
      toast.error(error.message || "Erro ao solicitar revisão")
      setIsRequesting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="text-destructive">
            <X className="h-4 w-4 mr-2" />
            Solicitar Ajustes
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Solicitar Ajustes nos Criativos</AlertDialogTitle>
            <AlertDialogDescription>
              Descreva os ajustes que você gostaria que fossem feitos nos criativos.
              A equipe UXER será notificada e trabalhará nas revisões solicitadas.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4">
            <label className="text-sm font-medium mb-2 block">
              Descrição dos ajustes necessários
            </label>
            <textarea
              className="w-full min-h-[120px] rounded-lg border border-border bg-background p-3 text-sm resize-none"
              placeholder="Ex: Ajustar cores do CTA, aumentar tamanho do logo, corrigir texto do produto..."
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              onClick={handleRequestRevision}
              disabled={isRequesting || !revisionNotes.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRequesting ? "Enviando..." : "Enviar Solicitação"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Aprovar Criativos
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar Criativos</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a aprovar todos os criativos deste projeto.
              Esta ação confirmará que você está satisfeito com o trabalho entregue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button onClick={handleApprove} disabled={isApproving}>
              {isApproving ? "Aprovando..." : "Confirmar Aprovação"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
