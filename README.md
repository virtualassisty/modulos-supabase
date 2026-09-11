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

### Panel de Administración
- **Login**: https://modulos-theta.vercel.app/admin-panel-auth.html
- **Panel Admin**: https://modulos-theta.vercel.app/admin (requiere login)

### Formularios Assistify
- **Paso 1**: https://modulos-theta.vercel.app/paso1
- **Paso 2**: https://modulos-theta.vercel.app/paso2
- **Operaciones Saludables**: https://modulos-theta.vercel.app/operaciones-saludables

### Formularios Entregables
- **Diagnóstico Financiero**: `/Entregables/Modulo 1/app_diagnostico_financiero.html`
- **Diagnóstico de Roles**: `/Entregables/Modulo 1/app_diagnostico_roles.html`
- **Inventario Semanal**: `/Entregables/Modulo 2/1. inventario_semanal_m2.html`
- **Diagnóstico de Delegación**: `/Entregables/Modulo 4/2. diagnostico_delegacion_m2.html`
- **Generador de Búsqueda**: `/Entregables/Modulo 5/app_contratacion_m4.html` (no guarda en BD)

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

## 🔐 Autenticación

El panel admin usa **Google OAuth** con acceso restringido a:
- Email permitido: `virtualassist@assistify365.com`
- Sesión: 24 horas
- Ver: `docs/OAUTH_SETUP.md` para configuración

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
- `GOOGLE_OAUTH_CLIENT_ID` - Client ID de Google OAuth
- Supabase credentials (en `/api/config.js`)

## 📖 Documentación

- **OAuth Setup**: `docs/OAUTH_SETUP.md`
- **Database Migration**: `docs/DATABASE_MIGRATION.md`

## 🔧 Desarrollo Local

```bash
# Instalar Vercel CLI
npm i -g vercel

# Pull variables de entorno
vercel env pull

# Servir localmente
vercel dev
```

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
