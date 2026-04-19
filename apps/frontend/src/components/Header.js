import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
export const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsx("header", { className: "bg-slate-900 text-white shadow-lg", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-4 flex justify-between items-center", children: [_jsx(Link, { to: "/dashboard", className: "text-2xl font-bold text-blue-400", children: "FISCORD" }), _jsxs("nav", { className: "flex items-center gap-8", children: [_jsx(Link, { to: "/dashboard", className: "hover:text-blue-300 transition", children: "Dashboard" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "text-sm text-slate-400", children: user?.nombre }), _jsx("button", { onClick: handleLogout, className: "px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition font-medium", children: "Logout" })] })] })] }) }));
};
//# sourceMappingURL=Header.js.map