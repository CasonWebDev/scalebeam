# ScaleBeam

![ScaleBeam](https://img.shields.io/badge/Status-BETA-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)

Plataforma SaaS de automação criativa com IA para produção e gestão de criativos em escala.

## 🚀 Tecnologias

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Database:** PostgreSQL via [Supabase](https://supabase.com)
- **ORM:** Prisma 6.19
- **UI:** Shadcn/UI + Radix UI
- **Styling:** Tailwind CSS v4
- **Notifications:** Sonner
- **Deployment:** Vercel

## 📦 Funcionalidades

### Admin (UXER)
- ✅ Dashboard com visão geral de projetos
- ✅ Gerenciamento de marcas e organizações
- ✅ Upload e gerenciamento de criativos (Supabase Storage)
- ✅ Controle de workflow (Draft → In Production → Ready → Approved)
- ✅ Sistema de validação de uploads (tipos e tamanhos)
- ✅ Comentários e revisões
- ✅ Activity logs completos

### Cliente
- ✅ Dashboard personalizado
- ✅ Gerenciamento de marcas próprias
- ✅ Visualização de projetos e criativos
- ✅ **Sistema de aprovação/revisão completo**
- ✅ **Auto-refresh a cada 30 segundos**
- ✅ **Botão de atualização manual**
- ✅ Download de assets
- ✅ Histórico de atividades visual
- ✅ Acesso ao brandbook e guidelines

### Marketing
- Landing page completa
- Página de preços (4 planos)
- Calculadora de ROI interativa
- Sistema de autenticação

## 🛠️ Setup Local

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no [Supabase](https://supabase.com) (gratuita)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/guigonzalez/scalebeam.git
cd scalebeam

# Instale as dependências
npm install
```

### Configuração do Banco de Dados (Supabase)

#### Opção 1: Supabase Cloud (Recomendado)

1. Crie um projeto em [supabase.com](https://supabase.com/dashboard)
2. Acesse: Project → Connect → Session pooler
3. Copie as connection strings
4. Crie `.env.local`:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Supabase Client (opcional)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
```

5. Rode as migrations e popule o banco:

```bash
npm run db:migrate:deploy  # Aplica migrations
npm run db:reset:seed      # Limpa e popula com dados de teste
```

6. Inicie o servidor:

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

#### Opção 2: Docker Local

Para rodar Supabase localmente com Docker, veja: [SUPABASE.md](./SUPABASE.md)

## 🚢 Deploy na Vercel

**Passo a Passo:**

1. **Conecte o repositório à Vercel**

2. **Configure variáveis de ambiente:**
   ```
   DATABASE_URL        # Session pooler URL (para serverless)
   DIRECT_URL          # Direct connection URL (para migrations)
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

3. **Configure Build Command:**
   ```bash
   prisma generate && prisma migrate deploy && next build
   ```

4. **Deploy:**
   - Push para `main` → deploy automático
   - Ou use: `vercel --prod`

5. **Popule o banco (via terminal local):**
   ```bash
   DATABASE_URL="[PRODUCTION_URL]" npm run db:reset:seed
   ```

Veja guia completo em: [SUPABASE.md](./SUPABASE.md)

## 📊 Estrutura do Banco

```
Organization
├── User (many-to-many)
├── Brand
│   ├── Asset (logos, imagens)
│   ├── Template (modelos de criativo)
│   └── Project
│       ├── Creative (criativos finais)
│       └── Comment
└── ActivityLog (histórico de ações)
```

**Enums:**
- `UserRole`: ADMIN, CLIENT
- `PlanType`: STARTER, PROFESSIONAL, AGENCY
- `ProjectStatus`: DRAFT, IN_PRODUCTION, READY, APPROVED, REVISION

## 🔐 Autenticação

Sistema completo de autenticação com NextAuth.js e bcrypt.

**Usuários de teste** (após `npm run db:reset:seed`):
- **Admin**: `admin@scalebeam.com` / `admin123`
- **Cliente**: `client@scalebeam.com` / `client123`

**Recursos implementados:**
- ✅ NextAuth.js 5 (beta) com Credentials Provider
- ✅ Senhas hashadas com bcrypt (10 rounds)
- ✅ Validação de senha em todas as rotas
- ✅ Sistema de permissões baseado em roles (ADMIN/CLIENT)
- ✅ Proteção de rotas por organização
- ✅ Session JWT com dados do usuário

**Para testar autenticação:**
```bash
npm run test:password  # Testa validação de senhas
```

**Próximas implementações:**
- [ ] Sistema de convites
- [ ] Recuperação de senha
- [ ] Multi-fator (2FA)
- [ ] OAuth providers (Google, GitHub)

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento (Turbopack)

# Build
npm run build            # Build de produção (com migrations)
npm run start            # Inicia servidor de produção

# Database
npm run db:migrate       # Cria e aplica migrations (dev)
npm run db:migrate:deploy # Aplica migrations (prod)
npm run db:seed          # Popula banco com dados de teste
npm run db:reset         # Limpa todas as tabelas
npm run db:reset:seed    # Limpa e popula (setup completo)
npm run db:studio        # Abre Prisma Studio
npm run db:push          # Push schema sem migrations

# Testes
npm run test:password    # Testa validação de autenticação

# Linting
npm run lint             # Executa ESLint
```

### Dados de Teste

Após `npm run db:reset:seed`, o banco contém:

- ✅ 1 Organization: **ScaleBeam Demo** (Professional)
- ✅ 2 Users: Admin e Client
- ✅ 2 Brands: **Nike Brasil**, **Adidas Brasil**
- ✅ 4 Assets (logos e produtos)
- ✅ 6 Templates (Feed, Stories, Banner)
- ✅ 2 Projects (diferentes status)
- ✅ 3 Creatives (para testar aprovação)
- ✅ 3 Comments (feedback simulado)
- ✅ 2 Activity Logs

## 🗂️ Estrutura de Pastas

```
scalebeam/
├── app/
│   ├── admin/           # Dashboard administrativo
│   │   └── page.tsx     # Visão geral de projetos
│   ├── client/          # Portal do cliente
│   │   ├── brands/[id]/ # Detalhes da marca
│   │   └── projects/    # Gestão de projetos
│   │       └── new/     # Criar novo projeto
│   ├── api/             # API Routes
│   │   └── client/
│   │       └── brands/  # Endpoints de brands
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # Componentes Shadcn/UI
│   ├── lightbox.tsx     # Visualizador de imagens
│   ├── creative-approval-grid-grouped.tsx
│   └── ...
├── lib/
│   ├── db.ts            # Prisma client singleton
│   └── utils.ts         # Utilitários
├── prisma/
│   ├── schema.prisma    # Schema do banco
│   └── migrations/      # Migrations do Prisma
├── scripts/
│   ├── seed.ts          # Dados de teste
│   └── reset-database.ts # Limpar banco
└── public/
    └── ...              # Arquivos estáticos
```

## 🎨 Design System

- **Font:** Geist Sans (padrão Next.js)
- **Logo:** Geist Light
- **Theme:** Slate (dark mode)
- **Components:** Shadcn/UI + Radix UI
- **Icons:** Lucide React

## 🔄 Workflow de Projetos

1. **DRAFT** - Projeto criado, aguardando briefing
2. **IN_PRODUCTION** - IA gerando criativos
3. **READY** - Criativos prontos para revisão
4. **APPROVED** - Aprovado pelo cliente
5. **REVISION** - Cliente solicitou alterações

## 📈 Planos Disponíveis

| Plano | Preço/mês | Setup | Criativos | Marcas |
|-------|-----------|-------|-----------|--------|
| **Starter** | R$ 6.000 | R$ 17.500 | 300 | 1 |
| **Professional** | R$ 12.500 | R$ 42.500 | 750 | 3 |
| **Agency** | R$ 25.000 | R$ 85.000 | 2.000 | 10 |
| **Enterprise** | Customizado | Custom | Ilimitado | Ilimitado |

## 🤝 Contribuindo

Este é um projeto em BETA. Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

## 🐛 Suporte

Para bugs e sugestões, abra uma [issue](https://github.com/guigonzalez/scalebeam/issues).

---

**© 2025 ScaleBeam. Todos os direitos reservados.**

🤖 Built with [Claude Code](https://claude.com/claude-code)
