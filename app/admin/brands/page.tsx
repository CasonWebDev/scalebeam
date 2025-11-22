"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"
import { LayoutGrid, List, Search, TrendingUp, Clock, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

type Brand = {
  id: string
  name: string
  logoUrl: string | null
  primaryColor: string | null
  secondaryColor: string | null
  organization: {
    name: string
    plan: string
    maxCreatives: number
  }
  _count: {
    projects: number
    assets: number
  }
  projects: Array<{
    id: string
    createdAt: Date
    updatedAt: Date
    _count: {
      creatives: number
    }
  }>
}

const planConfig: Record<string, { label: string; color: string }> = {
  STARTER: { label: "Starter", color: "bg-blue-500" },
  PROFESSIONAL: { label: "Professional", color: "bg-purple-500" },
  AGENCY: { label: "Agency", color: "bg-amber-500" },
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "client" | "volume" | "aging">("name")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    filterAndSortBrands()
  }, [brands, searchTerm, sortBy])

  async function fetchBrands() {
    try {
      const response = await fetch("/api/admin/brands")
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error("Error fetching brands:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterAndSortBrands() {
    let filtered = brands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.organization.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "client":
          return a.organization.name.localeCompare(b.organization.name)
        case "volume":
          const volumeA = getTotalCreatives(a) / a.organization.maxCreatives
          const volumeB = getTotalCreatives(b) / b.organization.maxCreatives
          return volumeB - volumeA
        case "aging":
          const lastA = getLastProjectDate(a)
          const lastB = getLastProjectDate(b)
          if (!lastA) return 1
          if (!lastB) return -1
          return lastB.getTime() - lastA.getTime()
        default:
          return 0
      }
    })

    setFilteredBrands(filtered)
  }

  function getTotalCreatives(brand: Brand) {
    return brand.projects.reduce((sum, project) => sum + project._count.creatives, 0)
  }

  function getLastProjectDate(brand: Brand): Date | null {
    if (brand.projects.length === 0) return null
    const dates = brand.projects.map((p) => new Date(p.updatedAt))
    return new Date(Math.max(...dates.map((d) => d.getTime())))
  }

  function getVolumePercentage(brand: Brand) {
    const total = getTotalCreatives(brand)
    const max = brand.organization.maxCreatives
    return Math.min((total / max) * 100, 100)
  }

  function getVolumeColor(percentage: number) {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-amber-500"
    return "bg-green-500"
  }

  function getAgingColor(date: Date | null) {
    if (!date) return "text-muted-foreground"
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days > 30) return "text-red-500"
    if (days > 14) return "text-amber-500"
    return "text-green-500"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Marcas</h1>
          <p className="text-muted-foreground mt-1">{filteredBrands.length} marcas cadastradas</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por marca ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome da Marca</SelectItem>
              <SelectItem value="client">Cliente</SelectItem>
              <SelectItem value="volume">Volume Usado</SelectItem>
              <SelectItem value="aging">Última Geração</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Brands Display */}
      {viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBrands.map((brand) => {
            const planCfg = planConfig[brand.organization.plan]
            const totalCreatives = getTotalCreatives(brand)
            const volumePercentage = getVolumePercentage(brand)
            const lastProjectDate = getLastProjectDate(brand)
            const volumeColor = getVolumeColor(volumePercentage)
            const agingColor = getAgingColor(lastProjectDate)

            return (
              <Card key={brand.id} className="p-6 hover:bg-secondary/50 transition-colors relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteConfirmationDialog
                    resourceType="Marca"
                    resourceName={brand.name}
                    endpoint={`/api/admin/brands/${brand.id}`}
                    onSuccess={fetchBrands}
                  />
                </div>
                <div className="flex items-start gap-4 mb-4">
                  {brand.logoUrl && (
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-lg border border-border overflow-hidden bg-muted">
                      <Image src={brand.logoUrl} alt={brand.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{brand.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{brand.organization.name}</p>
                    <div className="mt-2">
                      <Badge variant="outline">{planCfg.label}</Badge>
                    </div>
                  </div>
                </div>

                {/* Volume Meter */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Volume Mensal</span>
                    <span className="font-medium">
                      {totalCreatives} / {brand.organization.maxCreatives}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${volumeColor} transition-all`} style={{ width: `${volumePercentage}%` }} />
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {volumePercentage >= 90 && (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-500">Volume crítico</span>
                      </>
                    )}
                    {volumePercentage >= 70 && volumePercentage < 90 && (
                      <>
                        <TrendingUp className="h-3 w-3 text-amber-500" />
                        <span className="text-xs text-amber-500">Atenção ao volume</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Last Generation (Aging) */}
                <div className="flex items-center gap-2 text-sm mb-4">
                  <Clock className={`h-4 w-4 ${agingColor}`} />
                  <span className="text-muted-foreground">Última geração:</span>
                  <span className={`font-medium ${agingColor}`}>
                    {lastProjectDate ? formatDistanceToNow(lastProjectDate, { addSuffix: true, locale: ptBR }) : "Nunca"}
                  </span>
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Projetos</span>
                    <p className="text-lg font-semibold">{brand._count.projects}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Assets</span>
                    <p className="text-lg font-semibold">{brand._count.assets}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {filteredBrands.map((brand) => {
              const planCfg = planConfig[brand.organization.plan]
              const totalCreatives = getTotalCreatives(brand)
              const volumePercentage = getVolumePercentage(brand)
              const lastProjectDate = getLastProjectDate(brand)
              const volumeColor = getVolumeColor(volumePercentage)
              const agingColor = getAgingColor(lastProjectDate)

              return (
                <div key={brand.id} className="p-6 hover:bg-secondary/50 transition-colors group">
                  <div className="flex items-center gap-6">
                    {/* Logo */}
                    {brand.logoUrl && (
                      <div className="relative h-12 w-12 flex-shrink-0 rounded-lg border border-border overflow-hidden bg-muted">
                        <Image src={brand.logoUrl} alt={brand.name} fill className="object-cover" />
                      </div>
                    )}

                    {/* Brand Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{brand.name}</h3>
                      <p className="text-sm text-muted-foreground">{brand.organization.name}</p>
                    </div>

                    {/* Plan */}
                    <div className="hidden md:block">
                      <Badge variant="outline">{planCfg.label}</Badge>
                    </div>

                    {/* Volume */}
                    <div className="w-48 hidden lg:block">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Volume</span>
                        <span className="font-medium">
                          {totalCreatives}/{brand.organization.maxCreatives}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${volumeColor}`} style={{ width: `${volumePercentage}%` }} />
                      </div>
                    </div>

                    {/* Aging */}
                    <div className="w-40 hidden xl:flex items-center gap-2 text-sm">
                      <Clock className={`h-4 w-4 ${agingColor}`} />
                      <span className={`font-medium ${agingColor}`}>
                        {lastProjectDate ? formatDistanceToNow(lastProjectDate, { addSuffix: true, locale: ptBR }) : "Nunca"}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex gap-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{brand._count.projects}</div>
                        <div className="text-xs text-muted-foreground">Projetos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{brand._count.assets}</div>
                        <div className="text-xs text-muted-foreground">Assets</div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DeleteConfirmationDialog
                        resourceType="Marca"
                        resourceName={brand.name}
                        endpoint={`/api/admin/brands/${brand.id}`}
                        onSuccess={fetchBrands}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
