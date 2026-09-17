#!/usr/bin/env node
/**
 * Genera public/config-dev.js desde .env.local para desarrollo local
 */

const fs = require('fs');
const path = require('path');

// Leer .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Extraer variables
const supabaseUrl = envContent.match(/SUPABASE_URL=(.+)/)?.[1] || '';
const supabaseKey = envContent.match(/SUPABASE_ANON_KEY=(.+)/)?.[1] || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: No se encontraron SUPABASE_URL o SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

// Generar archivo
const configContent = `// Configuración para desarrollo local
// Este archivo se genera automáticamente desde .env.local
window.SUPABASE_URL = '${supabaseUrl}';
window.SUPABASE_ANON_KEY = '${supabaseKey}';
`;

const outputPath = path.join(__dirname, '..', 'public', 'config-dev.js');

// Crear directorio public si no existe
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(outputPath, configContent);
console.log('✅ Archivo public/config-dev.js generado correctamente');
