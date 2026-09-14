# 🔒 Documentación de Seguridad - Panel Admin

## Arquitectura de Autenticación

Este proyecto implementa autenticación **server-side** segura para el panel de administración.

### Flujo de Autenticación

```
┌──────────┐        ┌─────────────┐        ┌──────────────┐
│ Browser  │ ──1──> │ Google OAuth│ ──2──> │ /api/auth/   │
│          │        │             │        │ login        │
│          │        └─────────────┘        │              │
│          │                               │ ✅ Verifica  │
│          │                               │   JWT        │
│          │        ┌─────────────┐        │              │
│          │ <─3─── │  httpOnly   │<───────┤ ✅ Emite     │
│          │        │  cookie     │        │   sesión     │
└──────────┘        └─────────────┘        └──────────────┘
                            │
                            ├─────────┐
┌──────────┐        ┌──────▼──────┐  │     ┌──────────────┐
│ Browser  │ ──4──> │ /api/admin/ │  └────>│ /api/auth/   │
│          │        │ respuestas  │        │ verify       │
│          │        │             │◄───────┤ (middleware) │
│          │        │             │  ✅    └──────────────┘
│          │        └─────┬───────┘
│          │              │
│          │        ┌─────▼───────┐
│          │ <─5─── │  Supabase   │
│          │        │(SERVICE_KEY)│
└──────────┘        └─────────────┘
```

## Componentes de Seguridad

### 1. **Verificación JWT de Google** (`/api/auth/login.js`)

✅ **Qué hace:**
- Recibe el JWT credential de Google desde el cliente
- **Verifica la firma** usando `google-auth-library`
- **Verifica la expiración** automáticamente
- **Valida el audience** (client_id correcto)

✅ **Por qué es seguro:**
- La verificación ocurre en el **servidor**, no en el cliente
- Imposible de falsificar sin la clave privada de Google
- El cliente NO puede modificar o crear tokens falsos

### 2. **Lista Blanca de Emails** (`/api/auth/login.js:10-13`)

```javascript
const ALLOWED_EMAILS = [
  'virtualassist@assistify365.com',
  'emilia@assistify365.com'
];
```

✅ **Única fuente de verdad:**
- Los emails permitidos **solo** existen en el servidor
- NO se exponen al cliente
- NO pueden ser modificados desde el navegador

### 3. **Sesión con JWT Propio** (`/api/auth/login.js:111-119`)

✅ **Qué hace:**
- Después de verificar el JWT de Google, el servidor emite **su propio JWT**
- Firmado con `JWT_SECRET` (variable de entorno privada)
- Almacenado en **cookie httpOnly** (inaccesible desde JavaScript)

✅ **Por qué es seguro:**
- Cookie **HttpOnly**: No puede ser leída por `document.cookie` o `localStorage`
- Cookie **Secure** (en producción): Solo se transmite por HTTPS
- Cookie **SameSite=Strict**: Previene ataques CSRF
- **Max-Age**: Expira automáticamente después de 24 horas

### 4. **Middleware de Verificación** (`/api/auth/verify.js`)

✅ **Cada request al panel admin verifica:**
1. Que exista la cookie `admin_session`
2. Que el JWT sea válido (firma + expiración)
3. Que contenga los datos correctos del usuario

✅ **Si falla cualquier verificación:**
- La API devuelve `401 Unauthorized`
- El cliente redirige automáticamente al login

### 5. **Proxy Autenticado a Supabase** (`/api/admin/respuestas.js`)

✅ **Por qué NO consultar Supabase directamente desde el cliente:**

**❌ Inseguro (antes):**
```javascript
// Cliente hace query directo con ANON_KEY
const { data } = await supabase
  .from('respuestas_formularios')
  .select('*');
// Depende 100% de RLS (frágil, bypasseable)
```

**✅ Seguro (ahora):**
```javascript
// Cliente llama a API autenticada
const response = await fetch('/api/admin/respuestas', {
  credentials: 'include' // Incluye cookie httpOnly
});
// Servidor verifica sesión → usa SERVICE_ROLE_KEY → bypassa RLS
```

✅ **Ventajas:**
- El cliente **nunca** tiene acceso a `SERVICE_ROLE_KEY`
- Todas las queries pasan por verificación de sesión
- No depende de RLS (que puede deshabilitarse accidentalmente)

## Variables de Entorno Críticas

### `JWT_SECRET`

⚠️ **CRÍTICO**: Secret para firmar sesiones server-side

**Generar:**
```bash
openssl rand -base64 32
```

**Configurar en Vercel:**
```bash
vercel env add JWT_SECRET production
# Pegar el secret generado
```

### `SUPABASE_SERVICE_KEY`

⚠️ **CRÍTICO**: Key con permisos totales (bypassa RLS)

**Dónde obtenerlo:**
1. Ir a: https://supabase.com/dashboard/project/[tu-proyecto]/settings/api
2. Copiar "service_role key" (secret, NO la anon key)

**Configurar en Vercel:**
```bash
vercel env add SUPABASE_SERVICE_KEY production
# Pegar la service_role key
```

⚠️ **NUNCA exponer en cliente** - Solo usarla en APIs server-side.

### `GOOGLE_OAUTH_CLIENT_ID`

✅ Público (puede estar en cliente y servidor)

**Dónde obtenerlo:**
1. Ir a: https://console.cloud.google.com/apis/credentials
2. Crear/editar "OAuth 2.0 Client ID"
3. Configurar:
   - **Authorized JavaScript origins**: `https://modulos-theta.vercel.app`
   - **Authorized redirect URIs**: `https://modulos-theta.vercel.app/admin-panel-auth.html`

## Checklist de Seguridad

✅ **Antes de deploy a producción:**

- [ ] Configurar `JWT_SECRET` en Vercel (único, secreto)
- [ ] Configurar `SUPABASE_SERVICE_KEY` en Vercel
- [ ] Verificar que `GOOGLE_OAUTH_CLIENT_ID` tenga los dominios correctos
- [ ] Instalar dependencias: `npm install`
- [ ] Verificar que las cookies tengan flag `Secure` en producción
- [ ] Probar login completo en staging
- [ ] Probar que `/api/admin/respuestas` requiera autenticación (401 sin sesión)
- [ ] Probar logout y que limpie la sesión correctamente

## Pruebas de Seguridad

### Test 1: Intento de bypass de autenticación

```bash
# Intentar acceder a datos sin sesión
curl -X GET 'https://modulos-theta.vercel.app/api/admin/respuestas'

# Resultado esperado: 401 Unauthorized
```

### Test 2: Verificar que la cookie sea httpOnly

```javascript
// En la consola del navegador (después de login exitoso)
document.cookie
// NO debe mostrar 'admin_session' (está en httpOnly)
```

### Test 3: Verificar expiración de sesión

```bash
# Esperar 24 horas después de login
# Intentar acceder al panel
# Resultado esperado: Redirige a login
```

## Mitigaciones de Ataques Comunes

### ✅ XSS (Cross-Site Scripting)
- Cookie **HttpOnly**: Token no accesible desde JavaScript
- CSP headers configurados en `vercel.json`

### ✅ CSRF (Cross-Site Request Forgery)
- Cookie **SameSite=Strict**: Bloquea requests cross-site
- Verificación de sesión en cada endpoint

### ✅ JWT Tampering
- JWT firmado con `HS256` + `JWT_SECRET`
- Verificación de firma en cada request

### ✅ Session Hijacking
- Cookie **Secure**: Solo HTTPS en producción
- Expiración automática (24 horas)

### ✅ Email Enumeration
- `/api/oauth-config` NO expone `allowedEmails`
- Lista blanca solo en servidor

## Contacto de Seguridad

Si encuentras una vulnerabilidad de seguridad, reportala a:
- **Email**: virtualassist@assistify365.com
- **Asunto**: [SECURITY] Vulnerabilidad en Panel Admin
