# ScaleBeam

![ScaleBeam](https://img.shields.io/badge/Status-BETA-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)

Plataforma SaaS de automação criativa com IA para produção e gestão de criativos em escala.

## 🚀 Tecnologias

- **Framework:** Next.js 14 (App Router)
- **Database:** Vercel Postgres (PostgreSQL)
- **ORM:** Prisma
- **UI:** Shadcn/UI + Radix UI
- **Styling:** Tailwind CSS (Slate theme)
- **Notifications:** Sonner
- **Deployment:** Vercel

## 📦 Funcionalidades

### Admin (UXER)
- Dashboard com visão geral de projetos
- Gerenciamento de marcas e organizações
- Upload e gerenciamento de criativos
- Controle de workflow (Draft → In Production → Ready → Approved)
- QA visual automatizado
- Comentários e revisões

### Cliente
- Dashboard personalizado
- Gerenciamento de marcas próprias
- Visualização de projetos e criativos
- Sistema de aprovação/revisão
- Download de assets
- Acesso ao brandbook e guidelines

### Marketing
- Landing page completa
- Página de preços (4 planos)
- Calculadora de ROI interativa
- Sistema de autenticação

## 🛠️ Setup Local

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL (local ou Vercel Postgres)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/guigonzalez/scalebeam.git
cd scalebeam

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Edite .env.local com suas credenciais do banco
```

### Desenvolvimento Local

**Opção 1: Com Vercel Postgres**

```bash
# Instale a Vercel CLI
npm i -g vercel

# Faça login
vercel login

# Puxe as variáveis de ambiente
vercel env pull .env.local

# Rode as migrations
npm run db:migrate

# Popule o banco
npm run db:seed

# Inicie o servidor
npm run dev
```

**Opção 2: Com PostgreSQL Local**

```bash
# Inicie o PostgreSQL
brew services start postgresql@15

# Crie o banco
createdb scalebeam

# Configure .env.local
echo 'DATABASE_URL="postgresql://localhost:5432/scalebeam"' > .env.local
echo 'DIRECT_URL="postgresql://localhost:5432/scalebeam"' >> .env.local

# Rode as migrations
npm run db:migrate

# Popule o banco
npm run db:seed

# Inicie o servidor
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🚢 Deploy na Vercel

Siga o guia completo em [DEPLOY.md](./DEPLOY.md)

**Resumo rápido:**

1. Conecte o repositório à Vercel
2. Crie um banco Vercel Postgres
3. Configure o build command: `prisma generate && prisma migrate deploy && next build`
4. Faça o deploy
5. Rode o seed usando `vercel env pull` + `npm run db:seed`

## 📊 Estrutura do Banco

```
User
└── Organization
    └── Brand
        ├── Asset (logos, brandbooks)
        └── Project
            ├── Creative (imagens, vídeos)
            └── Comment
```

**Enums:**
- `UserRole`: ADMIN, CLIENT
- `PlanType`: STARTER, PROFESSIONAL, AGENCY
- `ProjectStatus`: DRAFT, IN_PRODUCTION, READY, APPROVED, REVISION

## 🔐 Autenticação (Protótipo)

O sistema atual usa autenticação mockada para demonstração:

**Admin:**
- Qualquer email com `@uxer.com`
- Qualquer email com "admin"
- `admin@admin.com`

**Cliente:**
- Qualquer outro email

**Senha:** Qualquer valor (não validada no protótipo)

Para produção, recomenda-se implementar:
- [NextAuth.js](https://next-auth.js.org/)
- [Clerk](https://clerk.dev/)
- [Auth0](https://auth0.com/)

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build
npm run build            # Build de produção (com migrations)
npm run start            # Inicia servidor de produção

# Database
npm run db:migrate       # Cria e aplica migrations (dev)
npm run db:migrate:deploy # Aplica migrations (prod)
npm run db:seed          # Popula banco com dados de exemplo
npm run db:studio        # Abre Prisma Studio
npm run db:push          # Push schema sem migrations

# Linting
npm run lint             # Executa ESLint
```

## 🗂️ Estrutura de Pastas

```
scalebeam/
├── app/
│   ├── (auth)/          # Rotas de autenticação
│   │   ├── login/
│   │   └── signup/
│   ├── (marketing)/     # Páginas de marketing
│   │   ├── pricing/
│   │   └── roi-calculator/
│   ├── admin/           # Dashboard admin
│   │   ├── brands/
│   │   ├── projects/
│   │   └── settings/
│   ├── client/          # Portal do cliente
│   │   ├── brands/
│   │   └── projects/
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # Componentes Shadcn/UI
│   ├── admin-sidebar.tsx
│   ├── client-sidebar.tsx
│   └── ...
├── lib/
│   ├── prisma.ts        # Cliente Prisma
│   └── utils.ts         # Utilitários
├── prisma/
│   ├── schema.prisma    # Schema do banco
│   ├── seed.ts          # Seed de dados
│   └── migrations/
└── public/
    ├── brands/          # Logos e brandbooks
    └── creatives/       # Assets de criativos
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
