import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFacturas } from '../hooks/useFacturas';
import { Header } from '../components/Header';
import { FacturaForm } from '../components/FacturaForm';
export const FacturaDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { loading, error, getById, update, delete: deleteFactura } = useFacturas();
    const [factura, setFactura] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    useEffect(() => {
        const fetchFactura = async () => {
            if (id) {
                const result = await getById(id);
                setFactura(result);
            }
        };
        fetchFactura();
    }, [id, getById]);
    const handleDelete = async () => {
        if (id && confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
            const success = await deleteFactura(id);
            if (success) {
                navigate('/dashboard');
            }
        }
    };
    const handleUpdate = async (data) => {
        if (id) {
            const result = await update(id, data);
            if (result) {
                setFactura(result);
                setShowEditForm(false);
            }
        }
    };
    if (loading && !factura) {
        return (_jsxs("div", { className: "min-h-screen bg-slate-50", children: [_jsx(Header, {}), _jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" }) })] }));
    }
    if (!factura) {
        return (_jsxs("div", { className: "min-h-screen bg-slate-50", children: [_jsx(Header, {}), _jsx("div", { className: "max-w-7xl mx-auto px-4 py-8", children: _jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 text-red-700", children: [_jsx("p", { className: "text-lg font-medium", children: "Factura no encontrada" }), _jsx("button", { onClick: () => navigate('/dashboard'), className: "mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition", children: "Volver al Dashboard" })] }) })] }));
    }
    const formatMoney = (value) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('es-RD', { style: 'currency', currency: 'DOP' }).format(num);
    };
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-RD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-50", children: [_jsx(Header, {}), _jsxs("div", { className: "max-w-4xl mx-auto px-4 py-8", children: [error && (_jsx("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700", children: error })), !showEditForm ? (_jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "border-b border-slate-200 px-6 py-6", children: _jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-slate-900", children: ["Factura ", factura.ncf] }), _jsx("p", { className: "text-slate-600 mt-1", children: factura.estado === 'activa' ? (_jsx("span", { className: "inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium", children: "Activa" })) : (_jsx("span", { className: "inline-block px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-medium", children: factura.estado })) })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setShowEditForm(true), className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition", children: "Editar" }), _jsx("button", { onClick: handleDelete, className: "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition", children: "Eliminar" })] })] }) }), _jsxs("div", { className: "px-6 py-6 space-y-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Informaci\u00F3n General" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600", children: "RNC Proveedor" }), _jsx("p", { className: "text-lg font-medium text-slate-900 mt-1", children: factura.rnc_proveedor })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600", children: "Tipo Factura" }), _jsx("p", { className: "text-lg font-medium text-slate-900 mt-1", children: factura.tipo_factura })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600", children: "Fecha Factura" }), _jsx("p", { className: "text-lg font-medium text-slate-900 mt-1", children: formatDate(factura.fecha_factura) })] }), factura.fecha_vencimiento && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600", children: "Fecha Vencimiento" }), _jsx("p", { className: "text-lg font-medium text-slate-900 mt-1", children: formatDate(factura.fecha_vencimiento) })] }))] })] }), _jsxs("div", { className: "border-t border-slate-200 pt-8", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Montos" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-slate-600", children: "Monto" }), _jsx("p", { className: "text-2xl font-bold text-blue-600 mt-2", children: formatMoney(factura.monto) })] }), _jsxs("div", { className: "bg-purple-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-slate-600", children: "ITBIS" }), _jsx("p", { className: "text-2xl font-bold text-purple-600 mt-2", children: formatMoney(factura.itbis || 0) })] }), _jsxs("div", { className: "bg-orange-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-slate-600", children: "ISR" }), _jsx("p", { className: "text-2xl font-bold text-orange-600 mt-2", children: formatMoney(factura.isr || 0) })] })] })] }), factura.descripcion && (_jsxs("div", { className: "border-t border-slate-200 pt-8", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Descripci\u00F3n" }), _jsx("p", { className: "text-slate-700 whitespace-pre-wrap", children: factura.descripcion })] })), _jsxs("div", { className: "border-t border-slate-200 pt-8", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Informaci\u00F3n del Sistema" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-slate-600", children: "Creada" }), _jsx("p", { className: "text-slate-900 font-mono text-xs mt-1", children: formatDate(factura.created_at) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-slate-600", children: "\u00DAltima actualizaci\u00F3n" }), _jsx("p", { className: "text-slate-900 font-mono text-xs mt-1", children: formatDate(factura.updated_at) })] })] })] })] }), _jsx("div", { className: "border-t border-slate-200 px-6 py-4 bg-slate-50", children: _jsx("button", { onClick: () => navigate('/dashboard'), className: "text-slate-700 hover:text-slate-900 transition", children: "\u2190 Volver al Dashboard" }) })] })) : (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900 mb-6", children: "Editar Factura" }), _jsx(FacturaForm, { factura: factura, loading: loading, onSubmit: handleUpdate, onCancel: () => setShowEditForm(false) })] }))] })] }));
};
//# sourceMappingURL=FacturaDetailPage.js.map