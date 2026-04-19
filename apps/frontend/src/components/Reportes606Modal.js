import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { reportesAPI } from '../services/api';
const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const TIPO_FACTURAS = ['', 'E31', 'E32', 'B01', 'B02', 'B14', 'B15'];
function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
export const Reportes606Modal = ({ onClose }) => {
    const now = new Date();
    const [mes, setMes] = useState(now.getMonth() + 1);
    const [anio, setAnio] = useState(now.getFullYear());
    const [tipoFactura, setTipoFactura] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const anioMin = 2020;
    const anioMax = now.getFullYear();
    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const result = await reportesAPI.generate606(mes, anio, {
                tipo_factura: tipoFactura || undefined,
            });
            triggerDownload(result.blob, result.filename);
            setSuccess({ filename: result.filename, filas: result.filas });
        }
        catch (err) {
            const msg = err?.response?.data instanceof Blob
                ? await err.response.data.text().then((t) => {
                    try {
                        return JSON.parse(t).message;
                    }
                    catch {
                        return t;
                    }
                })
                : err?.response?.data?.message ?? 'Error generando reporte';
            setError(msg);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-md", children: [_jsxs("div", { className: "bg-slate-900 text-white rounded-t-xl px-6 py-4 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold", children: "Reporte DGII 606" }), _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Compras de Bienes y Servicios" })] }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-white text-xl leading-none transition", children: "\u2715" })] }), _jsxs("div", { className: "p-6 space-y-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-slate-700 mb-3", children: "Per\u00EDodo tributario" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-500 mb-1", children: "Mes" }), _jsx("select", { value: mes, onChange: (e) => setMes(Number(e.target.value)), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm", children: MESES.map((m, i) => (_jsx("option", { value: i + 1, children: m }, i + 1))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-500 mb-1", children: "A\u00F1o" }), _jsx("input", { type: "number", value: anio, min: anioMin, max: anioMax, onChange: (e) => setAnio(Number(e.target.value)), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" })] })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-slate-700 mb-3", children: "Filtros opcionales" }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-500 mb-1", children: "Tipo de comprobante" }), _jsxs("select", { value: tipoFactura, onChange: (e) => setTipoFactura(e.target.value), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm", children: [_jsx("option", { value: "", children: "Todos los tipos" }), TIPO_FACTURAS.filter(Boolean).map((t) => (_jsx("option", { value: t, children: t }, t)))] })] })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1", children: [_jsx("p", { className: "font-medium", children: "Formato DGII 606 \u2014 Formulario de Compras" }), _jsxs("p", { children: ["Incluye solo facturas en estado ", _jsx("strong", { children: "activa" }), " del per\u00EDodo seleccionado."] }), _jsx("p", { children: "El archivo generado es compatible con el software SIPE de la DGII." })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700", children: error })), success && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-start gap-2", children: [_jsx("span", { className: "text-lg leading-none", children: "\u2705" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Descarga iniciada" }), _jsxs("p", { className: "text-xs mt-0.5", children: [success.filas, " factura", success.filas !== 1 ? 's' : '', " exportada", success.filas !== 1 ? 's' : '', ' · ', _jsx("span", { className: "font-mono", children: success.filename })] })] })] }))] }), _jsxs("div", { className: "px-6 pb-6 flex gap-3 justify-end", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition", children: "Cerrar" }), _jsx("button", { onClick: handleGenerate, disabled: loading || anio < anioMin || anio > anioMax, className: "px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition flex items-center gap-2", children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" }), "Generando..."] })) : (_jsx(_Fragment, { children: "\u2B07 Descargar Excel" })) })] })] }) }));
};
//# sourceMappingURL=Reportes606Modal.js.map