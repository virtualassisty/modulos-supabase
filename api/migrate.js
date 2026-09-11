/**
 * Vercel Serverless Function - Database Migration
 * Endpoint: /api/migrate
 *
 * WARNING: This should only be run once during setup!
 * Consider adding authentication or removing after migration.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional: Add a secret key check for security
  const { secret } = req.body;
  if (secret !== process.env.MIGRATION_SECRET && process.env.MIGRATION_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const SUPABASE_URL = 'https://wzimcsxlpfkzvdieicil.supabase.co';
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY not configured' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Migration SQL
    const migrations = [
      // 1. Create formularios table
      `CREATE TABLE IF NOT EXISTS formularios (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,

      // 2. Create respuestas_formularios table
      `CREATE TABLE IF NOT EXISTS respuestas_formularios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        formulario_id TEXT NOT NULL REFERENCES formularios(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        nombre TEXT NOT NULL,
        respuestas JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,

      // 3. Create indexes
      `CREATE INDEX IF NOT EXISTS idx_respuestas_formulario_id ON respuestas_formularios(formulario_id)`,
      `CREATE INDEX IF NOT EXISTS idx_respuestas_email ON respuestas_formularios(email)`,
      `CREATE INDEX IF NOT EXISTS idx_respuestas_nombre ON respuestas_formularios(nombre)`,
      `CREATE INDEX IF NOT EXISTS idx_respuestas_created_at ON respuestas_formularios(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_respuestas_jsonb ON respuestas_formularios USING GIN (respuestas)`,

      // 4. Enable RLS
      `ALTER TABLE formularios ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE respuestas_formularios ENABLE ROW LEVEL SECURITY`,
    ];

    const results = [];

    // Execute each migration
    for (const sql of migrations) {
      const { error } = await supabase.rpc('exec_sql', { query: sql });

      if (error && !error.message.includes('already exists')) {
        results.push({ sql: sql.substring(0, 50) + '...', error: error.message });
      } else {
        results.push({ sql: sql.substring(0, 50) + '...', success: true });
      }
    }

    // Insert initial form definitions
    const { error: insertError } = await supabase
      .from('formularios')
      .upsert([
        { id: 'diagnostico_financiero', nombre: 'Diagnóstico Financiero' },
        { id: 'diagnostico_roles', nombre: 'Diagnóstico de Roles' },
        { id: 'inventario_semanal', nombre: 'Inventario Semanal' },
        { id: 'diagnostico_delegacion', nombre: 'Diagnóstico de Delegación' },
      ], { onConflict: 'id' });

    if (insertError) {
      results.push({ step: 'insert_forms', error: insertError.message });
    } else {
      results.push({ step: 'insert_forms', success: true });
    }

    return res.status(200).json({
      message: 'Migration completed',
      results: results
    });

  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({
      error: 'Migration failed',
      details: error.message
    });
  }
}
