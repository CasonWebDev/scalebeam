# ScaleBeam - Plataforma de Geração de Criativos com IA

## Visão Geral

ScaleBeam é uma plataforma SaaS para geração automatizada de criativos publicitários usando IA. A plataforma permite que clientes criem campanhas, façam upload de assets de marca e recebam criativos personalizados gerados por inteligência artificial.

## Arquitetura

### Stack Tecnológico

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Autenticação**: Auth.js (NextAuth v5)
- **UI**: shadcn/ui + Tailwind CSS
- **Linguagem**: TypeScript

### Estrutura do Projeto

```
scalebeam/
├── app/                    # Next.js App Router
│   ├── admin/             # Área administrativa
│   ├── client/            # Área do cliente
│   ├── api/               # API routes
│   └── login/             # Autenticação
├── components/            # Componentes React
├── lib/                   # Utilitários e configurações
├── prisma/               # Schema e migrations
└── docs/                 # Documentação
```

## Principais Funcionalidades

### Para Administradores

1. **Gestão de Clientes**: CRUD completo de organizações
2. **Gestão de Marcas**: Visualização e gerenciamento de marcas dos clientes
3. **Gestão de Campanhas**: Visualização, upload de criativos, mudança de status
4. **Gestão de Templates**: CRUD de templates para geração de criativos
5. **Dashboard**: Métricas gerais (clientes, campanhas, templates, criativos)

### Para Clientes

1. **Gestão de Marcas**: Criar e gerenciar marcas (limitado por plano)
2. **Upload de Assets**: Upload de logos, fotos e materiais da marca
3. **Criação de Campanhas**: Solicitar geração de criativos via IA
4. **Solicitação de Templates**: Requisitar criação de novos templates
5. **Feedback de Criativos**: Sistema de feedback por criativo individual
6. **Dashboard**: Visualização de métricas e campanhas recentes

## Modelos de Dados Principais

### Organization
- Representa um cliente da plataforma
- Campos: nome, plano, limites (maxBrands, maxCreatives)

### Brand
- Marca pertencente a uma organização
- Campos: nome, logo, cores, tom de voz, descrição
- Relacionamento: 1:N com Projects e Assets

### Project
- Representa campanhas ou solicitações de templates
- Tipos: `CAMPAIGN` ou `TEMPLATE_CREATION`
- Campos: nome, briefing, dados da campanha, estimativa de criativos

### Creative
- Criativos gerados pela IA
- Campos: nome, URL, thumbnail, dimensões, formato, plataforma
- Relacionamento: N:1 com Project, 1:N com CreativeFeedback

### CreativeFeedback
- Feedback específico por criativo
- Campos: conteúdo, isResolved, criativo, usuário
- Permite revisões granulares

## Fluxo de Trabalho

### Fluxo de Campanha

1. **Cliente cria marca** (se ainda não existir)
2. **Cliente faz upload de assets** da marca
3. **Cliente cria nova campanha** preenchendo briefing
4. **Admin recebe notificação** e processa a solicitação
5. **Admin faz upload dos criativos** gerados pela IA
6. **Cliente visualiza e dá feedback** em criativos específicos
7. **Admin processa feedbacks** e faz ajustes
8. **Cliente aprova e baixa criativos** finais

### Fluxo de Template

1. **Cliente solicita novo template** via formulário
2. **Admin visualiza solicitação** na área de template requests
3. **Admin cria o template** ou rejeita solicitação
4. **Template fica disponível** para uso em futuras campanhas

## Mudanças Recentes

### Simplificação da Interface (Novembro 2024)

1. **Remoção de Status Tracking**:
   - Removidos indicadores de status de campanhas, criativos e templates
   - Simplificação do fluxo focando na geração de criativos

2. **Separação de Métricas**:
   - Campanhas e Templates agora são contados separadamente
   - Dashboards mostram métricas distintas para cada tipo

3. **Simplificação de Dashboards**:
   - Admin: 4 métricas principais + campanhas recentes
   - Cliente: 4 métricas principais + campanhas recentes (removida seção de marcas)

4. **Sistema de Feedback Granular**:
   - Feedback agora é por criativo específico (via CreativeFeedback)
   - Clientes podem solicitar revisões de criativos individuais
   - Badges visuais indicam criativos com feedback pendente

5. **CRUD de Marcas (Admin)**:
   - Nova interface simplificada para gestão de marcas
   - Tabela com colunas: Marca, Cliente, Campanhas, Templates, Assets, Ações

## Autenticação e Autorização

### Roles
- **ADMIN**: Acesso completo à plataforma
- **CLIENT**: Acesso limitado à área do cliente

### Proteção de Rotas
- `/admin/*`: Apenas ADMINs
- `/client/*`: Apenas CLIENTs
- API routes protegidas com `requireAuth()` e `requireAdmin()`

## Configuração de Ambiente

### Variáveis de Ambiente Necessárias

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"
```

### Comandos Principais

```bash
# Instalar dependências
npm install

# Rodar migrations
npx prisma migrate dev

# Gerar Prisma Client
npx prisma generate

# Seed do banco
npm run db:seed

# Desenvolvimento
npm run dev

# Build de produção
npm run build
```

## Próximos Passos

- [ ] Integração com serviços de geração de IA
- [ ] Sistema de notificações em tempo real
- [ ] Exportação em lote de criativos
- [ ] Analytics avançados por campanha
- [ ] Suporte a mais formatos de arquivo
