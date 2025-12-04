"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface OrganizationModalProps {
  mode: "create" | "edit"
  organization?: any
  children: React.ReactNode
}

export function OrganizationModal({ mode, organization, children }: OrganizationModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    plan: organization?.plan || "STARTER",
    maxCreatives: organization?.maxCreatives || 300,
    maxTemplates: organization?.maxTemplates || 3,
    paymentStatus: organization?.paymentStatus || "active",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = mode === "create"
        ? "/api/admin/organizations"
        : `/api/admin/organizations/${organization.id}`

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha ao salvar")
      }

      toast.success(mode === "create" ? "Organization criada!" : "Organization atualizada!")
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
            {mode === "create" ? "Nova Organization" : "Editar Organization"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Crie uma nova organization com seus limites e configurações"
              : "Atualize as informações e limites da organization"}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="plan">Plano</Label>
                <select
                  id="plan"
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                >
                  <option value="STARTER">Starter</option>
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="AGENCY">Agency</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentStatus">Status Pagamento</Label>
                <select
                  id="paymentStatus"
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                >
                  <option value="active">Ativo</option>
                  <option value="overdue">Atrasado</option>
                  <option value="suspended">Suspenso</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxCreatives">Limite de Criativos/Mês</Label>
                <Input
                  id="maxCreatives"
                  type="number"
                  value={formData.maxCreatives}
                  onChange={(e) => setFormData({ ...formData, maxCreatives: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxTemplates">Limite de Templates/Mês</Label>
                <Input
                  id="maxTemplates"
                  type="number"
                  value={formData.maxTemplates}
                  onChange={(e) => setFormData({ ...formData, maxTemplates: parseInt(e.target.value) })}
                  required
                />
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
