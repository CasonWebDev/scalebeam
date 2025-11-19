# ScaleBeam

Plataforma de colaboração para criação e gestão de criativos em escala.

## 📋 Sobre o Projeto

ScaleBeam é um SaaS de gestão de criativos que conecta agências (UXER) e clientes, facilitando o processo de:
- Upload de assets de marca (logos, brandbook, imagens)
- Envio de briefings
- Entrega e aprovação de criativos
- Gestão de múltiplas marcas e organizações

## 🎯 MVP - Protótipo Admin

Este protótipo foca na **interface administrativa (UXER)** com dados mockados para demonstrar o fluxo completo de trabalho.

### Funcionalidades Implementadas

#### Área Admin (UXER)

✅ **Dashboard**
- Métricas de projetos e criativos
- Visão geral de status
- Projetos recentes

✅ **Gestão de Projetos**
- Listagem completa de projetos
- Filtros por status
- Detalhes do projeto com:
  - Informações da marca
  - Assets disponíveis
  - Briefing (preview de dados CSV)
  - Galeria de criativos
  - Comentários/feedback

✅ **Gestão de Marcas**
- Listagem de todas as marcas
- Informações de organização e plano
- Contagem de projetos e assets

✅ **Configurações**
- Perfil do usuário
- Preferências do sistema

#### Área Cliente

✅ **Dashboard do Cliente**
- Resumo de marcas e projetos
- Estatísticas personalizadas
- Projetos aguardando aprovação

✅ **Minhas Marcas**
- Listagem de marcas cadastradas
- Upload de assets (logos, imagens, brandbook)
- Visualização de informações da marca

✅ **Projetos**
- Criar novo projeto com briefing CSV
- Listar todos os projetos
- Visualizar criativos entregues
- Aprovar ou solicitar ajustes
- Sistema de comentários

✅ **Aprovação de Criativos**
- Galeria de criativos entregues
- Download individual ou em lote
- Aprovar ou solicitar revisões
- Adicionar feedback via comentários

## 🛠️ Stack Tecnológica

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** SQLite (Prisma ORM)
- **UI:** Shadcn/UI (tema Slate) + Radix UI
- **Estilização:** Tailwind CSS
- **Ícones:** Lucide Icons
- **Fontes:** Geist (Light weight para logo)

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar banco de dados:**
```bash
# Criar tabelas
npx prisma migrate dev

# Popular com dados mockados
npm run db:seed
```

3. **Iniciar servidor de desenvolvimento:**
```bash
npm run dev
```

4. **Acessar aplicação:**
- Área Admin (UXER): [http://localhost:3000/admin](http://localhost:3000/admin)
- Área Cliente: [http://localhost:3000/client](http://localhost:3000/client)

## 📊 Dados Mockados

O seed cria:
- 3 organizações (diferentes planos: Starter, Professional, Agency)
- 5 marcas
- 7 projetos em diferentes status
- 9 criativos com imagens reais (via Unsplash)
- Assets de marca
- Comentários de exemplo

### Projetos de Exemplo

| Projeto | Marca | Status | Criativos |
|---------|-------|--------|-----------|
| Campanha Black Friday 2024 | TechFlow | Pronto | 4 |
| Coleção Verão 2025 | StyleHub | Aprovado | 3 |
| Dia das Mães - GreenLife | GreenLife | Pronto | 2 |
| Lançamento Produto Q1 | TechFlow | Em Produção | 0 |

## 🎨 Design System

**Tema:** Slate (tons de cinza-azulado)
**Modo:** Dark (padrão)

### Cores Principais
- Background: `slate-950`
- Cards: `slate-900`
- Borders: `slate-800`
- Text: `slate-50/100`

### Tipografia
- **Logo:** Geist Light (300)
- **Headings:** Geist Medium/Semibold (500/600)
- **Body:** Geist Regular (400)

## 📁 Estrutura do Projeto

```
scalebeam/
├── app/
│   ├── admin/                    # Área administrativa
│   │   ├── layout.tsx           # Layout com sidebar
│   │   ├── page.tsx             # Dashboard
│   │   ├── projects/            # Gestão de projetos
│   │   │   ├── page.tsx         # Listagem
│   │   │   └── [id]/page.tsx    # Detalhes
│   │   ├── brands/              # Gestão de marcas
│   │   └── settings/            # Configurações
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Estilos globais
├── components/
│   ├── ui/                      # Componentes Shadcn
│   └── admin-sidebar.tsx        # Sidebar admin
├── lib/
│   ├── prisma.ts               # Cliente Prisma
│   └── utils.ts                # Utilitários
├── prisma/
│   ├── schema.prisma           # Schema do banco
│   └── seed.ts                 # Dados mockados
└── public/                      # Assets estáticos
```

## 🗃️ Schema do Banco

### Principais Modelos

- **User** - Usuários (ADMIN ou CLIENT)
- **Organization** - Empresas clientes
- **Brand** - Marcas das organizações
- **Project** - Projetos de criação
- **Creative** - Criativos individuais
- **Asset** - Assets de marca
- **Comment** - Comentários/feedback

### Status de Projetos

- `DRAFT` - Rascunho
- `IN_PRODUCTION` - Em produção (UXER trabalhando)
- `READY` - Pronto para aprovação
- `APPROVED` - Aprovado pelo cliente
- `REVISION` - Em revisão (ajustes solicitados)

## 🔄 Próximos Passos

### Funcionalidades Futuras

- [ ] Upload real de arquivos (S3/Cloudflare R2)
- [ ] Autenticação completa (NextAuth)
- [ ] Área do cliente (client-facing)
- [ ] Sistema de notificações
- [ ] API para integrações
- [ ] Geração automática de criativos
- [ ] Integração com Google Ads / Meta Ads
- [ ] Dashboard de performance

## 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor desenvolvimento
npm run build        # Build produção
npm run start        # Servidor produção
npm run lint         # Lint do código
npm run db:seed      # Popular banco com dados mock
```

## 🎨 Identidade Visual

**Logo:** ScaleBeam (Geist Light)
**Paleta:** Minimalista com tema Slate dark
**Componentes:** Design limpo e moderno

---

**Desenvolvido para:** UXER
**Versão:** 1.0.0 (MVP)
**Status:** Protótipo Funcional
