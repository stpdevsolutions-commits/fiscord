export interface User {
  id: string;
  email: string;
  nombre: string;
  rnc?: string;
  empresa?: string;
  created_at: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface Factura {
  id: string;
  usuario_id: string;
  ncf: string;
  rnc_proveedor: string;
  tipo_factura: string;
  monto: number;
  itbis?: number;
  isr?: number;
  fecha_factura: string;
  fecha_vencimiento?: string;
  descripcion?: string;
  foto_url?: string;
  estado: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
