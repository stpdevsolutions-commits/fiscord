import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
export const FacturasTable = ({ facturas, loading, onDelete, onEdit }) => {
    const navigate = useNavigate();
    if (loading) {
        return (_jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" }) }));
    }
    if (facturas.length === 0) {
        return (_jsxs("div", { className: "text-center py-12 text-slate-500", children: [_jsx("p", { className: "text-lg", children: "No hay facturas registradas" }), _jsx("p", { className: "text-sm", children: "Crea tu primera factura para comenzar" })] }));
    }
    const formatMoney = (value) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('es-RD', { style: 'currency', currency: 'DOP' }).format(num);
    };
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-RD');
    };
    return (_jsx("div", { className: "overflow-x-auto rounded-lg border border-slate-200", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-slate-100 border-b border-slate-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left font-semibold text-slate-900", children: "NCF" }), _jsx("th", { className: "px-6 py-3 text-left font-semibold text-slate-900", children: "Proveedor (RNC)" }), _jsx("th", { className: "px-6 py-3 text-left font-semibold text-slate-900", children: "Tipo" }), _jsx("th", { className: "px-6 py-3 text-right font-semibold text-slate-900", children: "Monto" }), _jsx("th", { className: "px-6 py-3 text-right font-semibold text-slate-900", children: "ITBIS" }), _jsx("th", { className: "px-6 py-3 text-left font-semibold text-slate-900", children: "Fecha" }), _jsx("th", { className: "px-6 py-3 text-left font-semibold text-slate-900", children: "Estado" }), _jsx("th", { className: "px-6 py-3 text-center font-semibold text-slate-900", children: "Acciones" })] }) }), _jsx("tbody", { children: facturas.map((factura) => (_jsxs("tr", { className: "border-b border-slate-200 hover:bg-slate-50 transition", children: [_jsx("td", { className: "px-6 py-3 font-mono text-xs text-slate-700", children: factura.ncf }), _jsx("td", { className: "px-6 py-3 text-slate-700", children: factura.rnc_proveedor }), _jsx("td", { className: "px-6 py-3 text-slate-700", children: factura.tipo_factura }), _jsx("td", { className: "px-6 py-3 text-right font-medium text-slate-900", children: formatMoney(factura.monto) }), _jsx("td", { className: "px-6 py-3 text-right text-slate-700", children: formatMoney(factura.itbis || 0) }), _jsx("td", { className: "px-6 py-3 text-slate-700", children: formatDate(factura.fecha_factura) }), _jsx("td", { className: "px-6 py-3", children: _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${factura.estado === 'activa'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-slate-100 text-slate-800'}`, children: factura.estado }) }), _jsx("td", { className: "px-6 py-3 text-center", children: _jsxs("div", { className: "flex gap-2 justify-center", children: [_jsx("button", { onClick: () => navigate(`/facturas/${factura.id}`), className: "text-blue-600 hover:text-blue-800 font-medium text-xs", children: "Ver" }), _jsx("button", { onClick: () => onEdit(factura), className: "text-slate-600 hover:text-slate-800 font-medium text-xs", children: "Editar" }), _jsx("button", { onClick: () => {
                                                if (confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
                                                    onDelete(factura.id);
                                                }
                                            }, className: "text-red-600 hover:text-red-800 font-medium text-xs", children: "Eliminar" })] }) })] }, factura.id))) })] }) }));
};
//# sourceMappingURL=FacturasTable.js.map