"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Calculator, Clock, Zap, DollarSign, TrendingUp, Layers, Eye } from "lucide-react"

export default function ROICalculatorPage() {
  const [monthlyCreatives, setMonthlyCreatives] = useState(25)
  const [hoursPerCreative, setHoursPerCreative] = useState(6.4)
  const [hourlyRate, setHourlyRate] = useState(100)
  const [teamSize, setTeamSize] = useState(3)

  // Calculations
  const manualTimeMonth = monthlyCreatives * hoursPerCreative
  const aiReduction = 0.85 // 85% reduction
  const aiTimeMonth = manualTimeMonth * (1 - aiReduction)

  const grossSavings = (manualTimeMonth - aiTimeMonth) * hourlyRate
  const professionalPlanCost = 12500
  const netProfit = grossSavings - professionalPlanCost

  const monthsToPayback = professionalPlanCost / netProfit
  const daysToPayback = Math.ceil(monthsToPayback * 30)
  const roiFirstYear = ((netProfit * 12) / (professionalPlanCost * 12)) * 100

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
          Calculadora Interativa
        </Badge>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
          Calcule Seu ROI
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Descubra quanto tempo e dinheiro você pode economizar automatizando sua produção criativa com IA
        </p>
      </section>

      {/* Calculator */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Seus Dados</h2>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Criativos produzidos por mês
                </label>
                <Input
                  type="number"
                  value={monthlyCreatives}
                  onChange={(e) => setMonthlyCreatives(Number(e.target.value))}
                  placeholder="Número de peças criativas que sua equipe produz mensalmente"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Horas por criativo (manual)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={hoursPerCreative}
                  onChange={(e) => setHoursPerCreative(Number(e.target.value))}
                  placeholder="Tempo médio para criar uma peça do início ao fim"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Custo por hora (R$)
                </label>
                <Input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  placeholder="Custo médio da hora de trabalho criativo na sua empresa"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tamanho da equipe
                </label>
                <Input
                  type="number"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  placeholder="Número de pessoas envolvidas na produção criativa"
                />
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">Com IA da ScaleBeam</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Redução média de 85% no tempo de produção + QA automático + Otimização contínua
                </p>
              </div>
            </div>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Retorno Sobre Investimento</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">ROI no Primeiro Ano</div>
                  <div className="text-5xl font-bold text-primary">
                    {roiFirstYear.toFixed(0)}%
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-2">Payback em</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{daysToPayback}</span>
                    <span className="text-lg text-muted-foreground">dias</span>
                  </div>
                </div>
              </div>
            </Card>

            {monthlyCreatives === 0 || hoursPerCreative === 0 || hourlyRate === 0 ? (
              <Card className="p-8 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Ajuste os valores acima para ver seu ROI personalizado
                </p>
              </Card>
            ) : (
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-6">Economia mensal</h3>

                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Economia bruta/mês</div>
                    <div className="text-3xl font-bold">
                      {grossSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <div className="text-sm font-medium mb-4">Detalhamento</div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Tempo manual (mês)</span>
                        </div>
                        <span className="font-medium">{manualTimeMonth.toFixed(0)}h</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="text-sm">Tempo com IA (mês)</span>
                        </div>
                        <span className="font-medium text-primary">{aiTimeMonth.toFixed(0)}h</span>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-border">
                        <span className="text-sm">Economia mensal</span>
                        <span className="font-bold">
                          {grossSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Investimento (Professional)</span>
                        <span className="text-muted-foreground">
                          {professionalPlanCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-border">
                        <span className="font-medium">Lucro líquido mensal</span>
                        <span className="font-bold text-primary">
                          {netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-24 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold mb-4">Como Conseguimos Esses Resultados?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Layers className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Orquestração Multi-IA</h3>
              <p className="text-muted-foreground">
                Combinamos múltiplos modelos de IA para máxima eficiência e qualidade
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">QA Automatizado</h3>
              <p className="text-muted-foreground">
                Validação visual e de conformidade automática em todas as peças
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Otimização Contínua</h3>
              <p className="text-muted-foreground">
                IA que aprende com performance real e melhora seus criativos
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
            Teste grátis por 14 dias e veja os resultados na prática
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Começar Teste Grátis</Link>
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
