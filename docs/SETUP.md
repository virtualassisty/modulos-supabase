# 🚀 Guía de Configuración - Autenticación Segura

## Instalación de Dependencias

```bash
npm install
```

Esto instalará:
- `google-auth-library` - Verificación de JWT de Google
- `jose` - Creación y verificación de JWT propios
- `@supabase/supabase-js` - Cliente de Supabase

## Configuración de Variables de Entorno

### 1. Generar JWT_SECRET

```bash
openssl rand -base64 32
```

Copiar el resultado.

### 2. Obtener SUPABASE_SERVICE_KEY

1. Ir a: https://supabase.com/dashboard/project/[tu-proyecto]/settings/api
2. Copiar **"service_role key"** (la que dice "secret")
3. ⚠️ NO usar la "anon key" - necesitas la service_role

### 3. Configurar en Vercel

```bash
# Configurar JWT_SECRET
vercel env add JWT_SECRET

# Cuando pregunte el valor, pegar el secret generado
# Seleccionar: Production, Preview, Development

# Configurar SUPABASE_SERVICE_KEY
vercel env add SUPABASE_SERVICE_KEY

# Pegar la service_role key de Supabase
# Seleccionar: Production, Preview, Development

# Configurar GOOGLE_OAUTH_CLIENT_ID (si no está)
vercel env add GOOGLE_OAUTH_CLIENT_ID

# Pegar tu Client ID de Google
# Seleccionar: Production, Preview, Development
```

### 4. Verificar Variables Configuradas

```bash
vercel env ls
```

Deberías ver:
- ✅ `JWT_SECRET`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_KEY`
- ✅ `GOOGLE_OAUTH_CLIENT_ID`

## Configuración de Google OAuth

### 1. Crear OAuth Client ID

1. Ir a: https://console.cloud.google.com/apis/credentials
2. Click en **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Tipo de aplicación: **"Web application"**

### 2. Configurar Orígenes y Redirecciones

**Authorized JavaScript origins:**
```
https://modulos-theta.vercel.app
http://localhost:3000
```

**Authorized redirect URIs:**
```
https://modulos-theta.vercel.app/admin-panel-auth.html
http://localhost:3000/admin-panel-auth.html
```

### 3. Copiar Client ID

Copiar el **Client ID** que empieza con algo como:
```
1019622012963-xxxxxxxxxxxx.apps.googleusercontent.com
```

Y configurarlo en Vercel (paso 3 arriba).

## Deploy

```bash
# Deploy a producción
vercel --prod

# O usar el script
npm run deploy
```

## Verificación Post-Deploy

### 1. Verificar que los endpoints funcionen

```bash
# Verificar oauth-config (debe devolver solo clientId)
curl https://modulos-theta.vercel.app/api/oauth-config

# Resultado esperado:
# {"clientId":"1019622012963-xxx.apps.googleusercontent.com"}
# ❌ NO debe incluir "allowedEmails"
```

### 2. Verificar autenticación requerida

```bash
# Intentar acceder sin sesión
curl https://modulos-theta.vercel.app/api/admin/respuestas

# Resultado esperado:
# {"error":"Unauthorized","message":"Debes iniciar sesión para acceder a este recurso"}
```

### 3. Probar login completo

1. Ir a: https://modulos-theta.vercel.app/admin-panel-auth.html
2. Click en "Iniciar sesión con Google"
3. Seleccionar cuenta autorizada
4. Debe redirigir a `/admin` y mostrar el panel

### 4. Verificar cookie httpOnly

En la consola del navegador (después de login):
```javascript
document.cookie
// NO debe mostrar 'admin_session'
```

En las DevTools → Application → Cookies:
- ✅ Debe existir `admin_session`
- ✅ Debe tener flag `HttpOnly`
- ✅ Debe tener flag `Secure` (en producción)
- ✅ Debe tener `SameSite=Strict`

## Desarrollo Local

### 1. Crear .env.local

```bash
cp .env.example .env.local
```

Completar con tus valores.

### 2. Ejecutar servidor local

```bash
npm run dev
```

### 3. Configurar Google OAuth para localhost

Agregar en Google Cloud Console:
- **Authorized JavaScript origins**: `http://localhost:3000`
- **Authorized redirect URIs**: `http://localhost:3000/admin-panel-auth.html`

## Troubleshooting

### Error: "JWT_SECRET not configured"

**Solución:**
```bash
vercel env add JWT_SECRET
# Pegar el secret generado con openssl
vercel env pull  # Descargar variables localmente
```

### Error: "SUPABASE_SERVICE_KEY not configured"

**Solución:**
```bash
vercel env add SUPABASE_SERVICE_KEY
# Pegar la service_role key de Supabase (NO la anon key)
```

### Error: "Invalid token" al hacer login

**Posibles causas:**
1. Google OAuth Client ID incorrecto
2. Dominios no autorizados en Google Cloud Console
3. Token expirado (reintentar login)

**Verificar:**
```bash
# Ver variables configuradas
vercel env ls

# Verificar GOOGLE_OAUTH_CLIENT_ID
vercel env pull
cat .env.local | grep GOOGLE_OAUTH_CLIENT_ID
```

### Error: "Unauthorized" al acceder al panel

**Solución:**
1. Cerrar sesión: Click en "Cerrar sesión"
2. Limpiar cookies: DevTools → Application → Cookies → Delete all
3. Volver a hacer login

### Cookie no persiste después de login

**Posibles causas:**
1. Flag `Secure` activo en localhost (solo funciona en HTTPS)
2. Dominio incorrecto

**Verificar:**
En `api/auth/login.js:127-128`:
```javascript
const isProduction = process.env.NODE_ENV === 'production' ||
                     req.headers.host?.includes('vercel.app');
```

En localhost, `isProduction` debe ser `false` para no usar flag `Secure`.

## Logs de Depuración

Ver logs en Vercel:
```bash
vercel logs [deployment-url] --follow
```

O en el dashboard:
https://vercel.com/[tu-proyecto]/deployments → Click en deployment → Runtime Logs

## Seguridad

Ver documentación completa de seguridad en:
- [docs/SECURITY.md](./SECURITY.md)
