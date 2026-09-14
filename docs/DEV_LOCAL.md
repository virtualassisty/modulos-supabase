# 🛠️ Desarrollo Local - Guía Rápida

## ⚠️ Importante: Autenticación en Desarrollo Local

El panel admin tiene **dos modos de operación**:

### 🔒 Modo Producción (Seguro)
- Verifica JWT de Google en el servidor
- Usa cookies httpOnly
- Requiere `vercel dev` para funcionar

### 💻 Modo Desarrollo Local (Solo para testing)
- **NO ES SEGURO** - Solo para desarrollo
- Verifica en el cliente (bypasseable)
- Funciona con servidores simples (Live Server, `npx serve`, etc.)
- La autenticación se detecta automáticamente

---

## 🚀 Opción 1: Vercel Dev (Recomendado)

Esta opción ejecuta las funciones serverless localmente y es **100% idéntica a producción**.

### Instalación

```bash
# Instalar Vercel CLI
npm i -g vercel

# Instalar dependencias
npm install

# Descargar variables de entorno
vercel env pull
```

### Ejecutar

```bash
vercel dev
```

Abrir: http://localhost:3000

✅ **Ventajas:**
- Autenticación server-side funcional
- APIs `/api/auth/*` funcionan
- Idéntico a producción
- Testing completo

❌ **Desventajas:**
- Requiere configuración inicial
- Más lento que servidor simple

---

## ⚡ Opción 2: Servidor Simple (Testing rápido)

Para cambios rápidos de UI sin tocar autenticación.

### Usando Live Server (VS Code)

1. Instalar extensión: **Live Server**
2. Click derecho en `index.html` → **Open with Live Server**
3. Navegar a: http://127.0.0.1:5500

### Usando npx serve

```bash
npx serve .
```

Abrir: http://localhost:3000

### Usando Python

```bash
python -m http.server 8000
```

Abrir: http://localhost:8000

⚠️ **Limitaciones:**
- Modo dev automático (NO seguro)
- APIs serverless NO funcionan
- Solo para testing de UI
- La autenticación usa localStorage (bypasseable)

---

## 🔧 Configuración para Modo Dev Local

### 1. Actualizar Google OAuth Client ID

En `src/admin/login.html`, actualizar el `clientId` hardcoded (línea ~196):

```javascript
googleConfig = {
  clientId: 'TU-CLIENT-ID-AQUI.apps.googleusercontent.com'
};
```

### 2. Configurar Google Cloud Console

Agregar orígenes autorizados para desarrollo local:

1. Ir a: https://console.cloud.google.com/apis/credentials
2. Editar tu OAuth Client ID
3. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://127.0.0.1:5500
   http://localhost:5500
   ```
4. **Authorized redirect URIs**:
   ```
   http://localhost:3000/admin-panel-auth.html
   http://127.0.0.1:5500/src/admin/login.html
   ```

### 3. Configurar Supabase (para cargar datos)

Crear archivo `.env.local`:

```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

O actualizar directamente en `api/config.js`.

---

## 🔍 Detectar en Qué Modo Estás

Abre la consola del navegador y busca:

### Modo Desarrollo Local
```
⚠️ Modo desarrollo local detectado
💡 Para producción, usa: vercel dev
✅ OAuth config cargado (modo dev)
⚠️ AUTENTICACIÓN EN MODO DESARROLLO
```

### Modo Producción (Vercel Dev)
```
✅ OAuth config loaded
✅ Autenticación exitosa: [email]
```

---

## 🧪 Testing de Autenticación Local

### Login

1. Ir a: http://localhost:5500/src/admin/login.html
2. Click en "Iniciar sesión con Google"
3. Seleccionar cuenta autorizada
4. Verificar en consola:
   ```
   ✅ Dev login: virtualassist@assistify365.com
   ```
5. Redirige a `/admin`

### Verificar Sesión

En consola del navegador:
```javascript
JSON.parse(localStorage.getItem('admin_session_dev'))
// Debe mostrar: { email, name, picture, timestamp }
```

### Logout

Click en "Cerrar sesión" → Limpia `admin_session_dev` de localStorage

---

## 📁 Estructura de Archivos para Dev

```
.
├── src/admin/
│   ├── login.html          # Detecta modo dev automáticamente
│   └── index.html          # Detecta modo dev automáticamente
│
├── api/
│   ├── config.js           # Actualizar con tus credenciales Supabase
│   └── auth/               # Solo funciona con vercel dev
│       ├── login.js
│       ├── verify.js
│       └── logout.js
│
└── .env.local              # Variables locales (opcional)
```

---

## ⚠️ ADVERTENCIAS

### 🚨 Modo Dev Local NO es seguro

El modo de desarrollo local:
- ❌ NO verifica JWT en servidor
- ❌ NO usa cookies httpOnly
- ❌ Guarda sesión en localStorage (falsificable)
- ❌ Verifica emails en el cliente (bypasseable)

**SOLO usar para:**
- ✅ Testing de UI
- ✅ Desarrollo rápido de frontend
- ✅ Debugging de estilos

**NUNCA usar para:**
- ❌ Testing de seguridad
- ❌ Validación de autenticación
- ❌ Deploy a producción

### 🔒 Para Testing de Seguridad

**SIEMPRE** usar `vercel dev` o deploy a Vercel Preview:

```bash
# Testing local con autenticación real
vercel dev

# O deploy a preview
vercel

# Testing de producción
vercel --prod
```

---

## 🐛 Troubleshooting

### Error: "OAuth config not available"

**Solución:**
1. Actualizar `clientId` hardcoded en `src/admin/login.html`
2. O usar `vercel dev`

### Error: "Supabase not configured"

**Solución:**
1. Actualizar `api/config.js` con tus credenciales
2. O crear `.env.local`
3. O usar `vercel dev` + `vercel env pull`

### Login funciona pero no carga datos

**Solución:**
1. Verificar que `api/config.js` tenga credenciales correctas
2. Verificar en consola si hay errores de CORS
3. Probar con `vercel dev` en su lugar

### Google OAuth: "redirect_uri_mismatch"

**Solución:**
1. Verificar que la URL del error coincida con tu servidor
2. Agregar esa URL exacta en Google Cloud Console
3. Esperar 5 minutos para que propague

---

## 📚 Más Información

- [Seguridad](./SECURITY.md) - Arquitectura de autenticación
- [Setup](./SETUP.md) - Configuración de producción
- [Vercel Dev Docs](https://vercel.com/docs/cli#commands/dev)
