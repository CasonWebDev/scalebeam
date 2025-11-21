import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface UserHeaderProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export function UserHeader({ user }: UserHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-border">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {user.role === "ADMIN" ? "Admin Dashboard" : "Meus Projetos"}
        </h1>
        <p className="text-muted-foreground">
          {user.role === "ADMIN"
            ? "Gerencie todos os projetos e organizações"
            : "Visualize e gerencie seus projetos criativos"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
        >
          <Button type="submit" variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </form>
      </div>
    </div>
  )
}
