import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useFacturas } from '../hooks/useFacturas';
import { Header } from '../components/Header';
import { FacturasTable } from '../components/FacturasTable';
import { FacturaForm } from '../components/FacturaForm';
export const DashboardPage = () => {
    const { facturas, loading, error, pagination, getAll, create, update, delete: deleteFactura } = useFacturas();
    const [showForm, setShowForm] = useState(false);
    const [editingFactura, setEditingFactura] = useState(undefined);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        estado: '',
        tipo_factura: '',
        mes: '',
    });
    useEffect(() => {
        getAll({
            estado: filters.estado || undefined,
            tipo_factura: filters.tipo_factura || undefined,
        }, page, 10);
    }, [page, filters, getAll]);
    const handleCreateClick = () => {
        setEditingFactura(undefined);
        setShowForm(true);
    };
    const handleEditClick = (factura) => {
        setEditingFactura(factura);
        setShowForm(true);
    };
    const handleFormSubmit = async (data) => {
        if (editingFactura) {
            const result = await update(editingFactura.id, data);
            if (result) {
                setShowForm(false);
                setEditingFactura(undefined);
            }
        }
        else {
            const result = await create(data);
            if (result) {
                setShowForm(false);
                setPage(1);
            }
        }
    };
    const handleDeleteClick = async (id) => {
        const success = await deleteFactura(id);
        if (success) {
            if (facturas.length === 1 && page > 1) {
                setPage(page - 1);
            }
        }
    };
    const totalMonto = facturas.reduce((sum, f) => sum + parseFloat(String(f.monto)), 0);
    const totalItbis = facturas.reduce((sum, f) => sum + parseFloat(String(f.itbis || 0)), 0);
    const formatMoney = (value) => {
        return new Intl.NumberFormat('es-RD', { style: 'currency', currency: 'DOP' }).format(value);
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-50", children: [_jsx(Header, {}), _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("p", { className: "text-slate-600 text-sm", children: "Total Facturas" }), _jsx("p", { className: "text-3xl font-bold text-blue-600 mt-2", children: pagination.total })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("p", { className: "text-slate-600 text-sm", children: "Monto Total" }), _jsx("p", { className: "text-3xl font-bold text-green-600 mt-2", children: formatMoney(totalMonto) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("p", { className: "text-slate-600 text-sm", children: "ITBIS Total" }), _jsx("p", { className: "text-3xl font-bold text-purple-600 mt-2", children: formatMoney(totalItbis) })] })] }), _jsx("div", { className: "bg-white rounded-lg shadow p-6 mb-8", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-end justify-between", children: [_jsxs("div", { className: "flex gap-4 flex-1", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Estado" }), _jsxs("select", { value: filters.estado, onChange: (e) => {
                                                        setFilters({ ...filters, estado: e.target.value });
                                                        setPage(1);
                                                    }, className: "px-3 py-2 border border-slate-300 rounded-md text-sm", children: [_jsx("option", { value: "", children: "Todos" }), _jsx("option", { value: "activa", children: "Activa" }), _jsx("option", { value: "cancelada", children: "Cancelada" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Tipo Factura" }), _jsxs("select", { value: filters.tipo_factura, onChange: (e) => {
                                                        setFilters({ ...filters, tipo_factura: e.target.value });
                                                        setPage(1);
                                                    }, className: "px-3 py-2 border border-slate-300 rounded-md text-sm", children: [_jsx("option", { value: "", children: "Todos" }), _jsx("option", { value: "E31", children: "E31" }), _jsx("option", { value: "E32", children: "E32" }), _jsx("option", { value: "B01", children: "B01" }), _jsx("option", { value: "B02", children: "B02" })] })] })] }), _jsx("button", { onClick: handleCreateClick, className: "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium", children: "+ Agregar Factura" })] }) }), _jsxs("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: [error && (_jsx("div", { className: "p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm", children: error })), _jsx(FacturasTable, { facturas: facturas, loading: loading, onDelete: handleDeleteClick, onEdit: handleEditClick })] }), pagination.pages > 1 && (_jsxs("div", { className: "mt-6 flex justify-center gap-2", children: [_jsx("button", { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: "px-4 py-2 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 transition", children: "Anterior" }), _jsxs("span", { className: "px-4 py-2 text-slate-700", children: ["P\u00E1gina ", page, " de ", pagination.pages] }), _jsx("button", { onClick: () => setPage(Math.min(pagination.pages, page + 1)), disabled: page === pagination.pages, className: "px-4 py-2 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 transition", children: "Siguiente" })] }))] }), showForm && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [_jsx("div", { className: "sticky top-0 bg-white border-b border-slate-200 px-6 py-4", children: _jsx("h2", { className: "text-lg font-bold text-slate-900", children: editingFactura ? 'Editar Factura' : 'Nueva Factura' }) }), _jsx("div", { className: "p-6", children: _jsx(FacturaForm, { factura: editingFactura, loading: loading, onSubmit: handleFormSubmit, onCancel: () => {
                                    setShowForm(false);
                                    setEditingFactura(undefined);
                                } }) })] }) }))] }));
};
//# sourceMappingURL=DashboardPage.js.map