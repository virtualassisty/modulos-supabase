-- Migration: Create new JSONB-based schema for formularios
-- Date: 2026-09-11
-- Description: Creates tables for storing form definitions and responses with JSONB

-- 1. Create formularios table
CREATE TABLE IF NOT EXISTS formularios (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create respuestas_formularios table
CREATE TABLE IF NOT EXISTS respuestas_formularios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulario_id TEXT NOT NULL REFERENCES formularios(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  respuestas JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_respuestas_formulario_id ON respuestas_formularios(formulario_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_email ON respuestas_formularios(email);
CREATE INDEX IF NOT EXISTS idx_respuestas_nombre ON respuestas_formularios(nombre);
CREATE INDEX IF NOT EXISTS idx_respuestas_created_at ON respuestas_formularios(created_at DESC);

-- 4. Create GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_respuestas_jsonb ON respuestas_formularios USING GIN (respuestas);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE formularios ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_formularios ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for public read/write access
-- Formularios: Everyone can read
CREATE POLICY "Public can read formularios"
  ON formularios
  FOR SELECT
  USING (true);

-- Formularios: Authenticated users can insert (optional - adjust based on your needs)
CREATE POLICY "Public can insert formularios"
  ON formularios
  FOR INSERT
  WITH CHECK (true);

-- Respuestas: Everyone can insert (for form submissions)
CREATE POLICY "Public can insert respuestas"
  ON respuestas_formularios
  FOR INSERT
  WITH CHECK (true);

-- Respuestas: Everyone can read their own submissions
CREATE POLICY "Public can read respuestas"
  ON respuestas_formularios
  FOR SELECT
  USING (true);

-- 7. Insert initial form definitions
INSERT INTO formularios (id, nombre) VALUES
  ('diagnostico_financiero', 'Diagnóstico Financiero'),
  ('diagnostico_roles', 'Diagnóstico de Roles'),
  ('inventario_semanal', 'Inventario Semanal'),
  ('diagnostico_delegacion', 'Diagnóstico de Delegación')
ON CONFLICT (id) DO NOTHING;

-- 8. Add comments for documentation
COMMENT ON TABLE formularios IS 'Stores form definitions/types';
COMMENT ON TABLE respuestas_formularios IS 'Stores form responses with JSONB for flexible field structure';
COMMENT ON COLUMN respuestas_formularios.respuestas IS 'JSONB field containing all form answers as key-value pairs';
