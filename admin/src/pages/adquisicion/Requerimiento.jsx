import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { AdquisicionService } from '../../services/AdquisicionService';

const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
const itemInicial = { nombreProducto: '', cantidad: 1, precioUnitario: '', precioTotal: 0 };
const formInicial = { descripcion: '', solicitadoPor: '', prioridad: 'MEDIA', area: '', items: [{ ...itemInicial }] };

const colorPrioridad = { BAJA: '#6c757d', MEDIA: '#0d6efd', ALTA: '#fd7e14', URGENTE: '#dc3545' };
const bgPrioridad = { BAJA: 'linear-gradient(135deg, #6c757d, #adb5bd)', MEDIA: 'linear-gradient(135deg, #0d6efd, #6ea8fe)', ALTA: 'linear-gradient(135deg, #fd7e14, #ffb347)', URGENTE: 'linear-gradient(135deg, #dc3545, #f97583)' };
const iconEstado = { EN_PROCESO: 'fa-clock', COMPLETADO: 'fa-check-circle', CANCELADO: 'fa-ban' };
const badgeEstado = { EN_PROCESO: 'bg-primary', COMPLETADO: 'bg-success', CANCELADO: 'bg-dark' };

const fmt = (v) => `S/ ${parseFloat(v || 0).toFixed(2)}`;
const fmtFecha = (f) => {
    if (!f) return '—';
    try { return new Date(f).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return f; }
};

const Requerimiento = () => {
    const [adquisiciones, setAdquisiciones] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarDetalle, setMostrarDetalle] = useState(null);
    const [seleccionado, setSeleccionado] = useState(null);
    const [form, setForm] = useState(formInicial);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try { const data = await AdquisicionService.getAll(); setAdquisiciones(Array.isArray(data) ? data : []); }
        catch { toast.error('Error al cargar las solicitudes'); }
        finally { setCargando(false); }
    };

    const handleNuevo = () => { setSeleccionado(null); setForm(formInicial); setMostrarModal(true); };

    const handleEditar = (adq) => {
        setMostrarDetalle(null);
        setSeleccionado(adq);
        setForm({
            descripcion: adq.descripcion ?? '', solicitadoPor: adq.solicitadoPor ?? '',
            prioridad: adq.prioridad ?? 'MEDIA', area: adq.area ?? '',
            items: (adq.detalles || []).map(d => ({ nombreProducto: d.nombreProducto, cantidad: d.cantidad, precioUnitario: d.precioUnitario, precioTotal: d.precioTotal })),
        });
        setMostrarModal(true);
    };

    const handleEliminar = async (id) => {
        const r = await Swal.fire({ title: '¿Eliminar?', text: 'Se eliminará permanentemente.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí', cancelButtonText: 'No' });
        if (!r.isConfirmed) return;
        try { await AdquisicionService.delete(id); toast.success('Eliminada.'); setMostrarDetalle(null); await cargar(); }
        catch { toast.error('Error al eliminar.'); }
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        const r = await Swal.fire({ title: nuevoEstado === 'CANCELADO' ? '¿Cancelar solicitud?' : '¿Marcar como completado?', icon: nuevoEstado === 'CANCELADO' ? 'warning' : 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'No' });
        if (!r.isConfirmed) return;
        try { await AdquisicionService.cambiarEstado(id, nuevoEstado); toast.success(`Estado → ${nuevoEstado}`); setMostrarDetalle(null); await cargar(); }
        catch { toast.error('Error.'); }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (form.items.length === 0 || form.items.every(i => !i.nombreProducto.trim())) { toast.error('Agrega al menos un producto.'); return; }
        try {
            const payload = { ...form, items: form.items.filter(i => i.nombreProducto.trim()).map(i => ({ nombreProducto: i.nombreProducto, cantidad: parseInt(i.cantidad) || 1, precioUnitario: parseFloat(i.precioUnitario) || 0, precioTotal: (parseInt(i.cantidad) || 1) * (parseFloat(i.precioUnitario) || 0) })) };
            if (seleccionado) { await AdquisicionService.update(seleccionado.idAdquisicion, payload); toast.success('Actualizada.'); }
            else { await AdquisicionService.create(payload); toast.success('Registrada.'); }
            setMostrarModal(false); await cargar();
        } catch { toast.error('Error al guardar.'); }
    };

    const agregarItem = () => setForm(f => ({ ...f, items: [...f.items, { ...itemInicial }] }));
    const eliminarItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    const cambiarItem = (idx, campo, valor) => {
        setForm(f => {
            const items = [...f.items];
            items[idx] = { ...items[idx], [campo]: valor };
            if (['cantidad', 'precioUnitario'].includes(campo)) items[idx].precioTotal = (parseInt(items[idx].cantidad) || 0) * (parseFloat(items[idx].precioUnitario) || 0);
            return { ...f, items };
        });
    };
    const totalEstimado = form.items.reduce((s, i) => s + (parseFloat(i.precioTotal) || 0), 0);

    const filtradas = adquisiciones.filter(a => {
        const t = terminoBusqueda.toLowerCase();
        return (a.descripcion ?? '').toLowerCase().includes(t) || (a.solicitadoPor ?? '').toLowerCase().includes(t) || (a.area ?? '').toLowerCase().includes(t) || (a.prioridad ?? '').toLowerCase().includes(t) || (a.estado ?? '').toLowerCase().includes(t);
    });

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: '#094e8a', fontWeight: '800' }}>
                    <i className="fas fa-clipboard-list me-2"></i>SOLICITUDES DE ADQUISICIÓN
                </h2>
                <div>
                    <button className="btn btn-outline-primary shadow-sm me-2" onClick={cargar}><i className="fas fa-sync-alt me-1"></i>Actualizar</button>
                    <button className="btn btn-primary shadow-sm" onClick={handleNuevo}><i className="fas fa-plus me-1"></i>Nueva Solicitud</button>
                </div>
            </div>

            {/* Búsqueda */}
            <div className="mb-4">
                <div className="input-group shadow-sm">
                    <span className="input-group-text bg-white border-end-0"><i className="fas fa-search text-muted"></i></span>
                    <input type="text" className="form-control border-start-0" placeholder="Buscar por descripción, solicitante, área..."
                        value={terminoBusqueda} onChange={e => setTerminoBusqueda(e.target.value)} />
                    <span className="input-group-text bg-white fw-bold text-muted">{filtradas.length} resultado{filtradas.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Grid de Cards */}
            {cargando ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div><p className="mt-2 text-muted">Cargando...</p></div>
            ) : filtradas.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <i className="fas fa-inbox fa-3x d-block mb-3 opacity-25"></i>
                    <h5>No hay solicitudes</h5>
                    <p className="small">Haz clic en "Nueva Solicitud" para crear una.</p>
                </div>
            ) : (
                <div className="row g-3">
                    {filtradas.map(a => {
                        const pri = a.prioridad || 'MEDIA';
                        const numItems = (a.detalles || []).length;
                        return (
                            <div key={a.idAdquisicion} className="col-sm-6 col-lg-4 col-xl-3">
                                <div
                                    className="card border-0 shadow-sm h-100"
                                    style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', borderRadius: 12, overflow: 'hidden' }}
                                    onClick={() => setMostrarDetalle(a)}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)'; }}
                                >
                                    {/* Top color band */}
                                    <div style={{ background: bgPrioridad[pri], padding: '14px 16px', color: '#fff' }}>
                                        <div className="d-flex justify-content-end align-items-start">
                                            <span className={`badge ${badgeEstado[a.estado] || 'bg-secondary'}`}>
                                                <i className={`fas ${iconEstado[a.estado]} me-1`}></i>{a.estado?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h6 className="mt-2 mb-0 fw-bold text-truncate" title={a.descripcion}>{a.descripcion || 'Sin descripción'}</h6>
                                    </div>

                                    {/* Body */}
                                    <div className="card-body py-3 px-3">
                                        <div className="mb-2">
                                            <div className="d-flex align-items-center mb-1">
                                                <i className="fas fa-user text-muted me-2" style={{ width: 16, fontSize: '0.8rem' }}></i>
                                                <small className="text-truncate fw-medium">{a.solicitadoPor}</small>
                                            </div>
                                            <div className="d-flex align-items-center mb-1">
                                                <i className="fas fa-building text-muted me-2" style={{ width: 16, fontSize: '0.8rem' }}></i>
                                                <small className="text-truncate">{a.area}</small>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-calendar text-muted me-2" style={{ width: 16, fontSize: '0.8rem' }}></i>
                                                <small className="text-muted">{fmtFecha(a.fechaHora)}</small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="card-footer bg-white border-top py-2 px-3 d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            <i className="fas fa-boxes me-1"></i>{numItems} item{numItems !== 1 ? 's' : ''}
                                        </small>
                                        <span className="fw-bold" style={{ color: colorPrioridad[pri] }}>{fmt(a.totalEstimado)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ====== MODAL DETALLE ====== */}
            {mostrarDetalle && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setMostrarDetalle(null)}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 12, overflow: 'hidden' }}>
                            {/* Header con gradiente */}
                            <div style={{ background: bgPrioridad[mostrarDetalle.prioridad] || bgPrioridad.MEDIA, padding: '20px 24px', color: '#fff' }}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h4 className="fw-bold mb-1">{mostrarDetalle.descripcion || 'Sin descripción'}</h4>
                                        <small><i className="fas fa-calendar me-1"></i>{fmtFecha(mostrarDetalle.fechaHora)}</small>
                                    </div>
                                    <button className="btn btn-sm btn-outline-light border-0" onClick={() => setMostrarDetalle(null)}><i className="fas fa-times fs-5"></i></button>
                                </div>
                            </div>
                            <div className="modal-body p-4">
                                {/* Info */}
                                <div className="row g-3 mb-4">
                                    <div className="col-md-3">
                                        <div className="p-3 rounded bg-light text-center">
                                            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Solicitado Por</small>
                                            <span className="fw-bold">{mostrarDetalle.solicitadoPor}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="p-3 rounded bg-light text-center">
                                            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Área</small>
                                            <span className="fw-bold">{mostrarDetalle.area}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="p-3 rounded bg-light text-center">
                                            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Prioridad</small>
                                            <span className="badge" style={{ backgroundColor: colorPrioridad[mostrarDetalle.prioridad] }}>{mostrarDetalle.prioridad}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="p-3 rounded bg-light text-center">
                                            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Estado</small>
                                            <span className={`badge ${badgeEstado[mostrarDetalle.estado] || 'bg-secondary'}`}>
                                                <i className={`fas ${iconEstado[mostrarDetalle.estado]} me-1`}></i>{mostrarDetalle.estado?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabla de items */}
                                <h6 className="fw-bold text-primary mb-2"><i className="fas fa-boxes me-1"></i>Productos Solicitados</h6>
                                <div className="table-responsive">
                                    <table className="table table-sm table-bordered mb-0">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>#</th>
                                                <th>Producto / Insumo</th>
                                                <th className="text-center">Cant.</th>
                                                <th className="text-end">P. Unit.</th>
                                                <th className="text-end">P. Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(mostrarDetalle.detalles || []).map((d, i) => (
                                                <tr key={d.idDetalleAdquisicion || i}>
                                                    <td>{i + 1}</td>
                                                    <td className="fw-bold">{d.nombreProducto}</td>
                                                    <td className="text-center">{d.cantidad}</td>
                                                    <td className="text-end">{fmt(d.precioUnitario)}</td>
                                                    <td className="text-end fw-bold">{fmt(d.precioTotal)}</td>
                                                </tr>
                                            ))}
                                            {(!mostrarDetalle.detalles || mostrarDetalle.detalles.length === 0) && (
                                                <tr><td colSpan="5" className="text-center text-muted py-3">Sin items</td></tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr className="table-primary">
                                                <td colSpan="4" className="text-end fw-bold fs-6">TOTAL ESTIMADO:</td>
                                                <td className="text-end fw-bold fs-6">{fmt(mostrarDetalle.totalEstimado)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                            {/* Footer con acciones */}
                            <div className="modal-footer bg-light border-0 d-flex justify-content-between">
                                <div>
                                    {mostrarDetalle.estado === 'EN_PROCESO' && (
                                        <>
                                            <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEditar(mostrarDetalle)}><i className="fas fa-edit me-1"></i>Editar</button>
                                            <button className="btn btn-success btn-sm me-2" onClick={() => handleCambiarEstado(mostrarDetalle.idAdquisicion, 'COMPLETADO')}><i className="fas fa-check me-1"></i>Completar</button>
                                            <button className="btn btn-dark btn-sm me-2" onClick={() => handleCambiarEstado(mostrarDetalle.idAdquisicion, 'CANCELADO')}><i className="fas fa-ban me-1"></i>Cancelar</button>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <button className="btn btn-outline-danger btn-sm me-2" onClick={() => handleEliminar(mostrarDetalle.idAdquisicion)}><i className="fas fa-trash-alt me-1"></i>Eliminar</button>
                                    <button className="btn btn-light btn-sm" onClick={() => setMostrarDetalle(null)}>Cerrar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== MODAL FORMULARIO ====== */}
            {mostrarModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 12 }}>
                            <form onSubmit={handleGuardar}>
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title"><i className="fas fa-clipboard-list me-2"></i>{seleccionado ? 'Editar Solicitud' : 'Nueva Solicitud'}</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Solicitado Por <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" required placeholder="Nombre del solicitante"
                                                value={form.solicitadoPor} onChange={e => setForm(f => ({ ...f, solicitadoPor: e.target.value }))} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Prioridad <span className="text-danger">*</span></label>
                                            <select className="form-select" required value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))}>
                                                {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Área <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" required placeholder="Ej: Limpieza, Cocina..."
                                                value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-bold">Descripción <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" required placeholder="Descripción general de la solicitud"
                                                value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="fw-bold mb-0 text-primary"><i className="fas fa-boxes me-1"></i>Productos / Insumos</h6>
                                        <button type="button" className="btn btn-sm btn-primary" onClick={agregarItem}><i className="fas fa-plus me-1"></i>Agregar Item</button>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm bg-white mb-0">
                                            <thead className="table-dark text-center">
                                                <tr>
                                                    <th style={{ width: '40%' }}>Producto</th>
                                                    <th style={{ width: '12%' }}>Cant.</th>
                                                    <th style={{ width: '18%' }}>P. Unit.</th>
                                                    <th style={{ width: '18%' }}>P. Total</th>
                                                    <th style={{ width: '12%' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {form.items.map((item, idx) => (
                                                    <tr key={idx} className="align-middle">
                                                        <td><input type="text" className="form-control form-control-sm border-0" placeholder="Nombre..." value={item.nombreProducto} onChange={e => cambiarItem(idx, 'nombreProducto', e.target.value)} /></td>
                                                        <td><input type="number" className="form-control form-control-sm border-0 text-center" min="1" value={item.cantidad} onChange={e => cambiarItem(idx, 'cantidad', e.target.value)} /></td>
                                                        <td><input type="number" className="form-control form-control-sm border-0 text-end" step="0.01" min="0" placeholder="0.00" value={item.precioUnitario} onChange={e => cambiarItem(idx, 'precioUnitario', e.target.value)} /></td>
                                                        <td className="text-end fw-bold">{fmt(item.precioTotal)}</td>
                                                        <td className="text-center"><button type="button" className="btn btn-link text-danger p-0" onClick={() => eliminarItem(idx)}><i className="fas fa-trash-alt"></i></button></td>
                                                    </tr>
                                                ))}
                                                {form.items.length === 0 && <tr><td colSpan="5" className="text-center text-muted py-4">Sin items</td></tr>}
                                            </tbody>
                                            <tfoot>
                                                <tr className="table-primary">
                                                    <td colSpan="3" className="text-end fw-bold">TOTAL ESTIMADO:</td>
                                                    <td className="text-end fw-bold fs-5">{fmt(totalEstimado)}</td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary px-4"><i className="fas fa-save me-2"></i>{seleccionado ? 'Actualizar' : 'Registrar'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Requerimiento;
