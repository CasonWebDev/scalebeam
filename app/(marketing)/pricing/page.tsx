import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Check, Sparkles } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-[300] tracking-tight">ScaleBeam</Link>
            <Badge variant="secondary" className="text-xs">BETA</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground">Recursos</Link>
            <Link href="/roi-calculator" className="text-sm text-muted-foreground hover:text-foreground">ROI</Link>
            <Link href="/pricing" className="text-sm font-medium">Planos</Link>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <Badge variant="outline" className="mb-6">
          <Sparkles className="h-3 w-3 mr-1" />
          Preços Simples e Transparentes
        </Badge>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
          Escolha o Plano Ideal
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comece gratuitamente e escale conforme seu crescimento. Todos os planos incluem 14 dias de teste grátis.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
          {/* Starter */}
          <Card className="p-8 relative flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-2">Starter</h3>
              <p className="text-sm text-muted-foreground">Para equipes com automação criativa</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R$ 6.000</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">+ Setup: R$ 17.500</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Até 300 criativos/mês</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Máximo 1 marca</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Orquestração Multi-IA básica</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>QA Visual automatizado</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Templates pré-configurados</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Integrações essenciais</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Dashboard de performance</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Suporte por email</span>
              </li>
            </ul>
            <Button className="w-full mt-auto" asChild>
              <Link href="/signup">Começar Agora</Link>
            </Button>
          </Card>

          {/* Professional */}
          <Card className="p-8 relative border-primary shadow-lg flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge>Mais Popular</Badge>
            </div>
            <div className="mb-6 pt-2">
              <h3 className="text-2xl font-semibold mb-2">Professional</h3>
              <p className="text-sm text-muted-foreground">Para agilidade com crescimento escalável</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R$ 12.500</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">+ Setup: R$ 42.500</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Até 750 criativos/mês</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Máximo 3 marcas</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-medium">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Tudo do Starter, mais:</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>White-label completo</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Treinamento de IA personalizado</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Integrações avançadas (Meta, Google)</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Workflows personalizados</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Treinamento mensal do time</span>
              </li>
            </ul>
            <Button className="w-full mt-auto" asChild>
              <Link href="/signup">Solicitar Demo</Link>
            </Button>
          </Card>

          {/* Agency */}
          <Card className="p-8 relative flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-2">Agency</h3>
              <p className="text-sm text-muted-foreground">Para agências escaláveis e produção focada</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R$ 25.000</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">+ Setup: R$ 85.000</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Até 2.000 criativos/mês</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Até 10 marcas</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-medium">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Tudo do Professional, mais:</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Gerente de conta dedicado</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>SLA premium</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Suporte 24/7</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Consultoria estratégica mensal</span>
              </li>
            </ul>
            <Button className="w-full mt-auto" asChild>
              <Link href="/signup">Solicitar Demo</Link>
            </Button>
          </Card>

          {/* Enterprise */}
          <Card className="p-8 relative bg-secondary/30 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
              <p className="text-sm text-muted-foreground">Para soluções sob medida, compliance e infraestrutura dedicada</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">Customizado</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Preços e setup personalizados</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Criativos ilimitados</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Marcas ilimitadas</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-medium">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Tudo da Agency, mais:</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Infraestrutura dedicada</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Compliance e segurança avançada</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Integração com sistemas internos</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Customer Success Manager dedicado</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Análise de ROI exclusiva</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Roadmap prioritário</span>
              </li>
            </ul>
            <Button className="w-full mt-auto" variant="outline" asChild>
              <Link href="/signup">Falar com Vendas</Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* All Plans Include */}
      <section className="container mx-auto px-4 py-16 border-y border-border">
        <h3 className="text-2xl font-semibold text-center mb-12">Todos os planos incluem:</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">83%</div>
            <div className="text-sm text-muted-foreground">Margem bruta média</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">6-9 meses</div>
            <div className="text-sm text-muted-foreground">CAC Payback</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">&lt;5%</div>
            <div className="text-sm text-muted-foreground">Churn anual</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold mb-4">Perguntas Frequentes</h2>
            <p className="text-muted-foreground">Tudo que você precisa saber sobre nossos planos</p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="font-semibold mb-2">Posso mudar de plano a qualquer momento?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações entram em vigor imediatamente.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-2">Como funciona o teste grátis de 14 dias?</h4>
              <p className="text-sm text-muted-foreground">
                Você pode testar todos os recursos do plano Professional gratuitamente por 14 dias. Não é necessário cartão de crédito para começar.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-2">Quais formas de pagamento vocês aceitam?</h4>
              <p className="text-sm text-muted-foreground">
                Aceitamos cartão de crédito, PIX e faturamento corporativo (apenas para planos Enterprise).
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h4>
              <p className="text-sm text-muted-foreground">
                Sim, você pode cancelar seu plano a qualquer momento sem multas ou taxas adicionais.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-2">Há desconto para pagamento anual?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Oferecemos 20% de desconto para pagamentos anuais em todos os planos pagos.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center bg-gradient-to-br from-primary/10 to-primary/5">
          <h2 className="text-4xl font-semibold mb-4">Pronto para Começar?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de empresas que já estão transformando sua produção criativa com IA
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Começar Teste Grátis de 14 Dias</Link>
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xl font-[300] tracking-tight">ScaleBeam</Link>
              <Badge variant="secondary" className="text-xs">BETA</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 ScaleBeam. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
