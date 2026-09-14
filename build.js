#!/usr/bin/env node

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Funciones API que necesitan bundling
const apiFunctions = [
  'api/auth/login.js',
  'api/auth/logout.js',
  'api/auth/verify.js',
];

// Crear directorio de salida
const outDir = '.vercel_build_output';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('📦 Building API functions with esbuild...\n');

// Bundlear cada función
apiFunctions.forEach(async (funcPath) => {
  try {
    const result = await esbuild.build({
      entryPoints: [funcPath],
      bundle: true,
      platform: 'node',
      target: 'node18',
      outfile: path.join(outDir, funcPath),
      external: [], // Bundlear todo
      format: 'cjs',
      minify: false,
      sourcemap: false,
    });

    console.log(`✅ Built: ${funcPath}`);
  } catch (error) {
    console.error(`❌ Error building ${funcPath}:`, error);
    process.exit(1);
  }
});

console.log('\n✨ Build complete!');
