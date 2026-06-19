import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { VentaService } from '../../services/VentaService';

const iconPago = { Efectivo: 'fa-money-bill-wave', Transferencia: 'fa-university', Tarjeta: 'fa-credit-card', Yape: 'fa-mobile-alt', Plin: 'fa-mobile-alt' };
const colorPago = { Efectivo: '#198754', Transferencia: '#0d6efd', Tarjeta: '#6f42c1', Yape: '#9b2d86', Plin: '#00bcd4' };
const bgEstado = { COMPLETADA: 'linear-gradient(135deg, #198754, #40c474)', ANULADA: 'linear-gradient(135deg, #dc3545, #f97583)', PENDIENTE: 'linear-gradient(135deg, #ffc107, #ffda6a)' };
const badgeEstado = { COMPLETADA: 'bg-success', ANULADA: 'bg-danger', PENDIENTE: 'bg-warning text-dark' };

const fmt = (v) => `S/ ${parseFloat(v || 0).toFixed(2)}`;
const fmtFecha = (f) => {
    if (!f) return '—';
    try {
        let date;
        if (Array.isArray(f)) {
            const [y, m, d] = f;
            date = new Date(y, m - 1, d);
        } else if (typeof f === 'string') {
            const parts = f.split(/[-T: ]/);
            if (parts.length >= 3) {
                const [y, m, d] = parts.map(Number);
                date = new Date(y, m - 1, d);
            } else {
                date = new Date(f);
            }
        } else {
            date = new Date(f);
        }
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return f; }
};

const Ventas = () => {
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [mostrarDetalle, setMostrarDetalle] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const pageSize = 12;

    useEffect(() => { cargar(); }, [page]);

    const cargar = async () => {
        setCargando(true);
        try {
            const data = await VentaService.getAll(page, pageSize);
            setVentas(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch { toast.error('Error al cargar ventas'); }
        finally { setCargando(false); }
    };

    const verDetalle = async (venta) => {
        setMostrarDetalle(venta);
        setCargandoDetalle(true);
        try {
            const data = await VentaService.getDetallesPorVentaId(venta.idVenta);
            setDetalles(Array.isArray(data) ? data : []);
        } catch { toast.error('Error al cargar detalles'); setDetalles([]); }
        finally { setCargandoDetalle(false); }
    };

    const handleAnular = async (id) => {
        const r = await Swal.fire({ title: '¿Anular esta venta?', text: 'Se revertirá el stock.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, anular', cancelButtonText: 'No' });
        if (!r.isConfirmed) return;
        try {
            await VentaService.anularVenta(id);
            toast.success('Venta anulada.');
            setMostrarDetalle(null);
            await cargar();
        } catch { toast.error('Error al anular.'); }
    };

    const pagRange = () => {
        const range = [];
        const start = Math.max(0, page - 2);
        const end = Math.min(totalPages - 1, page + 2);
        for (let i = start; i <= end; i++) range.push(i);
        return range;
    };

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: '#094e8a', fontWeight: '800' }}>
                    <i className="fas fa-shopping-cart me-2"></i>HISTORIAL DE VENTAS
                </h2>
                <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary fs-6 px-3 py-2">{totalElements} ventas</span>
                    <button className="btn btn-outline-primary shadow-sm" onClick={cargar}><i className="fas fa-sync-alt me-1"></i>Actualizar</button>
                </div>
            </div>

            {/* Grid de Cards */}
            {cargando ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div><p className="mt-2 text-muted">Cargando ventas...</p></div>
            ) : ventas.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <i className="fas fa-receipt fa-3x d-block mb-3 opacity-25"></i>
                    <h5>No hay ventas registradas</h5>
                </div>
            ) : (
                <div className="row g-3">
                    {ventas.map(v => {
                        const pago = v.formaPago || 'Efectivo';
                        const estado = v.estado || 'COMPLETADA';
                        const cliente = v.clienteTienda?.nombreCompleto || 'Cliente General';
                        return (
                            <div key={v.idVenta} className="col-sm-6 col-lg-4 col-xl-3">
                                <div
                                    className="card border-0 shadow-sm h-100"
                                    style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', borderRadius: 14, overflow: 'hidden' }}
                                    onClick={() => verDetalle(v)}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)'; }}
                                >
                                    {/* Header gradiente */}
                                    <div style={{ background: bgEstado[estado] || bgEstado.COMPLETADA, padding: '16px', color: '#fff', position: 'relative' }}>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="badge bg-white bg-opacity-25">{v.tipoDocumento}</span>
                                            <span className={`badge ${badgeEstado[estado] || 'bg-secondary'}`}>{estado}</span>
                                        </div>
                                        <h4 className="fw-bold mb-0">{fmt(v.totalVenta)}</h4>
                                        <small className="opacity-75">{fmtFecha(v.fechaVenta)}</small>
                                    </div>

                                    {/* Body */}
                                    <div className="card-body py-3 px-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                                style={{ width: 32, height: 32, backgroundColor: '#e9ecef' }}>
                                                <i className="fas fa-user text-muted" style={{ fontSize: '0.8rem' }}></i>
                                            </div>
                                            <div>
                                                <small className="fw-bold d-block text-truncate" style={{ maxWidth: 160 }}>{cliente}</small>
                                                {v.clienteTienda?.dni && <small className="text-muted" style={{ fontSize: '0.7rem' }}>DNI: {v.clienteTienda.dni}</small>}
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <i className={`fas ${iconPago[pago] || 'fa-money-bill-wave'} me-2`} style={{ color: colorPago[pago] || '#198754' }}></i>
                                            <small className="fw-medium">{pago}</small>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="card-footer bg-white border-top py-2 px-3 text-center">
                                        <small className="text-primary fw-bold"><i className="fas fa-eye me-1"></i>Ver detalle</small>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <nav>
                        <ul className="pagination pagination-sm shadow-sm">
                            <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(0)}><i className="fas fa-angle-double-left"></i></button>
                            </li>
                            <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(p => Math.max(0, p - 1))}><i className="fas fa-angle-left"></i></button>
                            </li>
                            {pagRange().map(p => (
                                <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setPage(p)}>{p + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}><i className="fas fa-angle-right"></i></button>
                            </li>
                            <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(totalPages - 1)}><i className="fas fa-angle-double-right"></i></button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* ====== MODAL DETALLE ====== */}
            {mostrarDetalle && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setMostrarDetalle(null)}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14, overflow: 'hidden' }}>
                            {/* Header con gradiente */}
                            <div style={{ background: bgEstado[mostrarDetalle.estado] || bgEstado.COMPLETADA, padding: '24px', color: '#fff' }}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="d-flex gap-2 mb-2">
                                            <span className="badge bg-white bg-opacity-25">{mostrarDetalle.tipoDocumento}</span>
                                            <span className={`badge ${badgeEstado[mostrarDetalle.estado] || 'bg-secondary'}`}>{mostrarDetalle.estado}</span>
                                        </div>
                                        <h3 className="fw-bold mb-1">{fmt(mostrarDetalle.totalVenta)}</h3>
                                        <small><i className="fas fa-calendar me-1"></i>{fmtFecha(mostrarDetalle.fechaVenta)}</small>
                                    </div>
                                    <button className="btn btn-sm btn-outline-light border-0" onClick={() => setMostrarDetalle(null)}><i className="fas fa-times fs-5"></i></button>
                                </div>
                            </div>

                            <div className="modal-body p-4">
                                {/* Info cards */}
                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <div className="p-3 rounded bg-light text-center">
                                            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Cliente</small>
                                            <span className="fw-bold">{mostrarDetalle.clienteTienda?.nombreCompleto || 'General'}</span>
                                            {mostrarDetalle.clienteTienda?.dni && <small className="text-muted d-block">DNI: {mostrarDetalle.clienteTienda.dni}</small>}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-3 rounded bg-light text-center">
                                            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Método de Pago</small>
                                            <span className="fw-bold">
                                                <i className={`fas ${iconPago[mostrarDetalle.formaPago] || 'fa-money-bill-wave'} me-1`} style={{ color: colorPago[mostrarDetalle.formaPago] || '#198754' }}></i>
                                                {mostrarDetalle.formaPago}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-3 rounded bg-light text-center">
                                            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Sede / Inventario</small>
                                            <span className="fw-bold">{mostrarDetalle.inventario?.nombre || mostrarDetalle.inventario?.idInventario || '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Detalle de productos */}
                                <h6 className="fw-bold text-primary mb-2"><i className="fas fa-boxes me-1"></i>Productos Vendidos</h6>
                                {cargandoDetalle ? (
                                    <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered mb-0">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Producto</th>
                                                    <th className="text-center">Cant.</th>
                                                    <th className="text-end">P. Unit.</th>
                                                    <th className="text-end">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detalles.map((d, i) => (
                                                    <tr key={d.idDetalleVenta || i}>
                                                        <td>{i + 1}</td>
                                                        <td className="fw-bold">{d.producto?.nombre || d.producto?.nombreProducto || 'Producto'}</td>
                                                        <td className="text-center">{d.cantidad}</td>
                                                        <td className="text-end">{fmt(d.precioUnitario)}</td>
                                                        <td className="text-end fw-bold">{fmt(d.subTotal || d.SubTotal)}</td>
                                                    </tr>
                                                ))}
                                                {detalles.length === 0 && <tr><td colSpan="5" className="text-center text-muted py-3">Sin detalles</td></tr>}
                                            </tbody>
                                            <tfoot>
                                                <tr className="table-primary">
                                                    <td colSpan="4" className="text-end fw-bold fs-6">TOTAL:</td>
                                                    <td className="text-end fw-bold fs-6">{fmt(mostrarDetalle.totalVenta)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="modal-footer bg-light border-0 d-flex justify-content-between">
                                <div>
                                    {mostrarDetalle.estado === 'COMPLETADA' && (
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleAnular(mostrarDetalle.idVenta)}>
                                            <i className="fas fa-ban me-1"></i>Anular Venta
                                        </button>
                                    )}
                                </div>
                                <button className="btn btn-light btn-sm" onClick={() => setMostrarDetalle(null)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ventas;
