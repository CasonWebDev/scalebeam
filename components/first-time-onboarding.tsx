import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Plus, Building2, Upload, Zap } from "lucide-react"
import Link from "next/link"

export function FirstTimeOnboarding() {
  return (
    <Card className="max-w-3xl mx-auto mt-20 p-12">
      <div className="text-center">
        <Sparkles className="h-16 w-16 mx-auto text-primary mb-6" />
        <h1 className="text-3xl font-bold mb-4">
          Bem-vindo ao ScaleBeam IA!
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Nossa IA está pronta para criar criativos incríveis para sua marca.
          Vamos começar em 3 passos simples:
        </p>

        <div className="grid gap-6 md:grid-cols-3 mb-8 text-left">
          <Card className="p-6 bg-muted/30">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold mb-2">Crie sua marca</h3>
            <p className="text-sm text-muted-foreground">
              Cadastre informações básicas da sua marca
            </p>
          </Card>

          <Card className="p-6 bg-muted/30">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold mb-2">Faça upload de assets</h3>
            <p className="text-sm text-muted-foreground">
              Logo, fotos de produtos, cores da marca
            </p>
          </Card>

          <Card className="p-6 bg-muted/30">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold mb-2">Solicite seus criativos</h3>
            <p className="text-sm text-muted-foreground">
              Nossa IA criará templates e campanhas personalizadas
            </p>
          </Card>
        </div>

        <Button size="lg" asChild>
          <Link href="/client/brands">
            <Plus className="mr-2 h-5 w-5" />
            Criar Minha Primeira Marca
          </Link>
        </Button>

        <p className="text-xs text-muted-foreground mt-6">
          Você será redirecionado para a página de marcas
        </p>
      </div>
    </Card>
  )
}
