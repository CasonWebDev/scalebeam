"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
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
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface DeleteCreativeButtonProps {
  creativeId: string
  creativeName: string
}

export function DeleteCreativeButton({
  creativeId,
  creativeName,
}: DeleteCreativeButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/creatives/${creativeId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Falha ao deletar criativo")
      }

      toast.success("Criativo deletado com sucesso")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao deletar criativo")
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isDeleting}
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Deletar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Deleção</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja deletar o criativo "{creativeName}"? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deletando..." : "Deletar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
