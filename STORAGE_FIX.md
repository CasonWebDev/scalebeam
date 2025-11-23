# 🔧 Fix para Imagens não Carregando

## Problema
As imagens dos templates e criativos não estão sendo exibidas, mesmo que as URLs estejam corretas no banco de dados.

## Diagnóstico Completo ✅

### 1. URLs estão corretas ✅
```
https://toyzsriuzltehsrnshsp.supabase.co/storage/v1/object/public/assets/...
```

### 2. Next.js configurado corretamente ✅
```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'toyzsriuzltehsrnshsp.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
  ],
}
```

### 3. Storage funcionando ✅
```bash
curl -I "https://toyzsriuzltehsrnshsp.supabase.co/storage/v1/object/public/assets/..."
# HTTP/2 200 OK
```

## 🎯 Solução

O problema é que os **buckets não estão configurados como públicos** no Supabase Dashboard.

### Passos para Corrigir:

1. **Acesse o Supabase Dashboard:**
   - https://supabase.com/dashboard/project/toyzsriuzltehsrnshsp

2. **Vá em Storage → Configuration**

3. **Execute o script SQL:**
   - Vá em SQL Editor
   - Abra o arquivo: `scripts/verify-storage-setup.sql`
   - Execute TODO o script

4. **Verifique os buckets:**
   - Storage → Configuration
   - Certifique-se que os buckets estão marcados como **Public**:
     - ✅ `assets` → Public
     - ✅ `creatives` → Public
     - ❌ `briefings` → Private (correto)

5. **Verificar políticas RLS:**
   - O script já cria as políticas corretas
   - Políticas permitem:
     - Leitura pública para `assets` e `creatives`
     - Upload/update/delete apenas para autenticados
     - Briefings completamente privado

## 🔍 Como Verificar se Funcionou

### Teste 1: Verificar bucket público
```sql
SELECT id, name, public
FROM storage.buckets
WHERE name IN ('assets', 'creatives', 'briefings');

-- Resultado esperado:
-- assets     | true
-- creatives  | true
-- briefings  | false
```

### Teste 2: Testar URL no navegador
Abra uma das URLs do banco:
```
https://toyzsriuzltehsrnshsp.supabase.co/storage/v1/object/public/assets/templates/1763829549531-tb18x74mth.png
```

Deve mostrar a imagem diretamente.

### Teste 3: Verificar no app
1. Acesse `/admin/templates`
2. As imagens dos templates devem aparecer
3. Acesse uma template request
4. O Key Visual deve aparecer destacado

## 📋 Checklist de Configuração

- [ ] Buckets criados no Supabase
- [ ] Buckets marcados como públicos (exceto briefings)
- [ ] Políticas RLS aplicadas
- [ ] Next.js config com domínio Supabase
- [ ] .env.local com variáveis corretas
- [ ] Service role key configurada (para upload admin)

## 🚨 Importante

**NÃO** torne o bucket `briefings` público! Ele deve permanecer privado para proteger dados sensíveis dos clientes.

## 📝 Estrutura dos Buckets

```
assets/          (PUBLIC)
├── templates/   → Key visuals dos templates
├── {brandId}/
│   ├── key-visuals/  → KVs enviados pelos clientes
│   └── logos/        → Logos das marcas

creatives/       (PUBLIC)
└── {projectId}/ → Criativos gerados

briefings/       (PRIVATE)
└── {brandId}/   → Documentos de briefing
```

## 🔗 Links Úteis

- Dashboard Supabase: https://supabase.com/dashboard/project/toyzsriuzltehsrnshsp
- Documentação Storage: https://supabase.com/docs/guides/storage
- RLS Policies: https://supabase.com/docs/guides/auth/row-level-security
