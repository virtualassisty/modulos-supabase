# 📋 Módulos - Sistema de Formularios con JSONB

Sistema unificado de formularios para Operaciones Saludables y Assistify, con base de datos PostgreSQL/Supabase y arquitectura JSONB.

## 📂 Estructura del Proyecto

```
modulos/
├── index.html                    # Landing page (/)
├── src/
│   ├── admin/                    # Panel de administración
│   │   ├── index.html           # Panel admin principal (/admin)
│   │   └── login.html           # Login con Google OAuth
│   ├── forms/                    # Todos los formularios
│   │   ├── assistify/           # Formularios Assistify
│   │   │   ├── paso1.html       # Diagnóstico Paso 1 (/paso1)
│   │   │   ├── paso2.html       # Diagnóstico Paso 2 (/paso2)
│   │   │   └── operaciones-saludables.html
│   │   └── entregables/         # Formularios Entregables
│   │       ├── Modulo 1/        # Diagnósticos Financiero y Roles
│   │       ├── Modulo 2/        # Inventario Semanal
│   │       ├── Modulo 4/        # Diagnóstico Delegación
│   │       └── Modulo 5/        # Generador Búsqueda (no guarda)
│   └── js/                       # Scripts JavaScript
│       ├── formularios-client.js    # Cliente universal JSONB
│       └── formularios-wrapper.js   # Wrapper automático
├── api/                          # Vercel Serverless Functions
│   ├── config.js                # Configuración Supabase
│   ├── oauth-config.js          # Configuración OAuth
│   └── migrate.js               # Endpoint de migración
├── migrations/                   # Scripts SQL
│   ├── 001_create_formularios_schema.sql
│   ├── 002_add_old_forms_to_formularios.sql
│   ├── 003_migrate_existing_data.sql
│   └── migrate.html             # Herramienta visual
├── docs/                         # Documentación
│   ├── OAUTH_SETUP.md           # Guía OAuth
│   └── DATABASE_MIGRATION.md    # Guía migraciones
├── vercel.json                   # Configuración Vercel
└── package.json
```

## 🌐 URLs del Sistema

Ver **[URLS.md](URLS.md)** para la lista completa de todas las URLs del proyecto.

### Panel de Administración
- **Login**: https://modulos-theta.vercel.app/admin-panel-auth.html
- **Panel Admin**: https://modulos-theta.vercel.app/admin (requiere login)

### Formularios Assistify
- **Paso 1**: https://modulos-theta.vercel.app/paso1
- **Paso 2**: https://modulos-theta.vercel.app/paso2
- **Operaciones Saludables**: https://modulos-theta.vercel.app/operaciones-saludables

### Formularios Entregables (URLs amigables)
- **Diagnóstico Financiero**: https://modulos-theta.vercel.app/diagnostico-financiero
- **Diagnóstico de Roles**: https://modulos-theta.vercel.app/diagnostico-roles
- **Inventario Semanal**: https://modulos-theta.vercel.app/inventario-semanal
- **Diagnóstico de Delegación**: https://modulos-theta.vercel.app/diagnostico-delegacion
- **Generador de Búsqueda**: https://modulos-theta.vercel.app/generador-busqueda (no guarda en BD)

## 🗄️ Base de Datos

### Arquitectura
- **PostgreSQL/Supabase** con JSONB
- 2 tablas principales:
  - `formularios` - Tipos de formularios
  - `respuestas_formularios` - Respuestas en JSONB

### Formularios Activos (7 total)
1. `diagnostico_paso1` - Diagnóstico Paso 1
2. `diagnostico_paso2` - Diagnóstico Paso 2
3. `operaciones_saludables` - Operaciones Saludables
4. `diagnostico_financiero` - Diagnóstico Financiero
5. `diagnostico_roles` - Diagnóstico de Roles
6. `inventario_semanal` - Inventario Semanal
7. `diagnostico_delegacion` - Diagnóstico de Delegación

## 🔐 Autenticación (Server-Side Segura)

El panel admin implementa **autenticación server-side** con:
- ✅ Verificación de JWT de Google en el servidor
- ✅ Sesiones con cookies httpOnly (no accesibles desde JavaScript)
- ✅ Middleware de autenticación en todas las APIs admin
- ✅ Proxy autenticado a Supabase con SERVICE_ROLE_KEY

**Emails autorizados:**
- `virtualassist@assistify365.com`
- `emilia@assistify365.com`

**Duración de sesión:** 24 horas

📚 **Documentación completa:**
- [docs/SECURITY.md](./docs/SECURITY.md) - Arquitectura de seguridad
- [docs/SETUP.md](./docs/SETUP.md) - Guía de configuración

## 🚀 Deployment

### Comandos
```bash
# Deploy a producción
vercel --prod

# Ver logs
vercel logs

# Ver variables de entorno
vercel env ls
```

### Variables de Entorno Requeridas

| Variable | Descripción | Crítico |
|----------|-------------|---------|
| `SUPABASE_URL` | URL del proyecto Supabase | ✅ |
| `SUPABASE_ANON_KEY` | Anon key (público) | ✅ |
| `SUPABASE_SERVICE_KEY` | Service role key (privado) | 🔒 |
| `GOOGLE_OAUTH_CLIENT_ID` | Client ID de Google OAuth | ✅ |
| `JWT_SECRET` | Secret para firmar sesiones | 🔒 |

Ver: [.env.example](./.env.example)

## 📖 Documentación

- **OAuth Setup**: `docs/OAUTH_SETUP.md`
- **Database Migration**: `docs/DATABASE_MIGRATION.md`

## 🔧 Desarrollo Local

### Opción 1: Vercel Dev (Recomendado - autenticación real)

```bash
# Instalar dependencias
npm install

# Descargar variables de entorno
vercel env pull

# Iniciar servidor con funciones serverless
vercel dev
```

Abrir: http://localhost:3000

### Opción 2: Servidor Simple (Solo UI)

```bash
npx serve .
```

⚠️ **Modo dev automático:** La autenticación funciona en el cliente (NO seguro, solo testing).

📚 **Guía completa:** [docs/DEV_LOCAL.md](./docs/DEV_LOCAL.md)

## 📊 Estado del Proyecto

✅ Base de datos unificada (PostgreSQL/Supabase JSONB)
✅ 7 formularios activos migrando a JSONB
✅ Panel admin con OAuth de Google
✅ Sistema completamente funcional y desplegado
✅ Estructura de proyecto organizada

## 📞 Contacto

- **Admin**: virtualassist@assistify365.com
- **Supabase Project**: wzimcsxlpfkzvdieicil
- **Vercel Project**: assityfys-projects/modulos
