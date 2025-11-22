-- ============================================
-- HOTFIX: Corrigir função update_organization_timestamp
-- Execute este arquivo IMEDIATAMENTE no Supabase SQL Editor
-- ============================================

-- O problema: estava usando c.id que não existe no contexto do trigger
-- A solução: usar NEW."projectId" ou OLD."projectId" diretamente

CREATE OR REPLACE FUNCTION update_organization_timestamp()
RETURNS TRIGGER AS $$
DECLARE
  v_organization_id TEXT;
BEGIN
  -- Pegar organizationId dependendo da tabela
  IF TG_TABLE_NAME = 'Brand' THEN
    v_organization_id := COALESCE(NEW."organizationId", OLD."organizationId");
  ELSIF TG_TABLE_NAME = 'Project' THEN
    SELECT b."organizationId" INTO v_organization_id
    FROM "Brand" b
    WHERE b.id = COALESCE(NEW."brandId", OLD."brandId");
  ELSIF TG_TABLE_NAME = 'Creative' THEN
    -- Corrigido: buscar diretamente usando NEW/OLD projectId
    SELECT b."organizationId" INTO v_organization_id
    FROM "Project" p
    JOIN "Brand" b ON b.id = p."brandId"
    WHERE p.id = COALESCE(NEW."projectId", OLD."projectId");
  END IF;

  -- Atualizar updatedAt da organização
  IF v_organization_id IS NOT NULL THEN
    UPDATE "Organization"
    SET "updatedAt" = NOW()
    WHERE id = v_organization_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Verificar se a função foi atualizada
SELECT
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'update_organization_timestamp';
