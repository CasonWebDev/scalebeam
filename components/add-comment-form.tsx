"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AddCommentFormProps {
  projectId: string
}

export function AddCommentForm({ projectId }: AddCommentFormProps) {
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error("Por favor, escreva um comentário")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      })

      if (!response.ok) {
        throw new Error("Falha ao adicionar comentário")
      }

      toast.success("Comentário adicionado!", {
        description: "Seu feedback foi registrado no projeto.",
      })

      setComment("")

      // Recarregar página para mostrar novo comentário
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      toast.error("Erro ao adicionar comentário")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mb-4">
      <textarea
        className="w-full min-h-[100px] rounded-lg border border-border bg-background p-3 text-sm resize-none"
        placeholder="Adicione comentários ou feedback sobre os criativos..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button
        size="sm"
        className="mt-2 w-full"
        onClick={handleSubmit}
        disabled={isSubmitting || !comment.trim()}
      >
        {isSubmitting ? "Enviando..." : "Adicionar Comentário"}
      </Button>
    </div>
  )
}
