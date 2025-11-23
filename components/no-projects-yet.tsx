import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Rocket, Plus, Upload, Zap } from "lucide-react"
import Link from "next/link"

interface Brand {
  id: string
  name: string
}

interface NoProjectsYetProps {
  brands: Brand[]
}

export function NoProjectsYet({ brands }: NoProjectsYetProps) {
  const firstBrand = brands[0]

  return (
    <Card className="max-w-3xl mx-auto mt-20 p-12">
      <div className="text-center">
        <Rocket className="h-16 w-16 mx-auto text-primary mb-6" />
        <h1 className="text-3xl font-bold mb-4">
          Pronto para começar?
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Você já tem {brands.length} marca{brands.length > 1 ? 's' : ''} cadastrada{brands.length > 1 ? 's' : ''}.
          Agora é hora de solicitar seus primeiros criativos!
        </p>

        <div className="grid gap-6 md:grid-cols-2 mb-8 text-left">
          <Card className="p-6 bg-muted/30">
            <div className="bg-blue-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">1. Adicione assets da marca</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Faça upload do logo, fotos de produtos e outros materiais da sua marca
            </p>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href={`/client/brands/${firstBrand.id}/assets`}>
                <Upload className="mr-2 h-4 w-4" />
                Ir para Assets
              </Link>
            </Button>
          </Card>

          <Card className="p-6 bg-muted/30">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">2. Crie sua primeira campanha</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Nossa IA gerará criativos personalizados automaticamente
            </p>
            <Button size="sm" asChild className="w-full">
              <Link href="/client/campaigns/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar Campanha
              </Link>
            </Button>
          </Card>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Dica:</strong> Quanto mais assets você fornecer (logos, fotos, cores da marca),
            melhores serão os criativos gerados pela nossa IA!
          </p>
        </div>
      </div>
    </Card>
  )
}
