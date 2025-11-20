# Sprint 1.3: Sistema de Aprovação

**Data de implementação:** 19 de Novembro de 2025
**Status:** ✅ Concluído

## Objetivo

Implementar o sistema completo de aprovação e solicitação de revisão de projetos, com endpoints de API, integração frontend e componente de histórico de atividades.

## Implementações Realizadas

### 1. Endpoint de Aprovação (`app/api/projects/[id]/approve/route.ts`)

**PATCH /api/projects/[id]/approve**

Endpoint para aprovar projetos finalizados.

**Request:**
```json
{
  "comment": "Aprovado! Excelente trabalho." // opcional
}
```

**Validações:**
1. Autenticação obrigatória
2. Usuário deve ter acesso ao projeto (mesma organização ou admin)
3. Projeto deve estar em status READY
4. Schema validado com Zod

**Fluxo:**
1. Valida dados com `approveProjectSchema`
2. Busca projeto e verifica permissões
3. Verifica se status é READY
4. Atualiza status para APPROVED
5. Cria log de atividade
6. Adiciona comentário se fornecido
7. Retorna projeto atualizado

**Response (200):**
```json
{
  "success": true,
  "project": {
    "id": "...",
    "name": "Campanha Black Friday",
    "status": "APPROVED",
    "brand": { ... },
    "template": { ... },
    "_count": {
      "creatives": 50,
      "comments": 3
    }
  },
  "message": "Project approved successfully"
}
```

**Errors:**
- 400: Projeto não está em READY
- 403: Sem permissão para acessar projeto
- 404: Projeto não encontrado

---

### 2. Endpoint de Solicitação de Revisão (`app/api/projects/[id]/request-revision/route.ts`)

**POST /api/projects/[id]/request-revision**

Endpoint para solicitar revisões em projetos.

**Request:**
```json
{
  "comment": "Por favor ajustar o logo e as cores do CTA",
  "creativeIds": ["creative1", "creative2"] // opcional
}
```

**Validações:**
1. Autenticação obrigatória
2. Usuário deve ter acesso ao projeto
3. Projeto deve estar em status READY
4. Comentário mínimo de 10 caracteres
5. Schema validado com Zod

**Fluxo:**
1. Valida dados com `requestRevisionSchema`
2. Busca projeto e verifica permissões
3. Verifica se status é READY
4. Atualiza status para REVISION
5. Cria comentário obrigatório
6. Cria log de atividade
7. Retorna projeto atualizado

**Response (200):**
```json
{
  "success": true,
  "project": {
    "id": "...",
    "name": "Campanha Black Friday",
    "status": "REVISION",
    "brand": { ... },
    "_count": {
      "creatives": 50,
      "comments": 4
    }
  },
  "message": "Revision requested successfully"
}
```

**Errors:**
- 400: Projeto não está em READY ou comentário muito curto
- 403: Sem permissão
- 404: Projeto não encontrado

---

### 3. Integração Frontend (`components/project-approval-actions.tsx`)

Atualizado para usar as APIs reais em vez de mocks.

**Função handleApprove:**
```typescript
const handleApprove = async () => {
  setIsApproving(true)

  try {
    const response = await fetch(`/api/projects/${projectId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to approve project")
    }

    toast.success("Criativos aprovados com sucesso!")

    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error: any) {
    toast.error(error.message || "Erro ao aprovar projeto")
    setIsApproving(false)
  }
}
```

**Função handleRequestRevision:**
```typescript
const handleRequestRevision = async () => {
  if (!revisionNotes.trim() || revisionNotes.length < 10) {
    toast.error("Por favor, descreva os ajustes necessários (mínimo 10 caracteres)")
    return
  }

  setIsRequesting(true)

  try {
    const response = await fetch(`/api/projects/${projectId}/request-revision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: revisionNotes,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to request revision")
    }

    toast.success("Solicitação de ajustes enviada!")

    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error: any) {
    toast.error(error.message || "Erro ao solicitar revisão")
    setIsRequesting(false)
  }
}
```

**Melhorias:**
- ✅ Validação de mínimo 10 caracteres no comentário
- ✅ Tratamento de erros com toast
- ✅ Loading states apropriados
- ✅ Reload automático após sucesso

---

### 4. Componente de Histórico (`components/project-status-history.tsx`)

Novo componente para exibir timeline de atividades do projeto.

**Features:**
- Timeline visual com linha conectora
- Cores por tipo de ação
- Formatação de datas relativas (ex: "há 2 horas")
- Localização em português brasileiro
- Ícones e cores diferenciadas

**Tipos de Ação Suportados:**
- `created_project` - Projeto criado (azul)
- `uploaded_creatives` - Criativos adicionados (verde)
- `updated_project_status` - Status atualizado (amarelo)
- `project_approved` - Projeto aprovado (verde esmeralda)
- `revision_requested` - Revisão solicitada (laranja)

**Uso:**
```typescript
import { ProjectStatusHistory } from "@/components/project-status-history"

// No componente da página:
const activityHistory = await prisma.activityLog.findMany({
  where: {
    organizationId: project.brand.organizationId,
    OR: [
      { description: { contains: project.name } },
      { description: { contains: project.id } }
    ]
  },
  orderBy: {
    createdAt: "desc",
  },
  take: 20,
})

// No JSX:
<div className="mt-6">
  <h3 className="font-semibold mb-4">Histórico de Atividades</h3>
  <ProjectStatusHistory history={activityHistory} />
</div>
```

---

## Fluxo Completo de Aprovação

### Cenário 1: Aprovação Direta

1. Cliente acessa projeto com status READY
2. Revisa todos os criativos no grid
3. Clica em "Aprovar Criativos"
4. Confirma no dialog
5. Sistema chama `PATCH /api/projects/[id]/approve`
6. Status muda para APPROVED
7. Log criado: "Projeto aprovado por [Nome Cliente]"
8. Toast de sucesso
9. Página recarrega mostrando novo status

### Cenário 2: Solicitação de Revisão

1. Cliente acessa projeto com status READY
2. Identifica ajustes necessários
3. Clica em "Solicitar Ajustes"
4. Escreve descrição detalhada (mínimo 10 caracteres)
5. Confirma solicitação
6. Sistema chama `POST /api/projects/[id]/request-revision`
7. Status muda para REVISION
8. Comentário salvo no projeto
9. Log criado: "Revisão solicitada por [Nome Cliente]"
10. Admin recebe notificação (futuro)
11. Toast de sucesso
12. Página recarrega mostrando novo status

---

## Segurança

### Validações por Camada

**Frontend:**
- Validação de campo obrigatório (revisão)
- Validação de mínimo de caracteres
- Feedback visual imediato
- Disable de botões durante loading

**API:**
- Validação com Zod schemas
- Verificação de autenticação (requireAuth)
- Verificação de permissões (organizationIds)
- Validação de transição de status
- Validação de existência do projeto

**Database:**
- Foreign keys garantem integridade
- Índices otimizam queries
- Cascade deletes configurados

### Autorização

**Níveis de Acesso:**
- **ADMIN**: Pode aprovar/revisar qualquer projeto
- **CLIENT**: Só pode aprovar/revisar projetos da sua organização
- Verificação automática via `session.user.organizationIds`

---

## Activity Logging

Todas as ações são registradas com detalhes:

```typescript
await prisma.activityLog.create({
  data: {
    organizationId: project.brand.organizationId,
    userId: session!.user.id,
    action: "project_approved",
    description: `Projeto "${project.name}" aprovado por ${session!.user.name}`,
  },
})
```

**Ações Registradas:**
- `project_approved` - Aprovação de projeto
- `revision_requested` - Solicitação de revisão
- `project_created` - Criação de projeto
- `uploaded_creatives` - Upload de criativos
- `updated_project_status` - Mudança manual de status

---

## Testes Realizados

- ✅ Aprovação de projeto com status READY
- ✅ Tentativa de aprovar projeto com status diferente de READY (deve falhar)
- ✅ Solicitação de revisão com comentário válido
- ✅ Tentativa de revisão sem comentário (deve falhar)
- ✅ Tentativa de revisão com comentário muito curto (deve falhar)
- ✅ Verificação de permissões (cliente de outra org não pode aprovar)
- ✅ Activity logs criados corretamente
- ✅ Comentários salvos no banco
- ✅ Loading states no frontend
- ✅ Tratamento de erros
- ✅ Reload automático após sucesso

---

## Exemplos de Uso

### Aprovar Projeto via API

```typescript
const response = await fetch('/api/projects/abc123/approve', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    comment: 'Aprovado! Ficou excelente.',
  }),
})

const { project } = await response.json()
console.log(project.status) // "APPROVED"
```

### Solicitar Revisão via API

```typescript
const response = await fetch('/api/projects/abc123/request-revision', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    comment: 'Por favor ajustar cores do CTA e aumentar logo.',
    creativeIds: ['creative1', 'creative2'],
  }),
})

const { project } = await response.json()
console.log(project.status) // "REVISION"
```

---

## Limitações e Considerações

1. **Status APPROVED é final:**
   - Uma vez aprovado, não permite mais mudanças
   - Design intencional para garantir integridade
   - Se precisar alterar, deve criar novo projeto

2. **Apenas projetos READY podem ser aprovados/revisados:**
   - Garante que todos os criativos foram entregues
   - Admin deve marcar como READY primeiro

3. **Comentário obrigatório em revisões:**
   - Mínimo 10 caracteres
   - Garante feedback útil para o admin

4. **Reload de página:**
   - Atualmente usa `window.location.reload()`
   - Pode ser melhorado com revalidation do Next.js no futuro

---

## Próximos Passos (Futuro)

- [ ] Implementar notificações por email
- [ ] Adicionar seleção individual de criativos para revisão
- [ ] Implementar aprovação parcial de criativos
- [ ] Adicionar timestamps de SLA (tempo de resposta)
- [ ] Dashboard de métricas de aprovação
- [ ] Histórico de versões de criativos

---

## Arquivos Criados/Modificados

### Novos Arquivos
- `app/api/projects/[id]/approve/route.ts` - Endpoint de aprovação
- `app/api/projects/[id]/request-revision/route.ts` - Endpoint de revisão
- `components/project-status-history.tsx` - Componente de histórico
- `scripts/test-password.ts` - Script de teste de autenticação
- `docs/SPRINT_1.3_SISTEMA_APROVACAO.md` - Esta documentação

### Arquivos Modificados
- `components/project-approval-actions.tsx` - Integração com API real

---

## Conclusão

O Sprint 1.3 foi concluído com sucesso! O sistema de aprovação está completo e funcional, com:

- ✅ Endpoints de API robustos e validados
- ✅ Integração frontend-backend completa
- ✅ Sistema de permissões baseado em organizações
- ✅ Activity logging completo
- ✅ Componente de histórico visual
- ✅ Validações em todas as camadas
- ✅ Tratamento de erros apropriado

O sistema está pronto para uso em produção e para os próximos sprints de desenvolvimento.

---

**Próximo Sprint:** 1.4 - Páginas de Detalhes e Listagens
