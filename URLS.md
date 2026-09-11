# 🌐 URLs del Proyecto - Módulos

**Dominio de producción**: https://modulos-theta.vercel.app

---

## 📋 Panel de Administración

| URL Pública | Descripción | Archivo Físico |
|------------|-------------|----------------|
| [/admin-panel-auth.html](https://modulos-theta.vercel.app/admin-panel-auth.html) | Login con Google OAuth | `src/admin/login.html` |
| [/admin](https://modulos-theta.vercel.app/admin) | Panel de administración | `src/admin/index.html` |

**Acceso**: Solo `virtualassist@assistify365.com`

---

## 🎯 Formularios Assistify

| URL Pública | Descripción | Formulario ID | Archivo Físico |
|------------|-------------|---------------|----------------|
| [/paso1](https://modulos-theta.vercel.app/paso1) | Diagnóstico Paso 1 | `diagnostico_paso1` | `src/forms/assistify/paso1.html` |
| [/paso2](https://modulos-theta.vercel.app/paso2) | Diagnóstico Paso 2 | `diagnostico_paso2` | `src/forms/assistify/paso2.html` |
| [/operaciones-saludables](https://modulos-theta.vercel.app/operaciones-saludables) | Operaciones Saludables | `operaciones_saludables` | `src/forms/assistify/operaciones-saludables.html` |

**Guardan en BD**: ✅ Sí (tabla `respuestas_formularios`)

---

## 📦 Formularios Entregables - Módulo 1

| URL Pública | URL Amigable | Descripción | Formulario ID | Archivo Físico |
|------------|--------------|-------------|---------------|----------------|
| [/Entregables/Modulo 1/app_diagnostico_financiero.html](https://modulos-theta.vercel.app/Entregables/Modulo%201/app_diagnostico_financiero.html) | [/diagnostico-financiero](https://modulos-theta.vercel.app/diagnostico-financiero) | Diagnóstico Financiero | `diagnostico_financiero` | `src/forms/entregables/Modulo 1/app_diagnostico_financiero.html` |
| [/Entregables/Modulo 1/app_diagnostico_roles.html](https://modulos-theta.vercel.app/Entregables/Modulo%201/app_diagnostico_roles.html) | [/diagnostico-roles](https://modulos-theta.vercel.app/diagnostico-roles) | Diagnóstico de Roles | `diagnostico_roles` | `src/forms/entregables/Modulo 1/app_diagnostico_roles.html` |

**Guardan en BD**: ✅ Sí

---

## 📦 Formularios Entregables - Módulo 2

| URL Pública | URL Amigable | Descripción | Formulario ID | Archivo Físico |
|------------|--------------|-------------|---------------|----------------|
| [/Entregables/Modulo 2/1. inventario_semanal_m2.html](https://modulos-theta.vercel.app/Entregables/Modulo%202/1.%20inventario_semanal_m2.html) | [/inventario-semanal](https://modulos-theta.vercel.app/inventario-semanal) | Inventario Semanal | `inventario_semanal` | `src/forms/entregables/Modulo 2/1. inventario_semanal_m2.html` |

**Guardan en BD**: ✅ Sí

---

## 📦 Formularios Entregables - Módulo 4

| URL Pública | URL Amigable | Descripción | Formulario ID | Archivo Físico |
|------------|--------------|-------------|---------------|----------------|
| [/Entregables/Modulo 4/2. diagnostico_delegacion_m2.html](https://modulos-theta.vercel.app/Entregables/Modulo%204/2.%20diagnostico_delegacion_m2.html) | [/diagnostico-delegacion](https://modulos-theta.vercel.app/diagnostico-delegacion) | Diagnóstico de Delegación | `diagnostico_delegacion` | `src/forms/entregables/Modulo 4/2. diagnostico_delegacion_m2.html` |

**Guardan en BD**: ✅ Sí

---

## 📦 Formularios Entregables - Módulo 5

| URL Pública | URL Amigable | Descripción | Formulario ID | Archivo Físico |
|------------|--------------|-------------|---------------|----------------|
| [/Entregables/Modulo 5/app_contratacion_m4.html](https://modulos-theta.vercel.app/Entregables/Modulo%205/app_contratacion_m4.html) | [/generador-busqueda](https://modulos-theta.vercel.app/generador-busqueda) | Generador de Búsqueda | N/A (no guarda) | `src/forms/entregables/Modulo 5/app_contratacion_m4.html` |

**Guardan en BD**: ❌ No (solo genera PDF)

---

## 🏠 Otras Páginas

| URL Pública | Descripción | Archivo Físico |
|------------|-------------|----------------|
| [/](https://modulos-theta.vercel.app/) | Landing page | `index.html` |

---

## 🔧 Herramientas de Desarrollo

| URL | Descripción | Archivo Físico |
|-----|-------------|----------------|
| `/migrations/migrate.html` | Herramienta visual de migraciones | `migrations/migrate.html` |

⚠️ **No accesible en producción** (no está en rewrites)

---

## 🗄️ Base de Datos

**Sistema**: PostgreSQL/Supabase con arquitectura JSONB

**Tablas**:
- `formularios` - Tipos de formularios (7 activos)
- `respuestas_formularios` - Respuestas en formato JSONB

**Formularios activos** (7 total):
1. `diagnostico_paso1`
2. `diagnostico_paso2`
3. `operaciones_saludables`
4. `diagnostico_financiero`
5. `diagnostico_roles`
6. `inventario_semanal`
7. `diagnostico_delegacion`

---

## 🔐 Seguridad

- **OAuth**: Solo `virtualassist@assistify365.com`
- **Sesión**: 24 horas
- **CSP**: Headers configurados en `vercel.json`
- **Archivos bloqueados**: `.env*`, `.git`, `.vercel`, `package.json`, etc.

---

## 📊 Resumen de URLs por Tipo

| Tipo | Cantidad | Guardan en BD |
|------|----------|---------------|
| Admin | 2 | - |
| Assistify | 3 | ✅ |
| Módulo 1 | 2 | ✅ |
| Módulo 2 | 1 | ✅ |
| Módulo 4 | 1 | ✅ |
| Módulo 5 | 1 | ❌ |
| **Total formularios** | **8** | **7 guardan** |

---

**Última actualización**: 2026-09-11
