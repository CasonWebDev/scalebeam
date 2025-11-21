"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { useTransition } from "react"

interface Brand {
  id: string
  name: string
}

export function ProjectsFiltersForm({ brands }: { brands: Brand[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    startTransition(() => {
      router.push(`/client/projects?${params.toString()}`)
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="flex items-center gap-2 border rounded-lg px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar projetos..."
          className="border-0 shadow-none focus-visible:ring-0"
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => updateFilters("search", e.target.value)}
        />
      </div>

      <Select
        defaultValue={searchParams.get("status") || "all"}
        onValueChange={(value) => updateFilters("status", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="DRAFT">Rascunho</SelectItem>
          <SelectItem value="IN_PRODUCTION">Em Produção</SelectItem>
          <SelectItem value="READY">Pronto</SelectItem>
          <SelectItem value="APPROVED">Aprovado</SelectItem>
          <SelectItem value="REVISION">Revisão</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("brand") || "all"}
        onValueChange={(value) => updateFilters("brand", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por marca" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as marcas</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
