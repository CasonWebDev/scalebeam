import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Check, Zap, Building2, Target, TrendingDown, Users, ShieldCheck, Palette, Clock } from "lucide-react"

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
          <Target className="h-3 w-3 mr-1" />
          Capacidade Operacional Mensal
        </Badge>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
          Infraestrutura Criativa Sob Demanda
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Não vendemos criativos avulsos. Entregamos capacidade operacional: volume, velocidade, campanhas automatizadas e QA integrado — tudo que você precisa para substituir FTEs e escalar com previsibilidade.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {/* Starter */}
          <Card className="p-8 relative flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-2xl font-semibold">Starter</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Para equipes que precisam reduzir custo por criativo e escalar campanhas previsíveis.
            </p>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R$ 8.000</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Setup: R$ 6.000</p>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Capacidade Operacional Mensal</p>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Até 300 criativos</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Até 3 campanhas automatizadas ativas</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Fila compartilhada</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>QA visual automatizado</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Armazenamento 5GB/ano</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Brand System ilimitado</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Suporte por e-mail</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>SLA de entrega de lote</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Adicional: R$ 4,40/criativo extra</span>
              </li>
            </ul>

            <div className="bg-muted/50 rounded-lg p-3 mb-6">
              <p className="text-xs text-muted-foreground">
                <strong>Equivalente:</strong> Substitui 0,5 a 1 FTE de produção repetitiva + reduz variação de qualidade
              </p>
            </div>

            <Button className="w-full mt-auto" asChild>
              <Link href="/signup">Começar Agora</Link>
            </Button>
          </Card>

          {/* Professional */}
          <Card className="p-8 relative border-primary shadow-lg flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge>Mais Popular</Badge>
            </div>
            <div className="flex items-center gap-2 mb-6 pt-2">
              <Zap className="h-5 w-5 text-primary" />
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-2xl font-semibold">Professional</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Para operações que rodam múltiplas campanhas, com exigência de consistência e ritmo alto.
            </p>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R$ 10.000</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Setup: R$ 6.000</p>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Capacidade Operacional Mensal</p>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Até 750 criativos</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Até 5 campanhas automatizadas ativas</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Fila semidedicada</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>QA visual avançado com histórico</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Auditoria de versões</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Armazenamento 25GB/ano</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Brand System ilimitado</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Suporte por Slack</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>SLA avançado</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Adicional: R$ 3,10/criativo extra</span>
              </li>
            </ul>

            <div className="bg-primary/10 rounded-lg p-3 mb-6">
              <p className="text-xs text-muted-foreground">
                <strong>Equivalente:</strong> Substitui 1 a 2 FTEs, reduz lead time de campanhas e estabiliza a margem operacional
              </p>
            </div>

            <Button className="w-full mt-auto" asChild>
              <Link href="/signup">Solicitar Demo</Link>
            </Button>
          </Card>

          {/* Agency - Em Breve */}
          <Card className="p-8 relative flex flex-col opacity-75 border-dashed">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Em Breve
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-6 pt-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-2xl font-semibold text-muted-foreground">Agency</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Para operações com múltiplos clientes internos ou externos que exigem volume e repetibilidade.
            </p>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-muted-foreground">R$ 15.000</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Setup: R$ 6.000</p>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Capacidade Operacional Mensal</p>
            </div>

            <ul className="space-y-3 mb-6 flex-1 text-muted-foreground">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 flex-shrink-0" />
                <span>Até 2.000 criativos</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 flex-shrink-0" />
                <span>Até 10 campanhas automatizadas ativas</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 flex-shrink-0" />
                <span>Fila dedicada</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 flex-shrink-0" />
                <span>API completa para integrações</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 flex-shrink-0" />
                <span>QA automatizado + auditoria avançada</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 flex-shrink-0" />
                <span>Armazenamento 50GB/ano</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 flex-shrink-0" />
                <span>Suporte por Slack dedicado</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 flex-shrink-0" />
                <span>Treinamento mensal incluído</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 flex-shrink-0" />
                <span>Adicional: R$ 2,80/criativo extra</span>
              </li>
            </ul>

            <div className="bg-muted/50 rounded-lg p-3 mb-6">
              <p className="text-xs text-muted-foreground">
                <strong>Equivalente:</strong> Substitui 2 a 4 FTEs, multiplica a produção e reduz custo marginal por criativo
              </p>
            </div>

            <Button className="w-full mt-auto" variant="outline" disabled>
              Em Breve
            </Button>
          </Card>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="container mx-auto px-4 py-16 border-y border-border">
        <h3 className="text-2xl font-semibold text-center mb-4">O que o executivo realmente compra</h3>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Não vendemos plataforma. Vendemos resultados operacionais mensuráveis.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h4 className="font-semibold mb-2">Previsibilidade</h4>
            <p className="text-xs text-muted-foreground">
              Você sabe quantos criativos recebe e em qual velocidade
            </p>
          </Card>
          <Card className="p-6 text-center">
            <TrendingDown className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h4 className="font-semibold mb-2">Custo Decrescente</h4>
            <p className="text-xs text-muted-foreground">
              Quanto mais usa, mais barato fica cada peça
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h4 className="font-semibold mb-2">Substituição de FTE</h4>
            <p className="text-xs text-muted-foreground">
              Não precisa contratar 3 júniores para dar vazão
            </p>
          </Card>
          <Card className="p-6 text-center">
            <ShieldCheck className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h4 className="font-semibold mb-2">Redução de Erro</h4>
            <p className="text-xs text-muted-foreground">
              QA automático mata 80% dos retrabalhos
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Palette className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h4 className="font-semibold mb-2">Consistência Visual</h4>
            <p className="text-xs text-muted-foreground">
              Brand System ilimitado garante identidade
            </p>
          </Card>
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
              <h4 className="font-semibold mb-2">O que é Capacidade Operacional Mensal (COM)?</h4>
              <p className="text-sm text-muted-foreground">
                É a soma do volume máximo de criativos, velocidade de entrega, campanhas automatizadas ativas e recursos de QA/automação. Pense como infraestrutura criativa, não produção unitária.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-2">Posso mudar de plano a qualquer momento?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode fazer upgrade do seu plano a qualquer momento. As alterações entram em vigor imediatamente.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-2">Como funciona o setup?</h4>
              <p className="text-sm text-muted-foreground">
                O setup inclui onboarding, configuração do Brand System, criação das campanhas automatizadas iniciais e treinamento da equipe. É um investimento único que garante adoção eficiente.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-2">O que é uma campanha automatizada?</h4>
              <p className="text-sm text-muted-foreground">
                Uma campanha automatizada é um conjunto completo de regras visuais, variações criativas, integrações e orquestração de IA aplicados a um objetivo específico de mídia. Cada campanha gera múltiplos criativos automaticamente para Meta Ads e Google Ads.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-2">Quais plataformas de mídia são suportadas?</h4>
              <p className="text-sm text-muted-foreground">
                Atualmente suportamos Meta Ads e Google Ads. Em breve adicionaremos TikTok Ads, Amazon Ads, LinkedIn Ads e outras plataformas.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-2">O que significa "Brand System ilimitado"?</h4>
              <p className="text-sm text-muted-foreground">
                Você pode cadastrar quantas marcas, paletas de cores, tipografias e guidelines quiser. Isso garante consistência visual em todos os criativos gerados.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-2">Quais formas de pagamento vocês aceitam?</h4>
              <p className="text-sm text-muted-foreground">
                Aceitamos cartão de crédito, PIX e faturamento corporativo, mediante Nota Fiscal emitida.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center bg-gradient-to-br from-primary/10 to-primary/5">
          <h2 className="text-4xl font-semibold mb-4">Pronto para Escalar?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Substitua produção manual por capacidade operacional previsível. Fale com nosso time e descubra quanto você pode economizar.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Solicitar Demo</Link>
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
