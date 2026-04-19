import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  rnc?: string;
  empresa?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      await register(data.email, data.password, data.nombre, data.rnc, data.empresa);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Error en registro';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>FiscoRD</h1>
        <p className="subtitle">Crea tu cuenta</p>
        {error && <div className="alert alert-error">{error}</div>}
        <AuthForm type="register" onSubmit={handleRegister} isLoading={isLoading} />
        <p className="auth-link">
          ¿Ya tienes cuenta?{' '}
          <a onClick={() => navigate('/login')}>Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}
