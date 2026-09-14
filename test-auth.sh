#!/bin/bash

# Test script para verificar que el endpoint /api/auth/login está funcionando

echo "🧪 Testing /api/auth/login endpoint..."
echo ""

# Test 1: Verificar que rechaza requests sin credentials
echo "Test 1: Sin credentials (debe dar 400)"
curl -s -X POST https://modulos-theta.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'

echo ""
echo "Test 2: Con credential inválido (debe dar 401)"
curl -s -X POST https://modulos-theta.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"credential":"fake.token.here"}' | jq '.'

echo ""
echo "✅ Si ves respuestas JSON (no errores HTML), el endpoint está funcionando!"
