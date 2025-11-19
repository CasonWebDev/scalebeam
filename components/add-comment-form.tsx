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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    toast.success("Comentário adicionado!", {
      description: "Sua mensagem foi enviada à equipe UXER.",
    })

    setComment("")
    setIsSubmitting(false)

    // Simulate page reload to show new comment
    setTimeout(() => {
      window.location.reload()
    }, 1500)
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
