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
