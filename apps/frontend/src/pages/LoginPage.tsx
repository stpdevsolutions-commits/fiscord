import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Email o contraseña incorrectos';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>FiscoRD</h1>
        <p className="subtitle">Inicia sesión</p>
        {error && <div className="alert alert-error">{error}</div>}
        <AuthForm type="login" onSubmit={handleLogin} isLoading={isLoading} />
        <p className="auth-link">
          ¿No tienes cuenta?{' '}
          <a onClick={() => navigate('/register')}>Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
}
