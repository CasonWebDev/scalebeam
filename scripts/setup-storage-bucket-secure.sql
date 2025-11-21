-- Script SEGURO para configurar o bucket de assets no Supabase Storage
-- Este script usa autenticação para controlar acesso
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar o bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Remover políticas existentes
DROP POLICY IF EXISTS "Authenticated users can read assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete assets" ON storage.objects;

-- 3. Criar políticas baseadas em autenticação

-- Leitura pública (qualquer um pode ver assets pois o bucket é público)
CREATE POLICY "Anyone can read assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

-- Update apenas para usuários autenticados
CREATE POLICY "Authenticated users can update assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'assets')
WITH CHECK (bucket_id = 'assets');

-- Delete apenas para usuários autenticados
CREATE POLICY "Authenticated users can delete assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assets');
