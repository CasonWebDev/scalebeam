"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { Calculator, Users, Zap, TrendingUp, Layers, Eye, Target } from "lucide-react"

export default function ROICalculatorPage() {
  // Inputs
  const [currentFTEs, setCurrentFTEs] = useState(2)
  const [avgFTECost, setAvgFTECost] = useState(8000) // Custo mensal médio de um FTE junior/pleno
  const [campaignsNeeded, setCampaignsNeeded] = useState(3)

  // Constants based on pricing page
  const plans = {
    starter: {
      name: "Starter",
      price: 8000,
      setup: 6000,
      campaigns: 1,
      creatives: 300,
      fteEquivalent: { min: 0.5, max: 1 }
    },
    professional: {
      name: "Professional",
      price: 10000,
      setup: 6000,
      campaigns: 3,
      creatives: 750,
      fteEquivalent: { min: 1, max: 2 }
    },
    agency: {
      name: "Agency",
      price: 15000,
      setup: 6000,
      campaigns: 5,
      creatives: 2000,
      fteEquivalent: { min: 2, max: 4 }
    }
  }

  // Determine recommended plan based on campaigns needed
  const getRecommendedPlan = () => {
    if (campaignsNeeded <= 1) return plans.starter
    if (campaignsNeeded <= 3) return plans.professional
    return plans.agency
  }

  // Check if we have valid inputs
  const hasValidInputs = currentFTEs > 0 && avgFTECost > 0 && campaignsNeeded > 0

  const recommendedPlan = getRecommendedPlan()

  // Calculations
  const currentMonthlyCost = currentFTEs * avgFTECost
  const scalebeamMonthlyCost = recommendedPlan.price
  const monthlySavings = currentMonthlyCost - scalebeamMonthlyCost
  const annualSavings = monthlySavings * 12

  // FTE Replacement calculation
  const fteReplaced = recommendedPlan.fteEquivalent.min
  const potentialFTEReplaced = recommendedPlan.fteEquivalent.max

  // Payback calculation (including setup)
  const totalFirstYearInvestment = (recommendedPlan.price * 12) + recommendedPlan.setup
  const totalCurrentCost = currentMonthlyCost * 12
  const firstYearSavings = totalCurrentCost - totalFirstYearInvestment

  const paybackMonths = monthlySavings > 0
    ? Math.ceil(recommendedPlan.setup / monthlySavings)
    : 0

  // ROI calculation
  const roi = monthlySavings > 0
    ? ((annualSavings - recommendedPlan.setup) / totalFirstYearInvestment) * 100
    : 0

  // Cost per creative comparison
  const manualCostPerCreative = hasValidInputs ? currentMonthlyCost / (campaignsNeeded * 50) : 0 // Assuming ~50 creatives per campaign manually
  const scalebeamCostPerCreative = recommendedPlan.price / recommendedPlan.creatives

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
          Calculadora de Substituição de FTE
        </Badge>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
          Calcule Sua Economia em FTEs
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Descubra quantos FTEs de produção criativa você pode substituir com automação e quanto isso representa em economia real
        </p>
      </section>

      {/* Calculator */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Sua Operação Atual</h2>

            <div className="space-y-8">
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
                    Custo médio mensal por FTE (R$)
                  </Label>
                  <span className="text-2xl font-bold text-primary">
                    {avgFTECost.toLocaleString('pt-BR')}
                  </span>
                </div>
                <Slider
                  value={[avgFTECost]}
                  onValueChange={(value) => setAvgFTECost(value[0])}
                  min={0}
                  max={20000}
                  step={500}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  Inclua salário, encargos, benefícios e custos indiretos
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <Label className="text-sm font-medium">
                    Campanhas automatizadas necessárias
                  </Label>
                  <span className="text-2xl font-bold text-primary">{campaignsNeeded}</span>
                </div>
                <Slider
                  value={[campaignsNeeded]}
                  onValueChange={(value) => setCampaignsNeeded(value[0])}
                  min={0}
                  max={5}
                  step={1}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  Quantas campanhas de mídia você roda simultaneamente (Meta Ads, Google Ads)
                </p>
              </div>

              {hasValidInputs ? (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm">Plano Recomendado: {recommendedPlan.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {recommendedPlan.campaigns} campanha(s) automatizada(s) | Até {recommendedPlan.creatives.toLocaleString()} criativos/mês
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Ajuste os valores acima para ver a recomendação
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Equivalência em FTEs</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">FTEs que você pode substituir</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-primary">
                      {fteReplaced} - {potentialFTEReplaced}
                    </span>
                    <span className="text-lg text-muted-foreground">FTEs</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-2">Economia mensal estimada</div>
                  <div className="text-4xl font-bold">
                    {monthlySavings > 0
                      ? monthlySavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : 'R$ 0'
                    }
                  </div>
                  {monthlySavings <= 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Aumente os FTEs atuais para ver a economia
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6">Comparativo de Custos</h3>

              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">Custo atual (FTEs)</div>
                    <div className="text-2xl font-bold">
                      {currentMonthlyCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">Investimento ScaleBeam ({recommendedPlan.name})</div>
                    <div className="text-2xl font-bold text-primary">
                      {scalebeamMonthlyCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </div>
                  </div>
                  <Zap className="h-8 w-8 text-primary" />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Setup único</span>
                    <span>{recommendedPlan.setup.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payback do setup</span>
                    <span className="font-medium">
                      {paybackMonths > 0 ? `${paybackMonths} mês(es)` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Economia no 1o ano</span>
                    <span className="font-bold text-primary">
                      {firstYearSavings > 0
                        ? firstYearSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : '-'
                      }
                    </span>
                  </div>
                </div>

                {roi > 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-primary/10">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">ROI no primeiro ano</span>
                      <span className="text-2xl font-bold text-primary">{roi.toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-muted/50">
              <h4 className="font-medium mb-3">Custo por criativo</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Produção manual</div>
                  <div className="text-lg font-bold">
                    {manualCostPerCreative.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Com ScaleBeam</div>
                  <div className="text-lg font-bold text-primary">
                    {scalebeamCostPerCreative.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-24 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold mb-4">O Que Você Ganha Além da Economia</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Substituir FTEs por automação não é só sobre custo — é sobre previsibilidade e escala
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Previsibilidade</h3>
              <p className="text-muted-foreground">
                Sabe exatamente quantos criativos recebe por mês, sem variação de produtividade
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">QA Automático</h3>
              <p className="text-muted-foreground">
                Elimina 80% dos retrabalhos com validação visual e de conformidade automática
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Layers className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Consistência Visual</h3>
              <p className="text-muted-foreground">
                Brand System ilimitado garante identidade visual em todos os criativos
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center bg-gradient-to-br from-primary/10 to-primary/5">
          <h2 className="text-4xl font-semibold mb-4">Pronto para Substituir FTEs por Automação?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Fale com nosso time e descubra como escalar sua produção criativa com previsibilidade
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
