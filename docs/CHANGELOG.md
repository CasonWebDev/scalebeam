# Changelog - ScaleBeam

Todas as mudanças notáveis do projeto serão documentadas neste arquivo.

---

## [Sprint 1.3] - 2025-11-19

### ✨ Funcionalidades Adicionadas

#### Sistema de Aprovação de Projetos
- **Endpoint de Aprovação** (`PATCH /api/projects/[id]/approve`)
  - Permite clientes aprovarem projetos em status READY
  - Valida permissões baseadas em organização
  - Cria logs de atividade automáticos
  - Suporta comentários opcionais

- **Endpoint de Solicitação de Revisão** (`POST /api/projects/[id]/request-revision`)
  - Permite clientes solicitarem ajustes em projetos
  - Comentário obrigatório (mínimo 10 caracteres)
  - Muda status do projeto para REVISION
  - Notifica através de activity logs

#### Sistema de Atualização em Tempo Real
- **Auto-Refresh Automático**
  - Atualiza página do cliente a cada 30 segundos
  - Contador regressivo visível
  - Opção de pausar/retomar

- **Botão de Refresh Manual**
  - Atualização instantânea sob demanda
  - Feedback visual com animação
  - Mais rápido que F5

- **Componente de Histórico de Status**
  - Timeline visual de atividades do projeto
  - Cores diferenciadas por tipo de ação
  - Datas formatadas em português
  - Suporte para múltiplos tipos de eventos

### 🔒 Melhorias de Segurança

#### Fase 0: Correções Críticas (Já Implementadas)
- ✅ Campo `passwordHash` no schema User
- ✅ Validação de senha com bcrypt ativa
- ✅ Helper de autorização (`lib/api-auth.ts`)
- ✅ Rotas admin protegidas com `requireAdmin()`
- ✅ NEXTAUTH_SECRET configurado
- ✅ Script de teste de autenticação criado

### 🔧 Componentes Criados

1. **`components/project-approval-actions.tsx`** (Atualizado)
   - Integração com API real (substituiu mocks)
   - Validação client-side
   - Tratamento de erros robusto

2. **`components/project-status-history.tsx`** (Novo)
   - Timeline de atividades
   - Formatação de datas com date-fns
   - Design limpo e profissional

3. **`components/project-refresh-button.tsx`** (Novo)
   - Refresh manual com router.refresh()
   - Animação de loading
   - Feedback visual

4. **`components/project-auto-refresh.tsx`** (Novo)
   - Timer regressivo de 30s
   - Controle de pausa/retomada
   - Atualização automática em background

### 📝 Endpoints de API

#### Novos
- `PATCH /api/projects/[id]/approve` - Aprovar projeto
- `POST /api/projects/[id]/request-revision` - Solicitar revisão

#### Existentes (Já Implementados)
- `POST /api/upload` - Upload de arquivos
- `GET/POST /api/client/projects` - CRUD de projetos
- `GET/POST /api/projects/[id]/creatives` - Criativos do projeto
- `PATCH /api/projects/[id]/status` - Atualizar status

### 📚 Documentação

#### Novos Documentos
- `docs/SPRINT_1.3_SISTEMA_APROVACAO.md` - Documentação completa do sprint
- `docs/FIX_REFRESH_CRIATIVOS.md` - Solução do problema de sincronização
- `docs/CHANGELOG.md` - Este arquivo
- `scripts/test-password.ts` - Script de teste de autenticação

### 🐛 Correções

- **Fix: Criativos não apareciam para cliente sem refresh manual**
  - Problema: Server Components não atualizavam automaticamente
  - Solução: Auto-refresh + botão manual
  - Detalhes: Ver `docs/FIX_REFRESH_CRIATIVOS.md`

### 🔄 Fluxo de Trabalho Atualizado

#### Aprovação de Projetos
```
1. Cliente acessa projeto (status READY)
2. Revisa criativos no grid
3. Opção A: Clica "Aprovar" → Status: APPROVED
4. Opção B: Clica "Solicitar Ajustes" → Status: REVISION
5. Activity log criado automaticamente
6. Admin notificado (logs)
```

#### Sincronização Admin → Cliente
```
1. Admin adiciona criativos via API
2. Criativos salvos no banco
3. Cliente vê automaticamente (até 30s)
4. Ou: Cliente clica "Atualizar" (instantâneo)
```

### 🧪 Testes

- ✅ Aprovação de projeto com status READY
- ✅ Rejeição de aprovação com status != READY
- ✅ Solicitação de revisão com comentário válido
- ✅ Rejeição de revisão sem comentário
- ✅ Verificação de permissões por organização
- ✅ Activity logs criados corretamente
- ✅ Auto-refresh funciona a cada 30s
- ✅ Botão de refresh manual funciona
- ✅ Validação de senhas com bcrypt

### 📊 Validações Implementadas

**Schemas Zod:**
- `approveProjectSchema` - Aprovação (comentário opcional)
- `requestRevisionSchema` - Revisão (comentário obrigatório, min 10 chars)

**Regras de Negócio:**
- Projeto deve estar em READY para aprovar/revisar
- Usuário deve ter acesso à organização do projeto
- APPROVED é status final (não pode mudar)
- Comentário de revisão mínimo 10 caracteres

### 🚀 Performance

- Auto-refresh usa `router.refresh()` (mais rápido que reload)
- Server Components mantidos (SEO e performance)
- Validações em múltiplas camadas
- Cache otimizado com `force-dynamic`

### 🎯 Próximos Passos

**Sprint 1.4 - Páginas e Listagens:**
- Dashboard com métricas
- Listagem de projetos com filtros
- Página de detalhes da marca
- Melhorias de UX

**Melhorias Futuras:**
- Notificações por email
- Testes automatizados (Jest/Playwright)
- Toast quando novos criativos são detectados
- Seleção individual de criativos para revisão

---

## [Sprint 1.2] - 2025-11-19

### ✨ Funcionalidades
- Workflow de projetos implementado
- Upload de criativos em lote
- Validações com Zod
- Activity logging completo

---

## [Sprint 1.1] - 2025-11-19

### ✨ Funcionalidades
- Sistema de upload com Supabase Storage
- 6 buckets configurados (públicos e privados)
- Validação de tipos e tamanhos
- URLs assinadas para arquivos privados

---

## [Inicial] - 2025-11-18

### 🎉 Setup Inicial
- Projeto Next.js 15 criado
- Prisma + Supabase configurado
- Autenticação com NextAuth
- Schema do banco definido
- Seeds de teste criados
