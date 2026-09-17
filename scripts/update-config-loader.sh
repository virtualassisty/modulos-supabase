#!/bin/bash
# Actualiza todos los archivos HTML para usar el loader de configuración dinámico

files=(
  "src/forms/assistify/operaciones-saludables.html"
  "src/forms/assistify/paso1.html"
  "src/forms/assistify/paso2.html"
  "src/forms/entregables/Modulo 1/app_diagnostico_financiero.html"
  "src/forms/entregables/Modulo 2/1. inventario_semanal_m2.html"
  "src/forms/entregables/Modulo 4/2. diagnostico_delegacion_m2.html"
  "src/admin/index.html"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Actualizando $file..."
    # Backup
    cp "$file" "$file.bak"

    # Reemplazar la carga directa de config.js con el loader dinámico
    sed -i '' '/<script src="\/api\/config.js"><\/script>/c\
<script>\
  \/\/ Cargar configuración según el entorno\
  const isLocal = window.location.hostname === '"'"'localhost'"'"' || window.location.hostname === '"'"'127.0.0.1'"'"';\
  const configScript = document.createElement('"'"'script'"'"');\
  configScript.src = isLocal ? '"'"'\/public\/config-dev.js'"'"' : '"'"'\/api\/config.js'"'"';\
  configScript.onerror = function() {\
    \/\/ Si falla en local, intentar con \/api\/config.js (por si usa vercel dev)\
    if (isLocal) {\
      const fallbackScript = document.createElement('"'"'script'"'"');\
      fallbackScript.src = '"'"'\/api\/config.js'"'"';\
      document.head.appendChild(fallbackScript);\
    }\
  };\
  document.head.appendChild(configScript);\
<\/script>
' "$file"

    echo "✅ $file actualizado"
  fi
done

echo ""
echo "✅ Todos los archivos actualizados"
echo "Para restaurar los archivos originales: find . -name '*.bak' -exec bash -c 'mv \"{}\" \"\${0%.bak}\"' {} \;"
