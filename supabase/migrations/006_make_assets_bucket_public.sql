-- ============================================
-- Tornar bucket assets PÚBLICO
-- Execute este arquivo no Supabase SQL Editor
-- ============================================

-- Problema: Templates não aparecem porque o bucket não está público
-- Solução: Tornar o bucket assets público para que as imagens possam ser acessadas

-- Atualizar bucket assets para público
UPDATE storage.buckets
SET public = true
WHERE id = 'assets';

-- Verificar se foi atualizado
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'assets';

-- Nota: O bucket briefings deve continuar PRIVADO (não público)
SELECT
  id,
  name,
  public
FROM storage.buckets
WHERE id = 'briefings';
