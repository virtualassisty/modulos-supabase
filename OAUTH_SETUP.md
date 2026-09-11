# 🔐 Configuración de Google OAuth para Panel Admin

## Paso 1: Crear OAuth Client ID en Google Cloud Console

1. **Ir a Google Cloud Console**
   - URL: https://console.cloud.google.com/apis/credentials
   - Selecciona tu proyecto o crea uno nuevo

2. **Crear credenciales OAuth 2.0**
   - Click en "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Nombre: "Panel Admin - Modulos"

3. **Configurar Authorized JavaScript origins**
   Agregar estos orígenes:
   ```
   https://modulos-theta.vercel.app
   http://localhost:3000
   ```

4. **Configurar Authorized redirect URIs**
   Agregar estas URIs:
   ```
   https://modulos-theta.vercel.app/admin-panel-auth.html
   http://localhost:3000/admin-panel-auth.html
   ```

5. **Copiar el Client ID**
   - Después de crear, verás algo como:
   ```
   123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```
   - Copia este Client ID

## Paso 2: Configurar la Pantalla de Consentimiento OAuth

1. **Ir a OAuth consent screen**
   - URL: https://console.cloud.google.com/apis/credentials/consent
   - User Type: **External** (o Internal si tienes Google Workspace)

2. **Configurar información de la app**
   - App name: "Panel Admin - Operaciones Saludables"
   - User support email: virtualassist@assistify365.com
   - Developer contact: virtualassist@assistify365.com

3. **Scopes**
   - Solo necesitas:
     - `email`
     - `profile`
     - `openid`

4. **Test users** (si es External)
   - Agregar: virtualassist@assistify365.com

## Paso 3: Configurar Variable de Entorno en Vercel

1. **Ir a Vercel Dashboard**
   - URL: https://vercel.com/assityfys-projects/modulos/settings/environment-variables

2. **Agregar nueva variable**
   - Key: `GOOGLE_OAUTH_CLIENT_ID`
   - Value: `[TU CLIENT ID DE GOOGLE]`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. **Guardar y hacer redeploy**
   ```bash
   vercel --prod
   ```

## Paso 4: Probar la Autenticación

1. **Ir a la página de login**
   - URL: https://modulos-theta.vercel.app/admin-panel-auth.html

2. **Click en "Iniciar sesión con Google"**
   - Selecciona la cuenta: virtualassist@assistify365.com
   - Acepta los permisos

3. **Verificar acceso**
   - Si el email es correcto → Redirige a /admin-panel.html
   - Si el email NO es correcto → Muestra error de acceso denegado

## Arquitectura de Autenticación

```
┌─────────────────────────────────────────────────────────────┐
│ Usuario intenta acceder a /admin-panel.html                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ JavaScript verifica localStorage.admin_session              │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ✅ Sesión válida       ❌ No hay sesión
         │                       │
         │                       │
         ▼                       ▼
    Muestra panel    Redirige a /admin-panel-auth.html
                                │
                                ▼
                     ┌──────────────────────────┐
                     │ Usuario hace login       │
                     │ con Google               │
                     └──────────┬───────────────┘
                                │
                                ▼
                     ┌──────────────────────────┐
                     │ Verifica email ==        │
                     │ virtualassist@...        │
                     └──────────┬───────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
               ✅ Acceso             ❌ Acceso
               permitido              denegado
                    │                       │
                    ▼                       ▼
        Guarda sesión en          Muestra error
        localStorage y            "Acceso denegado"
        redirige a panel
```

## Seguridad

### ✅ Implementado:
- Verificación de email en cliente
- Sesión con expiración (24 horas)
- Redirect automático a login si no autenticado
- Botón de cerrar sesión

### ⚠️ Limitaciones:
- La verificación es del lado del cliente (JavaScript)
- El anon key de Supabase sigue siendo público

### 🔒 Mejoras futuras recomendadas:
1. Agregar backend de verificación (Vercel Serverless Function)
2. Implementar Supabase Row Level Security (RLS) basado en email
3. Usar tokens JWT con firma del servidor
4. Agregar rate limiting en las queries

## Notas Importantes

1. **Email único permitido**: `virtualassist@assistify365.com`
   - Hardcodeado en el código
   - Para cambiar: editar `admin-panel-auth.html` y `admin-panel.html`

2. **Duración de sesión**: 24 horas
   - Después se requiere re-login
   - Configurable en el código

3. **Modo de prueba**
   - Si no configuras el Client ID, muestra error
   - Puedes probar localmente con `http://localhost:3000`

## Troubleshooting

### Error: "OAuth config not available"
- Verifica que `GOOGLE_OAUTH_CLIENT_ID` esté configurado en Vercel
- Haz redeploy después de agregar la variable

### Error: "Access to XMLHttpRequest blocked by CORS"
- Verifica que la URL esté en "Authorized JavaScript origins"
- Espera unos minutos después de agregar la URL

### Error: "redirect_uri_mismatch"
- Verifica que la URL esté en "Authorized redirect URIs"
- La URL debe coincidir exactamente (con o sin trailing slash)

### Usuario no puede acceder
- Verifica que el email sea exactamente: `virtualassist@assistify365.com`
- Verifica que el usuario esté en "Test users" si la app está en modo Testing

## Comandos Útiles

```bash
# Ver variables de entorno en Vercel
vercel env ls

# Agregar variable de entorno
vercel env add GOOGLE_OAUTH_CLIENT_ID

# Pull variables localmente
vercel env pull

# Redeploy a producción
vercel --prod
```

## URLs Importantes

- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Vercel Dashboard**: https://vercel.com/assityfys-projects/modulos
- **Login Page**: https://modulos-theta.vercel.app/admin-panel-auth.html
- **Admin Panel**: https://modulos-theta.vercel.app/admin-panel.html
