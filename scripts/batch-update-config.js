#!/usr/bin/env node
/**
 * Actualiza todos los archivos HTML para usar el loader de configuración dinámico
 * con carga secuencial para evitar race conditions
 */

const fs = require('fs');
const path = require('path');

const files = [
  'src/forms/assistify/paso1.html',
  'src/forms/assistify/paso2.html',
  'src/forms/assistify/operaciones-saludables.html',
  'src/forms/entregables/Modulo 2/1. inventario_semanal_m2.html',
  'src/forms/entregables/Modulo 4/2. diagnostico_delegacion_m2.html',
  'src/admin/index.html',
];

// Loader que espera a que config.js se cargue antes de cargar formularios-client.js
const loaderWithSequentialLoad = `<script>
  // Cargar configuración según el entorno y luego el cliente de formularios
  (function() {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const configScript = document.createElement('script');
    configScript.src = isLocal ? '/public/config-dev.js' : '/api/config.js';

    // Cuando la configuración se carga, cargar el cliente de formularios
    configScript.onload = function() {
      const clientScript = document.createElement('script');
      clientScript.src = '/src/js/formularios-client.js?v=2';
      document.head.appendChild(clientScript);
    };

    // Si falla en local, intentar con /api/config.js (por si usa vercel dev)
    configScript.onerror = function() {
      if (isLocal) {
        const fallbackScript = document.createElement('script');
        fallbackScript.src = '/api/config.js';
        fallbackScript.onload = function() {
          const clientScript = document.createElement('script');
          clientScript.src = '/src/js/formularios-client.js?v=2';
          document.head.appendChild(clientScript);
        };
        document.head.appendChild(fallbackScript);
      }
    };

    document.head.appendChild(configScript);
  })();
</script>`;

// Loader compacto para archivos sin formularios-client.js
const loaderSimple = `<script>
  (function() {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const s = document.createElement('script');
    s.src = isLocal ? '/public/config-dev.js' : '/api/config.js';
    s.onerror = () => { if (isLocal) { const f = document.createElement('script'); f.src = '/api/config.js'; document.head.appendChild(f); } };
    document.head.appendChild(s);
  })();
</script>`;

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Determinar si el archivo tiene formularios-client.js
  const hasFormulariosClient = content.includes('formularios-client.js');

  // Patrón 1: <script src="/api/config.js"></script> seguido de formularios-client
  const pattern1 = /<script\s+src=["']\/api\/config\.js["']><\/script>\s*<script\s+src=["']\/src\/js\/formularios-client\.js[^"']*["']><\/script>/g;

  // Patrón 2: Solo <script src="/api/config.js"></script>
  const pattern2 = /<script\s+src=["']\/api\/config\.js["']><\/script>/g;

  // Patrón 3: Loader ya existente (para no duplicar)
  const pattern3 = /<script>\s*\(function\(\)\s*\{\s*const isLocal = /g;

  if (pattern3.test(content)) {
    console.log(`⏭️  ${file} - Ya tiene el loader actualizado`);
    return;
  }

  let updated = false;

  if (hasFormulariosClient && pattern1.test(content)) {
    content = content.replace(pattern1, loaderWithSequentialLoad);
    updated = true;
  } else if (pattern2.test(content)) {
    content = content.replace(pattern2, hasFormulariosClient ? loaderWithSequentialLoad : loaderSimple);
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${file}`);
  } else {
    console.log(`⏭️  ${file} - No necesita actualización`);
  }
});

console.log('\n✅ Proceso completado');
