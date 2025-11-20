"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface ProjectAutoRefreshProps {
  intervalSeconds?: number
}

export function ProjectAutoRefresh({ intervalSeconds = 30 }: ProjectAutoRefreshProps) {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(intervalSeconds)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          router.refresh()
          return intervalSeconds
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, intervalSeconds, router])

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>
        Atualizando em {secondsLeft}s
      </span>
      <button
        onClick={() => setIsActive(!isActive)}
        className="text-primary hover:underline"
      >
        {isActive ? 'Pausar' : 'Retomar'}
      </button>
    </div>
  )
}
