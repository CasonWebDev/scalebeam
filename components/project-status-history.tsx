"use client"

import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Clock } from "lucide-react"

interface StatusHistory {
  id: string
  action: string
  description: string
  createdAt: Date
  userId: string
}

interface ProjectStatusHistoryProps {
  history: StatusHistory[]
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  created_project: { label: "Projeto criado", color: "text-blue-500" },
  uploaded_creatives: { label: "Criativos adicionados", color: "text-green-500" },
  updated_project_status: { label: "Status atualizado", color: "text-yellow-500" },
  project_approved: { label: "Projeto aprovado", color: "text-emerald-500" },
  revision_requested: { label: "Revisão solicitada", color: "text-orange-500" },
  project_created: { label: "Projeto criado", color: "text-blue-500" },
}

export function ProjectStatusHistory({ history }: ProjectStatusHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhuma atividade registrada ainda</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((item, index) => {
        const actionInfo = ACTION_LABELS[item.action] || {
          label: item.action,
          color: "text-muted-foreground",
        }

        return (
          <div key={item.id} className="flex gap-4 items-start">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center">
              <div className={`w-2 h-2 rounded-full ${actionInfo.color.replace('text-', 'bg-')} flex-shrink-0 mt-2`} />
              {index < history.length - 1 && (
                <div className="w-px h-full bg-border mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${actionInfo.color}`}>
                    {actionInfo.label}
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {item.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
