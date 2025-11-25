# API Routes

## Autenticação

Todas as rotas API estão protegidas e requerem autenticação via Auth.js (NextAuth v5).

### Headers Necessários
```
Cookie: authjs.session-token=...
```

## Rotas Admin

### Organizations

#### `GET /api/admin/organizations`
Lista todas as organizações.

**Autenticação**: Admin only

**Resposta**:
```json
[
  {
    "id": "clx...",
    "name": "Empresa Exemplo",
    "plan": "PROFESSIONAL",
    "maxBrands": 5,
    "maxCreatives": 500,
    "_count": {
      "brands": 3
    }
  }
]
```

#### `POST /api/admin/organizations`
Cria nova organização.

**Body**:
```json
{
  "name": "Nova Empresa",
  "plan": "STARTER",
  "maxBrands": 1,
  "maxCreatives": 100
}
```

#### `PATCH /api/admin/organizations/[id]`
Atualiza organização.

#### `DELETE /api/admin/organizations/[id]`
Remove organização e dados relacionados.

### Brands

#### `GET /api/admin/brands`
Lista todas as marcas com estatísticas.

**Resposta**:
```json
[
  {
    "id": "clx...",
    "name": "Marca A",
    "logoUrl": "https://...",
    "organization": {
      "id": "clx...",
      "name": "Empresa X"
    },
    "projects": [
      { "id": "clx...", "projectType": "CAMPAIGN" }
    ],
    "_count": {
      "assets": 12
    }
  }
]
```

#### `DELETE /api/admin/brands/[id]`
Remove marca.

### Projects

#### `DELETE /api/admin/projects/[id]`
Remove projeto (campanha ou template request).

## Rotas Client

### Brands

#### `POST /api/client/brands`
Cria nova marca (limitado por plano).

**Body**:
```json
{
  "organizationId": "clx...",
  "name": "Minha Marca",
  "logoUrl": "https://...",
  "primaryColor": "#FF5733",
  "secondaryColor": "#33C1FF",
  "toneOfVoice": "Amigável e profissional",
  "description": "Uma marca inovadora..."
}
```

#### `PATCH /api/brands/[id]`
Atualiza marca.

#### `DELETE /api/brands/[id]`
Remove marca.

### Assets

#### `POST /api/brands/[id]/assets`
Upload de asset para marca.

**Body**:
```json
{
  "name": "Logo Principal",
  "url": "https://storage.../logo.png",
  "type": "LOGO",
  "description": "Logo oficial da marca"
}
```

#### `DELETE /api/brands/[id]/assets/[assetId]`
Remove asset.

### Projects

#### `POST /api/projects`
Cria novo projeto (campanha ou template request).

**Body para Campanha**:
```json
{
  "brandId": "clx...",
  "name": "Campanha Black Friday 2024",
  "projectType": "CAMPAIGN",
  "briefingData": {
    "platforms": ["facebook", "instagram"],
    "formats": ["feed", "stories"],
    "objetivo": "Aumentar vendas",
    "mensagemPrincipal": "Descontos imperdíveis"
  },
  "estimatedCreatives": 20,
  "templateId": "clx..."
}
```

**Body para Template Request**:
```json
{
  "brandId": "clx...",
  "name": "Novo Template E-commerce",
  "projectType": "TEMPLATE_CREATION",
  "briefingData": {
    "descricao": "Template para produtos de moda",
    "referencia": "https://exemplo.com/ref.jpg"
  }
}
```

#### `POST /api/projects/[id]/request-revision`
Solicita revisão de criativos específicos.

**Body**:
```json
{
  "comment": "Ajustar cores do produto no criativo",
  "creativeIds": ["clx_creative1", "clx_creative2"]
}
```

**Funcionalidade**:
- Cria `CreativeFeedback` para cada criativo selecionado
- Mantém projeto em status `IN_PRODUCTION`
- Cria log de atividade

### Creatives

#### `DELETE /api/creatives/[id]`
Remove criativo.

#### `GET /api/projects/[id]/download`
Download em lote de todos os criativos do projeto.

**Resposta**: ZIP file

#### `GET /api/creatives/[id]/download`
Download de criativo individual.

**Resposta**: Imagem/Video file

## Rotas Públicas

### Auth

#### `POST /api/auth/signin`
Login via credentials.

**Body**:
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

#### `POST /api/auth/signout`
Logout.

## Upload de Arquivos

### Upload de Criativos (Admin)

#### `POST /api/admin/projects/[id]/creatives`
Upload em lote de criativos gerados.

**Body** (multipart/form-data):
```
files[]: File[]
projectId: string
```

**Processamento**:
1. Valida formatos permitidos (jpg, png, mp4, gif)
2. Faz upload para storage (Supabase/S3)
3. Gera thumbnails para vídeos
4. Extrai metadados (dimensões, formato)
5. Cria registros no banco

### Upload de Assets (Client)

#### `POST /api/upload/asset`
Upload de asset de marca.

**Body** (multipart/form-data):
```
file: File
brandId: string
type: AssetType
name: string
description?: string
```

## Middleware de Autenticação

### `requireAuth()`
Valida se usuário está autenticado.

```typescript
const { error, session } = await requireAuth()
if (error) return error
// session.user disponível
```

### `requireAdmin()`
Valida se usuário é admin.

```typescript
const { error, session } = await requireAdmin()
if (error) return error
// garantido que session.user.role === "ADMIN"
```

## Tratamento de Erros

Todas as rotas seguem o padrão:

**Sucesso** (200-201):
```json
{
  "success": true,
  "data": { ... }
}
```

**Erro de Validação** (400):
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["name"],
      "message": "Required"
    }
  ]
}
```

**Erro de Autorização** (403):
```json
{
  "error": "Forbidden"
}
```

**Erro Não Encontrado** (404):
```json
{
  "error": "Resource not found"
}
```

**Erro Interno** (500):
```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```
