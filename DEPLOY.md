# Deploy do ScaleBeam na Vercel

Este guia explica como fazer o deploy do ScaleBeam na Vercel com Vercel Postgres.

## Pré-requisitos

- Conta na Vercel
- Repositório no GitHub (já configurado)
- Node.js 18+ instalado localmente

## Passo a Passo

### 1. Conectar Repositório à Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe o repositório `guigonzalez/scalebeam`
4. **NÃO clique em Deploy ainda!** Primeiro precisamos configurar o banco de dados

### 2. Criar Banco de Dados Vercel Postgres

1. Na página do seu projeto na Vercel, vá em **Storage**
2. Clique em **Create Database**
3. Selecione **Postgres**
4. Escolha a região mais próxima (ex: US East para melhor performance)
5. Clique em **Create**

A Vercel irá automaticamente adicionar as variáveis de ambiente:
- `DATABASE_URL` (connection pooling)
- `DIRECT_URL` (direct connection)
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### 3. Configurar Build Settings

Na configuração do projeto:

**Framework Preset:** Next.js

**Build Command:**
```bash
npx prisma generate && npx prisma migrate deploy && next build
```

**Install Command:**
```bash
npm install
```

**Output Directory:** `.next`

### 4. Fazer Deploy

1. Clique em **Deploy**
2. Aguarde o build completar

### 5. Popular o Banco de Dados (Seed)

Após o primeiro deploy, você precisa rodar o seed para popular o banco:

**Opção A: Via Vercel CLI (Recomendado)**

```bash
# Instale a Vercel CLI se ainda não tiver
npm i -g vercel

# Faça login
vercel login

# Puxe as variáveis de ambiente
vercel env pull .env.local

# Rode o seed localmente conectando ao banco de produção
npx tsx prisma/seed.ts
```

**Opção B: Via Script Personalizado**

Você pode criar um endpoint API para rodar o seed:

1. Crie o arquivo `app/api/seed/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  // Adicione proteção com token secreto
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Cole aqui o conteúdo do seu prisma/seed.ts
  // ...

  return NextResponse.json({ success: true })
}
```

2. Adicione `SEED_SECRET` nas env vars da Vercel
3. Acesse: `https://seu-projeto.vercel.app/api/seed` com o header de autorização

### 6. Verificar Deploy

Acesse seu projeto em: `https://scalebeam.vercel.app` (ou o domínio gerado)

Teste as rotas:
- `/` - Landing page
- `/login` - Login
- `/signup` - Cadastro
- `/admin` - Admin dashboard (após login com @uxer.com)
- `/client` - Client portal (após login com outro email)

## Ambiente Local com PostgreSQL

Se quiser desenvolver localmente com PostgreSQL:

### Opção 1: Usar Vercel Postgres localmente

```bash
# Puxar variáveis de ambiente da Vercel
vercel env pull .env.local

# Rodar migrations
npx prisma migrate dev

# Rodar seed
npx tsx prisma/seed.ts

# Iniciar dev server
npm run dev
```

### Opção 2: PostgreSQL Local

```bash
# Instalar PostgreSQL (macOS com Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Criar banco de dados
createdb scalebeam

# Atualizar .env.local
echo 'DATABASE_URL="postgresql://localhost:5432/scalebeam"' > .env.local
echo 'DIRECT_URL="postgresql://localhost:5432/scalebeam"' >> .env.local

# Rodar migrations
npx prisma migrate dev

# Rodar seed
npx tsx prisma/seed.ts

# Iniciar dev server
npm run dev
```

## Troubleshooting

### Erro: "Can't reach database server"

- Verifique se as variáveis `DATABASE_URL` e `DIRECT_URL` estão configuradas
- Confirme que o banco Postgres foi criado na Vercel

### Erro de Migration

Se houver problemas com migrations:

```bash
# Resetar banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset

# Criar nova migration
npx prisma migrate dev --name init
```

### Build Timeout

Se o build exceder 5 minutos (limite gratuito):
- Considere usar `npx prisma migrate deploy` apenas
- Remova o seed do build command
- Execute seed manualmente após deploy

## Comandos Úteis

```bash
# Ver logs da Vercel
vercel logs

# Rodar build localmente
vercel build

# Rodar preview deployment
vercel

# Fazer deploy para produção
vercel --prod

# Ver status do projeto
vercel inspect
```

## Próximos Passos

- Configure domínio customizado em Settings -> Domains
- Adicione autenticação real (NextAuth.js, Clerk, etc)
- Configure upload de arquivos (Vercel Blob ou AWS S3)
- Adicione analytics (Vercel Analytics)
- Configure monitoramento (Vercel Speed Insights)

## Suporte

Para mais informações:
- [Vercel Docs](https://vercel.com/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Docs](https://www.prisma.io/docs)
