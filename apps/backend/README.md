# fiscord-backend

API REST — Node.js + Express + TypeScript.

## Requisitos

- Node.js 20 LTS

## Setup

```bash
cp .env.example .env
# Edita .env con tu JWT_SECRET

npm install
npm run dev
```

Servidor en `http://localhost:5000`  
Health check: `GET http://localhost:5000/`

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor en modo watch (tsx) |
| `npm run build` | Compila TypeScript → `dist/` |
| `npm start` | Ejecuta build compilado |
| `npm run typecheck` | Verifica tipos sin compilar |
| `npm run clean` | Elimina `dist/` |

## Estructura

```
src/
├── config.ts   # Variables de entorno tipadas
├── app.ts      # Express app (middlewares + rutas)
└── server.ts   # Entry point — listen + graceful shutdown
```
