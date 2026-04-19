# FISCORD — Especificación Técnica Maestra

> **Versión:** 1.0.0 | **Fecha:** 2026-04-18 | **Autor:** Arquitecto FISCORD  
> **Estado:** MVP en desarrollo | **Próxima revisión:** al cierre de Sprint 2

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Usuarios & Personas](#2-usuarios--personas)
3. [Features MVP Detalladas](#3-features-mvp-detalladas)
4. [Arquitectura Técnica](#4-arquitectura-técnica)
5. [Base de Datos — Schema SQL](#5-base-de-datos--schema-sql)
6. [API REST — Endpoints](#6-api-rest--endpoints)
7. [Seguridad & Compliance](#7-seguridad--compliance)
8. [UI/UX Flows](#8-uiux-flows)
9. [Roadmap — Sprints por Semana](#9-roadmap--sprints-por-semana)
10. [Decisiones de Arquitectura Confirmadas](#10-decisiones-de-arquitectura-confirmadas)

---

## 1. Resumen Ejecutivo

### ¿Qué es FISCORD?

FISCORD es una aplicación web y móvil diseñada para contadores y pequeñas/medianas empresas (PyMEs) en la República Dominicana. Su propósito central es simplificar el cumplimiento fiscal relacionado con la Norma 06-2014 de la DGII (Dirección General de Impuestos Internos), específicamente la generación del **Formulario 606** de compras y gastos.

### Problema que Resuelve

| Problema Actual | Solución FISCORD |
|---|---|
| Registro manual en Excel propenso a errores | Formulario estructurado con validaciones en tiempo real |
| Exportación 606 tardada y con formato incorrecto | Exportación automática con columnas y formato oficial DGII |
| Facturas físicas perdidas o deterioradas | Almacenamiento digital de fotos por 10 años (compliance) |
| Digitación lenta de datos de facturas | OCR con Tesseract.js para extracción automática |
| Sin visibilidad de gastos en tiempo real | Dashboard con gráficos por categoría, proveedor y período |

### Scope del MVP

```
Alcance v1.0 (MVP):
  ✓ 1 empresa
  ✓ 1 usuario principal
  ✓ 1,000+ facturas/año
  ✓ Web + App móvil (iOS & Android)
  ✓ Cumplimiento total 606 DGII
  ✓ 8 semanas de desarrollo
  ✓ Costo operativo: RD$250/mes + Vercel free tier
```

### Métricas de Éxito MVP

- Tiempo de registro de una factura: **< 60 segundos** (manual) / **< 30 segundos** (OCR)
- Precisión OCR en facturas dominicanas: **> 80%**
- Exportación 606 sin errores de validación DGII: **100%**
- Uptime backend: **> 99.5%**
- Tiempo de carga inicial web: **< 2 segundos**

---

## 2. Usuarios & Personas

### Mapa de Roles

```
┌──────────────────────────────────────────┐
│             FISCORD MVP                  │
│                                          │
│  [Admin / Contador Principal]            │
│   └── Acceso total                       │
│                                          │
│  (Post-MVP) [Empleado / Data Entry]      │
│   └── Solo carga de facturas             │
│                                          │
│  (Post-MVP) [Contador Externo]           │
│   └── Solo lectura + exportación         │
└──────────────────────────────────────────┘
```

### Persona Principal — "El Contador PyME"

| Atributo | Descripción |
|---|---|
| **Nombre** | Carlos Rodríguez |
| **Rol** | Contador / Dueño de PyME |
| **Edad** | 35–55 años |
| **Dispositivos** | MacBook o PC Windows + iPhone/Android |
| **Dolor principal** | Pasa 4–6 horas al mes armando el 606 manualmente en Excel |
| **Meta** | Presentar el 606 en < 30 minutos sin errores |
| **Contexto técnico** | Cómodo con Excel, básico en apps; no es desarrollador |
| **Motivación** | Evitar multas DGII (RD$5,000–RD$50,000 por errores) |

### Flujos de Uso Primarios

```
Flujo A — Registro Rápido (móvil):
  Toma foto → OCR extrae datos → Revisar/corregir → Guardar

Flujo B — Registro Manual (web):
  Abrir formulario → Ingresar RNC/NCF/montos → Subir foto → Guardar

Flujo C — Exportación Mensual (web):
  Ir a Reportes → Seleccionar período → Exportar .xlsx → Enviar a DGII
```

---

## 3. Features MVP Detalladas

### F-01 — Autenticación

**Descripción:** Sistema de login/registro con sesiones seguras.

| Sub-feature | Detalle |
|---|---|
| Registro | Email + contraseña + nombre empresa + RNC empresa |
| Login | Email + contraseña → JWT access token (15 min) + refresh token (30 días) |
| Logout | Revocación de refresh token en Redis |
| Recuperación | Email con link de reset (expira en 1 hora) vía Amazon SES |
| Persistencia | "Recordarme" almacena refresh token en httpOnly cookie |

**Reglas de contraseña:** Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial.

---

### F-02 — Registro Manual de Facturas

**Descripción:** Formulario completo para registrar gastos según campos requeridos por el Formulario 606.

**Campos del formulario:**

| Campo | Tipo | Validación | Requerido |
|---|---|---|---|
| RNC / Cédula Proveedor | text | 9–11 dígitos, checksum DGII | Sí |
| NCF | text | Formato B##-############ | Sí |
| NCF modificado | text | Mismo formato, solo para notas de crédito/débito | No |
| Tipo Comprobante | select | B01–B16 (ver tabla abajo) | Sí |
| Fecha Factura | date | No futura, no > 5 años atrás | Sí |
| Fecha Pago | date | ≥ Fecha factura | No |
| Subtotal (sin ITBIS) | decimal | ≥ 0, máx 99,999,999.99 | Sí |
| ITBIS Facturado | decimal | 0 o 18% del subtotal ± 1% | No |
| ITBIS Retenido | decimal | Solo aplica si es agente de retención | No |
| ITBIS Percibido | decimal | ≥ 0 | No |
| ITBIS a costo | decimal | ≥ 0 | No |
| ITBIS proporcionalidad | decimal | ≥ 0 | No |
| Ret. ISR (Servicios) | decimal | ≥ 0 | No |
| ISR Percibido | decimal | ≥ 0 | No |
| Otros Impuestos | decimal | ≥ 0 | No |
| Monto Total | decimal | Auto-calculado | Sí |
| Forma de Pago | select | 01–07 (ver tabla abajo) | Sí |
| Notas | textarea | Máx 500 chars | No |

**Tipos de Comprobante Fiscal (NCF):**

| Código | Descripción |
|---|---|
| B01 | Facturas de Crédito Fiscal |
| B02 | Facturas al Consumidor Final |
| B03 | Notas de Débito |
| B04 | Notas de Crédito |
| B11 | Proveedores Informales |
| B12 | Único Ingreso |
| B13 | Gastos Menores |
| B14 | Regímenes Especiales |
| B15 | Gubernamentales |
| B16 | Proveedores del Exterior |

**Formas de Pago:**

| Código | Descripción |
|---|---|
| 01 | Efectivo |
| 02 | Cheques / Transferencias / Depósitos |
| 03 | Tarjeta Débito / Crédito |
| 04 | Compra a Crédito |
| 05 | Permuta |
| 06 | Nota de Crédito |
| 07 | Mixto |

---

### F-03 — Escaneo OCR de Facturas

**Descripción:** El usuario toma una foto de la factura y el sistema extrae automáticamente los campos reconocibles.

**Flujo técnico:**

```
[Usuario toma foto / sube imagen]
        ↓
[Frontend pre-procesa imagen]
  - Escala de grises
  - Contraste +30%
  - Resize a 1200px ancho mínimo
        ↓
[Tesseract.js extrae texto raw]
        ↓
[Parser RegEx + Heurísticas]
  - Detecta RNC: /\b\d{9,11}\b/
  - Detecta NCF: /B\d{2}-?\d{10,12}/i
  - Detecta montos: /\$?\s*[\d,]+\.?\d{0,2}/
  - Detecta fechas: /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/
        ↓
[Pre-llenar formulario con campos detectados]
        ↓
[Usuario revisa, corrige y confirma]
```

**Campos objetivo OCR:**

| Campo | Confianza esperada |
|---|---|
| RNC proveedor | Alta (formato estandarizado) |
| NCF | Alta (formato estandarizado B##-...) |
| Fecha factura | Media (múltiples formatos) |
| Monto total | Media (depende de la impresión) |
| ITBIS | Media |
| Nombre proveedor | Baja (variable) |

**Almacenamiento de fotos:**
- Proveedor: Supabase Storage
- Ruta: `facturas/{company_id}/{year}/{month}/{invoice_id}/{uuid}.webp`
- Compresión: WebP quality 85 antes de subir
- Tamaño máximo: 10 MB por foto
- Retención mínima: **10 años** (Norma 06-2014)
- Acceso: URLs firmadas con expiración de 1 hora

---

### F-04 — Listado, Edición y Eliminación de Facturas

**Listado:**
- Tabla con paginación (25 por página)
- Búsqueda por: RNC, NCF, nombre proveedor, rango de fechas, tipo NCF
- Ordenamiento por: fecha, monto, fecha de creación
- Filtros rápidos: mes actual, trimestre actual, con/sin foto, con/sin validación DGII

**Edición:**
- Formulario pre-llenado idéntico al de creación
- Historial de cambios en campo `updated_at`
- Si la factura ya fue incluida en un reporte 606 exportado, mostrar advertencia

**Eliminación:**
- Soft delete (campo `deleted_at`) — nunca borrado físico
- Requiere confirmación con modal
- Las fotos en Supabase Storage se conservan 10 años independientemente

---

### F-05 — Exportación Excel Formato 606

**Descripción:** Genera un archivo `.xlsx` con las columnas exactas y orden requerido por la DGII para el Formulario 606.

**Columnas del archivo 606 (orden oficial):**

```
1.  RNC o Cédula del Proveedor
2.  Tipo Identificación
3.  Tipo Bienes y Servicios Adquiridos
4.  NCF
5.  NCF o Documento Modificado
6.  Fecha Comprobante
7.  Fecha de Pago
8.  Monto Facturado Servicios
9.  Monto Facturado Bienes
10. Total Monto Facturado
11. ITBIS Facturado
12. ITBIS Retenido por Terceros
13. ITBIS Percibido
14. ITBIS incluido en el Costo/Gasto
15. ITBIS Sujeto a Proporcionalidad
16. ITBIS Llevado al Costo
17. Bienes o Servicios sujetos a Retención ISR
18. Retención en la Fuente Renta
19. ISR Percibido
20. Otros Impuestos/Tasas
21. Monto Total Facturado
22. Forma de Pago
```

**Opciones de exportación:**

| Opción | Descripción |
|---|---|
| Período | Mes específico o rango de fechas |
| Formato | `.xlsx` (con cabecera DGII) |
| Filtros | Solo facturas validadas / todas |
| Resumen | Hoja 2 con totales por tipo NCF |

**Librería:** `xlsx` (SheetJS) — ejecutado en backend para evitar exposición en cliente.

---

### F-06 — Dashboard con Gráficos

**Widgets del Dashboard:**

| Widget | Tipo | Datos |
|---|---|---|
| Gastos del mes | KPI Card | Total RD$ facturas del mes en curso |
| Facturas registradas | KPI Card | Count de facturas del mes |
| ITBIS acumulado | KPI Card | Suma ITBIS del mes |
| Gastos por mes | Bar Chart | Últimos 12 meses |
| Top 10 Proveedores | Horizontal Bar | Por monto total acumulado |
| Distribución por tipo NCF | Pie Chart | % por B01, B02, etc. |
| Distribución por forma de pago | Donut Chart | % por forma de pago |
| Facturas recientes | Data Table | Últimas 10 facturas |

**Librería de gráficos:** Recharts (React)

**Filtros del dashboard:** Año fiscal, mes, proveedor específico.

---

### F-07 — App Móvil (React Native + Expo)

**Pantallas MVP:**

```
App Móvil
├── Auth
│   ├── Login Screen
│   └── (No registro desde móvil en MVP)
├── Home (Dashboard compacto)
│   ├── KPIs del mes
│   └── Acceso rápido a cámara
├── Facturas
│   ├── Lista de facturas (infinite scroll)
│   └── Detalle de factura
├── Nueva Factura
│   ├── Opción: Cámara (OCR)
│   └── Opción: Manual
└── Perfil / Cerrar Sesión
```

**Capacidades nativas usadas:**

| Capacidad | Librería Expo |
|---|---|
| Cámara | `expo-camera` |
| Galería de fotos | `expo-image-picker` |
| Almacenamiento local | `expo-secure-store` (tokens) |
| Notificaciones push | `expo-notifications` (post-MVP) |
| Biometría | `expo-local-authentication` (post-MVP) |

**Distribución:** Expo EAS Build → `.apk` / `.ipa`  
**Target OS:** Android 10+ / iOS 14+

---

## 4. Arquitectura Técnica

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIOS                                │
│              Web Browser          App Móvil                     │
│         (React 18 + Vite)    (React Native + Expo)              │
└──────────────────┬──────────────────────┬───────────────────────┘
                   │                      │
                   ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE (WAF + DDoS + CDN)                │
└──────────────────────────────┬──────────────────────────────────┘
                               │
           ┌───────────────────┴────────────────────┐
           ▼                                        ▼
┌─────────────────────┐                 ┌───────────────────────┐
│   VERCEL (Web)      │                 │   RAILWAY (Backend)   │
│   React SPA         │                 │   Node.js + Express   │
│   Static build      │◄── REST API ───►│   TypeScript          │
└─────────────────────┘                 └──────────┬────────────┘
                                                   │
              ┌────────────────────────────────────┼──────────────┐
              ▼                                    ▼              ▼
┌─────────────────────┐              ┌─────────────────┐  ┌──────────────┐
│  PostgreSQL         │              │  Redis          │  │  Supabase    │
│  (Railway)          │              │  (Railway)      │  │  Storage     │
│  Datos principales  │              │  Sessions+Cache │  │  Fotos       │
└─────────────────────┘              └─────────────────┘  └──────────────┘
                                                   │
              ┌────────────────────────────────────┴──────────────┐
              ▼                                                    ▼
┌─────────────────────┐                              ┌────────────────────┐
│  Amazon SES         │                              │  Sentry + BetterStack│
│  Emails             │                              │  Monitoring         │
└─────────────────────┘                              └────────────────────┘
```

### Stack por Capa

#### Frontend Web

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool / dev server |
| TailwindCSS | 3.x | Styling utility-first |
| React Router | 6.x | Client-side routing |
| Zustand | 4.x | State management |
| React Query | 5.x | Server state / cache |
| React Hook Form | 7.x | Formularios + validación |
| Zod | 3.x | Schema validation compartido |
| Recharts | 2.x | Gráficos dashboard |
| Tesseract.js | 5.x | OCR en browser |
| SheetJS (xlsx) | 0.20.x | Parsing Excel (preview) |
| Axios | 1.x | HTTP client |

#### Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| Node.js | 20 LTS | Runtime |
| Express | 4.x | HTTP framework |
| TypeScript | 5.x | Type safety |
| Prisma | 5.x | ORM + migrations |
| Zod | 3.x | Validación requests |
| jsonwebtoken | 9.x | JWT handling |
| bcrypt | 5.x | Password hashing |
| ioredis | 5.x | Redis client |
| multer | 1.x | Multipart / uploads |
| sharp | 0.33.x | Procesamiento imágenes |
| xlsx | 0.20.x | Generación Excel 606 |
| @aws-sdk/client-ses | 3.x | Envío de emails |
| helmet | 7.x | HTTP security headers |
| express-rate-limit | 7.x | Rate limiting |
| cors | 2.x | CORS configurado |
| morgan | 1.x | HTTP request logging |

#### App Móvil

| Tecnología | Versión | Propósito |
|---|---|---|
| React Native | 0.74.x | Mobile framework |
| Expo | 51.x | Managed workflow |
| Expo Router | 3.x | File-based routing |
| NativeWind | 4.x | TailwindCSS para RN |
| Zustand | 4.x | State management |
| React Query | 5.x | Server state |
| expo-camera | latest | Cámara OCR |
| expo-image-picker | latest | Galería fotos |
| expo-secure-store | latest | Tokens seguros |

### Variables de Entorno

#### Backend (`.env`)

```env
# App
NODE_ENV=production
PORT=3000
APP_URL=https://api.fiscord.app

# Database
DATABASE_URL=postgresql://user:pass@host:5432/fiscord
REDIS_URL=redis://user:pass@host:6379

# Auth
JWT_ACCESS_SECRET=<256-bit-random>
JWT_REFRESH_SECRET=<256-bit-random>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
BCRYPT_ROUNDS=12

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>
SUPABASE_BUCKET=facturas

# Amazon SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
SES_FROM_EMAIL=noreply@fiscord.app

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx

# Encryption
AES_256_KEY=<32-byte-hex>
```

#### Frontend Web (`.env`)

```env
VITE_API_URL=https://api.fiscord.app
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 5. Base de Datos — Schema SQL

### Diagrama ERD (simplificado)

```
companies ─── users
    │
    └── invoices ─── invoice_photos
           │
           └── (soft-delete via deleted_at)

export_logs (registro de 606 exportados)
password_reset_tokens
refresh_tokens
```

### Schema Completo

```sql
-- ─────────────────────────────────────────
-- EXTENSIONES
-- ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- búsqueda fuzzy en proveedor

-- ─────────────────────────────────────────
-- COMPANIES
-- ─────────────────────────────────────────
CREATE TABLE companies (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  rnc           VARCHAR(11)  NOT NULL UNIQUE,  -- RNC o cédula empresa
  address       TEXT,
  phone         VARCHAR(20),
  email         VARCHAR(255),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

CREATE TABLE users (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id        UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email             VARCHAR(255) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  full_name         VARCHAR(255) NOT NULL,
  role              user_role   NOT NULL DEFAULT 'admin',
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);

-- ─────────────────────────────────────────
-- REFRESH TOKENS
-- ─────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked     BOOLEAN     NOT NULL DEFAULT false,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

-- ─────────────────────────────────────────
-- PASSWORD RESET TOKENS
-- ─────────────────────────────────────────
CREATE TABLE password_reset_tokens (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INVOICES (FACTURAS)
-- ─────────────────────────────────────────
CREATE TYPE ncf_type AS ENUM (
  'B01', 'B02', 'B03', 'B04',
  'B11', 'B12', 'B13', 'B14', 'B15', 'B16'
);

CREATE TYPE payment_method AS ENUM (
  '01', '02', '03', '04', '05', '06', '07'
);

CREATE TABLE invoices (
  -- Identificadores
  id                        UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id                UUID          NOT NULL REFERENCES companies(id),
  created_by_user_id        UUID          NOT NULL REFERENCES users(id),

  -- Datos proveedor
  supplier_rnc              VARCHAR(11)   NOT NULL,
  supplier_id_type          CHAR(1)       NOT NULL DEFAULT '1', -- 1=RNC, 2=Cédula, 3=Pasaporte
  supplier_name             VARCHAR(255),

  -- Comprobante Fiscal
  ncf                       VARCHAR(19)   NOT NULL,  -- Ej: B01-00000001
  ncf_modified              VARCHAR(19),             -- NCF afectado (notas créd/déb)
  ncf_type                  ncf_type      NOT NULL,

  -- Fechas
  invoice_date              DATE          NOT NULL,
  payment_date              DATE,

  -- Montos (todos en RD$, precisión 2 decimales)
  amount_services           NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  amount_goods              NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  subtotal                  NUMERIC(14,2) GENERATED ALWAYS AS (amount_services + amount_goods) STORED,
  itbis_billed              NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  itbis_retained            NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  itbis_perceived           NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  itbis_proportionality     NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  itbis_to_cost             NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  goods_services_isr        NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  isr_retention             NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  isr_perceived             NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  other_taxes               NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  total_amount              NUMERIC(14,2) NOT NULL,

  -- Pago
  payment_method            payment_method NOT NULL,

  -- Metadata
  notes                     TEXT,
  is_validated              BOOLEAN       NOT NULL DEFAULT false,
  validation_errors         JSONB,        -- Errores de validación 606
  exported_in_period        VARCHAR(7),   -- "2025-01" si fue exportado en ese período

  -- Soft delete + auditoría
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ   -- NULL = activo
);

CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_supplier_rnc ON invoices(supplier_rnc);
CREATE INDEX idx_invoices_ncf ON invoices(ncf);
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_supplier_name_trgm ON invoices USING GIN (supplier_name gin_trgm_ops);

-- ─────────────────────────────────────────
-- INVOICE PHOTOS
-- ─────────────────────────────────────────
CREATE TABLE invoice_photos (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id      UUID          NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  storage_path    TEXT          NOT NULL, -- path en Supabase Storage
  storage_url     TEXT          NOT NULL, -- URL pública base (sin firma)
  file_size_bytes INTEGER,
  mime_type       VARCHAR(50)   NOT NULL DEFAULT 'image/webp',
  ocr_raw_text    TEXT,         -- Texto crudo extraído por OCR
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_photos_invoice_id ON invoice_photos(invoice_id);

-- ─────────────────────────────────────────
-- EXPORT LOGS (Historial 606 exportados)
-- ─────────────────────────────────────────
CREATE TABLE export_logs (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID          NOT NULL REFERENCES companies(id),
  exported_by     UUID          NOT NULL REFERENCES users(id),
  period          VARCHAR(7)    NOT NULL, -- "YYYY-MM"
  invoice_count   INTEGER       NOT NULL,
  total_amount    NUMERIC(14,2) NOT NULL,
  file_path       TEXT,         -- Path del xlsx en storage (opcional)
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TRIGGER: updated_at automático
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### Índices y Queries Críticos

```sql
-- Facturas del mes para exportación 606
SELECT * FROM invoices
WHERE company_id = $1
  AND invoice_date >= date_trunc('month', $2::date)
  AND invoice_date < date_trunc('month', $2::date) + INTERVAL '1 month'
  AND deleted_at IS NULL
ORDER BY invoice_date ASC;

-- Búsqueda por proveedor (fuzzy)
SELECT * FROM invoices
WHERE company_id = $1
  AND supplier_name % $2  -- pg_trgm
  AND deleted_at IS NULL;

-- Dashboard KPIs del mes
SELECT
  COUNT(*)              AS invoice_count,
  SUM(total_amount)     AS total_amount,
  SUM(itbis_billed)     AS total_itbis
FROM invoices
WHERE company_id = $1
  AND invoice_date >= date_trunc('month', NOW())
  AND deleted_at IS NULL;
```

---

## 6. API REST — Endpoints

### Convenciones

```
Base URL:   https://api.fiscord.app/api/v1
Auth:       Bearer <JWT access token> en header Authorization
Content:    application/json (excepto uploads: multipart/form-data)
Errores:    { "error": "MESSAGE", "code": "ERROR_CODE", "details": {} }
Paginación: ?page=1&limit=25 → { data: [], meta: { total, page, limit, pages } }
```

### Respuesta de Error Estándar

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "ncf": ["Invalid NCF format"],
    "invoice_date": ["Cannot be in the future"]
  }
}
```

---

### Auth — `/api/v1/auth`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/auth/register` | No | Registra empresa + usuario admin |
| `POST` | `/auth/login` | No | Login → devuelve access + refresh token |
| `POST` | `/auth/logout` | Sí | Revoca refresh token |
| `POST` | `/auth/refresh` | No | Renueva access token con refresh token |
| `GET` | `/auth/me` | Sí | Perfil del usuario autenticado |
| `POST` | `/auth/forgot-password` | No | Envía email de recuperación |
| `POST` | `/auth/reset-password` | No | Resetea contraseña con token |
| `PUT` | `/auth/change-password` | Sí | Cambia contraseña (requiere actual) |

**`POST /auth/register`**

```json
// Request
{
  "company_name": "Mi Empresa SRL",
  "company_rnc": "101234567",
  "full_name": "Carlos Rodríguez",
  "email": "carlos@miempresa.com",
  "password": "Passw0rd!"
}

// Response 201
{
  "user": { "id": "uuid", "email": "...", "full_name": "...", "role": "admin" },
  "company": { "id": "uuid", "name": "...", "rnc": "..." },
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

**`POST /auth/login`**

```json
// Request
{ "email": "carlos@miempresa.com", "password": "Passw0rd!" }

// Response 200
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 900
}
```

---

### Facturas — `/api/v1/invoices`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/invoices` | Sí | Listar facturas (paginado + filtros) |
| `POST` | `/invoices` | Sí | Crear factura |
| `GET` | `/invoices/:id` | Sí | Obtener factura por ID |
| `PUT` | `/invoices/:id` | Sí | Actualizar factura |
| `DELETE` | `/invoices/:id` | Sí | Soft-delete factura |
| `POST` | `/invoices/:id/photos` | Sí | Subir foto(s) a factura |
| `DELETE` | `/invoices/:id/photos/:photoId` | Sí | Eliminar foto |
| `POST` | `/invoices/ocr` | Sí | Procesar imagen OCR → extraer campos |

**`GET /invoices` — Query params:**

| Param | Tipo | Descripción |
|---|---|---|
| `page` | int | Página (default: 1) |
| `limit` | int | Por página (default: 25, max: 100) |
| `search` | string | Búsqueda en RNC, NCF, nombre proveedor |
| `ncf_type` | string | Filtrar por tipo NCF (B01, B02...) |
| `payment_method` | string | Filtrar por forma de pago |
| `date_from` | date | Fecha inicio (YYYY-MM-DD) |
| `date_to` | date | Fecha fin (YYYY-MM-DD) |
| `has_photo` | bool | Solo con/sin foto |
| `is_validated` | bool | Solo validadas/no validadas |
| `sort_by` | string | `invoice_date`, `total_amount`, `created_at` |
| `sort_dir` | string | `asc` \| `desc` |

**`POST /invoices` — Request body:**

```json
{
  "supplier_rnc": "101234567",
  "supplier_name": "Proveedor SRL",
  "ncf": "B01-00000001",
  "ncf_type": "B01",
  "invoice_date": "2025-01-15",
  "payment_date": "2025-01-20",
  "amount_services": 5000.00,
  "amount_goods": 0.00,
  "itbis_billed": 900.00,
  "itbis_retained": 0.00,
  "itbis_perceived": 0.00,
  "itbis_proportionality": 0.00,
  "itbis_to_cost": 0.00,
  "goods_services_isr": 0.00,
  "isr_retention": 0.00,
  "isr_perceived": 0.00,
  "other_taxes": 0.00,
  "total_amount": 5900.00,
  "payment_method": "02",
  "notes": "Servicio de diseño gráfico"
}
```

**`POST /invoices/ocr` — Multipart:**

```
Campo: image (file, max 10MB, JPEG/PNG/WEBP)
Response 200:
{
  "extracted": {
    "supplier_rnc": "101234567",
    "ncf": "B01-00000001",
    "invoice_date": "2025-01-15",
    "total_amount": 5900.00,
    "itbis_billed": 900.00
  },
  "confidence": {
    "supplier_rnc": 0.95,
    "ncf": 0.90,
    "invoice_date": 0.75,
    "total_amount": 0.82,
    "itbis_billed": 0.80
  },
  "raw_text": "...",
  "temp_image_id": "uuid"  // Para adjuntar a la factura al guardar
}
```

---

### Reportes — `/api/v1/reports`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/reports/606` | Sí | Preview de datos 606 para período |
| `POST` | `/reports/606/export` | Sí | Generar y descargar Excel 606 |
| `GET` | `/reports/606/history` | Sí | Historial de exportaciones |

**`POST /reports/606/export`**

```json
// Request
{
  "period": "2025-01",      // YYYY-MM
  "include_all": false      // false = solo validadas
}

// Response: archivo .xlsx con Content-Disposition: attachment
// Headers:
//   Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
//   Content-Disposition: attachment; filename="606_2025-01_FISCORD.xlsx"
```

---

### Dashboard — `/api/v1/dashboard`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/dashboard/stats` | Sí | KPIs y resumen general |
| `GET` | `/dashboard/monthly-trend` | Sí | Gastos por mes (últimos 12) |
| `GET` | `/dashboard/top-suppliers` | Sí | Top 10 proveedores por monto |
| `GET` | `/dashboard/by-ncf-type` | Sí | Distribución por tipo NCF |
| `GET` | `/dashboard/by-payment-method` | Sí | Distribución por forma de pago |

**`GET /dashboard/stats?year=2025&month=1`**

```json
{
  "current_month": {
    "invoice_count": 42,
    "total_amount": 250000.00,
    "total_itbis": 45000.00,
    "pending_validation": 3
  },
  "current_year": {
    "invoice_count": 210,
    "total_amount": 1250000.00,
    "total_itbis": 225000.00
  },
  "last_invoice_date": "2025-01-28"
}
```

---

### Empresa — `/api/v1/company`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/company` | Sí | Obtener datos de la empresa |
| `PUT` | `/company` | Sí | Actualizar datos de la empresa |

---

### Validaciones 606 (lógica backend)

El backend valida cada factura contra las reglas de la DGII antes de permitir su inclusión en la exportación 606:

```
✓ RNC válido (checksum módulo 11)
✓ NCF formato correcto (B##-########## o E##-############)
✓ Fecha factura no futura
✓ Monto total = subtotal + itbis_billed - itbis_retained + otros_impuestos
✓ ITBIS no puede ser mayor al 18% del subtotal + 1% tolerancia
✓ Si NCF es B03/B04 → ncf_modified es requerido
✓ Si ITBIS_retenido > 0 → empresa debe ser agente de retención
```

---

## 7. Seguridad & Compliance

### Modelo de Amenazas (OWASP Top 10)

| Amenaza OWASP | Mitigación en FISCORD |
|---|---|
| A01: Broken Access Control | Middleware `requireAuth` + `requireRole` en cada route. Company scoping en todas las queries. |
| A02: Cryptographic Failures | AES-256 para datos sensibles en reposo. HTTPS end-to-end (Cloudflare + Railway). bcrypt rounds=12. |
| A03: Injection | Prisma ORM con queries parametrizadas. Zod para validar y sanitizar todo input. |
| A04: Insecure Design | Soft delete (nunca borrado real). Refresh token rotation. Audit trail `created_at/updated_at`. |
| A05: Security Misconfiguration | Helmet.js headers. Variables de entorno nunca en código. CORS whitelist estricto. |
| A06: Vulnerable Components | Dependabot alerts activados. `npm audit` en CI. |
| A07: Auth Failures | Rate limiting 5 intentos/IP en `/auth/login`. JWT de corta duración (15 min). Refresh token httpOnly cookie. |
| A08: Data Integrity Failures | Validación Zod en frontend Y backend. Checksums en exportación 606. |
| A09: Logging Failures | Sentry para errores. Morgan para HTTP logs. Better Stack para alertas. |
| A10: SSRF | No se realizan requests a URLs externas arbitrarias. Whitelist de dominios Supabase. |

### Configuración de Seguridad HTTP

```typescript
// helmet.js config
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "*.supabase.co"],
      scriptSrc: ["'self'"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,                    // 5 intentos
  message: { error: "Too many login attempts", code: "RATE_LIMITED" }
});
app.use('/api/v1/auth/login', loginLimiter);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minuto
  max: 100              // 100 req/min general
});
app.use('/api/v1/', apiLimiter);
```

### JWT Strategy

```
Access Token:
  - Expiración: 15 minutos
  - Payload: { sub: user_id, company_id, role, iat, exp }
  - Almacenamiento cliente: memoria (NO localStorage)

Refresh Token:
  - Expiración: 30 días
  - Almacenamiento cliente: httpOnly cookie (SameSite=Strict)
  - Hash en DB: SHA-256 del token antes de guardar
  - Rotación: nuevo refresh token en cada renovación
  - Revocación: al logout o detectar uso de token revocado
```

### Cumplimiento DGII — Norma 06-2014

| Requisito | Implementación |
|---|---|
| Conservar comprobantes 10 años | Fotos en Supabase Storage con lifecycle policy de 10 años. Soft-delete nunca borra físicamente. |
| Formato 606 exacto | Columnas y orden según plantilla oficial. Validación automática antes de exportar. |
| Integridad de montos | Suma de control al final de cada exportación. |
| RNC válido | Checksum módulo 11 validado en frontend y backend. |
| NCF válido | Regex + verificación de secuencia. |

### Cifrado de Datos Sensibles

```
En tránsito:  TLS 1.3 (Cloudflare → Railway, Railway → PostgreSQL)
En reposo:
  - Contraseñas: bcrypt (cost=12)
  - Refresh tokens en DB: SHA-256 hash
  - RNC empresa: almacenado en claro (dato público DGII)
  - Fotos: almacenadas en Supabase con bucket privado
  - Acceso fotos: URLs firmadas (expiración 1 hora)
```

### Política de Backups

| Item | Frecuencia | Retención |
|---|---|---|
| PostgreSQL (Railway) | Diario automático | 30 días |
| Supabase Storage (fotos) | Redundancia multi-región | 10 años |
| Export logs | Permanente en DB | Indefinido |

---

## 8. UI/UX Flows

### Paleta de Colores

```
Primario:    #1E40AF (Blue-800)  — Confianza, fiscal
Secundario:  #0EA5E9 (Sky-500)   — Acción, interactivo
Éxito:       #16A34A (Green-600) — Validado, guardado
Advertencia: #D97706 (Amber-600) — Pendiente, revisar
Error:       #DC2626 (Red-600)   — Error, inválido
Neutral:     #1E293B (Slate-800) — Textos principales
Fondo:       #F8FAFC (Slate-50)  — Fondo general
```

### Flow 1 — Onboarding (Primera Vez)

```
[Landing / Login Page]
        ↓ click "Crear cuenta"
[Registro Step 1 — Empresa]
  Nombre empresa + RNC + validación checksum
        ↓
[Registro Step 2 — Usuario]
  Nombre + Email + Contraseña
        ↓
[Email de bienvenida enviado]
        ↓
[Dashboard vacío con wizard]
  "Registra tu primera factura →"
```

### Flow 2 — Registro Manual de Factura (Web)

```
[Dashboard] → click "Nueva Factura"
        ↓
[Formulario Factura — Tab 1: Proveedor]
  RNC (validación en tiempo real via blur)
  → Auto-lookup nombre proveedor (caché local)
  NCF + Tipo NCF
        ↓
[Formulario Factura — Tab 2: Montos]
  Fecha factura + Fecha pago
  Monto servicios + Monto bienes
  ITBIS (auto-calculado, editable)
  Otros campos fiscales (colapsados por defecto)
  Total (auto-calculado)
  Forma de pago
        ↓
[Formulario Factura — Tab 3: Foto]
  Upload drag & drop o click
  Preview de imagen
  (Opcional: ejecutar OCR desde aquí)
        ↓
[Botón "Guardar Factura"]
  → Validación 606 inmediata
  → Toast: "Factura guardada ✓"
  → Redirige a listado
```

### Flow 3 — OCR (Móvil)

```
[Home App] → FAB "+" → "Escanear Factura"
        ↓
[Cámara] → Tomar foto (guía de encuadre)
        ↓
[Processing screen] → "Extrayendo datos..."
  (Tesseract.js procesa en background)
        ↓
[Formulario pre-llenado]
  Campos extraídos destacados en azul
  Campos con baja confianza destacados en amarillo
  Campos no detectados en rojo (vacíos)
        ↓
[Usuario revisa y corrige]
        ↓
[Guardar] → Sincroniza con backend
        ↓
[Confirmación + regresa a Home]
```

### Flow 4 — Exportación 606

```
[Sidebar] → "Reportes 606"
        ↓
[Selector de período: mes/año]
[Preview tabla con facturas del período]
[Resumen: count, total, ITBIS]
[Advertencias: facturas sin validar]
        ↓
[Botón "Exportar Excel"]
        ↓
[Generando... (spinner)]
        ↓
[Descarga automática 606_2025-01_FISCORD.xlsx]
[Toast: "Exportación exitosa — 42 facturas"]
[Registro en historial de exportaciones]
```

### Navegación Web — Sidebar

```
FISCORD
├── 🏠 Dashboard
├── 📄 Facturas
│   ├── Todas las facturas
│   └── Nueva factura
├── 📊 Reportes
│   ├── Exportar 606
│   └── Historial exportaciones
├── 🏢 Mi Empresa
└── 👤 Perfil / Cerrar sesión
```

### Componentes UI Reutilizables

| Componente | Descripción |
|---|---|
| `InvoiceForm` | Formulario completo de factura (create/edit) |
| `InvoiceTable` | Tabla paginada con filtros |
| `InvoiceDetail` | Vista detalle con foto |
| `OCRUploader` | Drag & drop + cámara con preview |
| `RNCInput` | Input con validación checksum en tiempo real |
| `NCFInput` | Input con formato automático B##-########## |
| `CurrencyInput` | Input para montos RD$ con formato |
| `PeriodSelector` | Selector mes/año para reportes |
| `ExportButton` | Botón exportar con estado de carga |
| `KPICard` | Card de métrica del dashboard |
| `StatusBadge` | Badge validado/pendiente/error |

---

## 9. Roadmap — Sprints por Semana

### Vista General

```
Sem 1-2  │████████████░░░░░░░░░░░░░░░░░░░░│ Setup + Auth
Sem 3-4  │░░░░░░░░████████████░░░░░░░░░░░░│ CRUD Facturas
Sem 5-6  │░░░░░░░░░░░░░░░░████████████░░░░│ OCR + 606 Export
Sem 7    │░░░░░░░░░░░░░░░░░░░░░░░░████░░░░│ App Móvil
Sem 8    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░████│ QA + Deploy
```

---

### Sprint 1 — Semana 1: Fundamentos e Infraestructura

**Objetivo:** Repositorio funcional, CI/CD básico, DB desplegada, primeras rutas de auth.

| Tarea | Área | Estimado |
|---|---|---|
| Monorepo setup (apps/web, apps/mobile, apps/backend) | DevOps | 4h |
| ESLint + Prettier + Husky + lint-staged | DevOps | 2h |
| GitHub Actions CI (lint + typecheck) | DevOps | 3h |
| PostgreSQL en Railway + primeras migrations | Backend | 3h |
| Redis en Railway | Backend | 1h |
| Express app base + Helmet + CORS + Morgan | Backend | 3h |
| `POST /auth/register` | Backend | 4h |
| `POST /auth/login` + JWT | Backend | 4h |
| `POST /auth/refresh` + Redis | Backend | 3h |
| Vite + React + TailwindCSS scaffold | Frontend | 3h |
| React Router config + layouts | Frontend | 2h |
| Zustand auth store | Frontend | 2h |
| Login page UI | Frontend | 3h |

**Entregable:** Login funcional en web, endpoints auth testeados con Postman.

---

### Sprint 2 — Semana 2: Auth Completo + Seguridad Base

**Objetivo:** Auth production-ready con recuperación de contraseña y protecciones OWASP.

| Tarea | Área | Estimado |
|---|---|---|
| `POST /auth/logout` con revocación Redis | Backend | 2h |
| `POST /auth/forgot-password` + Amazon SES | Backend | 4h |
| `POST /auth/reset-password` | Backend | 3h |
| Rate limiting en rutas auth | Backend | 2h |
| Middleware `requireAuth` global | Backend | 2h |
| Register page UI (multi-step) | Frontend | 4h |
| Forgot/reset password UI | Frontend | 3h |
| Auth guards en React Router | Frontend | 2h |
| Refresh token silencioso (Axios interceptors) | Frontend | 3h |
| Supabase Storage bucket config | Backend | 2h |
| Variables de entorno production (Railway secrets) | DevOps | 1h |
| Deploy inicial backend Railway | DevOps | 2h |
| Deploy inicial frontend Vercel | DevOps | 2h |

**Entregable:** Auth completo deployado. Email de recuperación funcionando.

---

### Sprint 3 — Semana 3: CRUD Facturas Backend

**Objetivo:** API completa de facturas con validaciones 606.

| Tarea | Área | Estimado |
|---|---|---|
| Schema Prisma facturas + migrations | Backend | 3h |
| Zod schemas para Invoice | Backend | 2h |
| `GET /invoices` con paginación y filtros | Backend | 4h |
| `POST /invoices` con validación 606 | Backend | 4h |
| `GET /invoices/:id` | Backend | 1h |
| `PUT /invoices/:id` | Backend | 2h |
| `DELETE /invoices/:id` (soft delete) | Backend | 2h |
| `POST /invoices/:id/photos` (upload Supabase) | Backend | 4h |
| `DELETE /invoices/:id/photos/:photoId` | Backend | 2h |
| Lógica validación 606 (service layer) | Backend | 4h |
| RNC checksum validator (módulo 11) | Backend | 2h |
| Tests unitarios validaciones 606 | Backend | 3h |

**Entregable:** API facturas 100% funcional y probada.

---

### Sprint 4 — Semana 4: CRUD Facturas Frontend

**Objetivo:** UI completa para gestión de facturas en web.

| Tarea | Área | Estimado |
|---|---|---|
| InvoiceTable con paginación | Frontend | 4h |
| Filtros y búsqueda en tabla | Frontend | 3h |
| InvoiceForm (create) — Tab Proveedor | Frontend | 4h |
| InvoiceForm — Tab Montos con auto-cálculo | Frontend | 4h |
| InvoiceForm — Tab Foto (upload) | Frontend | 3h |
| RNCInput con validación tiempo real | Frontend | 2h |
| NCFInput con formato auto | Frontend | 2h |
| InvoiceDetail con foto viewer | Frontend | 3h |
| Edit flow (pre-llenado) | Frontend | 2h |
| Soft-delete con confirmación modal | Frontend | 2h |
| React Query hooks (useInvoices, useCreateInvoice...) | Frontend | 3h |
| Toast notifications (Sonner) | Frontend | 1h |

**Entregable:** CRUD facturas completo y funcional en web.

---

### Sprint 5 — Semana 5: OCR + Dashboard

**Objetivo:** Escaneo OCR funcional y dashboard con gráficos.

| Tarea | Área | Estimado |
|---|---|---|
| `POST /invoices/ocr` backend (recibe imagen, devuelve campos) | Backend | 4h |
| Integración Tesseract.js en frontend | Frontend | 4h |
| Pre-procesamiento imagen (escala grises, contraste) | Frontend | 3h |
| Parser RegEx (RNC, NCF, montos, fechas) | Frontend | 4h |
| OCRUploader component (cámara + upload) | Frontend | 4h |
| Formulario pre-llenado desde OCR + highlight confianza | Frontend | 3h |
| `/dashboard/stats` endpoint | Backend | 2h |
| `/dashboard/monthly-trend` endpoint | Backend | 2h |
| `/dashboard/top-suppliers` endpoint | Backend | 2h |
| Dashboard UI — KPI Cards | Frontend | 3h |
| Dashboard UI — Recharts (bar, pie, donut) | Frontend | 4h |
| Dashboard — período selector | Frontend | 2h |

**Entregable:** OCR funcionando (>80% precisión en facturas dominicanas). Dashboard con todos los gráficos.

---

### Sprint 6 — Semana 6: Reportes 606 + Exportación Excel

**Objetivo:** Exportación 606 lista para DGII.

| Tarea | Área | Estimado |
|---|---|---|
| `GET /reports/606` con preview datos | Backend | 3h |
| `POST /reports/606/export` — generar xlsx SheetJS | Backend | 6h |
| Columnas exactas formato oficial 606 | Backend | 3h |
| Hoja resumen por tipo NCF en xlsx | Backend | 2h |
| `export_logs` — guardar historial | Backend | 2h |
| Página Reportes 606 UI | Frontend | 4h |
| Preview tabla datos antes de exportar | Frontend | 3h |
| Botón exportar + descarga automática | Frontend | 2h |
| Historial de exportaciones | Frontend | 2h |
| Advertencias de facturas sin validar | Frontend | 2h |

**Entregable:** Excel 606 generado correctamente, validado manualmente contra plantilla DGII oficial.

---

### Sprint 7 — Semana 7: App Móvil

**Objetivo:** App React Native + Expo funcional para iOS y Android.

| Tarea | Área | Estimado |
|---|---|---|
| Expo project setup + Expo Router | Mobile | 3h |
| NativeWind + tema de colores | Mobile | 2h |
| Axios instance + React Query setup | Mobile | 2h |
| Login screen | Mobile | 3h |
| Home screen (KPIs compacto) | Mobile | 4h |
| Invoices list screen (infinite scroll) | Mobile | 4h |
| Invoice detail screen | Mobile | 3h |
| Nueva factura — opción cámara (expo-camera) | Mobile | 4h |
| Nueva factura — formulario manual (móvil) | Mobile | 4h |
| Expo Secure Store para tokens | Mobile | 2h |
| EAS Build config (Android + iOS) | Mobile | 2h |
| Test en emulador Android e iOS | Mobile | 3h |

**Entregable:** App instalable en Android e iOS con flujos core funcionando.

---

### Sprint 8 — Semana 8: QA, Hardening y Deploy Producción

**Objetivo:** Sistema production-ready, seguro y monitoreado.

| Tarea | Área | Estimado |
|---|---|---|
| End-to-end tests críticos (Playwright) | QA | 6h |
| Pruebas de carga básica (Artillery) — 50 users | QA | 3h |
| Auditoría OWASP — revisión manual checklist | Security | 4h |
| Sentry integración frontend + backend | DevOps | 3h |
| Better Stack alertas (uptime + error rate) | DevOps | 2h |
| Variables entorno revisión final | DevOps | 1h |
| Cloudflare WAF rules + rate limiting | DevOps | 3h |
| Custom domain + SSL (api.fiscord.app) | DevOps | 2h |
| Backup PostgreSQL test restore | DevOps | 2h |
| Smoke testing producción (checklist 30 items) | QA | 3h |
| Documentación API (OpenAPI/Swagger) | Docs | 4h |
| Fix de bugs encontrados en QA | Backend/Frontend | 8h |

**Entregable:** Sistema en producción, monitoreado, con dominio propio.

---

### Criterios de Aceptación por Feature

| Feature | Criterio de Done |
|---|---|
| Auth | Login/logout funcionando. Refresh token silencioso. Email recuperación enviado < 5 segundos. |
| CRUD Facturas | Crear, editar, eliminar, listar con filtros. Validaciones 606 correctas. |
| OCR | > 80% campos extraídos correctamente en 10 facturas de prueba locales. |
| Export 606 | Excel generado pasa validación manual contra plantilla DGII. Totales correctos. |
| Dashboard | Todos los gráficos cargan en < 2s. Datos correctos para períodos de prueba. |
| App Móvil | Instala y corre en Android 10+ e iOS 14+. Foto → OCR → Guardar funciona. |

---

## 10. Decisiones de Arquitectura Confirmadas

### ADR-001: Monorepo vs Polyrepo

- **Decisión:** Monorepo con estructura `apps/` (web, mobile, backend) + `packages/` (shared types, validators)
- **Razón:** Un solo desarrollador, lógica de validación Zod compartida, deploy simplificado
- **Trade-off:** CI más lento a futuro; mitigado con build caching en GitHub Actions

### ADR-002: Prisma ORM vs SQL crudo

- **Decisión:** Prisma 5 con migraciones versionadas
- **Razón:** Type-safety automática, migraciones reproducibles, productividad en MVP
- **Trade-off:** Overhead en queries complejos; aceptable para volumen < 10K facturas/año

### ADR-003: OCR en cliente vs servidor

- **Decisión:** Tesseract.js en el browser/app
- **Razón:** Sin costo de cómputo en servidor, funciona offline (app móvil)
- **Trade-off:** Primera carga lenta (modelo ~10MB); mitigado con lazy loading y cache

### ADR-004: Supabase Storage vs S3

- **Decisión:** Supabase Storage
- **Razón:** Free tier generoso (1GB), URLs firmadas built-in, integración simple
- **Trade-off:** Vendor lock-in menor; ruta de migración a S3 directa si escala

### ADR-005: Railway vs AWS/GCP

- **Decisión:** Railway para backend + PostgreSQL + Redis
- **Razón:** RD$250/mes, deploy desde git, PostgreSQL + Redis en mismo proveedor
- **Trade-off:** Menos control que EC2; aceptable para MVP 1 empresa

### ADR-006: JWT + Refresh Token vs Sessions

- **Decisión:** JWT access token (15min) + httpOnly refresh token (30d)
- **Razón:** Stateless para escalar, refresh en httpOnly elimina vulnerabilidad XSS principal
- **Trade-off:** Revocación requiere Redis; ya incluido en stack

### ADR-007: Soft Delete obligatorio

- **Decisión:** Nunca borrar registros de facturas físicamente; solo `deleted_at`
- **Razón:** Compliance DGII Norma 06-2014 requiere conservar evidencia 10 años
- **Trade-off:** Tabla crece sin límite; índice parcial `WHERE deleted_at IS NULL` mitiga impacto en queries

### ADR-008: Expo Managed Workflow vs Bare

- **Decisión:** Expo Managed Workflow
- **Razón:** MVP en 1 semana, EAS Build sin necesitar Xcode/Android Studio localmente
- **Trade-off:** Limitaciones en módulos nativos custom; no aplica para features requeridas

### ADR-009: Excel generado en backend

- **Decisión:** SheetJS ejecutado en Node.js backend, no en el browser
- **Razón:** Mantiene lógica de negocio (columnas 606, validaciones) fuera del cliente. Evitar exposición de la lógica de formateo
- **Trade-off:** Request bloqueante al descargar; aceptable para archivos < 5MB

### ADR-010: Validación duplicada (frontend + backend)

- **Decisión:** Mismos schemas Zod en `packages/validators` usados en frontend Y backend
- **Razón:** UX inmediata en cliente + seguridad garantizada en servidor. DRY para schemas
- **Trade-off:** Bundle size mínimamente mayor en web; irrelevante

---

## Apéndice A — Estructura de Carpetas

```
fiscord/
├── apps/
│   ├── web/                  # React 18 + Vite
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── invoices/
│   │   │   │   ├── dashboard/
│   │   │   │   └── ui/         # Componentes genéricos
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── stores/         # Zustand
│   │   │   ├── services/       # Axios + React Query
│   │   │   └── lib/            # Tesseract, utils
│   │   └── vite.config.ts
│   │
│   ├── mobile/               # React Native + Expo
│   │   ├── app/              # Expo Router (file-based)
│   │   │   ├── (auth)/
│   │   │   └── (tabs)/
│   │   ├── components/
│   │   └── app.json
│   │
│   └── backend/              # Node.js + Express
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── invoices.ts
│       │   │   ├── reports.ts
│       │   │   └── dashboard.ts
│       │   ├── middleware/
│       │   │   ├── requireAuth.ts
│       │   │   └── rateLimiter.ts
│       │   ├── services/
│       │   │   ├── invoice.service.ts
│       │   │   ├── ocr.service.ts
│       │   │   ├── export606.service.ts
│       │   │   └── email.service.ts
│       │   ├── lib/
│       │   │   ├── prisma.ts
│       │   │   ├── redis.ts
│       │   │   └── supabase.ts
│       │   └── app.ts
│       └── prisma/
│           ├── schema.prisma
│           └── migrations/
│
├── packages/
│   ├── validators/           # Zod schemas compartidos
│   │   └── src/
│   │       ├── invoice.ts
│   │       └── auth.ts
│   └── types/                # TypeScript types compartidos
│       └── src/
│           └── index.ts
│
├── docs/
│   └── FISCORD_SPECIFICATION.md
├── .github/
│   └── workflows/
│       └── ci.yml
└── package.json              # Workspace root (npm workspaces)
```

---

## Apéndice B — Checklist Pre-Deploy Producción

```
INFRAESTRUCTURA
[ ] PostgreSQL Railway — connection string en .env
[ ] Redis Railway — connection string en .env
[ ] Supabase Storage — bucket "facturas" creado, privado
[ ] Amazon SES — dominio verificado, salida de sandbox
[ ] Railway — variables de entorno configuradas
[ ] Vercel — variables VITE_* configuradas
[ ] Cloudflare — dominio apuntando a Railway
[ ] SSL activo en api.fiscord.app

SEGURIDAD
[ ] JWT secrets >= 256 bits (random)
[ ] bcrypt rounds = 12
[ ] CORS whitelist solo dominios de producción
[ ] Rate limiting activo en auth routes
[ ] Helmet headers activos
[ ] No console.log con datos sensibles

FUNCIONALIDAD
[ ] Login + Logout funcionan
[ ] Registro empresa + usuario
[ ] Crear factura con todos los campos
[ ] Subir foto → se ve en detalle
[ ] OCR extrae mínimo RNC + NCF + monto
[ ] Exportar 606 → Excel válido DGII
[ ] Dashboard carga con datos reales
[ ] App móvil instala en Android

MONITORING
[ ] Sentry captura errores en prod
[ ] Better Stack alerta si uptime < 99%
[ ] Logs backend accesibles en Railway
```

---

*Documento generado el 2026-04-18. Actualizar al cierre de cada sprint.*
