import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { GastoService } from '../../services/GastoService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Estado inicial del formulario de Gasto (alineado a GastoRegistroDTO del backend)
const gastoInicial = {
    tipoGasto: '',
    descripcion: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    metodoPago: 'Efectivo',
};

const TIPOS_GASTO = [
    'Pago de Servicios',
    'Planilla',
    'Alimentación',
    'Insumos',
    'Transporte',
    'Mantenimiento',
    'Otros',
];

// Helper: obtener fecha en zona Lima YYYY-MM-DD
const getLimaDate = () => {
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' });
    return formatter.format(new Date());
};

const PagosGastos = () => {
    const [gastos, setGastos] = useState([]);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [mostrarReporte, setMostrarReporte] = useState(true);
    const elementosPorPagina = 10;

    // Modales
    const [mostrarModalFormulario, setMostrarModalFormulario] = useState(false);
    const [gastoSeleccionado, setGastoSeleccionado] = useState(null);
    const [formulario, setFormulario] = useState(gastoInicial);

    useEffect(() => {
        cargarGastos();
    }, []);

    const cargarGastos = async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await GastoService.getAll();
            setGastos(Array.isArray(data) ? data : (data.content ?? []));
        } catch (err) {
            setError('No se pudieron cargar los gastos. Verifica que el servidor esté activo.');
        } finally {
            setCargando(false);
        }
    };

    // --- REPORTE: Cálculos derivados ---
    const reporte = useMemo(() => {
        const hoy = getLimaDate();
        const ahora = new Date();

        // Inicio de semana (lunes)
        const diaSemana = ahora.getDay();
        const diffLunes = diaSemana === 0 ? 6 : diaSemana - 1;
        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - diffLunes);
        const inicioSemanaStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(inicioSemana);

        // Inicio de mes
        const inicioMes = hoy.substring(0, 7) + '-01';

        let totalGeneral = 0;
        let totalHoy = 0;
        let totalSemana = 0;
        let totalMes = 0;
        const porTipo = {};
        const porMetodo = {};

        gastos.forEach(g => {
            const monto = parseFloat(g.monto ?? 0);
            const fecha = g.fecha ?? '';
            totalGeneral += monto;

            if (fecha === hoy) totalHoy += monto;
            if (fecha >= inicioSemanaStr && fecha <= hoy) totalSemana += monto;
            if (fecha >= inicioMes && fecha <= hoy) totalMes += monto;

            // Por tipo
            const tipo = g.tipoGasto || 'Sin tipo';
            if (!porTipo[tipo]) porTipo[tipo] = { cantidad: 0, total: 0 };
            porTipo[tipo].cantidad++;
            porTipo[tipo].total += monto;

            // Por método de pago
            const metodo = g.metodoPago || 'Sin método';
            if (!porMetodo[metodo]) porMetodo[metodo] = { cantidad: 0, total: 0 };
            porMetodo[metodo].cantidad++;
            porMetodo[metodo].total += monto;
        });

        // Ordenar por total desc
        const tiposOrdenados = Object.entries(porTipo)
            .map(([nombre, data]) => ({ nombre, ...data }))
            .sort((a, b) => b.total - a.total);

        const metodosOrdenados = Object.entries(porMetodo)
            .map(([nombre, data]) => ({ nombre, ...data }))
            .sort((a, b) => b.total - a.total);

        return { totalGeneral, totalHoy, totalSemana, totalMes, tiposOrdenados, metodosOrdenados, totalRegistros: gastos.length };
    }, [gastos]);

    // Colores para barras de progreso por tipo
    const coloresTipo = ['#dc3545', '#fd7e14', '#ffc107', '#198754', '#0d6efd', '#6f42c1', '#20c997'];
    const coloresMetodo = { 'Efectivo': '#198754', 'Transferencia': '#0d6efd', 'Yape/Plin': '#6f42c1', 'Tarjeta': '#fd7e14' };

    // --- ACCIONES ---

    const handleAgregarGasto = () => {
        setGastoSeleccionado(null);
        setFormulario(gastoInicial);
        setMostrarModalFormulario(true);
    };

    const handleEditarGasto = (gasto) => {
        setGastoSeleccionado(gasto);
        setFormulario({
            tipoGasto: gasto.tipoGasto ?? '',
            descripcion: gasto.descripcion ?? '',
            monto: gasto.monto ?? '',
            fecha: gasto.fecha ? gasto.fecha.substring(0, 10) : new Date().toISOString().split('T')[0],
            metodoPago: gasto.metodoPago ?? 'Efectivo',
        });
        setMostrarModalFormulario(true);
    };

    const handleEliminarGasto = async (id) => {
        const r = await Swal.fire({
            title: '¿Eliminar este gasto?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });
        if (!r.isConfirmed) return;
        try {
            await GastoService.delete(id);
            toast.success('Gasto eliminado correctamente.');
            await cargarGastos();
        } catch (err) {
            toast.error('Error al eliminar el gasto.');
        }
    };

    const handleGuardarGasto = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                tipoGasto: formulario.tipoGasto,
                descripcion: formulario.descripcion,
                monto: parseFloat(formulario.monto),
                fecha: formulario.fecha,
                metodoPago: formulario.metodoPago,
            };
            if (gastoSeleccionado) {
                await GastoService.update(gastoSeleccionado.idGasto ?? gastoSeleccionado.id, payload);
                toast.success('Gasto actualizado correctamente.');
            } else {
                await GastoService.create(payload);
                toast.success('Gasto registrado correctamente.');
            }
            setMostrarModalFormulario(false);
            await cargarGastos();
        } catch (err) {
            toast.error('Error al guardar el gasto. Revisa los datos ingresados.');
        }
    };

    // --- EXPORTACIÓN ---

    const handleExportarExcel = () => {
        const datos = gastosFiltrados.map(g => ({
            ID: g.idGasto ?? g.id,
            'Tipo de Gasto': g.tipoGasto,
            Descripción: g.descripcion,
            'Monto (S/)': parseFloat(g.monto ?? 0).toFixed(2),
            Fecha: g.fecha,
            'Método de Pago': g.metodoPago,
        }));
        const ws = XLSX.utils.json_to_sheet(datos);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'GASTOS');
        XLSX.writeFile(wb, 'Reporte_Gastos.xlsx');
    };

    const handleExportarPDF = () => {
        const doc = new jsPDF();
        doc.text('Reporte de Gastos', 14, 15);
        doc.autoTable({
            head: [['ID', 'Tipo', 'Descripción', 'Monto (S/)', 'Fecha', 'Método Pago']],
            body: gastosFiltrados.map(g => [
                g.idGasto ?? g.id,
                g.tipoGasto,
                g.descripcion,
                `S/ ${parseFloat(g.monto ?? 0).toFixed(2)}`,
                g.fecha,
                g.metodoPago,
            ]),
            startY: 20,
        });
        doc.save('Reporte_Gastos.pdf');
    };

    // --- FILTRADO Y PAGINACIÓN ---

    const gastosFiltrados = gastos.filter(g => {
        const texto = terminoBusqueda.toLowerCase();
        return (
            String(g.descripcion ?? '').toLowerCase().includes(texto) ||
            String(g.tipoGasto ?? '').toLowerCase().includes(texto) ||
            String(g.metodoPago ?? '').toLowerCase().includes(texto) ||
            String(g.fecha ?? '').toLowerCase().includes(texto)
        );
    });

    const totalPaginas = Math.ceil(gastosFiltrados.length / elementosPorPagina);
    const elementosActuales = gastosFiltrados.slice((paginaActual - 1) * elementosPorPagina, paginaActual * elementosPorPagina);
    const totalMontoFiltrado = gastosFiltrados.reduce((suma, g) => suma + parseFloat(g.monto ?? 0), 0);

    const fmt = (v) => `S/ ${parseFloat(v || 0).toFixed(2)}`;

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <h2 style={{ color: '#094e8a', fontWeight: '800' }}>
                    <i className="fas fa-money-bill-wave me-2"></i>GESTIÓN DE GASTOS
                </h2>
                <div>
                    <button
                        className={`btn ${mostrarReporte ? 'btn-secondary' : 'btn-outline-secondary'} shadow-sm me-2`}
                        onClick={() => setMostrarReporte(!mostrarReporte)}
                        title={mostrarReporte ? 'Ocultar reporte' : 'Mostrar reporte'}
                    >
                        <i className={`fas ${mostrarReporte ? 'fa-chart-bar' : 'fa-chart-bar'} me-1`}></i>
                        {mostrarReporte ? 'Ocultar Reporte' : 'Ver Reporte'}
                    </button>
                    <button className="btn btn-outline-primary shadow-sm me-2" onClick={cargarGastos}>
                        <i className="fas fa-sync-alt me-2"></i>Actualizar
                    </button>
                    <button className="btn btn-danger shadow-sm" onClick={handleAgregarGasto}>
                        <i className="fas fa-plus me-2"></i>Registrar Gasto
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="alert alert-warning d-flex align-items-center mb-4">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button className="btn btn-sm btn-warning ms-auto" onClick={cargarGastos}>Reintentar</button>
                </div>
            )}

            {/* ==================== SECCIÓN REPORTE ==================== */}
            {mostrarReporte && (
                <div className="mb-4 no-print">
                    {/* Cards resumen */}
                    <div className="row g-3 mb-4">
                        <div className="col-6 col-md-3">
                            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #dc3545', borderLeftStyle: 'solid' }}>
                                <div className="card-body py-3">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 42, height: 42, backgroundColor: '#dc354520' }}>
                                            <i className="fas fa-calendar-day text-danger"></i>
                                        </div>
                                        <div>
                                            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Gastos Hoy</small>
                                            <h5 className="mb-0 fw-bold text-danger">{fmt(reporte.totalHoy)}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #fd7e14', borderLeftStyle: 'solid' }}>
                                <div className="card-body py-3">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 42, height: 42, backgroundColor: '#fd7e1420' }}>
                                            <i className="fas fa-calendar-week" style={{ color: '#fd7e14' }}></i>
                                        </div>
                                        <div>
                                            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Esta Semana</small>
                                            <h5 className="mb-0 fw-bold" style={{ color: '#fd7e14' }}>{fmt(reporte.totalSemana)}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #0d6efd', borderLeftStyle: 'solid' }}>
                                <div className="card-body py-3">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 42, height: 42, backgroundColor: '#0d6efd20' }}>
                                            <i className="fas fa-calendar-alt text-primary"></i>
                                        </div>
                                        <div>
                                            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Este Mes</small>
                                            <h5 className="mb-0 fw-bold text-primary">{fmt(reporte.totalMes)}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #6f42c1', borderLeftStyle: 'solid' }}>
                                <div className="card-body py-3">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 42, height: 42, backgroundColor: '#6f42c120' }}>
                                            <i className="fas fa-coins" style={{ color: '#6f42c1' }}></i>
                                        </div>
                                        <div>
                                            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Total General</small>
                                            <h5 className="mb-0 fw-bold" style={{ color: '#6f42c1' }}>{fmt(reporte.totalGeneral)}</h5>
                                            <small className="text-muted">{reporte.totalRegistros} registros</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desglose por Tipo y Método - Gráficos de Pastel */}
                    <div className="row g-3">
                        {/* Pie: Por Tipo de Gasto */}
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-0 pt-3 pb-0">
                                    <h6 className="fw-bold mb-0 text-dark">
                                        <i className="fas fa-tags text-warning me-2"></i>Por Tipo de Gasto
                                    </h6>
                                </div>
                                <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: 250 }}>
                                    {reporte.tiposOrdenados.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={230}>
                                            <PieChart>
                                                <Pie
                                                    data={reporte.tiposOrdenados.map(t => ({ name: t.nombre, value: t.total }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={45}
                                                    outerRadius={80}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    labelLine={false}
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    {reporte.tiposOrdenados.map((_, i) => (
                                                        <Cell key={i} fill={coloresTipo[i % coloresTipo.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(v) => fmt(v)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center text-muted py-3">
                                            <i className="fas fa-chart-pie opacity-25 d-block fs-3 mb-2"></i>
                                            Sin datos
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pie: Por Método de Pago */}
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-0 pt-3 pb-0">
                                    <h6 className="fw-bold mb-0 text-dark">
                                        <i className="fas fa-wallet text-primary me-2"></i>Por Método de Pago
                                    </h6>
                                </div>
                                <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: 250 }}>
                                    {reporte.metodosOrdenados.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={230}>
                                            <PieChart>
                                                <Pie
                                                    data={reporte.metodosOrdenados.map(m => ({ name: m.nombre, value: m.total }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={45}
                                                    outerRadius={80}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    labelLine={false}
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    {reporte.metodosOrdenados.map((m, i) => (
                                                        <Cell key={i} fill={coloresMetodo[m.nombre] || '#6c757d'} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(v) => fmt(v)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center text-muted py-3">
                                            <i className="fas fa-credit-card opacity-25 d-block fs-3 mb-2"></i>
                                            Sin datos
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== TOOLBAR ==================== */}
            <div className="card shadow-sm border-0 mb-4 no-print">
                <div className="card-body">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar por tipo, descripción, método de pago..."
                                    value={terminoBusqueda}
                                    onChange={(e) => { setTerminoBusqueda(e.target.value); setPaginaActual(1); }}
                                />
                            </div>
                        </div>
                        <div className="col-md-3 text-end">
                            <span className="fw-bold text-muted">
                                {gastosFiltrados.length} gasto{gastosFiltrados.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="col-md-3 text-end">
                            <button className="btn btn-outline-success me-2" onClick={handleExportarExcel} title="Exportar Excel">
                                <i className="fas fa-file-excel me-1"></i>Excel
                            </button>
                            <button className="btn btn-outline-danger me-2" onClick={handleExportarPDF} title="Exportar PDF">
                                <i className="fas fa-file-pdf me-1"></i>PDF
                            </button>
                            <button className="btn btn-outline-dark" onClick={() => window.print()} title="Imprimir">
                                <i className="fas fa-print"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== TABLA DE GASTOS ==================== */}
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    {cargando ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Cargando gastos...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-danger">
                                    <tr>
                                        <th className="ps-4">ID</th>
                                        <th>Tipo de Gasto</th>
                                        <th>Descripción</th>
                                        <th>Fecha</th>
                                        <th>Método Pago</th>
                                        <th className="text-end">Monto</th>
                                        <th className="text-center pe-4 no-print">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {elementosActuales.map((gasto) => (
                                        <tr key={gasto.idGasto ?? gasto.id}>
                                            <td className="ps-4 text-muted">#{gasto.idGasto ?? gasto.id}</td>
                                            <td>
                                                <span className="badge bg-warning text-dark">{gasto.tipoGasto || '—'}</span>
                                            </td>
                                            <td>
                                                <div className="fw-bold">{gasto.descripcion || '—'}</div>
                                            </td>
                                            <td>{gasto.fecha}</td>
                                            <td>
                                                <span className={`badge ${gasto.metodoPago === 'Efectivo' ? 'bg-success' :
                                                    gasto.metodoPago === 'Transferencia' ? 'bg-primary' :
                                                        gasto.metodoPago === 'Yape/Plin' ? 'bg-info text-dark' :
                                                            'bg-secondary'
                                                    }`}>
                                                    {gasto.metodoPago ?? '—'}
                                                </span>
                                            </td>
                                            <td className="text-end fw-bold text-danger">
                                                S/ {parseFloat(gasto.monto ?? 0).toFixed(2)}
                                            </td>
                                            <td className="text-center pe-4 no-print">
                                                <div className="btn-group btn-group-sm">
                                                    <button className="btn btn-outline-primary" onClick={() => handleEditarGasto(gasto)} title="Editar">
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button className="btn btn-outline-danger" onClick={() => handleEliminarGasto(gasto.idGasto ?? gasto.id)} title="Eliminar">
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {elementosActuales.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted">
                                                <i className="fas fa-inbox fa-2x mb-2 d-block opacity-25"></i>
                                                No se encontraron gastos registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer con totales y paginación */}
                <div className="card-footer bg-white py-3">
                    <div className="row align-items-center">
                        <div className="col-md-4 text-muted small">
                            Mostrando {elementosActuales.length} de {gastosFiltrados.length} gastos
                        </div>
                        <div className="col-md-4">
                            <nav className="no-print d-flex justify-content-center">
                                <ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setPaginaActual(paginaActual - 1)}>Ant.</button>
                                    </li>
                                    {[...Array(totalPaginas)].map((_, i) => (
                                        <li key={i} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setPaginaActual(i + 1)}>{i + 1}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${paginaActual === totalPaginas || totalPaginas === 0 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setPaginaActual(paginaActual + 1)}>Sig.</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                        <div className="col-md-4 text-end">
                            <span className="fw-bold fs-5 text-dark me-2">Total Gastos:</span>
                            <span className="fw-bold fs-5 text-danger">{fmt(totalMontoFiltrado)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== MODAL FORMULARIO ==================== */}
            {mostrarModalFormulario && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow-lg">
                            <form onSubmit={handleGuardarGasto}>
                                <div className="modal-header bg-danger text-white">
                                    <h5 className="modal-title">
                                        <i className="fas fa-file-invoice-dollar me-2"></i>
                                        {gastoSeleccionado ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModalFormulario(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    {/* Tipo de Gasto + Método de Pago */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Tipo de Gasto <span className="text-danger">*</span></label>
                                            <select
                                                className="form-select"
                                                required
                                                value={formulario.tipoGasto}
                                                onChange={e => setFormulario(f => ({ ...f, tipoGasto: e.target.value }))}
                                            >
                                                <option value="">Seleccione...</option>
                                                {TIPOS_GASTO.map(tipo => (
                                                    <option key={tipo} value={tipo}>{tipo}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Método de Pago <span className="text-danger">*</span></label>
                                            <select
                                                className="form-select"
                                                required
                                                value={formulario.metodoPago}
                                                onChange={e => setFormulario(f => ({ ...f, metodoPago: e.target.value }))}
                                            >
                                                <option value="Efectivo">Efectivo</option>
                                                <option value="Transferencia">Transferencia</option>
                                                <option value="Yape/Plin">Yape/Plin</option>
                                                <option value="Tarjeta">Tarjeta</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Descripción <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            placeholder="Detalle exacto del gasto..."
                                            value={formulario.descripcion}
                                            onChange={e => setFormulario(f => ({ ...f, descripcion: e.target.value }))}
                                        />
                                    </div>

                                    {/* Monto + Fecha */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Monto (S/) <span className="text-danger">*</span></label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                step="0.01"
                                                min="0.01"
                                                required
                                                placeholder="0.00"
                                                value={formulario.monto}
                                                onChange={e => setFormulario(f => ({ ...f, monto: e.target.value }))}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Fecha <span className="text-danger">*</span></label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                required
                                                value={formulario.fecha}
                                                onChange={e => setFormulario(f => ({ ...f, fecha: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setMostrarModalFormulario(false)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-danger px-4">
                                        <i className="fas fa-save me-2"></i>
                                        {gastoSeleccionado ? 'Actualizar Gasto' : 'Registrar Gasto'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagosGastos;
