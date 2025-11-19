"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    toast.success("Logout realizado com sucesso")
    setTimeout(() => {
      router.push("/login")
    }, 500)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start text-muted-foreground hover:text-foreground"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sair
    </Button>
  )
}
