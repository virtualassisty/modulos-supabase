# Configuración Local vs Producción

## Problema Original

El archivo `/api/config.js` es una **Vercel Serverless Function** que inyecta las variables de entorno en el cliente. Esto funciona perfectamente en producción (Vercel), pero en desarrollo local con `npx serve` no se ejecuta porque es un servidor estático simple.

Además, había un problema de **race condition**: los scripts de configuración se cargaban de forma asíncrona, pero `formularios-client.js` se ejecutaba inmediatamente sin esperar, causando el error:

```
⚠️ Error: Credenciales de Supabase no configuradas
Uncaught Error: Supabase credentials not configured
```

## Solución implementada

### 1. Carga secuencial con `onload`

Todos los archivos HTML ahora usan un loader que:
1. Carga el script de configuración (`config-dev.js` o `config.js`)
2. **Espera** a que termine de cargar (evento `onload`)
3. Solo entonces carga `formularios-client.js`

Esto garantiza que las credenciales estén disponibles antes de que el cliente de Supabase se inicialice.

### 2. Configuración dual (local vs producción)

### Opción 1: Usar `npm run dev` (recomendado para la mayoría de casos)

```bash
npm run dev
```

Este comando:
1. Ejecuta automáticamente `scripts/generate-config.js` (via `predev` hook)
2. Genera `public/config-dev.js` desde `.env.local`
3. Inicia el servidor con `npx serve`

### Opción 2: Usar Vercel Dev (para testing de API endpoints)

```bash
npm run dev:vercel
```

Este comando usa `vercel dev` que simula completamente el entorno de Vercel, incluyendo las Serverless Functions.

## Cómo funciona

### En desarrollo local (localhost)

Los archivos HTML detectan automáticamente si están en `localhost` y cargan:
```javascript
/public/config-dev.js  // Generado desde .env.local
```

### En producción (Vercel)

Los archivos HTML cargan:
```javascript
/api/config.js  // Serverless Function que inyecta las variables de entorno
```

## Archivo generado

`public/config-dev.js` contiene:

```javascript
window.SUPABASE_URL = 'https://wzimcsxlpfkzvdieicil.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGc...';
```

Este archivo:
- ✅ Se genera automáticamente al correr `npm run dev`
- ✅ Está en `.gitignore` (no se sube al repo)
- ✅ Se crea desde `.env.local` (tus credenciales locales)

## Si cambias las credenciales en .env.local

Simplemente ejecuta:

```bash
node scripts/generate-config.js
```

O reinicia el servidor de desarrollo:

```bash
npm run dev
```

## Archivos involucrados

```
scripts/generate-config.js    # Script que genera el archivo
public/config-dev.js          # Archivo generado (git ignored)
api/config.js                 # Serverless Function para producción
package.json                  # Tiene el hook "predev"
```

## Troubleshooting

### Error: "Supabase credentials not configured"

1. Verifica que existe `.env.local` con `SUPABASE_URL` y `SUPABASE_ANON_KEY`
2. Ejecuta `node scripts/generate-config.js`
3. Reinicia el servidor de desarrollo

### Error: "export declarations may only appear at top level"

Este error significa que estás intentando cargar `/api/config.js` directamente en un navegador.
- Solución: Usa `npm run dev` en lugar de abrir el archivo directamente
- O usa `npm run dev:vercel` para simular Vercel completamente

### El formulario no guarda en Supabase

1. Abre la consola del navegador (F12)
2. Verifica que aparezca: `✅ Supabase cliente inicializado correctamente`
3. Si no aparece, verifica que `public/config-dev.js` existe y tiene las credenciales correctas
