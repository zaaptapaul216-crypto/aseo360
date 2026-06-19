import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import './Cotizacion.css';
import logo from '../../assets/imagenes/logo.png';
import { useAuth } from '../../context/AuthContext';
import { InventarioService } from '../../services/InventarioService';

const Cotizacion = () => {
    const { user } = useAuth();
    const pdfRef = useRef(null);

    const [modoVista, setModoVista] = useState('form');
    const [productosDisponibles, setProductosDisponibles] = useState([]);
    const [cargandoProductos, setCargandoProductos] = useState(true);

    const estadoInicial = {
        fechaEmision: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }),
        clienteNombre: '',
        vendedor: '',
        direccionTienda: '',
        observacion: '',
        items: [],
        subtotal: 0,
        importeTotal: 0,
    };

    const [cotizacionData, setCotizacionData] = useState(estadoInicial);

    // Cargar productos registrados
    useEffect(() => {
        const cargarProductos = async () => {
            try {
                setCargandoProductos(true);
                const data = await InventarioService.getAll();
                const productos = data?.content || (Array.isArray(data) ? data : []);
                setProductosDisponibles(productos.filter(p => p.estado === 'DISPONIBLE'));
            } catch (error) {
                toast.error('Error al cargar los productos.');
            } finally {
                setCargandoProductos(false);
            }
        };
        cargarProductos();
    }, []);

    // Auto-llenar vendedor desde el usuario logueado
    useEffect(() => {
        if (user && user.nombreCompleto) {
            setCotizacionData(prev => ({ ...prev, vendedor: user.nombreCompleto }));
        }
    }, [user]);

    // Calcular totales
    useEffect(() => {
        const total = cotizacionData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
        setCotizacionData(prev => ({
            ...prev,
            subtotal: total.toFixed(2),
            importeTotal: total.toFixed(2),
        }));
    }, [cotizacionData.items]);

    // --- ACCIONES ---
    const handleLimpiar = async () => {
        const r = await Swal.fire({
            title: '¿Limpiar todos los campos?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        });
        if (r.isConfirmed) {
            setCotizacionData({ ...estadoInicial, vendedor: user?.nombreCompleto || '' });
        }
    };

    const handleGuardar = () => {
        if (!cotizacionData.clienteNombre.trim()) {
            toast.warning('Ingrese el nombre del cliente.');
            return;
        }
        if (cotizacionData.items.length === 0) {
            toast.warning('Agregue al menos un producto.');
            return;
        }
        // Ya no se guarda en localStorage
        toast.success('Cotización lista (vista previa disponible).');
    };

    const handleGenerarPDF = () => {
        if (!cotizacionData.clienteNombre.trim()) {
            toast.warning('Ingrese el nombre del cliente antes de generar el PDF.');
            return;
        }
        if (cotizacionData.items.length === 0) {
            toast.warning('Agregue al menos un producto.');
            return;
        }
        setModoVista('preview');
    };

    const descargarPDF = () => {
        const element = pdfRef.current;
        if (!element) return;

        const opt = {
            margin: [2, 2, 2, 2],
            filename: `Ticket_${cotizacionData.clienteNombre.replace(/\s+/g, '_')}_${cotizacionData.fechaEmision}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: [80, 297], orientation: 'portrait' } // Formato ticket 80mm
        };

        html2pdf().set(opt).from(element).save().then(() => {
            toast.success('PDF generado correctamente.');
        });
    };

    // --- HANDLERS FORM ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCotizacionData(prev => ({ ...prev, [name]: value }));
    };

    // Seleccionar un producto registrado
    const handleSeleccionarProducto = (index, idProducto) => {
        const producto = productosDisponibles.find(p => p.idProducto === idProducto);
        if (!producto) return;

        const nuevosItems = [...cotizacionData.items];
        const item = { ...nuevosItems[index] };
        item.idProducto = producto.idProducto;
        item.descripcion = producto.nombre;
        item.precioVenta = parseFloat(producto.precioVenta) || 0;
        item.precioPorMayor = parseFloat(producto.precioPorMayor || producto.precioMayor) || 0;
        item.presentacion = producto.presentacion || '';

        const cant = parseFloat(item.cantidad) || 1;
        // Si cantidad > 3 y hay precio por mayor, usar precio por mayor
        item.precioUnitario = (cant > 3 && item.precioPorMayor > 0) ? item.precioPorMayor : item.precioVenta;
        item.esPrecioMayor = cant > 3 && item.precioPorMayor > 0;
        item.total = (cant * item.precioUnitario).toFixed(2);

        nuevosItems[index] = item;
        setCotizacionData(prev => ({ ...prev, items: nuevosItems }));
    };

    const handleCambioItem = (index, field, value) => {
        const nuevosItems = [...cotizacionData.items];
        const item = { ...nuevosItems[index] };
        item[field] = value;

        const cant = parseFloat(item.cantidad) || 0;
        // Cambiar precio según cantidad: > 3 usa precio por mayor
        if (item.precioVenta !== undefined) {
            item.precioUnitario = (cant > 3 && item.precioPorMayor > 0) ? item.precioPorMayor : item.precioVenta;
            item.esPrecioMayor = cant > 3 && item.precioPorMayor > 0;
        }
        const precio = parseFloat(item.precioUnitario) || 0;
        item.total = (cant * precio).toFixed(2);

        nuevosItems[index] = item;
        setCotizacionData(prev => ({ ...prev, items: nuevosItems }));
    };

    const agregarItem = () => {
        setCotizacionData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    idProducto: '',
                    descripcion: '',
                    presentacion: '',
                    precioVenta: 0,
                    precioPorMayor: 0,
                    precioUnitario: 0,
                    esPrecioMayor: false,
                    cantidad: 1,
                    total: 0
                }
            ]
        }));
    };

    const eliminarItem = (index) => {
        setCotizacionData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    // Formatear fecha para mostrar
    const formatearFecha = (fechaStr) => {
        const [year, month, day] = fechaStr.split('-');
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${parseInt(day)} de ${meses[parseInt(month) - 1]} del ${year}`;
    };

    // Obtener productos no seleccionados (para evitar duplicados en el selector)
    const getProductosNoSeleccionados = (currentIndex) => {
        const idsSeleccionados = cotizacionData.items
            .filter((_, i) => i !== currentIndex)
            .map(item => item.idProducto)
            .filter(id => id);
        return productosDisponibles.filter(p => !idsSeleccionados.includes(p.idProducto));
    };

    // ============================
    // VISTA FORMULARIO
    // ============================
    if (modoVista === 'form') {
        return (
            <div className="cot-page">
                <div className="cot-card">
                    <div className="cot-card-header">
                        <div className="cot-card-header-left">
                            <i className="fas fa-file-invoice cot-header-icon"></i>
                            <h5 className="cot-card-title">Nueva Cotización</h5>
                        </div>
                        <div className="cot-card-header-actions">
                            <button className="cot-btn cot-btn-outline-danger" onClick={handleLimpiar}>
                                <i className="fas fa-eraser me-1"></i> Limpiar
                            </button>
                        </div>
                    </div>

                    <div className="cot-card-body">
                        {/* Info principal */}
                        <div className="cot-info-grid">
                            <div className="cot-field">
                                <label className="cot-label">
                                    <i className="fas fa-calendar-alt me-1"></i> Fecha
                                </label>
                                <input
                                    type="date"
                                    className="cot-input"
                                    name="fechaEmision"
                                    value={cotizacionData.fechaEmision}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="cot-field">
                                <label className="cot-label">
                                    <i className="fas fa-user me-1"></i> Cliente <span className="cot-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="cot-input"
                                    name="clienteNombre"
                                    value={cotizacionData.clienteNombre}
                                    onChange={handleChange}
                                    placeholder="Nombre del cliente"
                                />
                            </div>
                            <div className="cot-field">
                                <label className="cot-label">
                                    <i className="fas fa-user-tie me-1"></i> Vendedor
                                </label>
                                <input
                                    type="text"
                                    className="cot-input cot-input-readonly"
                                    name="vendedor"
                                    value={cotizacionData.vendedor}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Dirección de la tienda */}
                        <div className="cot-field" style={{ marginTop: '1rem' }}>
                            <label className="cot-label">
                                <i className="fas fa-map-marker-alt me-1"></i> Dirección de la Tienda
                            </label>
                            <input
                                type="text"
                                className="cot-input"
                                name="direccionTienda"
                                value={cotizacionData.direccionTienda}
                                onChange={handleChange}
                                placeholder="Dirección de la tienda"
                            />
                        </div>

                        {/* Observación */}
                        <div className="cot-field" style={{ marginTop: '1rem' }}>
                            <label className="cot-label">
                                <i className="fas fa-sticky-note me-1"></i> Observación (opcional)
                            </label>
                            <textarea
                                className="cot-input cot-textarea"
                                name="observacion"
                                value={cotizacionData.observacion}
                                onChange={handleChange}
                                placeholder="Notas adicionales para la cotización..."
                                rows={2}
                            />
                        </div>

                        {/* Tabla de Productos */}
                        <div className="cot-products-section">
                            <div className="cot-products-header">
                                <h6 className="cot-products-title">
                                    <i className="fas fa-boxes me-2"></i>Productos
                                    {cargandoProductos && <span className="cot-loading-badge">Cargando...</span>}
                                </h6>
                                <button
                                    className="cot-btn cot-btn-primary cot-btn-sm"
                                    onClick={agregarItem}
                                    disabled={cargandoProductos || productosDisponibles.length === 0}
                                >
                                    <i className="fas fa-plus me-1"></i> Agregar Producto
                                </button>
                            </div>

                            <div className="cot-table-wrap">
                                <table className="cot-table">
                                    <thead>
                                        <tr>
                                            <th className="cot-th-num">#</th>
                                            <th className="cot-th-desc">Producto</th>
                                            <th className="cot-th-pres">Presentación</th>
                                            <th className="cot-th-cant">Cantidad</th>
                                            <th className="cot-th-price">P. Unitario</th>
                                            <th className="cot-th-total">Total</th>
                                            <th className="cot-th-action"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cotizacionData.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="cot-td-center">{index + 1}</td>
                                                <td>
                                                    <select
                                                        className="cot-table-select"
                                                        value={item.idProducto}
                                                        onChange={(e) => handleSeleccionarProducto(index, e.target.value)}
                                                    >
                                                        <option value="">-- Seleccionar producto --</option>
                                                        {getProductosNoSeleccionados(index).map(prod => (
                                                            <option key={prod.idProducto} value={prod.idProducto}>
                                                                {prod.nombre}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="cot-td-center cot-td-pres">
                                                    {item.presentacion || '-'}
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="cot-table-input cot-input-center"
                                                        value={item.cantidad}
                                                        min="1"
                                                        onChange={(e) => handleCambioItem(index, 'cantidad', e.target.value)}
                                                    />
                                                </td>
                                                <td className="cot-td-price-display">
                                                    S/ {parseFloat(item.precioUnitario).toFixed(2)}
                                                    {item.esPrecioMayor && <span className="cot-badge-mayor">Mayor</span>}
                                                </td>
                                                <td className="cot-td-total">S/ {item.total}</td>
                                                <td className="cot-td-center">
                                                    <button
                                                        className="cot-btn-icon cot-btn-icon-danger"
                                                        onClick={() => eliminarItem(index)}
                                                        title="Eliminar"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {cotizacionData.items.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="cot-empty-row">
                                                    <i className="fas fa-box-open cot-empty-icon"></i>
                                                    <p>No hay productos agregados</p>
                                                    <span>Presione "Agregar Producto" para seleccionar de los productos registrados</span>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totales y Acciones */}
                        <div className="cot-footer">
                            <div className="cot-totals-card">
                                <div className="cot-total-row">
                                    <span>Subtotal:</span>
                                    <span className="cot-total-value">S/ {cotizacionData.subtotal}</span>
                                </div>
                                <div className="cot-total-row cot-grand-total">
                                    <span>TOTAL:</span>
                                    <span className="cot-grand-total-value">S/ {cotizacionData.importeTotal}</span>
                                </div>
                            </div>
                            <div className="cot-action-buttons">
                                <button className="cot-btn cot-btn-outline" onClick={handleGuardar}>
                                    <i className="fas fa-save me-2"></i> Guardar
                                </button>
                                <button className="cot-btn cot-btn-success" onClick={handleGenerarPDF}>
                                    <i className="fas fa-file-pdf me-2"></i> Generar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============================
    // VISTA PREVIA (PDF)
    // ============================
    return (
        <div className="cot-preview-page">
            {/* Barra flotante de acciones */}
            <div className="cot-preview-actions">
                <button className="cot-fab cot-fab-secondary" onClick={() => setModoVista('form')} title="Volver a editar">
                    <i className="fas fa-arrow-left"></i>
                </button>
                <button className="cot-fab cot-fab-primary" onClick={descargarPDF} title="Descargar PDF">
                    <i className="fas fa-download"></i>
                </button>
            </div>

            {/* Documento PDF (Formato Ticket 80mm) */}
            <div className="cot-pdf-paper" ref={pdfRef}>
                {/* Encabezado del Ticket */}
                <div className="cot-ticket-header">
                    <img src={logo} alt="Logo" className="cot-ticket-logo" />
                    <div className="cot-ticket-company">ASEO 360</div>
                    <div className="cot-ticket-ruc">RUC: 20611306963</div>
                    {cotizacionData.direccionTienda && (
                        <div className="cot-ticket-address">{cotizacionData.direccionTienda}</div>
                    )}
                    <div className="cot-ticket-divider"></div>
                    <div className="cot-ticket-title">COTIZACIÓN</div>
                    <div className="cot-ticket-date">{formatearFecha(cotizacionData.fechaEmision)}</div>
                </div>

                <div className="cot-ticket-divider-dash"></div>

                {/* Info del Cliente */}
                <div className="cot-ticket-info">
                    <div className="cot-ticket-row">
                        <span className="cot-ticket-label">Cliente:</span>
                        <span className="cot-ticket-value">{cotizacionData.clienteNombre}</span>
                    </div>
                    <div className="cot-ticket-row">
                        <span className="cot-ticket-label">Vendedor:</span>
                        <span className="cot-ticket-value">{cotizacionData.vendedor}</span>
                    </div>
                </div>

                {cotizacionData.observacion && (
                    <div className="cot-ticket-obs">
                        Nota: {cotizacionData.observacion}
                    </div>
                )}

                <div className="cot-ticket-divider-dash"></div>

                {/* Tabla de Productos */}
                <table className="cot-ticket-table">
                    <thead>
                        <tr>
                            <th className="cot-t-cant">CANT</th>
                            <th className="cot-t-desc">DESCRIPCIÓN</th>
                            <th className="cot-t-total">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cotizacionData.items.map((item, index) => (
                            !item.idProducto ? null :
                                <tr key={index}>
                                    <td className="cot-t-cant">{item.cantidad}</td>
                                    <td className="cot-t-desc">
                                        {item.descripcion}
                                        {item.presentacion && <div className="cot-t-sub">{item.presentacion}</div>}
                                        <div className="cot-t-sub">PU: S/{parseFloat(item.precioUnitario).toFixed(2)} {item.esPrecioMayor ? '(x Mayor)' : ''}</div>
                                    </td>
                                    <td className="cot-t-total">S/{item.total}</td>
                                </tr>
                        ))}
                    </tbody>
                </table>

                <div className="cot-ticket-divider-dash"></div>

                {/* Totales */}
                <div className="cot-ticket-totals">
                    <div className="cot-ticket-total-row">
                        <span>Subtotal:</span>
                        <span>S/ {cotizacionData.subtotal}</span>
                    </div>
                    <div className="cot-ticket-total-row cot-ticket-grand">
                        <span>TOTAL:</span>
                        <span>S/ {cotizacionData.importeTotal}</span>
                    </div>
                </div>

                <div className="cot-ticket-divider"></div>

                {/* Pie de Ticket */}
                <div className="cot-ticket-footer">
                    <p>¡Gracias por su preferencia!</p>
                    <p className="cot-ticket-firma">ASEO 360</p>
                </div>
            </div>
        </div>
    );
};
export default Cotizacion;
