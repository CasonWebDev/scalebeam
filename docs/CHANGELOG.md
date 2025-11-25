# Changelog

## [Unreleased]

### Adicionado
- Sistema de feedback granular por criativo via `CreativeFeedback`
- Badges visuais para indicar criativos com feedback pendente
- Documentação completa do projeto em `/docs`

### Modificado
- Separação clara de métricas entre Campanhas e Templates
- Simplificação do dashboard do cliente (removida seção de marcas)
- Interface de marcas no admin agora usa tabela CRUD simplificada
- Dashboards agora focam em funcionalidades principais

### Removido
- Sistema de tracking de status de campanhas, criativos e templates
- Seção "Minhas Marcas" do dashboard do cliente
- Métricas baseadas em status
- Comentários gerais em projetos (substituídos por feedback específico)

## [2024-11-24] - Simplificação da Interface

### Removido
- **Status Tracking**: Removidos indicadores de status em todas as páginas
  - `app/admin/campaigns/page.tsx`: Removida coluna Status
  - `app/admin/templates/page.tsx`: Removido badge de status
  - `app/admin/template-requests/[id]/page.tsx`: Removido status de template
  - `app/client/page.tsx`: Removidas métricas baseadas em status

### Modificado
- **Dashboards Simplificados**:
  - Admin: 4 cards de métricas + campanhas recentes
  - Client: 4 cards de métricas + campanhas recentes (sem seção de marcas)

- **Separação de Métricas**:
  - `totalCampaigns`: Conta apenas projetos com `projectType: "CAMPAIGN"`
  - `totalTemplates`: Conta templates da tabela Template
  - `totalTemplateRequests`: Conta projetos com `projectType: "TEMPLATE_CREATION"`

- **CRUD de Marcas (Admin)**:
  - Convertido de client component para server component
  - Removidas features complexas (grid/list toggle, filtros, volume tracking)
  - Adicionadas colunas: Campanhas e Templates (separadas)
  - Layout tabular simples e consistente

- **CRUD de Marcas (Client)**:
  - Grid de cards mantido conforme solicitado
  - Adicionadas 3 colunas de métricas: Campanhas, Templates, Assets

### Adicionado
- **Sistema de Feedback por Criativo**:
  - Model `CreativeFeedback` no Prisma
  - Endpoint `/api/projects/[id]/request-revision` atualizado
  - Suporte a múltiplos criativos selecionados
  - Badges visuais em criativos com feedback
  - Exibição de feedbacks no hover

## [2024-11-23] - Implementação Inicial

### Adicionado
- Estrutura inicial do projeto Next.js 15
- Configuração do Prisma com PostgreSQL
- Autenticação com Auth.js (NextAuth v5)
- Models principais: User, Organization, Brand, Project, Template, Creative, Asset
- Área administrativa completa
- Área do cliente
- Sistema de upload de criativos
- Sistema de upload de assets
- Dashboard com métricas
- CRUD de organizações
- CRUD de templates
- Sistema de comentários em projetos
- Logs de atividade

### Características
- Server Components para performance
- Type-safe com TypeScript
- UI moderna com shadcn/ui
- Responsive design com Tailwind
- Validação com Zod
- Formatação de datas com date-fns (pt-BR)

## Notas de Migração

### Para atualizar de versões anteriores:

1. Executar migrations do Prisma:
```bash
npx prisma migrate dev
```

2. Atualizar dados existentes se necessário:
```bash
npx tsx scripts/update-data.ts
```

3. Limpar cache do Next.js:
```bash
rm -rf .next
npm run dev
```

## Roadmap

### Próximas Versões

#### v1.1 (Planejado)
- [ ] Integração com APIs de IA (OpenAI, Midjourney)
- [ ] Sistema de notificações em tempo real
- [ ] Webhooks para eventos importantes
- [ ] Exportação de relatórios em PDF

#### v1.2 (Planejado)
- [ ] Sistema de templates customizáveis
- [ ] Editor de criativos inline
- [ ] Versionamento de criativos
- [ ] Colaboração em tempo real

#### v2.0 (Planejado)
- [ ] Suporte multi-idioma
- [ ] Analytics avançados
- [ ] Integrações com plataformas de ads (Meta, Google)
- [ ] API pública com rate limiting
