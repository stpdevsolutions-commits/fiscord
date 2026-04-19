# FISCORD

![Estado](https://img.shields.io/badge/estado-MVP%20en%20desarrollo-orange?style=flat-square)
![Node](https://img.shields.io/badge/Node.js-20%20LTS-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Licencia](https://img.shields.io/badge/licencia-MIT-green?style=flat-square)

Aplicación web y móvil para contadores y PyMEs en República Dominicana.  
Registra facturas de gastos, valida automáticamente según las reglas de la **DGII Formulario 606** y exporta el reporte listo para presentar — en segundos.

---

## Características MVP

- **Registro de facturas** — formulario validado contra reglas 606 (RNC, NCF, montos, ITBIS)
- **OCR automático** — extrae datos de fotos de facturas con Tesseract.js
- **Exportación 606** — genera el `.xlsx` en formato oficial DGII con un clic
- **Almacenamiento 10 años** — fotos de comprobantes en cumplimiento con Norma 06-2014
- **Dashboard** — gráficos de gastos por mes, proveedor y tipo de comprobante
- **App móvil** — iOS y Android (React Native + Expo)

---

## Quick Start

### Prerequisitos

- Node.js 20 LTS
- Docker (para PostgreSQL y Redis en desarrollo local)
- Cuenta en [Railway](https://railway.app), [Supabase](https://supabase.com) y [Vercel](https://vercel.com)

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-usuario/fiscord.git
cd fiscord
npm install          # instala workspaces: web, mobile, backend, packages
```

### 2. Configurar variables de entorno

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Edita apps/backend/.env con tus credenciales de Railway, Supabase y SES

# Frontend web
cp apps/web/.env.example apps/web/.env
# Edita apps/web/.env con VITE_API_URL
```

### 3. Iniciar en modo desarrollo

```bash
# Levantar PostgreSQL + Redis (Docker)
docker compose up -d

# Ejecutar migraciones
npm run db:migrate

# Iniciar todos los servicios en paralelo
npm run dev
```

> Web en `http://localhost:5173` · API en `http://localhost:3000` · Docs API en `http://localhost:3000/api/docs`

---

## Estructura del Proyecto

```
fiscord/
├── apps/
│   ├── web/                  # React 18 + Vite + TailwindCSS
│   │   └── src/
│   │       ├── components/   # InvoiceForm, Dashboard, OCRUploader...
│   │       ├── pages/
│   │       ├── hooks/
│   │       ├── stores/       # Zustand
│   │       └── services/     # Axios + React Query
│   │
│   ├── mobile/               # React Native + Expo
│   │   └── app/              # Expo Router (file-based)
│   │       ├── (auth)/
│   │       └── (tabs)/
│   │
│   └── backend/              # Node.js + Express + TypeScript
│       ├── src/
│       │   ├── routes/       # auth, invoices, reports, dashboard
│       │   ├── middleware/   # requireAuth, rateLimiter
│       │   └── services/     # invoice, ocr, export606, email
│       └── prisma/
│           ├── schema.prisma
│           └── migrations/
│
├── packages/
│   ├── validators/           # Zod schemas compartidos (web + backend)
│   └── types/                # TypeScript types compartidos
│
└── docs/
    └── FISCORD_SPECIFICATION.md   # Especificación técnica maestra
```

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend Web** | React 18, TypeScript, Vite, TailwindCSS, Zustand, React Query |
| **App Móvil** | React Native, Expo 51, Expo Router, NativeWind |
| **Backend** | Node.js 20, Express, TypeScript, Prisma ORM |
| **Base de Datos** | PostgreSQL 16, Redis |
| **Storage** | Supabase Storage (fotos facturas) |
| **OCR** | Tesseract.js 5 |
| **Reportes** | SheetJS (xlsx) — exportación Formulario 606 |
| **Seguridad** | Cloudflare WAF, JWT, bcrypt, Helmet.js |
| **Email** | Amazon SES |
| **Monitoreo** | Sentry, Better Stack |
| **Deploy** | Vercel (web) · Railway (backend + DB) |

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # todos los servicios en paralelo
npm run dev:web          # solo frontend web
npm run dev:backend      # solo backend
npm run dev:mobile       # Expo (requiere Expo Go en dispositivo)

# Base de datos
npm run db:migrate       # ejecutar migraciones pendientes
npm run db:studio        # abrir Prisma Studio

# Calidad de código
npm run lint             # ESLint en todos los workspaces
npm run typecheck        # TypeScript check en todos los workspaces
npm run test             # tests unitarios

# Build producción
npm run build            # build web + backend
```

---

## Cumplimiento Fiscal

FISCORD está diseñado desde cero para cumplir con:

- **DGII Norma 06-2014** — Formulario 606 (Compras y Gastos)
- **Retención 10 años** — fotos de comprobantes fiscales (soft delete obligatorio)
- **Validaciones RNC** — checksum módulo 11 en tiempo real
- **Validaciones NCF** — formato `B##-##########` con reglas por tipo
- **OWASP Top 10** — aplicado desde el Sprint 1

---

## Cómo Contribuir

> El proyecto está en fase **MVP activo** (8 sprints). No se aceptan contribuciones externas hasta la versión `v1.0.0`.

A partir de `v1.0.0`, el proceso será:

1. Abre un [Issue](https://github.com/tu-usuario/fiscord/issues) describiendo el bug o feature
2. Espera aprobación antes de comenzar a desarrollar
3. Haz fork → rama `feat/nombre-feature` o `fix/nombre-bug`
4. Asegúrate de que `npm run lint && npm run typecheck && npm run test` pasen sin errores
5. Abre un Pull Request referenciando el issue

Consulta [docs/FISCORD_SPECIFICATION.md](docs/FISCORD_SPECIFICATION.md) para entender la arquitectura y decisiones de diseño antes de contribuir.

---

## Roadmap

| Sprint | Semanas | Objetivo |
|---|---|---|
| 1–2 | Sem 1–2 | Setup infraestructura + Auth completo |
| 3–4 | Sem 3–4 | CRUD Facturas (web) |
| 5–6 | Sem 5–6 | OCR + Exportación 606 + Dashboard |
| 7 | Sem 7 | App móvil (iOS + Android) |
| 8 | Sem 8 | QA + Deploy producción |

---

## Licencia

MIT © 2026 FISCORD. Ver [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  Construido para contadores y PyMEs de República Dominicana 🇩🇴
</p>
