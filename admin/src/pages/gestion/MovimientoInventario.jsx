import React, { useState, useEffect } from 'react';
import { InventarioService } from '../../services/InventarioService';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const MovimientoInventario = () => {
    // ---- ESTADOS GLOBALES ----
    const [tipoMovimiento, setTipoMovimiento] = useState('INGRESO'); // INGRESO | SALIDA

    // Datos de soporte
    const [productos, setProductos] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [proveedores, setProveedores] = useState([]);

    // Formularios
    const [lineas, setLineas] = useState([]);
    const [cabecera, setCabecera] = useState({
        fecha: new Date().toISOString().split('T')[0],
        idSede: '',
        motivo: 'COMPRA', // Para ingreso: COMPRA, DEVOLUCIÓN, AJUSTE POSITIVO | Para salida: MERMA, CONSUMO INTERNO, DEVOLUCIÓN PROVEEDOR, AJUSTE NEGATIVO
        observacion: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);

    // Opciones de motivo según el tipo de movimiento
    const motivosIngreso = ["COMPRA", "REABASTECIMIENTO", "DEVOLUCIÓN", "AJUSTE POSITIVO"];
    const motivosSalida = ["MERMA", "CONSUMO INTERNO", "DEVOLUCIÓN PROVEEDOR", "AJUSTE NEGATIVO"];

    // ---- CARGA INICIAL ----
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const pData = await InventarioService.getAll();
                const sData = await InventarioService.getAttributes('sede');
                const provData = await InventarioService.getAttributes('proveedor');
                setProductos(pData?.content || (Array.isArray(pData) ? pData : []));
                setSedes(sData?.content || (Array.isArray(sData) ? sData : []));
                setProveedores(provData?.content || (Array.isArray(provData) ? provData : []));
            } catch (error) {
                toast.error('No se pudieron cargar los datos base (Productos, Sedes, Proveedores).');
            }
        };
        cargarDatos();
    }, []);

    // ---- MANEJO DEL TIPO DE MOVIMIENTO ----
    const handleCambioTipo = (nuevoTipo) => {
        if (lineas.length > 0) {
            Swal.fire({
                title: '¿Cambiar tipo de movimiento?',
                text: "Si cambias entre Ingreso y Salida, se borrarán las líneas actuales.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, cambiar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    aplicarCambioTipo(nuevoTipo);
                }
            });
        } else {
            aplicarCambioTipo(nuevoTipo);
        }
    };

    const aplicarCambioTipo = (nuevoTipo) => {
        setTipoMovimiento(nuevoTipo);
        setLineas([]);
        setCabecera({
            fecha: new Date().toISOString().split('T')[0],
            idSede: '',
            motivo: nuevoTipo === 'INGRESO' ? 'COMPRA' : 'MERMA',
            observacion: ''
        });
    };

    // ---- MANEJO DE LÍNEAS ----
    const agregarLinea = () => {
        if (tipoMovimiento === 'INGRESO') {
            setLineas([...lineas, { idProducto: '', idProveedor: '', cantidad: 1, precioCosto: 0 }]);
        } else {
            setLineas([...lineas, { idProducto: '', cantidad: 1 }]);
        }
    };

    const actualizarLinea = (indice, campo, valor) => {
        const lineasActualizadas = [...lineas];
        lineasActualizadas[indice][campo] = valor;
        setLineas(lineasActualizadas);
    };

    const eliminarLinea = (indice) => setLineas(lineas.filter((_, i) => i !== indice));

    // Helper: obtener stock del inventario PRINCIPAL para la sede seleccionada
    const getStockPrincipal = (producto) => {
        if (!producto?.stock || !cabecera.idSede) return 0;
        const stockPrincipal = producto.stock.find(s =>
            String(s.idSede) === String(cabecera.idSede) &&
            s.nombreInventario?.toUpperCase().includes('PRINCIPAL')
        );
        return stockPrincipal?.cantidad || 0;
    };

    // ---- PROCESAMIENTO ----
    const handleSave = async () => {
        if (!cabecera.idSede || lineas.length === 0) {
            toast.warning('Completa la sede y agrega al menos un producto');
            return;
        }

        // Validación de líneas
        for (let i = 0; i < lineas.length; i++) {
            const linea = lineas[i];
            if (tipoMovimiento === 'INGRESO') {
                if (!linea.idProducto || !linea.idProveedor || !linea.cantidad || linea.cantidad <= 0 || linea.precioCosto === '' || isNaN(linea.precioCosto) || linea.precioCosto < 0) {
                    toast.warning(`Línea ${i + 1}: Seleccione producto, proveedor, cantidad > 0 y costo >= 0.`);
                    return;
                }
            } else {
                if (!linea.idProducto || !linea.cantidad || linea.cantidad <= 0) {
                    toast.warning(`Línea ${i + 1}: Seleccione producto y cantidad > 0.`);
                    return;
                }
            }
        }

        try {
            setIsProcessing(true);

            if (tipoMovimiento === 'INGRESO') {
                // LOGICA DE INGRESO SEGÚN Ingreso.jsx
                const payload = {
                    fecha: cabecera.fecha,
                    idSede: cabecera.idSede,
                    tipoIngreso: cabecera.motivo,
                    observacion: cabecera.observacion,
                    lineas: lineas
                };
                const response = await InventarioService.registrarIngreso(payload);

                toast.success('Ingreso de mercadería registrado exitosamente.');

                if (response && response.alertas && response.alertas.length > 0) {
                    const alertasHtml = `<ul style="text-align: left; font-size: 0.9em; margin-top: 10px;">`
                        + response.alertas.map(a => `<li>${a}</li>`).join('')
                        + `</ul>`;

                    Swal.fire({
                        title: '⚠️ Revisa estos precios',
                        html: `Algunos productos tienen problemas de rentabilidad:<br/>${alertasHtml}`,
                        icon: 'warning',
                        confirmButtonText: 'Entendido',
                        width: '600px'
                    });
                }

            } else {
                // Validación pre-backend de seguridad para saldo negativo (opcional, el backend lo rechaza igual)
                for (const lineaSalida of lineas) {
                    const productoEncontrado = productos.find(p => String(p.idProducto) === String(lineaSalida.idProducto));
                    if (productoEncontrado) {
                        const saldoAnterior = getStockPrincipal(productoEncontrado);
                        const saldoActual = saldoAnterior - parseInt(lineaSalida.cantidad);
                        if (saldoActual < 0) {
                            const result = await Swal.fire({
                                title: '¡Advertencia de Stock!',
                                text: `El stock de ${productoEncontrado.nombre} quedará en negativo (${saldoActual}). El sistema podría rechazarlo. ¿Continuar?`,
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Sí, intentar',
                                cancelButtonText: 'Cancelar'
                            });
                            if (!result.isConfirmed) {
                                setIsProcessing(false);
                                return;
                            }
                        }
                    }
                }

                // NUEVA LÓGICA DIRECTA AL BACKEND
                const payloadSalida = {
                    fecha: cabecera.fecha,
                    idSede: cabecera.idSede,
                    motivo: cabecera.motivo,
                    observacion: cabecera.observacion,
                    lineas: lineas.map(l => ({
                        idProducto: l.idProducto,
                        cantidad: parseInt(l.cantidad)
                    }))
                };
                await InventarioService.registrarSalida(payloadSalida);

                toast.success('Salida de almacén registrada exitosamente.');
            }

            // Limpiar formulario tras éxito
            setLineas([]);
            setCabecera({ ...cabecera, observacion: '' });

            // Recargar productos para actualizar stock visual
            const pData = await InventarioService.getAll();
            setProductos(pData?.content || (Array.isArray(pData) ? pData : []));

        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.message || 'Error desconocido del servidor';
            toast.error(`Ocurrió un problema: ${msg}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // ---- RENDERIZADO CONDICIONAL POR TIPO ----
    const isIngreso = tipoMovimiento === 'INGRESO';
    const colorTheme = isIngreso ? 'success' : 'danger';
    const iconTheme = isIngreso ? 'fa-sign-in-alt' : 'fa-sign-out-alt';
    const titleTheme = isIngreso ? 'Registrar Ingreso de Almacén' : 'Registrar Salida de Almacén';
    const buttonText = isIngreso ? 'PROCESAR INGRESO' : 'PROCESAR SALIDA';
    const optionsMotivo = isIngreso ? motivosIngreso : motivosSalida;

    return (
        <div className="container-fluid mt-3 px-4">
            <div className="card shadow border-0 rounded-4 overflow-hidden mb-4">
                <div className={`card-header bg-${colorTheme} text-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2`}>
                    <h5 className="mb-0 fw-bold"><i className={`fas ${iconTheme} me-2`}></i>{titleTheme}</h5>

                    {/* TABS DE TIPO DE MOVIMIENTO INTEGRADAS EN HEADER */}
                    <div className="btn-group shadow-sm rounded-pill bg-white overflow-hidden p-1" style={{ width: '250px' }}>
                        <button
                            type="button"
                            className={`btn btn-sm ${isIngreso ? 'btn-success fw-bold rounded-pill' : 'btn-white text-secondary border-0'} w-50`}
                            onClick={() => handleCambioTipo('INGRESO')}
                        >
                            <i className="fas fa-arrow-down me-1"></i> Ingreso
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm ${!isIngreso ? 'btn-danger fw-bold rounded-pill' : 'btn-white text-secondary border-0'} w-50`}
                            onClick={() => handleCambioTipo('SALIDA')}
                        >
                            <i className="fas fa-arrow-up me-1"></i> Salida
                        </button>
                    </div>
                </div>
                <div className="card-body p-3 bg-light">
                    {/* CABECERA */}
                    <div className="row g-2 mb-3">
                        <div className="col-md-2">
                            <label className="form-label small fw-bold mb-1">Fecha</label>
                            <input type="date" className="form-control form-control-sm" value={cabecera.fecha} onChange={e => setCabecera({ ...cabecera, fecha: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold mb-1">{isIngreso ? 'Sede Destino' : 'Sede Origen'}</label>
                            <select className="form-select form-select-sm" value={cabecera.idSede} onChange={e => setCabecera({ ...cabecera, idSede: e.target.value })}>
                                <option value="">Seleccione sede...</option>
                                {sedes.map(sede => <option key={sede.id} value={sede.id}>{sede.nombre}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold mb-1">Motivo</label>
                            <select className="form-select form-select-sm" value={cabecera.motivo} onChange={e => setCabecera({ ...cabecera, motivo: e.target.value })}>
                                {optionsMotivo.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-5">
                            <label className="form-label small fw-bold mb-1">Observaciones</label>
                            <input type="text" className="form-control form-control-sm" placeholder="Escriba algún detalle (Opcional)..." value={cabecera.observacion} onChange={e => setCabecera({ ...cabecera, observacion: e.target.value })} />
                        </div>
                    </div>

                    {/* DETALLE (LÍNEAS) */}
                    <div className="bg-white p-2 rounded shadow-sm border">
                        <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                            <h6 className={`fw-bold mb-0 text-${colorTheme} small text-uppercase`}>
                                <i className="fas fa-list me-1"></i> {isIngreso ? 'Líneas de Ingreso' : 'Líneas de Salida'}
                            </h6>
                            <button className={`btn btn-outline-${colorTheme} btn-sm fw-bold`} onClick={agregarLinea}>
                                <i className="fas fa-plus me-1"></i> Agregar Fila
                            </button>
                        </div>
                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="table table-sm align-middle table-hover mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-light sticky-top shadow-sm z-1">
                                    <tr>
                                        <th style={{ width: isIngreso ? '35%' : '40%' }} className="text-secondary fw-bold">Producto</th>
                                        {isIngreso && <th style={{ width: '25%' }} className="text-secondary fw-bold">Proveedor</th>}
                                        {!isIngreso && <th style={{ width: '15%' }} className="text-secondary fw-bold text-center">Stock Disp.</th>}
                                        <th style={{ width: '15%' }} className="text-secondary fw-bold text-center">Cantidad</th>
                                        {isIngreso && <th style={{ width: '15%' }} className="text-secondary fw-bold text-center">Costo Unit.</th>}
                                        <th style={{ width: '10%' }} className="text-secondary fw-bold text-center"><i className="fas fa-cog"></i></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineas.map((linea, indice) => (
                                        <tr key={indice}>
                                            <td>
                                                <select className="form-select form-select-sm" value={linea.idProducto} onChange={e => actualizarLinea(indice, 'idProducto', e.target.value)}>
                                                    <option value="">-- Seleccionar --</option>
                                                    {productos.map(p => {
                                                        const stockDisp = !isIngreso ? getStockPrincipal(p) : null;
                                                        return (
                                                            <option key={p.idProducto} value={p.idProducto}>
                                                                {p.nombre} {!isIngreso ? `(Stock: ${stockDisp})` : ''}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </td>

                                            {isIngreso && (
                                                <td>
                                                    <select className="form-select form-select-sm" value={linea.idProveedor} onChange={e => actualizarLinea(indice, 'idProveedor', e.target.value)}>
                                                        <option value="">-- Seleccionar Proveedor --</option>
                                                        {proveedores.map(p => <option key={p.ruc || p.id} value={p.ruc || p.id}>{p.nombre}</option>)}
                                                    </select>
                                                </td>
                                            )}

                                            {!isIngreso && (() => {
                                                const prod = productos.find(p => String(p.idProducto) === String(linea.idProducto));
                                                const stockDisp = prod ? getStockPrincipal(prod) : '-';
                                                return (
                                                    <td className="text-center">
                                                        <span className={`badge fs-6 ${stockDisp > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                            {stockDisp}
                                                        </span>
                                                    </td>
                                                );
                                            })()}

                                            <td className="text-center">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm text-center font-monospace"
                                                    min="1"
                                                    value={linea.cantidad}
                                                    onChange={e => actualizarLinea(indice, 'cantidad', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                />
                                            </td>

                                            {isIngreso && (
                                                <td>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text">S/</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="form-control"
                                                            value={linea.precioCosto}
                                                            onChange={e => actualizarLinea(indice, 'precioCosto', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                </td>
                                            )}

                                            <td className="text-center">
                                                <button className="btn btn-link text-danger p-0" title="Eliminar Fila" onClick={() => eliminarLinea(indice)}>
                                                    <i className="fas fa-trash-alt fs-5"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {lineas.length === 0 && (
                                        <tr>
                                            <td colSpan={isIngreso ? 5 : 4} className="text-center py-5 text-muted bg-light">
                                                <i className="fas fa-box-open fa-3x mb-3 text-secondary opacity-25"></i>
                                                <p className="mb-0 fw-bold">Empieza agregando una fila</p>
                                                <small>No hay productos en la lista actual.</small>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-3 d-flex justify-content-end">
                        <button
                            className={`btn btn-${colorTheme} px-5 fw-bold rounded-pill shadow-sm`}
                            onClick={handleSave}
                            disabled={lineas.length === 0 || isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    PROCESANDO...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-check-circle me-2"></i> {buttonText}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovimientoInventario;
