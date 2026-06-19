import React, { useState, useEffect } from 'react';
import { InventarioService } from '../../services/InventarioService';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const Transferencia = () => {
    const [productos, setProductos] = useState([]);
    const [productosOrigen, setProductosOrigen] = useState([]);
    const [inventarios, setInventarios] = useState([]);
    const [elementos, setElementos] = useState([]);
    const [pestanaActiva, setPestanaActiva] = useState('nuevo'); // nuevo, historial
    const [historialTraslados, setHistorialTraslados] = useState([]);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);
    const [procesando, setProcesando] = useState(false);

    const [encabezado, setEncabezado] = useState({
        fecha: new Date().toLocaleDateString('es-PE'),
        tipoCambio: '3.356',
        serie: 'TRF1',
        documento: '',
        moneda: 'SOLES',
        almacenOrigen: '',
        almacenDestino: '',
        encargadoRecepcion: '',
        proyecto: '',
        observacion: ''
    });

    useEffect(() => {
        const cargar = async () => {
            const pData = await InventarioService.getAll();
            const invData = await InventarioService.getInventariosList();
            setProductos(pData?.content || (Array.isArray(pData) ? pData : []));
            setInventarios(invData || []);
        };
        cargar();
    }, []);

    useEffect(() => {
        const cargarProductosOrigen = async () => {
            if (encabezado.almacenOrigen) {
                try {
                    const data = await InventarioService.getProductosPorInventario(encabezado.almacenOrigen);
                    setProductosOrigen(data || []);
                } catch (error) {
                    setProductosOrigen([]);
                }
            } else {
                setProductosOrigen([]);
            }
            // Limpiar los elementos al cambiar el almacén de origen ya que los productos cambian
            setElementos([]);
        };
        cargarProductosOrigen();
    }, [encabezado.almacenOrigen]);

    const cargarHistorial = async () => {
        try {
            setCargandoHistorial(true);
            const data = await InventarioService.listarTraslados();
            setHistorialTraslados(data || []);
        } catch (error) {
        } finally {
            setCargandoHistorial(false);
        }
    };

    useEffect(() => {
        if (pestanaActiva === 'historial') {
            cargarHistorial();
        }
    }, [pestanaActiva]);

    const agregarElemento = () => {
        setElementos([...elementos, { codigo: '', nombre: '', unidad: 'UNIDAD', cantidad: 1, maxStock: 0 }]);
    };

    const handleCambioElemento = (indice, campo, valor) => {
        const nuevosElementos = [...elementos];
        if (campo === 'codigo') {
            const productoSel = productosOrigen.find(p => p.producto?.idProducto === valor);
            if (productoSel) {
                nuevosElementos[indice].nombre = productoSel.producto?.nombre;
                nuevosElementos[indice].codigo = productoSel.producto?.idProducto;
                nuevosElementos[indice].maxStock = productoSel.stock || 0;
                nuevosElementos[indice].cantidad = 1; // reset cantidad when product changes
                if (nuevosElementos[indice].maxStock === 0) {
                    nuevosElementos[indice].cantidad = 0;
                }
            } else {
                nuevosElementos[indice].codigo = valor;
                nuevosElementos[indice].maxStock = 0;
            }
        } else if (campo === 'cantidad') {
            let numVal = Number(valor);
            if (numVal > nuevosElementos[indice].maxStock) {
                numVal = nuevosElementos[indice].maxStock;
            }
            if (numVal < 1 && nuevosElementos[indice].maxStock > 0) {
                numVal = 1;
            }
            nuevosElementos[indice][campo] = numVal;
        } else {
            nuevosElementos[indice][campo] = valor;
        }
        setElementos(nuevosElementos);
    };

    const eliminarElemento = (idx) => setElementos(elementos.filter((_, i) => i !== idx));

    const handleGuardar = async () => {
        if (!encabezado.almacenOrigen || !encabezado.almacenDestino) {
            toast.warning('Selecciona un almacén de origen y uno de destino.');
            return;
        }
        if (encabezado.almacenOrigen === encabezado.almacenDestino) {
            toast.warning('El almacén origen y destino no pueden ser el mismo.');
            return;
        }
        if (elementos.length === 0 || elementos[0].codigo === '') {
            toast.warning('Añade al menos un producto a trasladar.');
            return;
        }

        const confirmar = await Swal.fire({
            title: '¿Confirmar traslado?',
            text: 'El stock no se sustraerá hasta que un administrador lo apruebe.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, enviar',
            cancelButtonText: 'Cancelar'
        });
        if (!confirmar.isConfirmed) return;

        setProcesando(true);
        try {
            // Guardar línea por línea
            for (let e of elementos) {
                if (!e.codigo) continue;
                await InventarioService.registrarTraslado({
                    idOrigen: encabezado.almacenOrigen,
                    idDestino: encabezado.almacenDestino,
                    idProducto: e.codigo,
                    cantidad: Number(e.cantidad),
                    usuario: JSON.parse(localStorage.getItem('aseo360_auth_user'))?.username || 'ADM',
                    motivo: encabezado.observacion || 'Trámite Manual'
                });
            }

            toast.success('Solicitudes de traslado enviadas con éxito. Estado: En Proceso.');

            // Limpiar Modal
            setElementos([]);
            setEncabezado({ ...encabezado, documento: '', observacion: '' });
            setPestanaActiva('historial');
        } catch (error) {
            toast.error('No hay stock suficiente en el origen para registrar el traslado.');
        } finally {
            setProcesando(false);
        }
    };

    const cambiarEstado = async (id, estado) => {
        const accion = estado === 'FINALIZADO' ? 'aprobar (restar stock)' : 'cancelar';
        const result = await Swal.fire({
            title: `¿Deseas ${accion} este traslado?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        });
        if (!result.isConfirmed) return;

        try {
            setCargandoHistorial(true);
            const user = JSON.parse(localStorage.getItem('aseo360_auth_user'))?.username || 'ADM';
            await InventarioService.cambiarEstadoTraslado(id, estado, user);
            await cargarHistorial();
        } catch (error) {
            toast.error('No se pudo procesar: ' + (error.response?.data?.error || error.message));
        } finally {
            setCargandoHistorial(false);
        }
    };

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: '1200px' }}>
                {/* Header Titular */}
                <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 text-primary fw-bold"><i className="fas fa-truck-moving me-2"></i> Trámites de Traslado de Existencias</h5>
                </div>

                {/* Tabs Principales */}
                <ul className="nav nav-tabs px-4 pt-3 border-0 bg-light">
                    <li className="nav-item">
                        <button
                            className={`nav-link small border-0 py-2 px-4 shadow-sm ${pestanaActiva === 'nuevo' ? 'active text-primary fw-bold bg-white' : 'text-muted'}`}
                            onClick={() => setPestanaActiva('nuevo')}
                            style={{ borderRadius: '10px 10px 0 0' }}
                        >
                            <i className="fas fa-plus-circle me-1"></i> Nueva Solicitud
                        </button>
                    </li>
                    <li className="nav-item ms-2">
                        <button
                            className={`nav-link small border-0 py-2 px-4 shadow-sm ${pestanaActiva === 'historial' ? 'active text-primary fw-bold bg-white' : 'text-muted'}`}
                            onClick={() => setPestanaActiva('historial')}
                            style={{ borderRadius: '10px 10px 0 0' }}
                        >
                            <i className="fas fa-list me-1"></i> Seguimiento y Aprobaciones
                        </button>
                    </li>
                </ul>

                <div className="card-body p-4 bg-white border-top">
                    {/* ===== PESTAÑA: NUEVO TRASLADO ===== */}
                    {pestanaActiva === 'nuevo' && (
                        <>
                            {/* Fila 1: Orígenes y Destinos */}
                            <div className="row g-4 mb-4">
                                <div className="col-md-5">
                                    <div className="card shadow-sm border-warning h-100">
                                        <div className="card-header bg-warning text-dark fw-bold small">
                                            <i className="fas fa-upload me-2"></i> Origen (Salida de Mercadería)
                                        </div>
                                        <div className="card-body">
                                            <label className="form-label small text-muted mb-1"><span className="text-danger">*</span> Selecciona el Almacén / Tienda:</label>
                                            <select className="form-select form-select-sm" value={encabezado.almacenOrigen} onChange={e => setEncabezado({ ...encabezado, almacenOrigen: e.target.value })}>
                                                <option value="">Seleccione Inventario de Origen...</option>
                                                {inventarios.map(inv => (
                                                    <option key={`orig-${inv.idInventario}`} value={inv.idInventario}>{inv.nombre} ({inv.tipo} - Sede: {inv.sede?.nombre})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-2 d-flex align-items-center justify-content-center">
                                    <i className="fas fa-arrow-right fa-2x text-muted opacity-50"></i>
                                </div>

                                <div className="col-md-5">
                                    <div className="card shadow-sm border-success h-100">
                                        <div className="card-header bg-success text-white fw-bold small">
                                            <i className="fas fa-download me-2"></i> Destino (Ingreso de Mercadería)
                                        </div>
                                        <div className="card-body">
                                            <label className="form-label small text-muted mb-1"><span className="text-danger">*</span> Selecciona el Almacén / Tienda:</label>
                                            <select className="form-select form-select-sm" value={encabezado.almacenDestino} onChange={e => setEncabezado({ ...encabezado, almacenDestino: e.target.value })}>
                                                <option value="">Seleccione Inventario de Recepción...</option>
                                                {inventarios.map(inv => (
                                                    <option key={`dest-${inv.idInventario}`} value={inv.idInventario}>{inv.nombre} ({inv.tipo} - Sede: {inv.sede?.nombre})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fila 2: Documentos */}
                            <div className="row g-3 mb-4 bg-light p-3 rounded">
                                <div className="col-md-4">
                                    <label className="form-label small text-muted mb-1">Referencia Documento Opcional:</label>
                                    <input type="text" className="form-control form-control-sm" placeholder="Ej. Guía 001-200" value={encabezado.documento} onChange={e => setEncabezado({ ...encabezado, documento: e.target.value })} />
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label small text-muted mb-1">Observaciones o Justificación:</label>
                                    <input type="text" className="form-control form-control-sm" placeholder="Motivo de la transferencia..." value={encabezado.observacion} onChange={e => setEncabezado({ ...encabezado, observacion: e.target.value })} />
                                </div>
                            </div>

                            {/* Tabla de Productos a añadir */}
                            <div className="border rounded shadow-sm">
                                <div className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
                                    <h6 className="mb-0 fw-bold text-secondary">Artículos a Trasladar</h6>
                                    <button className="btn btn-primary btn-sm px-3 rounded-pill" onClick={agregarElemento}>
                                        <i className="fas fa-plus me-2"></i>Añadir Línea
                                    </button>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover mb-0 align-middle">
                                        <thead className="bg-white">
                                            <tr>
                                                <th className="small text-muted fw-bold ps-4" style={{ width: '40%' }}>Seleccionar Producto Maestro</th>
                                                <th className="small text-muted fw-bold" style={{ width: '40%' }}>Descripción</th>
                                                <th className="small text-muted fw-bold text-center" style={{ width: '15%' }}>Cant. a Enviar</th>
                                                <th style={{ width: '5%' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {elementos.map((elemento, idx) => (
                                                <tr key={idx}>
                                                    <td className="ps-3 border-end">
                                                        <select
                                                            className="form-select border-0 shadow-none fw-bold text-primary"
                                                            value={elemento.codigo}
                                                            onChange={e => handleCambioElemento(idx, 'codigo', e.target.value)}
                                                            disabled={!encabezado.almacenOrigen}
                                                        >
                                                            <option value="">
                                                                {!encabezado.almacenOrigen ? 'Seleccione Origen Primero...' : 'Seleccione o busque...'}
                                                            </option>
                                                            {productosOrigen.map(p => (
                                                                <option key={p.producto?.idProducto} value={p.producto?.idProducto} disabled={p.stock <= 0}>
                                                                    {p.producto?.idProducto} - {p.producto?.nombre} {p.stock <= 0 ? '(Agotado)' : `(Disp: ${p.stock})`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="text-muted small border-end ps-3">
                                                        {elemento.nombre || '-'}
                                                        <br />
                                                        {elemento.codigo && <span className="badge bg-light text-dark fw-normal mt-1 border">Stock: {elemento.maxStock}</span>}
                                                    </td>
                                                    <td className="px-3 border-end">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={elemento.maxStock}
                                                            className="form-control text-center border bg-light shadow-sm fw-bold"
                                                            value={elemento.cantidad}
                                                            onChange={e => handleCambioElemento(idx, 'cantidad', e.target.value)}
                                                            disabled={!elemento.codigo || elemento.maxStock <= 0}
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        <button className="btn btn-link text-danger p-0 px-2" onClick={() => eliminarElemento(idx)}><i className="fas fa-times"></i></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {elementos.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-5 text-muted small">
                                                        <i className="fas fa-box-open d-block mb-3 opacity-25" style={{ fontSize: '3rem' }}></i>
                                                        <span className="fs-6">El carrito de traslados está vacío.</span><br />Pulse el botón "Añadir Línea" arriba a la derecha.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mt-4 d-flex justify-content-end">
                                <button className="btn btn-success px-5 py-2 fw-bold shadow-sm" onClick={handleGuardar} disabled={procesando}>
                                    <i className={`fas fa-paper-plane me-2 ${procesando ? 'fa-beat' : ''}`}></i> {procesando ? 'Enviando...' : 'Enviar Solicitud'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* ===== PESTAÑA: HISTORIAL / SEGUIMIENTO ===== */}
                    {pestanaActiva === 'historial' && (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h6 className="mb-0 fw-bold">Seguimiento de Trámites</h6>
                                    <span className="small text-muted">Acepta o cancela traslados para aplicar los cambios de Stock Físico</span>
                                </div>
                                <button className="btn btn-outline-secondary btn-sm" onClick={cargarHistorial} disabled={cargandoHistorial}>
                                    <i className={`fas fa-sync-alt me-1 ${cargandoHistorial ? 'fa-spin' : ''}`}></i> Refrescar
                                </button>
                            </div>

                            <div className="table-responsive rounded border">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="small text-muted fw-bold ps-3">Fecha</th>
                                            <th className="small text-muted fw-bold">Origen &rarr; Destino</th>
                                            <th className="small text-muted fw-bold">Producto</th>
                                            <th className="small text-muted fw-bold text-center">Cant.</th>
                                            <th className="small text-muted fw-bold">Solicitante / Motivo</th>
                                            <th className="small text-muted fw-bold text-center">Estado</th>
                                            <th className="small text-muted fw-bold text-center" style={{ width: '150px' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historialTraslados.map(t => (
                                            <tr key={t.idTraslado}>
                                                <td className="ps-3 small">
                                                    {new Date(t.fecha).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="small">
                                                    <div className="fw-bold text-warning-emphasis"><i className="fas fa-upload me-1 extra-small"></i> {t.inventarioOrigen?.nombre}</div>
                                                    <div className="fw-bold text-success-emphasis"><i className="fas fa-download me-1 extra-small"></i> {t.inventarioDestino?.nombre}</div>
                                                </td>
                                                <td className="small">
                                                    <div className="fw-bold">{t.producto?.nombre}</div>
                                                    <div className="extra-small text-muted">{t.producto?.idProducto}</div>
                                                </td>
                                                <td className="text-center fw-bold fs-5">{t.cantidad}</td>
                                                <td className="small">
                                                    <div className="text-dark"><i className="fas fa-user-circle me-1"></i>{t.usuario}</div>
                                                    <div className="text-muted italic extra-small mt-1">{t.motivo}</div>
                                                </td>
                                                <td className="text-center">
                                                    {t.estado === 'EN_PROCESO' && <span className="badge bg-warning text-dark px-3 py-2 rounded-pill"><i className="fas fa-clock me-1"></i>En Proceso</span>}
                                                    {t.estado === 'FINALIZADO' && <span className="badge bg-success px-3 py-2 rounded-pill"><i className="fas fa-check me-1"></i>Aprobado</span>}
                                                    {t.estado === 'CANCELADO' && <span className="badge bg-danger px-3 py-2 rounded-pill"><i className="fas fa-times me-1"></i>Cancelado</span>}
                                                </td>
                                                <td className="text-center">
                                                    {t.estado === 'EN_PROCESO' ? (
                                                        <div className="d-flex gap-1 justify-content-center">
                                                            <button className="btn btn-sm btn-success" title="Aprobar y Sustraer Stock" onClick={() => cambiarEstado(t.idTraslado, 'FINALIZADO')} disabled={cargandoHistorial}>
                                                                <i className="fas fa-check"></i>
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-danger" title="Cancelar Solicitud" onClick={() => cambiarEstado(t.idTraslado, 'CANCELADO')} disabled={cargandoHistorial}>
                                                                <i className="fas fa-ban"></i>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted small"><i className="fas fa-lock me-1"></i>Cerrado</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {historialTraslados.length === 0 && !cargandoHistorial && (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4 text-muted">No se encontraron traslados registrados.</td>
                                            </tr>
                                        )}
                                        {cargandoHistorial && (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4 text-primary"><i className="fas fa-spinner fa-spin me-2"></i> Cargando información...</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transferencia;
