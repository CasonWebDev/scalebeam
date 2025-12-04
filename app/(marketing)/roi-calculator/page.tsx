"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { Calculator, Users, Target } from "lucide-react"

export default function ROICalculatorPage() {
  // Inputs
  const [currentFTEs, setCurrentFTEs] = useState(2)
  const [baseSalary, setBaseSalary] = useState(5000) // Salário base SP
  const [campaignsNeeded, setCampaignsNeeded] = useState(2)

  // Multiplicador de custo operacional (encargos ~80% + benefícios ~20% + infra ~20% = ~2x)
  const OPERATIONAL_MULTIPLIER = 2
  const avgFTECost = baseSalary * OPERATIONAL_MULTIPLIER

  // Planos com campanhas disponíveis
  const plans = [
    {
      name: "Starter",
      price: 8000,
      setup: 6000,
      campaigns: 3,
      creatives: 300,
      fteReplacement: 0.5 // Substitui meio FTE
    },
    {
      name: "Professional",
      price: 10000,
      setup: 6000,
      campaigns: 5,
      creatives: 750,
      fteReplacement: 1.5 // Substitui 1.5 FTEs
    },
    {
      name: "Agency",
      price: 15000,
      setup: 6000,
      campaigns: 10,
      creatives: 2000,
      fteReplacement: 3 // Substitui 3 FTEs
    }
  ]

  // Custo atual da operação
  const currentMonthlyCost = currentFTEs * avgFTECost

  // Calcula economia para cada plano
  const calculatePlanEconomics = (plan: typeof plans[0]) => {
    // Comparação direta: Custo da equipe vs Custo ScaleBeam
    const monthlySavings = currentMonthlyCost - plan.price

    // Economia anual (descontando setup no primeiro ano)
    const annualSavings = (monthlySavings * 12) - plan.setup

    // Payback em meses (se houver economia)
    const paybackMonths = monthlySavings > 0
      ? Math.ceil(plan.setup / monthlySavings)
      : null

    return {
      ...plan,
      monthlySavings,
      annualSavings,
      paybackMonths,
      isViable: monthlySavings > 0
    }
  }

  // Calcula para todos os planos
  const planResults = plans.map(calculatePlanEconomics)

  // Filtra planos que atendem às campanhas necessárias
  const eligiblePlans = planResults.filter(p => p.campaigns >= campaignsNeeded)

  // Encontra o melhor plano elegível (maior economia anual positiva)
  const viablePlans = eligiblePlans.filter(p => p.isViable && p.annualSavings > 0)
  const bestPlan = viablePlans.length > 0
    ? viablePlans.reduce((best, current) =>
        current.annualSavings > best.annualSavings ? current : best
      )
    : null

  // Plano mínimo necessário (baseado em campanhas)
  const minimumPlan = eligiblePlans.length > 0 ? eligiblePlans[0] : null

  const hasValidInputs = currentFTEs > 0 && baseSalary > 0 && campaignsNeeded > 0

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
            <Link href="/roi-calculator" className="text-sm font-medium">ROI</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Planos</Link>
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
          <Calculator className="h-3 w-3 mr-1" />
          Calculadora de ROI
        </Badge>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
          Quanto Você Economiza com ScaleBeam?
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Informe sua estrutura atual e veja quanto pode economizar substituindo parte da equipe por automação
        </p>
      </section>

      {/* Calculator */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Inputs */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Sua Operação Atual</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between mb-3">
                  <Label className="text-sm font-medium">
                    FTEs dedicados à produção criativa
                  </Label>
                  <span className="text-2xl font-bold text-primary">{currentFTEs}</span>
                </div>
                <Slider
                  value={[currentFTEs]}
                  onValueChange={(value) => setCurrentFTEs(value[0])}
                  min={0}
                  max={10}
                  step={1}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  Designers, produtores e coordenadores envolvidos na criação de peças
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <Label className="text-sm font-medium">
                    Salário base mensal (R$)
                  </Label>
                  <span className="text-2xl font-bold text-primary">
                    {baseSalary.toLocaleString('pt-BR')}
                  </span>
                </div>
                <Slider
                  value={[baseSalary]}
                  onValueChange={(value) => setBaseSalary(value[0])}
                  min={3000}
                  max={15000}
                  step={500}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  Referência: Designer/Produtor criativo em São Paulo
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between mb-3">
                  <Label className="text-sm font-medium">
                    Campanhas ativas necessárias
                  </Label>
                  <span className="text-2xl font-bold text-primary">{campaignsNeeded}</span>
                </div>
                <Slider
                  value={[campaignsNeeded]}
                  onValueChange={(value) => setCampaignsNeeded(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  Quantas campanhas de mídia você precisa rodar simultaneamente (Meta Ads, Google Ads)
                </p>
              </div>
            </div>

            {hasValidInputs && (
              <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Custo operacional por FTE</span>
                  <span>
                    R$ {baseSalary.toLocaleString('pt-BR')} × 2 = <strong>R$ {avgFTECost.toLocaleString('pt-BR')}</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Custo mensal total da operação</span>
                  <span className="text-2xl font-bold">
                    {currentMonthlyCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Multiplicador 2x inclui: encargos trabalhistas (~80%), benefícios (~20%) e infraestrutura (~20%)
                </p>
              </div>
            )}
          </Card>

          {/* Results */}
          {hasValidInputs ? (
            <>
              {/* Best Plan Highlight */}
              {bestPlan && (
                <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">Melhor Opção: {bestPlan.name}</h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Economia mensal</div>
                      <div className="text-3xl font-bold text-primary">
                        {bestPlan.monthlySavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Economia no 1º ano</div>
                      <div className="text-3xl font-bold">
                        {bestPlan.annualSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Payback do setup</div>
                      <div className="text-3xl font-bold">
                        {bestPlan.paybackMonths} {bestPlan.paybackMonths === 1 ? 'mês' : 'meses'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-primary/20">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Capacidade equivalente a <strong>{bestPlan.fteReplacement}</strong> FTE(s)</span>
                      </div>
                      <span className="text-muted-foreground">|</span>
                      <span>Até <strong>{bestPlan.creatives.toLocaleString()}</strong> criativos/mês</span>
                    </div>
                  </div>
                </Card>
              )}

              {!bestPlan && minimumPlan && (
                <Card className="p-8 mb-8 bg-muted/50">
                  <div className="text-center space-y-2">
                    <p className="font-medium">
                      Para {campaignsNeeded} campanha(s), o plano mínimo é o <strong>{minimumPlan.name}</strong> (R$ {minimumPlan.price.toLocaleString('pt-BR')}/mês)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Com a estrutura atual, o ScaleBeam não gera economia imediata.
                      Considere aumentar os FTEs ou o salário base para ver cenários de economia.
                    </p>
                  </div>
                </Card>
              )}

              {!bestPlan && !minimumPlan && (
                <Card className="p-8 mb-8 bg-muted/50">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Nenhum plano atende à quantidade de campanhas necessárias.
                    </p>
                  </div>
                </Card>
              )}

              {/* All Plans Comparison */}
              <h3 className="text-xl font-semibold mb-4">Comparativo por Plano</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {planResults.map((plan) => {
                  const meetsRequirements = plan.campaigns >= campaignsNeeded
                  return (
                  <Card
                    key={plan.name}
                    className={`p-6 ${plan === bestPlan ? 'ring-2 ring-primary' : ''} ${!meetsRequirements ? 'opacity-50' : !plan.isViable ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{plan.name}</h4>
                      {plan === bestPlan && (
                        <Badge variant="default" className="text-xs">Recomendado</Badge>
                      )}
                      {!meetsRequirements && (
                        <Badge variant="outline" className="text-xs">Insuficiente</Badge>
                      )}
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mensalidade</span>
                        <span>{plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Substitui</span>
                        <span>{plan.fteReplacement} FTE(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Campanhas</span>
                        <span>{plan.campaigns}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Criativos/mês</span>
                        <span>{plan.creatives.toLocaleString()}</span>
                      </div>

                      <div className="pt-3 border-t border-border">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Economia mensal</span>
                          <span className={`font-bold ${plan.monthlySavings > 0 ? 'text-primary' : 'text-destructive'}`}>
                            {plan.monthlySavings > 0 ? '+' : ''}{plan.monthlySavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )})}
              </div>

              {/* Explanation */}
              <Card className="p-6 mt-8 bg-muted/30">
                <h4 className="font-semibold mb-3">Como calculamos</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Custo operacional:</strong> Salário base × 2 (encargos + benefícios + infra)</p>
                  <p><strong>Custo atual:</strong> {currentFTEs} FTEs × R$ {avgFTECost.toLocaleString('pt-BR')} = R$ {currentMonthlyCost.toLocaleString('pt-BR')}/mês</p>
                  <p><strong>Economia mensal:</strong> Custo operacional atual - Mensalidade ScaleBeam</p>
                  <p><strong>Economia anual:</strong> (Economia mensal × 12) - Setup único de R$ 6.000</p>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Ajuste os valores acima para ver a análise de economia
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center bg-gradient-to-br from-primary/10 to-primary/5">
          <h2 className="text-4xl font-semibold mb-4">Quer Validar Esses Números?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Fale com nosso time para uma análise personalizada da sua operação
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Solicitar Demo</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">Ver Planos</Link>
            </Button>
          </div>
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
