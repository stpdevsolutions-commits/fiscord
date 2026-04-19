export interface User {
  id: string;
  email: string;
  nombre: string;
  rnc?: string;
  empresa?: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface AuthError {
  error: string;
  message: string;
}

export interface Factura {
  id: string;
  usuario_id: string;
  ncf: string;
  rnc_proveedor: string;
  tipo_factura: string;
  monto: number | string;
  itbis?: number | string;
  isr?: number | string;
  fecha_factura: string;
  fecha_vencimiento?: string;
  descripcion?: string;
  foto_url?: string;
  estado: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface FacturasResponse {
  facturas: Factura[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface FacturaResponse {
  factura: Factura;
}
