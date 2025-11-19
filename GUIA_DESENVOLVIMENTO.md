# 🚀 GUIA DE DESENVOLVIMENTO - SCALEBEAM
## Fases 1 a 8 - Passo a Passo Detalhado

---

## 📋 ÍNDICE

- [FASE 0: Correções Críticas de Segurança](#fase-0)
- [FASE 1: Funcionalidades Core](#fase-1)
- [FASE 2: Páginas Faltantes](#fase-2)
- [FASE 3: Registro e Onboarding](#fase-3)
- [FASE 4: Templates](#fase-4)
- [FASE 5: Multi-tenant](#fase-5)
- [FASE 6: Comentários](#fase-6)
- [FASE 7: Melhorias de UX](#fase-7)
- [FASE 8: Notificações Email](#fase-8)

---

# <a name="fase-0"></a>🔴 FASE 0: CORREÇÕES CRÍTICAS DE SEGURANÇA

**Duração estimada:** 1-2 dias
**Prioridade:** CRÍTICA - DEVE ser feito ANTES de qualquer outra coisa

## Problema Atual

Atualmente, o sistema aceita qualquer senha para fazer login. Isso é um risco crítico de segurança.

**Arquivo:** `lib/auth.ts` (linhas 57-60)
```typescript
// Por enquanto, aceita qualquer senha (desenvolvimento)
// Em produção, descomentar a linha abaixo:
// const passwordMatch = await bcrypt.compare(credentials.password as string, user.passwordHash)
// if (!passwordMatch) return null
```

---

## PASSO 1: Adicionar campo passwordHash ao schema Prisma

### 1.1 Editar o schema

**Arquivo:** `prisma/schema.prisma`

**Localizar o modelo User e adicionar:**

```prisma
model User {
  id              String         @id @default(cuid())
  email           String         @unique
  name            String
  passwordHash    String         // ← ADICIONAR ESTA LINHA
  role            Role           @default(CLIENT)
  organizations   Organization[]
  comments        Comment[]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}
```

### 1.2 Criar a migration

```bash
npx prisma migrate dev --name add_password_hash_to_user
```

**O que isso faz:**
- Cria um arquivo SQL em `prisma/migrations/`
- Adiciona a coluna `passwordHash` na tabela `User`
- Atualiza o Prisma Client

### 1.3 Aplicar no Supabase (produção)

```bash
DATABASE_URL="postgresql://postgres:niUIdk7TPVIGnTNh@db.toyzsriuzltehsrnshsp.supabase.co:5432/postgres" npx prisma migrate deploy
```

---

## PASSO 2: Atualizar seed scripts com bcrypt

### 2.1 Editar `scripts/seed.ts`

**Adicionar no topo:**
```typescript
import bcrypt from "bcryptjs"
```

**Modificar a criação de usuários:**

```typescript
// ANTES:
const admin = await prisma.user.create({
  data: {
    email: "admin@scalebeam.com",
    name: "Admin User",
    role: "ADMIN",
  },
})

// DEPOIS:
const adminPassword = await bcrypt.hash("admin123", 10) // 10 rounds de salt
const admin = await prisma.user.create({
  data: {
    email: "admin@scalebeam.com",
    name: "Admin User",
    passwordHash: adminPassword,
    role: "ADMIN",
  },
})

// Repetir para todos os usuários (client, client2, etc.)
```

### 2.2 Fazer o mesmo em `scripts/seed-second-client.ts`

```typescript
const clientPassword = await bcrypt.hash("client123", 10)
const user2 = await prisma.user.upsert({
  where: { email: "client2@scalebeam.com" },
  update: {
    passwordHash: clientPassword, // adicionar
    organizations: {
      connect: { id: org2.id },
    },
  },
  create: {
    email: "client2@scalebeam.com",
    name: "Maria Silva",
    passwordHash: clientPassword, // adicionar
    role: "CLIENT",
    organizations: {
      connect: { id: org2.id },
    },
  },
})
```

### 2.3 Re-executar seeds

```bash
# Resetar banco e popular novamente
DATABASE_URL="postgresql://postgres:niUIdk7TPVIGnTNh@db.toyzsriuzltehsrnshsp.supabase.co:5432/postgres" npm run db:reset:seed
```

---

## PASSO 3: Ativar validação de senha no NextAuth

### 3.1 Editar `lib/auth.ts`

**Localizar a função authorize (linha 35) e modificar:**

```typescript
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: {
      email: credentials.email as string,
    },
    include: {
      organizations: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  // ✅ ATIVAR VALIDAÇÃO DE SENHA
  const passwordMatch = await bcrypt.compare(
    credentials.password as string,
    user.passwordHash
  )

  if (!passwordMatch) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationIds: user.organizations.map((org) => org.id),
  }
}
```

### 3.2 Testar login

1. Acessar `http://localhost:3000/login`
2. Tentar login com senha errada → Deve FALHAR
3. Login com `admin@scalebeam.com` / `admin123` → Deve FUNCIONAR
4. Login com `client@scalebeam.com` / `client123` → Deve FUNCIONAR

---

## PASSO 4: Adicionar auth middleware em rotas admin da API

### 4.1 Criar helper de autorização

**Criar arquivo:** `lib/api-auth.ts`

```typescript
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * Verifica se o usuário está autenticado
 */
export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
      session: null,
    }
  }

  return { error: null, session }
}

/**
 * Verifica se o usuário é ADMIN
 */
export async function requireAdmin() {
  const { error, session } = await requireAuth()

  if (error) return { error, session: null }

  if (session!.user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      ),
      session: null,
    }
  }

  return { error: null, session }
}

/**
 * Verifica se o usuário é CLIENT
 */
export async function requireClient() {
  const { error, session } = await requireAuth()

  if (error) return { error, session: null }

  if (session!.user.role !== "CLIENT") {
    return {
      error: NextResponse.json(
        { error: "Forbidden - Client access required" },
        { status: 403 }
      ),
      session: null,
    }
  }

  return { error: null, session }
}
```

### 4.2 Usar em rotas admin

**Exemplo:** `app/api/admin/brands/route.ts`

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"

export async function GET() {
  // ✅ ADICIONAR VERIFICAÇÃO
  const { error, session } = await requireAdmin()
  if (error) return error

  try {
    const brands = await prisma.brand.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(brands)
  } catch (error) {
    console.error("Error fetching brands:", error)
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    )
  }
}
```

### 4.3 Aplicar em TODAS as rotas admin

Repetir para:
- `app/api/admin/brands/route.ts` ✅
- `app/api/admin/brands/[id]/route.ts` (se existir)
- `app/api/admin/projects/route.ts` (quando criar)
- `app/api/admin/organizations/route.ts` (quando criar)

---

## PASSO 5: Configurar NEXTAUTH_SECRET

### 5.1 Gerar secret seguro

```bash
openssl rand -base64 32
```

**Exemplo de output:**
```
vT8Zx+2kL9mN3pQ5rS7wA1bC4dE6fG8hI0jK2lM4nO=
```

### 5.2 Adicionar ao .env.local

```bash
echo 'NEXTAUTH_SECRET="vT8Zx+2kL9mN3pQ5rS7wA1bC4dE6fG8hI0jK2lM4nO="' >> .env.local
```

### 5.3 Adicionar ao Vercel (quando for deploy)

```bash
# Via CLI do Vercel
vercel env add NEXTAUTH_SECRET

# Ou no dashboard: Settings → Environment Variables
```

### 5.4 Atualizar .env.example

**Adicionar:**
```bash
# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000" # Em produção: https://seudominio.com
```

---

## ✅ CHECKLIST FASE 0

- [ ] Campo `passwordHash` adicionado ao schema User
- [ ] Migration criada e aplicada
- [ ] Seed scripts atualizados com bcrypt
- [ ] Banco re-populado com senhas hashadas
- [ ] Validação de senha ativada em `lib/auth.ts`
- [ ] Helper `lib/api-auth.ts` criado
- [ ] Rotas admin protegidas com `requireAdmin()`
- [ ] NEXTAUTH_SECRET configurado
- [ ] Login testado com senha correta/incorreta
- [ ] Rotas admin testadas sem autenticação (deve retornar 401/403)

---

# <a name="fase-1"></a>🔥 FASE 1: FUNCIONALIDADES CORE

**Duração estimada:** 1-2 semanas
**Prioridade:** CRÍTICA

---

## SPRINT 1.1: SISTEMA DE UPLOAD (SUPABASE STORAGE)

**Duração:** 3-5 dias

### Objetivos
- Permitir upload de arquivos para Supabase Storage
- Gerar URLs assinadas para downloads seguros
- Validar tipos e tamanhos de arquivos
- Progress tracking

---

### PASSO 1: Instalar dependências do Supabase

```bash
npm install @supabase/supabase-js
```

**O que é:**
- SDK oficial do Supabase para JavaScript/TypeScript
- Permite interagir com Storage, Database, Auth, etc.

---

### PASSO 2: Configurar buckets no Supabase

#### 2.1 Acessar Supabase Dashboard

1. Ir para https://supabase.com/dashboard
2. Selecionar seu projeto
3. Menu lateral → **Storage**

#### 2.2 Criar buckets

Criar os seguintes buckets:

| Nome do Bucket | Público? | Propósito |
|----------------|----------|-----------|
| `brand-logos` | ✅ Sim | Logos de marcas (exibidos publicamente) |
| `brand-books` | ❌ Não | PDFs de brand books (privado) |
| `creatives` | ❌ Não | Arquivos criativos (privado) |
| `briefings` | ❌ Não | CSVs de briefing (privado) |
| `templates` | ✅ Sim | Imagens de templates (público) |
| `assets` | ❌ Não | Assets da marca (privado) |

**Como criar:**
- Clicar em "New bucket"
- Nomear (ex: `brand-logos`)
- Marcar "Public bucket" se público
- Criar

#### 2.3 Configurar políticas de acesso (RLS)

Para buckets privados, adicionar policies:

**Exemplo para bucket `creatives`:**

```sql
-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'creatives');

-- Permitir leitura apenas dos próprios arquivos
CREATE POLICY "Users can read own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'creatives');

-- Permitir delete apenas dos próprios arquivos
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'creatives');
```

**Repetir para todos os buckets privados.**

---

### PASSO 3: Criar helper Supabase Storage

**Criar arquivo:** `lib/supabase-storage.ts`

```typescript
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Tipos de arquivos permitidos
 */
export const ALLOWED_FILE_TYPES = {
  images: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  videos: ["video/mp4", "video/quicktime"],
  documents: ["application/pdf"],
  spreadsheets: [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
} as const

/**
 * Tamanhos máximos por tipo (em bytes)
 */
export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  document: 5 * 1024 * 1024, // 5MB
  spreadsheet: 2 * 1024 * 1024, // 2MB
} as const

/**
 * Upload de arquivo para bucket
 */
export async function uploadFile({
  bucket,
  path,
  file,
  contentType,
}: {
  bucket: string
  path: string
  file: File | Buffer
  contentType?: string
}) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: false, // Não sobrescrever arquivos existentes
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  return data
}

/**
 * Gerar URL pública (para buckets públicos)
 */
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Gerar URL assinada (para buckets privados)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600 // 1 hora por padrão
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Deletar arquivo
 */
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Listar arquivos em um diretório
 */
export async function listFiles(bucket: string, path: string = "") {
  const { data, error } = await supabase.storage.from(bucket).list(path)

  if (error) {
    throw new Error(`List failed: ${error.message}`)
  }

  return data
}

/**
 * Validar tipo de arquivo
 */
export function validateFileType(
  file: File,
  allowedTypes: readonly string[]
): boolean {
  return allowedTypes.includes(file.type)
}

/**
 * Validar tamanho de arquivo
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

/**
 * Gerar nome único para arquivo
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split(".").pop()
  return `${timestamp}-${randomStr}.${extension}`
}
```

---

### PASSO 4: Criar endpoint POST /api/upload

**Criar arquivo:** `app/api/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import {
  uploadFile,
  getPublicUrl,
  generateUniqueFileName,
  validateFileType,
  validateFileSize,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZES,
} from "@/lib/supabase-storage"

export async function POST(request: NextRequest) {
  // Verificar autenticação
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucket = formData.get("bucket") as string
    const folder = formData.get("folder") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!bucket) {
      return NextResponse.json({ error: "Bucket not specified" }, { status: 400 })
    }

    // Determinar tipo de arquivo
    let allowedTypes: readonly string[]
    let maxSize: number

    if (file.type.startsWith("image/")) {
      allowedTypes = ALLOWED_FILE_TYPES.images
      maxSize = MAX_FILE_SIZES.image
    } else if (file.type.startsWith("video/")) {
      allowedTypes = ALLOWED_FILE_TYPES.videos
      maxSize = MAX_FILE_SIZES.video
    } else if (file.type === "application/pdf") {
      allowedTypes = ALLOWED_FILE_TYPES.documents
      maxSize = MAX_FILE_SIZES.document
    } else if (ALLOWED_FILE_TYPES.spreadsheets.includes(file.type)) {
      allowedTypes = ALLOWED_FILE_TYPES.spreadsheets
      maxSize = MAX_FILE_SIZES.spreadsheet
    } else {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      )
    }

    // Validar tipo
    if (!validateFileType(file, allowedTypes)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Validar tamanho
    if (!validateFileSize(file, maxSize)) {
      return NextResponse.json(
        {
          error: `File too large. Max size: ${(maxSize / 1024 / 1024).toFixed(
            0
          )}MB`,
        },
        { status: 400 }
      )
    }

    // Gerar nome único
    const uniqueFileName = generateUniqueFileName(file.name)
    const path = folder ? `${folder}/${uniqueFileName}` : uniqueFileName

    // Converter File para Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload
    await uploadFile({
      bucket,
      path,
      file: buffer,
      contentType: file.type,
    })

    // Retornar URL
    const publicUrl = getPublicUrl(bucket, path)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path,
      bucket,
      fileName: uniqueFileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    )
  }
}
```

---

### PASSO 5: Criar endpoint para signed URLs

**Criar arquivo:** `app/api/files/signed-url/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { getSignedUrl } from "@/lib/supabase-storage"

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const { bucket, path, expiresIn } = await request.json()

    if (!bucket || !path) {
      return NextResponse.json(
        { error: "Bucket and path are required" },
        { status: 400 }
      )
    }

    const signedUrl = await getSignedUrl(bucket, path, expiresIn || 3600)

    return NextResponse.json({
      success: true,
      signedUrl,
      expiresIn: expiresIn || 3600,
    })
  } catch (error: any) {
    console.error("Signed URL error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate signed URL" },
      { status: 500 }
    )
  }
}
```

---

### PASSO 6: Atualizar componente de upload

**Editar:** `components/upload-creatives-modal.tsx`

**Substituir o mock (linhas 30-57) por:**

```typescript
"use client"

import { useState } from "react"
import { Upload, X, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface UploadCreativesModalProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface UploadedFile {
  id: string
  name: string
  size: number
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  url?: string
  error?: string
}

export function UploadCreativesModal({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: UploadCreativesModalProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      status: "pending",
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const uploadFile = async (file: File, fileId: string) => {
    try {
      // Atualizar status para uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: "uploading" as const } : f
        )
      )

      // Criar FormData
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", "creatives")
      formData.append("folder", `projects/${projectId}`)

      // Upload com tracking de progresso
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
          )
        }
      })

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } else {
            reject(new Error(xhr.statusText))
          }
        })
        xhr.addEventListener("error", () => reject(new Error("Upload failed")))
        xhr.open("POST", "/api/upload")
        xhr.send(formData)
      })

      const response: any = await uploadPromise

      // Criar creative no banco
      const creativeResponse = await fetch(`/api/projects/${projectId}/creatives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          url: response.url,
          format: file.type.split("/")[1],
          width: 0, // TODO: Extrair dimensões da imagem
          height: 0,
        }),
      })

      if (!creativeResponse.ok) {
        throw new Error("Failed to save creative")
      }

      // Atualizar status para success
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "success" as const, progress: 100, url: response.url }
            : f
        )
      )
    } catch (error: any) {
      console.error("Upload error:", error)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error" as const,
                error: error.message || "Upload failed",
              }
            : f
        )
      )
    }
  }

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending")

    if (pendingFiles.length === 0) {
      toast.error("Nenhum arquivo para enviar")
      return
    }

    setIsUploading(true)

    // Upload em paralelo (máximo 3 simultâneos)
    const chunkSize = 3
    for (let i = 0; i < pendingFiles.length; i += chunkSize) {
      const chunk = pendingFiles.slice(i, i + chunkSize)
      await Promise.all(
        chunk.map((f) => {
          const fileInput = document.querySelector(
            `input[type="file"]`
          ) as HTMLInputElement
          const file = Array.from(fileInput?.files || []).find(
            (file) => file.name === f.name
          )
          if (file) {
            return uploadFile(file, f.id)
          }
          return Promise.resolve()
        })
      )
    }

    setIsUploading(false)

    // Verificar se todos foram enviados com sucesso
    const allSuccess = files.every((f) => f.status === "success")
    if (allSuccess) {
      toast.success("Todos os arquivos foram enviados!")
      onSuccess?.()
      setTimeout(() => {
        onClose()
        setFiles([])
      }, 1500)
    } else {
      toast.error("Alguns arquivos falharam no envio")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload de Criativos</DialogTitle>
          <DialogDescription>
            Envie os arquivos criativos para este projeto
          </DialogDescription>
        </DialogHeader>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Imagens (JPG, PNG, WebP) até 10MB | Vídeos (MP4) até 100MB
          </p>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <Button asChild variant="outline">
            <label htmlFor="file-upload" className="cursor-pointer">
              Selecionar Arquivos
            </label>
          </Button>
        </div>

        {files.length > 0 && (
          <div className="space-y-2 mt-4">
            <h3 className="font-medium">Arquivos ({files.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {file.status === "uploading" && (
                      <div className="mt-2">
                        <div className="h-1 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {file.progress}%
                        </p>
                      </div>
                    )}
                    {file.status === "error" && (
                      <p className="text-xs text-destructive mt-1">{file.error}</p>
                    )}
                  </div>

                  {file.status === "success" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                  {file.status === "error" && (
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  )}
                  {file.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={
              files.length === 0 ||
              isUploading ||
              files.every((f) => f.status !== "pending")
            }
          >
            {isUploading ? "Enviando..." : "Enviar Arquivos"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## ✅ CHECKLIST SPRINT 1.1

- [ ] @supabase/supabase-js instalado
- [ ] 6 buckets criados no Supabase
- [ ] Políticas RLS configuradas
- [ ] `lib/supabase-storage.ts` criado
- [ ] `app/api/upload/route.ts` criado
- [ ] `app/api/files/signed-url/route.ts` criado
- [ ] `components/upload-creatives-modal.tsx` atualizado
- [ ] Teste: Upload de imagem funciona
- [ ] Teste: Progress bar atualiza
- [ ] Teste: Validação de tipo funciona
- [ ] Teste: Validação de tamanho funciona

---

## SPRINT 1.2: WORKFLOW DE PROJETOS

**Duração:** 5-7 dias

### Objetivos
- Criar projetos via API
- Upload de criativos para projetos
- Atualizar status de projetos
- Validações robustas

---

### PASSO 1: Criar validações Zod

**Criar arquivo:** `lib/validations/project.ts`

```typescript
import { z } from "zod"

export const createProjectSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  brandId: z.string().cuid("Brand ID inválido"),
  templateId: z.string().cuid("Template ID inválido").optional().nullable(),
  briefingData: z.string().optional(),
  briefingCsvUrl: z.string().url("URL inválida").optional().nullable(),
  estimatedCreatives: z.number().int().positive().optional(),
})

export const updateProjectStatusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "IN_PRODUCTION",
    "READY",
    "APPROVED",
    "REVISION",
  ]),
  comment: z.string().optional(),
})

export const createCreativeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  url: z.string().url("URL inválida"),
  format: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  lista: z.string().optional().nullable(),
  modelo: z.string().optional().nullable(),
})

export const approveProjectSchema = z.object({
  comment: z.string().optional(),
})

export const requestRevisionSchema = z.object({
  comment: z.string().min(10, "Comentário deve ter no mínimo 10 caracteres"),
  creativesToRevise: z.array(z.string().cuid()).optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>
export type CreateCreativeInput = z.infer<typeof createCreativeSchema>
export type ApproveProjectInput = z.infer<typeof approveProjectSchema>
export type RequestRevisionInput = z.infer<typeof requestRevisionSchema>
```

**Instalar Zod se necessário:**
```bash
npm install zod
```

---

### PASSO 2: Implementar POST /api/client/projects

**Criar arquivo:** `app/api/client/projects/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { requireClient } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { createProjectSchema } from "@/lib/validations/project"
import { z } from "zod"

export async function POST(request: NextRequest) {
  const { error: authError, session } = await requireClient()
  if (authError) return authError

  try {
    const body = await request.json()

    // Validar input
    const validatedData = createProjectSchema.parse(body)

    // Verificar se a brand pertence à organização do usuário
    const brand = await prisma.brand.findUnique({
      where: { id: validatedData.brandId },
      select: { organizationId: true, organization: { select: { maxCreatives: true } } },
    })

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    if (!session!.user.organizationIds.includes(brand.organizationId)) {
      return NextResponse.json(
        { error: "You don't have access to this brand" },
        { status: 403 }
      )
    }

    // Verificar limite de criativos (se estimatedCreatives fornecido)
    if (validatedData.estimatedCreatives) {
      const totalCreatives = await prisma.creative.count({
        where: {
          project: {
            brand: {
              organizationId: brand.organizationId,
            },
          },
        },
      })

      if (
        totalCreatives + validatedData.estimatedCreatives >
        brand.organization.maxCreatives
      ) {
        return NextResponse.json(
          {
            error: `Limit exceeded. Your plan allows ${brand.organization.maxCreatives} creatives. You currently have ${totalCreatives}.`,
          },
          { status: 400 }
        )
      }
    }

    // Criar projeto
    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        brandId: validatedData.brandId,
        templateId: validatedData.templateId,
        briefingData: validatedData.briefingData,
        briefingCsvUrl: validatedData.briefingCsvUrl,
        estimatedCreatives: validatedData.estimatedCreatives,
        status: "DRAFT",
      },
      include: {
        brand: {
          select: {
            name: true,
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
        template: {
          select: {
            name: true,
          },
        },
      },
    })

    // Criar log de atividade
    await prisma.activityLog.create({
      data: {
        organizationId: brand.organizationId,
        userId: session!.user.id,
        action: "project_created",
        description: `Projeto "${project.name}" criado`,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    console.error("Create project error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to create project" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { error: authError, session } = await requireClient()
  if (authError) return authError

  try {
    const projects = await prisma.project.findMany({
      where: {
        brand: {
          organizationId: {
            in: session!.user.organizationIds,
          },
        },
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        template: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            creatives: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(projects)
  } catch (error: any) {
    console.error("Get projects error:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}
```

---

### PASSO 3: Implementar POST /api/projects/[id]/creatives

**Criar arquivo:** `app/api/projects/[id]/creatives/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { createCreativeSchema } from "@/lib/validations/project"
import { z } from "zod"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  try {
    const { id: projectId } = await params
    const body = await request.json()

    // Validar input
    const validatedData = createCreativeSchema.parse(body)

    // Verificar se o projeto existe e se o usuário tem acesso
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        brand: {
          select: {
            organizationId: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Verificar acesso (CLIENT precisa ser da mesma org, ADMIN pode tudo)
    if (session!.user.role === "CLIENT") {
      if (!session!.user.organizationIds.includes(project.brand.organizationId)) {
        return NextResponse.json(
          { error: "You don't have access to this project" },
          { status: 403 }
        )
      }
    }

    // Criar criativo
    const creative = await prisma.creative.create({
      data: {
        projectId,
        name: validatedData.name,
        url: validatedData.url,
        format: validatedData.format,
        width: validatedData.width,
        height: validatedData.height,
        lista: validatedData.lista,
        modelo: validatedData.modelo,
      },
    })

    return NextResponse.json(creative, { status: 201 })
  } catch (error: any) {
    console.error("Create creative error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to create creative" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  try {
    const { id: projectId } = await params

    // Verificar acesso ao projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        brand: {
          select: {
            organizationId: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (session!.user.role === "CLIENT") {
      if (!session!.user.organizationIds.includes(project.brand.organizationId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Buscar criativos
    const creatives = await prisma.creative.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(creatives)
  } catch (error: any) {
    console.error("Get creatives error:", error)
    return NextResponse.json(
      { error: "Failed to fetch creatives" },
      { status: 500 }
    )
  }
}
```

---

### PASSO 4: Implementar PATCH /api/projects/[id]/status

**Criar arquivo:** `app/api/projects/[id]/status/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { updateProjectStatusSchema } from "@/lib/validations/project"
import { z } from "zod"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAdmin()
  if (authError) return authError

  try {
    const { id: projectId } = await params
    const body = await request.json()

    // Validar input
    const validatedData = updateProjectStatusSchema.parse(body)

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        brand: {
          select: {
            organizationId: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Validar transições de status permitidas
    const allowedTransitions: Record<string, string[]> = {
      DRAFT: ["IN_PRODUCTION"],
      IN_PRODUCTION: ["READY", "DRAFT"],
      READY: ["APPROVED", "REVISION", "IN_PRODUCTION"],
      APPROVED: [],
      REVISION: ["IN_PRODUCTION"],
    }

    if (!allowedTransitions[project.status].includes(validatedData.status)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${project.status} to ${validatedData.status}`,
        },
        { status: 400 }
      )
    }

    // Atualizar projeto
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: validatedData.status,
      },
      include: {
        brand: true,
        template: true,
        _count: {
          select: {
            creatives: true,
          },
        },
      },
    })

    // Criar log de atividade
    await prisma.activityLog.create({
      data: {
        organizationId: project.brand.organizationId,
        userId: session!.user.id,
        action: "project_status_changed",
        description: `Projeto "${project.name}" mudou de ${project.status} para ${validatedData.status}`,
      },
    })

    // Se houver comentário, criar comment
    if (validatedData.comment) {
      await prisma.comment.create({
        data: {
          projectId,
          userId: session!.user.id,
          content: validatedData.comment,
        },
      })
    }

    return NextResponse.json(updatedProject)
  } catch (error: any) {
    console.error("Update status error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to update status" },
      { status: 500 }
    )
  }
}
```

---

### PASSO 5: Conectar form de criação de projeto

**Editar:** `app/client/projects/new/page.tsx`

**Localizar o handleSubmit (linha 65-96) e substituir por:**

```typescript
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)

  try {
    // Upload do CSV (se houver)
    let briefingCsvUrl = null
    if (briefingFile) {
      const formData = new FormData()
      formData.append("file", briefingFile)
      formData.append("bucket", "briefings")
      formData.append("folder", `briefings/${selectedBrand}`)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload briefing file")
      }

      const uploadData = await uploadResponse.json()
      briefingCsvUrl = uploadData.url
    }

    // Upload da key visual (se template for solicitado e houver arquivo)
    let keyVisualUrl = null
    if (requestNewTemplate && keyVisual) {
      const formData = new FormData()
      formData.append("file", keyVisual)
      formData.append("bucket", "templates")
      formData.append("folder", `templates/${selectedBrand}`)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload key visual")
      }

      const uploadData = await uploadResponse.json()
      keyVisualUrl = uploadData.url
    }

    // Criar projeto
    const projectData = {
      name: projectName,
      brandId: selectedBrand!,
      templateId: requestNewTemplate ? null : selectedTemplate,
      briefingCsvUrl,
      briefingData: requestNewTemplate
        ? JSON.stringify({ keyVisualUrl, notes: "Template solicitado pelo cliente" })
        : undefined,
    }

    const response = await fetch("/api/client/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create project")
    }

    const project = await response.json()

    toast.success("Projeto criado com sucesso!")

    // Redirecionar para a página do projeto
    router.push(`/client/projects/${project.id}`)
  } catch (error: any) {
    console.error("Error creating project:", error)
    toast.error(error.message || "Erro ao criar projeto")
  } finally {
    setIsSubmitting(false)
  }
}
```

**Adicionar também no topo do componente:**

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
// ... resto dos imports
```

---

## ✅ CHECKLIST SPRINT 1.2

- [ ] Zod instalado
- [ ] `lib/validations/project.ts` criado
- [ ] `app/api/client/projects/route.ts` criado (POST + GET)
- [ ] `app/api/projects/[id]/creatives/route.ts` criado
- [ ] `app/api/projects/[id]/status/route.ts` criado
- [ ] Form de criação conectado
- [ ] Teste: Criar projeto via form funciona
- [ ] Teste: Upload de briefing CSV funciona
- [ ] Teste: Validação de limites funciona
- [ ] Teste: Activity log é criado

---

## SPRINT 1.3: SISTEMA DE APROVAÇÃO

**Duração:** 3-4 dias

### PASSO 1: Implementar PATCH /api/projects/[id]/approve

**Criar arquivo:** `app/api/projects/[id]/approve/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { requireClient } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { approveProjectSchema } from "@/lib/validations/project"
import { z } from "zod"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireClient()
  if (authError) return authError

  try {
    const { id: projectId } = await params
    const body = await request.json()

    // Validar input
    const validatedData = approveProjectSchema.parse(body)

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        brand: {
          select: {
            organizationId: true,
            name: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Verificar acesso
    if (!session!.user.organizationIds.includes(project.brand.organizationId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verificar se projeto está em READY
    if (project.status !== "READY") {
      return NextResponse.json(
        { error: "Only projects with READY status can be approved" },
        { status: 400 }
      )
    }

    // Atualizar status
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "APPROVED",
      },
    })

    // Criar log de atividade
    await prisma.activityLog.create({
      data: {
        organizationId: project.brand.organizationId,
        userId: session!.user.id,
        action: "project_approved",
        description: `Projeto "${project.name}" aprovado`,
      },
    })

    // Criar comentário se fornecido
    if (validatedData.comment) {
      await prisma.comment.create({
        data: {
          projectId,
          userId: session!.user.id,
          content: validatedData.comment,
        },
      })
    }

    // TODO: Enviar notificação por email para admin

    return NextResponse.json({
      success: true,
      project: updatedProject,
    })
  } catch (error: any) {
    console.error("Approve project error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to approve project" },
      { status: 500 }
    )
  }
}
```

---

### PASSO 2: Implementar POST /api/projects/[id]/request-revision

**Criar arquivo:** `app/api/projects/[id]/request-revision/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { requireClient } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { requestRevisionSchema } from "@/lib/validations/project"
import { z } from "zod"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireClient()
  if (authError) return authError

  try {
    const { id: projectId } = await params
    const body = await request.json()

    // Validar input
    const validatedData = requestRevisionSchema.parse(body)

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        brand: {
          select: {
            organizationId: true,
            name: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Verificar acesso
    if (!session!.user.organizationIds.includes(project.brand.organizationId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verificar se projeto está em READY
    if (project.status !== "READY") {
      return NextResponse.json(
        { error: "Only projects with READY status can request revision" },
        { status: 400 }
      )
    }

    // Atualizar status
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "REVISION",
      },
    })

    // Criar comentário
    await prisma.comment.create({
      data: {
        projectId,
        userId: session!.user.id,
        content: validatedData.comment,
      },
    })

    // Criar log de atividade
    await prisma.activityLog.create({
      data: {
        organizationId: project.brand.organizationId,
        userId: session!.user.id,
        action: "revision_requested",
        description: `Revisão solicitada para projeto "${project.name}"`,
      },
    })

    // TODO: Enviar notificação por email para admin

    return NextResponse.json({
      success: true,
      project: updatedProject,
    })
  } catch (error: any) {
    console.error("Request revision error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to request revision" },
      { status: 500 }
    )
  }
}
```

---

### PASSO 3: Conectar grid de aprovação

**Editar:** `components/creative-approval-grid-grouped.tsx`

**Localizar a função de aprovação (linha 200-242) e substituir por:**

```typescript
const handleApprove = async () => {
  try {
    const response = await fetch(`/api/projects/${projectId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: approvalComment || undefined,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to approve project")
    }

    toast.success("Projeto aprovado com sucesso!")
    setShowApproveDialog(false)
    setApprovalComment("")

    // Recarregar página após 1 segundo
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error: any) {
    console.error("Approval error:", error)
    toast.error(error.message || "Erro ao aprovar projeto")
  }
}

const handleRequestRevision = async () => {
  if (!revisionComment || revisionComment.length < 10) {
    toast.error("Por favor, descreva as alterações necessárias (mínimo 10 caracteres)")
    return
  }

  try {
    const response = await fetch(`/api/projects/${projectId}/request-revision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: revisionComment,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to request revision")
    }

    toast.success("Revisão solicitada com sucesso!")
    setShowRevisionDialog(false)
    setRevisionComment("")

    // Recarregar página após 1 segundo
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error: any) {
    console.error("Revision error:", error)
    toast.error(error.message || "Erro ao solicitar revisão")
  }
}
```

---

### PASSO 4: Adicionar histórico de status

**Criar componente:** `components/project-status-history.tsx`

```typescript
"use client"

import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface StatusHistory {
  id: string
  action: string
  description: string
  createdAt: Date
  user: {
    name: string
  }
}

interface ProjectStatusHistoryProps {
  history: StatusHistory[]
}

export function ProjectStatusHistory({ history }: ProjectStatusHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Nenhuma atividade registrada
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div key={item.id} className="flex gap-4 items-start">
          <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{item.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {item.user.name}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Usar na página do projeto:**

```typescript
// Em app/client/projects/[id]/page.tsx

import { ProjectStatusHistory } from "@/components/project-status-history"

// No componente:
const activityHistory = await prisma.activityLog.findMany({
  where: {
    organizationId: project.brand.organizationId,
    description: {
      contains: project.name,
    },
  },
  include: {
    user: {
      select: {
        name: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
  take: 10,
})

// No JSX:
<div className="mt-6">
  <h3 className="font-semibold mb-4">Histórico</h3>
  <ProjectStatusHistory history={activityHistory} />
</div>
```

---

## ✅ CHECKLIST SPRINT 1.3

- [ ] `app/api/projects/[id]/approve/route.ts` criado
- [ ] `app/api/projects/[id]/request-revision/route.ts` criado
- [ ] Grid de aprovação conectado
- [ ] `components/project-status-history.tsx` criado
- [ ] Teste: Aprovar projeto funciona
- [ ] Teste: Solicitar revisão funciona
- [ ] Teste: Comentários são salvos
- [ ] Teste: Activity log é criado
- [ ] Teste: Histórico é exibido

---

## 🎉 CONCLUSÃO DA FASE 1

Parabéns! Você completou a **Fase 1 - Funcionalidades Core**.

**O que foi implementado:**
- ✅ Sistema completo de upload com Supabase Storage
- ✅ Criação de projetos via API
- ✅ Upload de criativos para projetos
- ✅ Workflow de aprovação/revisão
- ✅ Validações robustas com Zod
- ✅ Logs de atividade
- ✅ Histórico de status

**Próximos passos:**
- Avançar para **Fase 2: Páginas Faltantes**

---

_Continue lendo as próximas seções para implementar as Fases 2-8..._

