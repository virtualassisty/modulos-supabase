-- Migration: Add old forms to formularios table
-- Date: 2026-09-11
-- Description: Adds the 3 old forms (paso1, paso2, operaciones_saludables) to formularios table

-- Insert the 3 old form definitions
INSERT INTO formularios (id, nombre) VALUES
  ('diagnostico_paso1', 'Diagnóstico Assistify - Paso 1'),
  ('diagnostico_paso2', 'Diagnóstico Assistify - Paso 2'),
  ('operaciones_saludables', 'Diagnóstico Operaciones Saludables')
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre;

-- Verify
SELECT * FROM formularios ORDER BY id;
