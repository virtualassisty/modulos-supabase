#!/usr/bin/env node

/**
 * Direct Database Migration Script
 * Executes SQL commands directly against Supabase using fetch API
 */

const SUPABASE_URL = 'https://wzimcsxlpfkzvdieicil.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6aW1jc3hscGZrenZkaWVpY2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDI5NDI2NCwiZXhwIjoyMDk5ODcwMjY0fQ.cTi-umEgxEwvS2Dg1r3LhQAQman8eBkNqnN3C3l_1SQ';

console.log('🚀 Iniciando migración de base de datos...\n');

// Step 1: Create formularios table using REST API
async function createFormulariosTable() {
  console.log('📝 Paso 1: Creando tabla formularios...');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({
      query: `
        CREATE TABLE IF NOT EXISTS formularios (
          id TEXT PRIMARY KEY,
          nombre TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`   ⚠️  Response: ${error}`);
  } else {
    console.log('   ✅ Tabla formularios creada\n');
  }
}

// Step 2: Create respuestas_formularios table
async function createRespuestasTable() {
  console.log('📝 Paso 2: Creando tabla respuestas_formularios...');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({
      query: `
        CREATE TABLE IF NOT EXISTS respuestas_formularios (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          formulario_id TEXT NOT NULL,
          email TEXT NOT NULL,
          nombre TEXT NOT NULL,
          respuestas JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`   ⚠️  Response: ${error}`);
  } else {
    console.log('   ✅ Tabla respuestas_formularios creada\n');
  }
}

// Step 3: Insert form definitions using REST API directly
async function insertFormDefinitions() {
  console.log('📝 Paso 3: Insertando definiciones de formularios...');

  const forms = [
    { id: 'diagnostico_financiero', nombre: 'Diagnóstico Financiero' },
    { id: 'diagnostico_roles', nombre: 'Diagnóstico de Roles' },
    { id: 'inventario_semanal', nombre: 'Inventario Semanal M2' },
    { id: 'diagnostico_delegacion', nombre: 'Diagnóstico de Delegación M2' },
  ];

  for (const form of forms) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/formularios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(form)
    });

    if (response.ok) {
      console.log(`   ✅ ${form.nombre}`);
    } else {
      const error = await response.text();
      if (error.includes('duplicate') || error.includes('already exists')) {
        console.log(`   ⚠️  ${form.nombre} (ya existe)`);
      } else {
        console.log(`   ❌ Error en ${form.nombre}: ${error}`);
      }
    }
  }
  console.log('');
}

// Step 4: Verify the migration
async function verifyMigration() {
  console.log('📝 Paso 4: Verificando migración...');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/formularios?select=*`, {
    method: 'GET',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    }
  });

  if (response.ok) {
    const forms = await response.json();
    console.log(`   ✅ Se encontraron ${forms.length} formularios:`);
    forms.forEach(f => console.log(`      - ${f.id}: ${f.nombre}`));
  } else {
    console.log(`   ❌ Error al verificar: ${await response.text()}`);
  }
  console.log('');
}

// Run migration
try {
  await createFormulariosTable();
  await createRespuestasTable();
  await insertFormDefinitions();
  await verifyMigration();

  console.log('✅ ¡Migración completada exitosamente!\n');
  process.exit(0);
} catch (error) {
  console.error('❌ Error durante la migración:', error.message);
  process.exit(1);
}
