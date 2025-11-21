-- Script para configurar o bucket de assets no Supabase Storage
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar o bucket se não existir (provavelmente já existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Remover políticas existentes
DROP POLICY IF EXISTS "Anyone can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete assets" ON storage.objects;

-- 3. Criar políticas permissivas (público pode fazer tudo no bucket assets)
-- Nota: Em produção, você pode querer restringir baseado em auth.uid()

-- Permitir leitura pública
CREATE POLICY "Public can read assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Permitir upload público
CREATE POLICY "Public can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets');

-- Permitir update público
CREATE POLICY "Public can update assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'assets')
WITH CHECK (bucket_id = 'assets');

-- Permitir delete público
CREATE POLICY "Public can delete assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'assets');
