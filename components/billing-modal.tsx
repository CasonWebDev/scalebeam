"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Edit } from "lucide-react"

interface Organization {
  id: string
  name: string
  paymentStatus: string
  billingUrl: string | null
  lastPaymentDate: Date | null
  nextBillingDate: Date | null
  asaasCustomerId: string | null
  asaasSubscriptionId: string | null
}

interface BillingModalProps {
  organization: Organization
}

export function BillingModal({ organization }: BillingModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    paymentStatus: organization.paymentStatus,
    billingUrl: organization.billingUrl || "",
    lastPaymentDate: organization.lastPaymentDate
      ? new Date(organization.lastPaymentDate).toISOString().split("T")[0]
      : "",
    nextBillingDate: organization.nextBillingDate
      ? new Date(organization.nextBillingDate).toISOString().split("T")[0]
      : "",
    asaasCustomerId: organization.asaasCustomerId || "",
    asaasSubscriptionId: organization.asaasSubscriptionId || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/billing/${organization.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: formData.paymentStatus,
          billingUrl: formData.billingUrl || null,
          lastPaymentDate: formData.lastPaymentDate || null,
          nextBillingDate: formData.nextBillingDate || null,
          asaasCustomerId: formData.asaasCustomerId || null,
          asaasSubscriptionId: formData.asaasSubscriptionId || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update billing")
      }

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating billing:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar Faturamento</DialogTitle>
          <DialogDescription>
            Gerencie o pagamento de {organization.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="paymentStatus">Status do Pagamento</Label>
              <Select
                value={formData.paymentStatus}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentStatus: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="billingUrl">Link de Cobrança</Label>
              <Input
                id="billingUrl"
                type="url"
                placeholder="https://www.asaas.com/c/..."
                value={formData.billingUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, billingUrl: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Link de pagamento do Asaas
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="asaasCustomerId">ID Cliente Asaas</Label>
              <Input
                id="asaasCustomerId"
                placeholder="cus_000000000000"
                value={formData.asaasCustomerId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, asaasCustomerId: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                ID do cliente no painel Asaas (para webhook)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="asaasSubscriptionId">ID Assinatura Asaas</Label>
              <Input
                id="asaasSubscriptionId"
                placeholder="sub_000000000000"
                value={formData.asaasSubscriptionId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, asaasSubscriptionId: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                ID da assinatura (opcional)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lastPaymentDate">Último Pagamento</Label>
                <Input
                  id="lastPaymentDate"
                  type="date"
                  value={formData.lastPaymentDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastPaymentDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nextBillingDate">Próximo Vencimento</Label>
                <Input
                  id="nextBillingDate"
                  type="date"
                  value={formData.nextBillingDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nextBillingDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
