"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<"client">("client")

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres")
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.success("Conta criada com sucesso!", {
      description: "Você será redirecionado em instantes...",
    })

    setIsLoading(false)

    // Redirect to client dashboard
    setTimeout(() => {
      router.push("/client")
    }, 1000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Criar Conta</h2>
        <p className="text-sm text-muted-foreground">
          Comece a criar criativos em escala
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        {/* User Type (locked to client for signup) */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Tipo de Conta</p>
          <p className="text-sm font-medium">Cliente</p>
          <p className="text-xs text-muted-foreground mt-1">
            Contas UXER são criadas pela administração
          </p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Nome Completo <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            placeholder="João Silva"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            E-mail <span className="text-destructive">*</span>
          </label>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Company */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Empresa <span className="text-muted-foreground text-xs">(opcional)</span>
          </label>
          <Input
            type="text"
            placeholder="Sua Empresa Ltda"
            value={formData.company}
            onChange={(e) => handleChange("company", e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Senha <span className="text-destructive">*</span>
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Mínimo de 6 caracteres
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Confirmar Senha <span className="text-destructive">*</span>
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Terms */}
        <div className="text-xs text-muted-foreground">
          Ao criar uma conta, você concorda com nossos{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => toast.info("Funcionalidade em desenvolvimento")}
          >
            Termos de Serviço
          </button>{" "}
          e{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => toast.info("Funcionalidade em desenvolvimento")}
          >
            Política de Privacidade
          </button>
          .
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Criando conta..." : "Criar Conta"}
        </Button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Já tem uma conta? </span>
        <Link href="/login" className="text-primary hover:underline">
          Fazer login
        </Link>
      </div>
    </Card>
  )
}
