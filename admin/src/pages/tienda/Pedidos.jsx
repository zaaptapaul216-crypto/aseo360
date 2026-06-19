import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Pedidos.css';
import { PedidoService } from '../../services/PedidoService';

const estadoClases = {
    pendiente: 'bg-warning text-dark',
    pagado: 'bg-success',
    enviado: 'bg-info text-dark',
    cancelado: 'bg-danger',
    PENDIENTE: 'bg-warning text-dark',
    PAGADO: 'bg-success',
    ENVIADO: 'bg-info text-dark',
    CANCELADO: 'bg-danger',
};

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [filtro, setFiltro] = useState('todos');
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const elementosPorPagina = 6;

    // Modales
    const [mostrarModalVista, setMostrarModalVista] = useState(false);
    const [mostrarModalEstado, setMostrarModalEstado] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [detallesPedido, setDetallesPedido] = useState([]);
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [cargandoDetalles, setCargandoDetalles] = useState(false);

    useEffect(() => {
        cargarPedidos();
    }, []);

    const cargarPedidos = async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await PedidoService.getAll();
            // El backend puede devolver un objeto Page con .content, o un array directo
            setPedidos(Array.isArray(data) ? data : (data.content ?? []));
        } catch (err) {
            setError('No se pudieron cargar los pedidos. Verifica que el servidor esté activo.');
        } finally {
            setCargando(false);
        }
    };

    // --- ACCIONES ---

    const handleVer = async (pedido) => {
        setPedidoSeleccionado(pedido);
        setDetallesPedido([]);
        setMostrarModalVista(true);
        setCargandoDetalles(true);
        try {
            const detalles = await PedidoService.getDetalles(pedido.idPedido ?? pedido.id);
            setDetallesPedido(Array.isArray(detalles) ? detalles : []);
        } catch (err) {
        } finally {
            setCargandoDetalles(false);
        }
    };

    const handleCambiarEstado = (pedido) => {
        setPedidoSeleccionado(pedido);
        setNuevoEstado(pedido.estado ?? 'PENDIENTE');
        setMostrarModalEstado(true);
    };

    const handleGuardarEstado = async (e) => {
        e.preventDefault();
        if (!pedidoSeleccionado) return;
        try {
            await PedidoService.updateEstado(
                pedidoSeleccionado.idPedido ?? pedidoSeleccionado.id,
                nuevoEstado
            );
            setMostrarModalEstado(false);
            await cargarPedidos();
        } catch (err) {
            toast.error('Error al cambiar el estado del pedido.');
        }
    };

    const handleAnular = async (pedido) => {
        const id = pedido.idPedido ?? pedido.id;
        const r = await Swal.fire({ title: `¿Anular el pedido #${id}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí', cancelButtonText: 'No' });
        if (!r.isConfirmed) return;
        try {
            await PedidoService.anular(id);
            await cargarPedidos();
        } catch (err) {
            toast.error('Error al anular el pedido.');
        }
    };

    // --- FILTRADO Y PAGINACIÓN ---

    const pedidosFiltrados = (pedidos || []).filter(p => {
        if (!p) return false;
        const texto = terminoBusqueda.toLowerCase();
        const idStr = String(p.idPedido ?? p.id ?? '').toLowerCase();
        const clienteStr = String(
            p.cliente?.nombre ?? p.cliente?.nombreCompleto ?? p.nombreCliente ?? ''
        ).toLowerCase();
        const origenStr = String(p.origen ?? '').toLowerCase();
        const coincideFiltro = filtro === 'todos' || origenStr === filtro;
        const coincideBusqueda = idStr.includes(texto) || clienteStr.includes(texto);
        return coincideFiltro && coincideBusqueda;
    });

    const totalPaginas = Math.ceil(pedidosFiltrados.length / elementosPorPagina);
    const elementosActuales = pedidosFiltrados.slice(
        (paginaActual - 1) * elementosPorPagina,
        paginaActual * elementosPorPagina
    );

    // --- EXPORTACIÓN ---

    const handleExportarExcel = () => {
        const datos = pedidosFiltrados.map(p => ({
            ID: p.idPedido ?? p.id,
            Cliente: p.cliente?.nombre ?? p.nombreCliente ?? '—',
            Fecha: p.fecha,
            Origen: p.origen?.toUpperCase() ?? '—',
            Estado: p.estado?.toUpperCase() ?? '—',
            Total: p.total ?? 0,
        }));
        const ws = XLSX.utils.json_to_sheet(datos);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
        XLSX.writeFile(wb, 'Pedidos.xlsx');
    };

    const handleExportarPDF = () => {
        const doc = new jsPDF();
        doc.text('Reporte de Pedidos', 14, 15);
        doc.autoTable({
            head: [['ID', 'Cliente', 'Fecha', 'Estado', 'Total']],
            body: pedidosFiltrados.map(p => [
                p.idPedido ?? p.id,
                p.cliente?.nombre ?? p.nombreCliente ?? '—',
                p.fecha,
                p.estado,
                `S/ ${parseFloat(p.total ?? 0).toFixed(2)}`,
            ]),
            startY: 20,
        });
        doc.save('Pedidos.pdf');
    };

    const obtenerNombreCliente = (p) =>
        p.cliente?.nombre ?? p.cliente?.nombreCompleto ?? p.nombreCliente ?? '—';

    return (
        <div className="container-fluid p-4 container-pedidos">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <h2 className="title-gestion">
                    <i className="fas fa-shopping-bag me-2"></i>Gestión de Pedidos
                </h2>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary shadow-sm" onClick={cargarPedidos}>
                        <i className="fas fa-sync-alt me-2"></i>Actualizar
                    </button>
                    <div className="btn-group">
                        <button className={`btn ${filtro === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setFiltro('todos'); setPaginaActual(1); }}>Todos</button>
                        <button className={`btn ${filtro === 'tienda' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setFiltro('tienda'); setPaginaActual(1); }}>Web</button>
                        <button className={`btn ${filtro === 'pos' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setFiltro('pos'); setPaginaActual(1); }}>Tienda</button>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="alert alert-warning d-flex align-items-center mb-4">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button className="btn btn-sm btn-warning ms-auto" onClick={cargarPedidos}>Reintentar</button>
                </div>
            )}

            {/* Toolbar */}
            <div className="card shadow-sm border-0 mb-4 no-print">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar por cliente o ID..."
                                    value={terminoBusqueda}
                                    onChange={e => { setTerminoBusqueda(e.target.value); setPaginaActual(1); }}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 text-end">
                            <button className="btn btn-outline-success me-2" onClick={handleExportarExcel} title="Excel">
                                <i className="fas fa-file-excel"></i>
                            </button>
                            <button className="btn btn-outline-danger me-2" onClick={handleExportarPDF} title="PDF">
                                <i className="fas fa-file-pdf"></i>
                            </button>
                            <button className="btn btn-outline-dark" onClick={() => window.print()} title="Imprimir">
                                <i className="fas fa-print"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-0">
                    {cargando ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Cargando pedidos...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th className="ps-4">ID</th>
                                        <th>Cliente</th>
                                        <th>Fecha</th>
                                        <th>Origen</th>
                                        <th>Estado</th>
                                        <th className="text-end">Total</th>
                                        <th className="text-center pe-4 no-print">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {elementosActuales.map(pedido => (
                                        <tr key={pedido.idPedido ?? pedido.id}>
                                            <td className="ps-4 fw-bold text-primary">
                                                #{pedido.idPedido ?? pedido.id}
                                            </td>
                                            <td>{obtenerNombreCliente(pedido)}</td>
                                            <td>{pedido.fecha}</td>
                                            <td>
                                                {pedido.origen === 'tienda'
                                                    ? <span className="badge bg-primary">Web</span>
                                                    : <span className="badge bg-secondary">Tienda</span>}
                                            </td>
                                            <td>
                                                <span className={`badge ${estadoClases[pedido.estado] || 'bg-secondary'}`}>
                                                    {String(pedido.estado ?? '').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="text-end fw-bold">
                                                S/ {parseFloat(pedido.total ?? 0).toFixed(2)}
                                            </td>
                                            <td className="text-center pe-4 no-print">
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => handleVer(pedido)}
                                                        title="Ver detalles"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => handleCambiarEstado(pedido)}
                                                        title="Cambiar estado"
                                                    >
                                                        <i className="fas fa-exchange-alt"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleAnular(pedido)}
                                                        title="Anular pedido"
                                                    >
                                                        <i className="fas fa-ban"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {elementosActuales.length === 0 && !cargando && (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted">
                                                <i className="fas fa-inbox fa-2x mb-2 d-block opacity-25"></i>
                                                No se encontraron pedidos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {/* Paginación */}
                <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center no-print">
                    <small className="text-muted">
                        Mostrando {elementosActuales.length} de {pedidosFiltrados.length} pedidos
                    </small>
                    <nav>
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
            </div>

            {/* --- MODALES --- */}

            {/* Modal: Ver detalles */}
            {mostrarModalVista && pedidoSeleccionado && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    Detalles del Pedido #{pedidoSeleccionado.idPedido ?? pedidoSeleccionado.id}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModalVista(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <h6 className="text-muted text-uppercase small">Cliente</h6>
                                        <p className="fw-bold">{obtenerNombreCliente(pedidoSeleccionado)}</p>
                                    </div>
                                    <div className="col-md-3">
                                        <h6 className="text-muted text-uppercase small">Fecha</h6>
                                        <p>{pedidoSeleccionado.fecha}</p>
                                    </div>
                                    <div className="col-md-3 text-end">
                                        <h6 className="text-muted text-uppercase small">Estado</h6>
                                        <span className={`badge ${estadoClases[pedidoSeleccionado.estado] || 'bg-secondary'}`}>
                                            {String(pedidoSeleccionado.estado ?? '').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                {cargandoDetalles ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                        <span className="ms-2 text-muted">Cargando detalles...</span>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Producto</th>
                                                    <th className="text-center">Cant.</th>
                                                    <th className="text-end">Precio Unit.</th>
                                                    <th className="text-end">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detallesPedido.length > 0 ? detallesPedido.map((item, i) => (
                                                    <tr key={i}>
                                                        <td>{item.nombreProducto ?? item.producto?.nombre ?? '—'}</td>
                                                        <td className="text-center">{item.cantidad}</td>
                                                        <td className="text-end">S/ {parseFloat(item.precioUnitario ?? item.precio ?? 0).toFixed(2)}</td>
                                                        <td className="text-end">S/ {parseFloat(item.subtotal ?? (item.cantidad * (item.precioUnitario ?? 0))).toFixed(2)}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="4" className="text-center text-muted py-3">
                                                            No hay detalles disponibles.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <th colSpan="3" className="text-end border-0">Total</th>
                                                    <th className="text-end text-primary h5">
                                                        S/ {parseFloat(pedidoSeleccionado.total ?? 0).toFixed(2)}
                                                    </th>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-0">
                                <button type="button" className="btn btn-secondary" onClick={() => setMostrarModalVista(false)}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Cambiar Estado */}
            {mostrarModalEstado && pedidoSeleccionado && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
                        <div className="modal-content border-0 shadow-lg">
                            <form onSubmit={handleGuardarEstado}>
                                <div className="modal-header bg-secondary text-white">
                                    <h5 className="modal-title">
                                        <i className="fas fa-exchange-alt me-2"></i>
                                        Cambiar Estado — Pedido #{pedidoSeleccionado.idPedido ?? pedidoSeleccionado.id}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModalEstado(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <label className="form-label fw-bold">Nuevo Estado</label>
                                    <select
                                        className="form-select form-select-lg"
                                        value={nuevoEstado}
                                        onChange={e => setNuevoEstado(e.target.value)}
                                    >
                                        <option value="PENDIENTE">PENDIENTE</option>
                                        <option value="PAGADO">PAGADO</option>
                                        <option value="ENVIADO">ENVIADO</option>
                                        <option value="CANCELADO">CANCELADO</option>
                                    </select>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setMostrarModalEstado(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary px-4">Confirmar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pedidos;
