-- Migration: Drop old database tables
-- Date: 2026-09-11
-- Description: Removes legacy tables (diagnosticos, respuestas) after migrating data to JSONB

-- ⚠️  WARNING: This script will permanently delete the old tables.
-- Make sure you have:
-- 1. Already executed migration 003_migrate_existing_data.sql
-- 2. Verified that all data is in respuestas_formularios table
-- 3. Have a backup of your database

-- Verify migration before dropping
SELECT
  'diagnosticos' as old_table,
  COUNT(*) as records
FROM diagnosticos
UNION ALL
SELECT
  'respuestas_formularios (migrated)' as table_name,
  COUNT(*) as records
FROM respuestas_formularios
WHERE respuestas->>'migrated_from' = 'diagnosticos_table';

-- If counts match, proceed with dropping old tables

-- 1. Drop respuestas table (child table first due to FK)
DROP TABLE IF EXISTS respuestas CASCADE;

-- 2. Drop diagnosticos table
DROP TABLE IF EXISTS diagnosticos CASCADE;

-- Verify tables are gone
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('diagnosticos', 'respuestas')
ORDER BY table_name;

-- Should return empty result

-- Show remaining tables (should only be formularios and respuestas_formularios)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Cleanup complete!
-- The old tables have been removed.
-- All data is now in the new JSONB structure:
-- - formularios (form types)
-- - respuestas_formularios (form responses with JSONB)
