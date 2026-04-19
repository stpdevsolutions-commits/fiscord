-- ─────────────────────────────────────────────────────────────────────────────
-- FISCORD — Schema inicial
-- Ejecutar en Supabase: SQL Editor → New query → pegar y ejecutar
-- PostgreSQL 15+ (gen_random_uuid() built-in)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: usuarios
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255)  UNIQUE NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  nombre        VARCHAR(255)  NOT NULL,
  rnc           VARCHAR(9)    UNIQUE,
  empresa       VARCHAR(255),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email   ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_deleted ON usuarios(deleted_at) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: proveedores
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proveedores (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  rnc           VARCHAR(9)    UNIQUE NOT NULL,
  nombre        VARCHAR(255)  NOT NULL,
  direccion     TEXT,
  telefono      VARCHAR(20),
  email         VARCHAR(255),
  tipo_factura  VARCHAR(20),   -- E31, E32, B01, etc.
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_proveedores_rnc    ON proveedores(rnc);
CREATE INDEX IF NOT EXISTS idx_proveedores_nombre ON proveedores(nombre);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: facturas
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facturas (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id       UUID          NOT NULL REFERENCES usuarios(id),
  ncf              VARCHAR(20)   UNIQUE NOT NULL,
  rnc_proveedor    VARCHAR(9)    NOT NULL REFERENCES proveedores(rnc),
  tipo_factura     VARCHAR(20)   NOT NULL,   -- E31, E32, B01, B02, etc.
  monto            DECIMAL(15,2) NOT NULL,
  itbis            DECIMAL(15,2),
  isr              DECIMAL(15,2),
  fecha_factura    DATE          NOT NULL,
  fecha_vencimiento DATE,
  descripcion      TEXT,
  foto_url         VARCHAR(512),             -- URL en Supabase Storage
  estado           VARCHAR(20)   NOT NULL DEFAULT 'activa', -- activa | cancelada | duplicada
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_facturas_usuario ON facturas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_facturas_rnc     ON facturas(rnc_proveedor);
CREATE INDEX IF NOT EXISTS idx_facturas_ncf     ON facturas(ncf);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha   ON facturas(fecha_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_estado  ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_deleted ON facturas(deleted_at) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: audit_logs
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID          REFERENCES usuarios(id),
  tabla       VARCHAR(100)  NOT NULL,
  accion      VARCHAR(50)   NOT NULL,   -- INSERT | UPDATE | DELETE
  registro_id UUID,
  cambios     JSONB,
  ip_address  VARCHAR(50),
  user_agent  TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_tabla   ON audit_logs(tabla);
CREATE INDEX IF NOT EXISTS idx_audit_fecha   ON audit_logs(created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER: updated_at automático en todas las tablas
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_proveedores_updated_at
  BEFORE UPDATE ON proveedores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_facturas_updated_at
  BEFORE UPDATE ON facturas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
