"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos")
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Determine user type based on email
    const isAdmin = email.toLowerCase().includes("@uxer.com") ||
                    email.toLowerCase().includes("admin") ||
                    email.toLowerCase() === "admin@admin.com"

    const userTypeName = isAdmin ? "UXER" : "Cliente"

    toast.success("Login realizado com sucesso!", {
      description: `Bem-vindo de volta, ${userTypeName}!`,
    })

    setIsLoading(false)

    // Redirect based on detected user type
    setTimeout(() => {
      if (isAdmin) {
        router.push("/admin")
      } else {
        router.push("/client")
      }
    }, 500)
  }

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Entrar</h2>
        <p className="text-sm text-muted-foreground">
          Acesse sua conta ScaleBeam
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium">E-mail</label>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Senha</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => toast.info("Funcionalidade em desenvolvimento")}
          >
            Esqueceu a senha?
          </button>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      {/* Demo Credentials */}
      <div className="mt-6 p-4 rounded-lg bg-muted">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Credenciais de demonstração:
        </p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>• <span className="font-medium">Admin UXER:</span> qualquer e-mail com @uxer.com ou "admin"</p>
          <p>• <span className="font-medium">Cliente:</span> qualquer outro e-mail</p>
          <p>• Qualquer senha funciona neste protótipo</p>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Não tem uma conta? </span>
        <Link href="/signup" className="text-primary hover:underline">
          Criar conta
        </Link>
      </div>
    </Card>
  )
}
