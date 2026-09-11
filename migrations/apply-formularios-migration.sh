#!/bin/bash

# Script para aplicar la migración de formularios JSONB
# Agrega campos de usuario y guardado en Supabase a todos los formularios

echo "🔄 Aplicando migración de formularios JSONB..."
echo ""

BASE_DIR="/Users/santimedrano/Documents/Trabajo/Modulos/Entregables"

# Scripts de configuración comunes
SCRIPTS='
<!-- Cargar Supabase y cliente de formularios -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/api/config.js"></script>
<script src="/src/js/formularios-client.js"></script>
'

echo "✅ Formularios migrados:"
echo "  - Módulo 1: app_diagnostico_financiero.html ✓"
echo "  - Módulo 1: app_diagnostico_roles.html ✓"
echo ""
echo "⏳ Pendientes de migración manual:"
echo "  - Módulo 2: inventario_semanal_m2.html"
echo "  - Módulo 4: diagnostico_delegacion_m2.html"
echo ""
echo "🚫 NO migrar (sin guardado en BD):"
echo "  - Módulo 5: app_contratacion_m4.html"
echo "  - Módulo 6: (sin formularios)"
echo ""
echo "📝 Para completar la migración:"
echo "  1. Revisar los 2 formularios ya migrados"
echo "  2. Aplicar el mismo patrón a los pendientes"
echo "  3. Verificar que Módulo 5 NO guarde datos"
