#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════
# Script de Verificación de Seguridad
# ════════════════════════════════════════════════════════════════════════════
#
# Verifica que la autenticación server-side esté correctamente configurada
#

set -e

echo "🔒 Verificación de Seguridad - Panel Admin"
echo "═══════════════════════════════════════════════════════════════"
echo ""

BASE_URL="${1:-https://modulos-theta.vercel.app}"

echo "🌐 URL Base: $BASE_URL"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# Test 1: Verificar que oauth-config NO exponga allowedEmails
# ────────────────────────────────────────────────────────────────────────────

echo "📝 Test 1: Verificando /api/oauth-config..."

OAUTH_RESPONSE=$(curl -s "$BASE_URL/api/oauth-config")

if echo "$OAUTH_RESPONSE" | grep -q "allowedEmails"; then
  echo "❌ FALLO: oauth-config expone allowedEmails (vulnerabilidad)"
  echo "   Respuesta: $OAUTH_RESPONSE"
  exit 1
else
  echo "✅ PASS: oauth-config NO expone allowedEmails"
fi

if echo "$OAUTH_RESPONSE" | grep -q "clientId"; then
  echo "✅ PASS: oauth-config devuelve clientId correctamente"
else
  echo "❌ FALLO: oauth-config no devuelve clientId"
  exit 1
fi

echo ""

# ────────────────────────────────────────────────────────────────────────────
# Test 2: Verificar que /api/admin/respuestas requiera autenticación
# ────────────────────────────────────────────────────────────────────────────

echo "📝 Test 2: Verificando protección de /api/admin/respuestas..."

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/respuestas")

if [ "$STATUS" = "401" ]; then
  echo "✅ PASS: /api/admin/respuestas devuelve 401 sin autenticación"
else
  echo "❌ FALLO: /api/admin/respuestas devuelve $STATUS (esperado: 401)"
  echo "   Esto significa que la API NO está protegida"
  exit 1
fi

echo ""

# ────────────────────────────────────────────────────────────────────────────
# Test 3: Verificar que /api/auth/verify requiera sesión
# ────────────────────────────────────────────────────────────────────────────

echo "📝 Test 3: Verificando /api/auth/verify..."

VERIFY_RESPONSE=$(curl -s "$BASE_URL/api/auth/verify")

if echo "$VERIFY_RESPONSE" | grep -q '"authenticated":false'; then
  echo "✅ PASS: /api/auth/verify devuelve authenticated:false sin sesión"
else
  echo "❌ FALLO: /api/auth/verify no responde correctamente"
  echo "   Respuesta: $VERIFY_RESPONSE"
  exit 1
fi

echo ""

# ────────────────────────────────────────────────────────────────────────────
# Test 4: Verificar que las páginas admin estén accesibles (HTML)
# ────────────────────────────────────────────────────────────────────────────

echo "📝 Test 4: Verificando páginas admin..."

LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin-panel-auth.html")
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin")

if [ "$LOGIN_STATUS" = "200" ]; then
  echo "✅ PASS: Página de login accesible (200)"
else
  echo "❌ FALLO: Página de login devuelve $LOGIN_STATUS (esperado: 200)"
  exit 1
fi

if [ "$ADMIN_STATUS" = "200" ]; then
  echo "✅ PASS: Página admin HTML accesible (200)"
  echo "   Nota: El HTML es público, pero el JavaScript verifica sesión"
else
  echo "⚠️  WARNING: Página admin devuelve $ADMIN_STATUS (esperado: 200)"
fi

echo ""

# ────────────────────────────────────────────────────────────────────────────
# Resumen
# ────────────────────────────────────────────────────────────────────────────

echo "═══════════════════════════════════════════════════════════════"
echo "✅ TODOS LOS TESTS PASARON"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🔒 La autenticación server-side está correctamente configurada:"
echo "   • oauth-config NO expone emails autorizados"
echo "   • APIs admin requieren autenticación (401 sin sesión)"
echo "   • Sistema de verificación de sesión funciona"
echo ""
echo "⚠️  IMPORTANTE: Recuerda verificar también:"
echo "   • Variables de entorno en Vercel (JWT_SECRET, SUPABASE_SERVICE_KEY)"
echo "   • Login manual con cuenta autorizada"
echo "   • Cookie httpOnly en DevTools después de login"
echo ""
