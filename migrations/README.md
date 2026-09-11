# Database Migration Guide

## Step 1: Run the Migration SQL

1. Go to: https://supabase.com/dashboard/project/wzimcsxlpfkzvdieicil/sql/new
2. Copy the entire contents of `001_create_formularios_schema.sql`
3. Paste into the SQL Editor
4. Click "Run" to execute the migration

This will create:
- ✅ `formularios` table (stores form types)
- ✅ `respuestas_formularios` table (stores form submissions with JSONB)
- ✅ Indexes for performance
- ✅ RLS policies for public access
- ✅ Initial form definitions

## Step 2: Verify the Migration

Run this query in the SQL Editor to verify:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('formularios', 'respuestas_formularios');

-- Check form definitions
SELECT * FROM formularios;
```

## Step 3: Test Insert

Test that the new schema works:

```sql
-- Test inserting a response
INSERT INTO respuestas_formularios (formulario_id, email, nombre, respuestas)
VALUES (
  'diagnostico_financiero',
  'test@example.com',
  'Test User',
  '{"pregunta1": "Respuesta 1", "pregunta2": "Respuesta 2"}'::jsonb
);

-- Verify it was inserted
SELECT * FROM respuestas_formularios ORDER BY created_at DESC LIMIT 1;
```

## Troubleshooting

If you get errors about existing tables, you can drop them first:

```sql
DROP TABLE IF EXISTS respuestas_formularios CASCADE;
DROP TABLE IF EXISTS formularios CASCADE;
```

Then re-run the migration.
