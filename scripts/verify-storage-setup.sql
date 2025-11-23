-- ==================================================
-- SCRIPT DE VERIFICAÇÃO E CORREÇÃO DO STORAGE
-- ==================================================

-- 1. Verificar buckets existentes
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 2. Tornar buckets públicos (EXECUTE ISTO!)
UPDATE storage.buckets
SET public = true
WHERE name IN ('assets', 'creatives', 'briefings');

-- 3. Verificar políticas existentes
SELECT
  policyname,
  tablename,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;

-- 4. REMOVER políticas antigas (se existirem)
DROP POLICY IF EXISTS "Allow authenticated uploads to assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to assets" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated uploads to briefings" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read access to briefings" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to briefings" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to briefings" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated uploads to creatives" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to creatives" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to creatives" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to creatives" ON storage.objects;

-- 5. CRIAR políticas corretas

-- ============================================
-- BUCKET: assets (público para leitura)
-- ============================================

CREATE POLICY "Public read access for assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets');

CREATE POLICY "Authenticated upload to assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

CREATE POLICY "Authenticated update assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'assets')
WITH CHECK (bucket_id = 'assets');

CREATE POLICY "Authenticated delete assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'assets');

-- ============================================
-- BUCKET: creatives (público para leitura)
-- ============================================

CREATE POLICY "Public read access for creatives"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'creatives');

CREATE POLICY "Authenticated upload to creatives"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'creatives');

CREATE POLICY "Authenticated update creatives"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'creatives')
WITH CHECK (bucket_id = 'creatives');

CREATE POLICY "Authenticated delete creatives"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'creatives');

-- ============================================
-- BUCKET: briefings (privado, apenas autenticados)
-- ============================================

CREATE POLICY "Authenticated read briefings"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'briefings');

CREATE POLICY "Authenticated upload to briefings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'briefings');

CREATE POLICY "Authenticated update briefings"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'briefings')
WITH CHECK (bucket_id = 'briefings');

CREATE POLICY "Authenticated delete briefings"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'briefings');

-- 6. Verificar novamente
SELECT
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets
ORDER BY name;

SELECT
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
