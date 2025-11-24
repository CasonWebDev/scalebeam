-- ============================================
-- CRIAR BUCKET DEDICADO PARA CRIATIVOS
-- Execute este arquivo no Supabase SQL Editor (OPCIONAL)
-- ============================================

-- NOTA: Esta migration é OPCIONAL.
-- O sistema atualmente usa o bucket 'assets' com pasta 'creatives/'
-- e funciona perfeitamente. Esta migration é apenas se você quiser
-- separar os criativos em um bucket dedicado no futuro.

-- ============================================
-- CRIAR BUCKET
-- ============================================

-- Inserir bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'creatives',
  'creatives',
  true, -- Público para exibição em campanhas
  10485760, -- 10MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLICIES RLS
-- ============================================

-- POLICY 1: Upload - Apenas admins podem fazer upload
CREATE POLICY "Only admins can upload creatives"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'creatives' AND
  (SELECT role::text FROM "User" WHERE email = auth.jwt() ->> 'email') = 'ADMIN'
);

-- POLICY 2: Read - Acesso público para visualização
CREATE POLICY "Public read access to creatives"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'creatives');

-- POLICY 3: Update - Apenas admins
CREATE POLICY "Only admins can update creatives"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'creatives' AND
  (SELECT role::text FROM "User" WHERE email = auth.jwt() ->> 'email') = 'ADMIN'
)
WITH CHECK (bucket_id = 'creatives');

-- POLICY 4: Delete - Apenas admins
CREATE POLICY "Only admins can delete creatives"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'creatives' AND
  (SELECT role::text FROM "User" WHERE email = auth.jwt() ->> 'email') = 'ADMIN'
);

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Ver configuração do bucket
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'creatives';

-- Ver policies
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%creatives%'
ORDER BY policyname;

-- ============================================
-- INSTRUÇÕES PARA ATIVAR
-- ============================================

-- Se decidir usar este bucket dedicado, você precisará:
-- 1. Executar este SQL no Supabase
-- 2. Alterar upload-creatives-modal.tsx linha 49:
--    formData.append("bucket", "creatives")  // em vez de "assets"
-- 3. Alterar linha 50:
--    formData.append("folder", projectId)    // em vez de "creatives/${projectId}"
