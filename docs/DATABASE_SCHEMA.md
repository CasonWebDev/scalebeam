# Database Schema

## Entidades Principais

### User
Usuários do sistema (admins e clientes).

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String
  passwordHash    String
  role            UserRole @default(CLIENT)
  organizationIds String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Roles**:
- `ADMIN`: Administradores da plataforma
- `CLIENT`: Clientes que criam campanhas

### Organization
Empresas clientes da plataforma.

```prisma
model Organization {
  id           String   @id @default(cuid())
  name         String
  plan         Plan     @default(STARTER)
  maxBrands    Int      @default(1)
  maxCreatives Int      @default(100)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**Plans**:
- `STARTER`: Plano básico (1 marca, 100 criativos/mês)
- `PROFESSIONAL`: Plano intermediário
- `AGENCY`: Plano avançado

### Brand
Marcas pertencentes a organizações.

```prisma
model Brand {
  id             String       @id @default(cuid())
  organizationId String
  name           String
  logoUrl        String?
  primaryColor   String?
  secondaryColor String?
  toneOfVoice    String?
  description    String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

### Project
Projetos (campanhas ou solicitações de templates).

```prisma
model Project {
  id                  String      @id @default(cuid())
  brandId             String
  name                String
  projectType         ProjectType
  status              ProjectStatus @default(PENDING)
  briefingData        Json?
  estimatedCreatives  Int         @default(0)
  templateId          String?
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
}
```

**ProjectType**:
- `CAMPAIGN`: Campanha de geração de criativos
- `TEMPLATE_CREATION`: Solicitação de novo template

**ProjectStatus**:
- `PENDING`: Aguardando processamento
- `IN_PRODUCTION`: Em produção
- `COMPLETED`: Concluído
- `CANCELLED`: Cancelado

### Template
Templates para geração de criativos.

```prisma
model Template {
  id                   String   @id @default(cuid())
  name                 String
  description          String?
  imageUrl             String?
  preliminaryContent   String?
  restrictions         String?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

### Creative
Criativos gerados.

```prisma
model Creative {
  id           String   @id @default(cuid())
  projectId    String
  name         String
  url          String
  thumbnailUrl String?
  width        Int?
  height       Int?
  format       String
  platform     String?
  lista        String?
  modelo       String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### CreativeFeedback
Feedback específico por criativo.

```prisma
model CreativeFeedback {
  id         String   @id @default(cuid())
  creativeId String
  userId     String
  content    String
  isResolved Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### Asset
Assets de marca (logos, fotos, etc.).

```prisma
model Asset {
  id          String     @id @default(cuid())
  brandId     String
  name        String
  url         String
  type        AssetType
  description String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

**AssetType**:
- `LOGO`: Logo da marca
- `PHOTO`: Foto de produto/serviço
- `VIDEO`: Vídeo
- `DOCUMENT`: Documento (manual de marca, etc.)

### Comment
Comentários gerais em projetos.

```prisma
model Comment {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### ActivityLog
Logs de atividade para auditoria.

```prisma
model ActivityLog {
  id             String   @id @default(cuid())
  organizationId String
  userId         String
  action         String
  description    String
  createdAt      DateTime @default(now())
}
```

## Relacionamentos

```
Organization 1:N Brand
Brand 1:N Project
Brand 1:N Asset
Project N:1 Template (optional)
Project 1:N Creative
Project 1:N Comment
Creative 1:N CreativeFeedback
User 1:N Comment
User 1:N CreativeFeedback
User 1:N ActivityLog
Organization 1:N ActivityLog
```

## Índices e Constraints

- Todos os IDs são `cuid()` para segurança
- Email de usuário é único
- Timestamps automáticos (`createdAt`, `updatedAt`)
- Cascade delete em relacionamentos críticos
- Índices em chaves estrangeiras para performance

## Queries Comuns

### Buscar campanhas de uma organização
```typescript
const campaigns = await prisma.project.findMany({
  where: {
    brand: { organizationId: orgId },
    projectType: "CAMPAIGN"
  },
  include: {
    brand: true,
    creatives: true
  }
})
```

### Buscar criativos com feedback pendente
```typescript
const creativesWithFeedback = await prisma.creative.findMany({
  where: {
    feedbacks: {
      some: {
        isResolved: false
      }
    }
  },
  include: {
    feedbacks: {
      where: { isResolved: false },
      include: { user: true }
    }
  }
})
```

### Contar projetos por tipo
```typescript
const stats = {
  totalCampaigns: await prisma.project.count({
    where: {
      brand: { organizationId: orgId },
      projectType: "CAMPAIGN"
    }
  }),
  totalTemplates: await prisma.project.count({
    where: {
      brand: { organizationId: orgId },
      projectType: "TEMPLATE_CREATION"
    }
  })
}
```
