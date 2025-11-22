"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface UserModalProps {
  mode: "create" | "edit"
  user?: any
  children: React.ReactNode
}

export function UserModal({ mode, user, children }: UserModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "CLIENT",
    organizationIds: user?.organizations?.map((o: any) => o.id) || [],
  })

  useEffect(() => {
    if (open) {
      fetch("/api/admin/organizations")
        .then(res => res.json())
        .then(data => setOrganizations(data.organizations || []))
        .catch(console.error)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = mode === "create"
        ? "/api/admin/users"
        : `/api/admin/users/${user.id}`

      const body = mode === "create"
        ? formData
        : { ...formData, password: formData.password || undefined }

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha ao salvar")
      }

      toast.success(mode === "create" ? "Usuário criado!" : "Usuário atualizado!")
      setOpen(false)
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Novo Usuário" : "Editar Usuário"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Crie um novo usuário do sistema"
              : "Atualize as informações do usuário"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">
                Senha {mode === "edit" && "(deixe em branco para não alterar)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={mode === "create"}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="CLIENT">Cliente</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label>Organizations</Label>
              <div className="border border-border rounded-lg p-3 max-h-40 overflow-y-auto">
                {organizations.map((org) => (
                  <label key={org.id} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={formData.organizationIds.includes(org.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            organizationIds: [...formData.organizationIds, org.id]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            organizationIds: formData.organizationIds.filter((id: string) => id !== org.id)
                          })
                        }
                      }}
                    />
                    <span className="text-sm">{org.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : mode === "create" ? "Criar" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
