"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Folder, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { LogoutButton } from "@/components/logout-button"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Projetos", href: "/admin/projects", icon: Folder },
  { name: "Marcas", href: "/admin/brands", icon: Users },
  { name: "Configurações", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-2xl font-[300] tracking-tight">ScaleBeam</span>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            BETA
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Admin UXER</p>
            <p className="text-xs text-muted-foreground truncate">admin@uxer.com</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </div>
  )
}
