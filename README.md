# Módulos Assistify

Aplicación web para cuestionarios de diagnóstico empresarial.

## Estructura del Proyecto

```
/
├── src/
│   ├── js/              # JavaScript modules
│   │   └── supabase-client.js
│   └── pages/           # HTML pages
│       ├── index.html
│       ├── login.html
│       └── admin-dashboard.html
├── docs/
│   └── archive/         # Old documentation (gitignored)
├── sql/                 # SQL migration files (gitignored)
├── vercel.json          # Vercel configuration
├── package.json
└── .env.example         # Environment variables template
```

## Configuración Rápida

1. Clonar el repositorio
2. Copiar `.env.example` a `.env.local` y completar las credenciales de Supabase
3. Desplegar a Vercel: `vercel --prod`

## Stack Tecnológico

- Frontend: HTML, CSS, JavaScript vanilla
- Backend: Supabase (PostgreSQL + Auth)
- Hosting: Vercel
- Autenticación: Supabase Auth con RLS

## Variables de Entorno

Ver `.env.example` para las variables requeridas.

## Deployment

La aplicación está configurada para deployment automático en Vercel. Cada push a `main` despliega a producción.
