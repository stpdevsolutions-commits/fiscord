import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold text-blue-400">
          FISCORD
        </Link>
        <nav className="flex items-center gap-8">
          <Link to="/dashboard" className="hover:text-blue-300 transition">
            Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user?.nombre}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition font-medium"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
