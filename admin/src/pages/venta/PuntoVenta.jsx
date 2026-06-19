import React, { useState, useEffect } from 'react';
import './PuntoVenta.css';
import { InventarioService } from '../../services/InventarioService';
import { KardexService } from '../../services/KardexService';
import { ClienteTiendaService } from '../../services/ClienteTiendaService';
import { VentaService } from '../../services/VentaService';
import { ComprobanteService } from '../../services/ComprobanteService';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import logo from '../../assets/imagenes/logo.png';

const PuntoVenta = () => {
    // Estados principales del punto de venta
    const [carrito, setCarrito] = useState([]);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
    const [productos, setProductos] = useState([]);
    const [codigoEscaneado, setCodigoEscaneado] = useState('');

    // Cargar clientes e inventarios al montar el componente
    useEffect(() => {
        cargarInventarios();
        cargarClientes();
    }, []);

    const [inventarios, setInventarios] = useState([]);
    const [inventarioSeleccionado, setInventarioSeleccionado] = useState('');

    // Escuchar el cambio del selector
    useEffect(() => {
        if (inventarioSeleccionado) {
            cargarProductos(inventarioSeleccionado);
        } else {
            setProductos([]); // Limpiar grilla si no hay nada
        }
    }, [inventarioSeleccionado]);

    const cargarInventarios = async () => {
        try {
            const data = await InventarioService.getInventariosList();
            setInventarios(data || []);
        } catch (error) {
        }
    };

    const cargarProductos = async (idInv) => {
        try {
            const productosBackend = await InventarioService.getProductosDisponiblesPorInventario(idInv);
            const productosData = Array.isArray(productosBackend) ? productosBackend : [];

            // El backend devuelve Lista de InventarioProducto ahora, cuyo hijo '.producto' tiene la info general.
            const productosMapeados = productosData.map(ip => ({
                id: ip.producto.idProducto,
                nombre: ip.producto.nombre,
                precio: parseFloat(ip.producto.precioVenta),
                precioMayor: parseFloat(ip.producto.precioPorMayor || ip.producto.precioVenta),
                stock: ip.stock,
                categoria: ip.producto.idCategoriaProducto,
                inventarioId: ip.inventario.idInventario
            }));
            setProductos(productosMapeados);
        } catch (error) {
            setProductos([]);
        }
    };

    // Estado del cliente seleccionado y lista de clientes
    const [cliente, setCliente] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [documentoBusqueda, setDocumentoBusqueda] = useState('');
    const [mostrarModalNuevoCliente, setMostrarModalNuevoCliente] = useState(false);
    const [datosNuevoCliente, setDatosNuevoCliente] = useState({ nombreCompleto: '', dni: '', correo: '', direccion: '', origen: 'pos' });

    // Estado del proceso de Venta y Resultado
    const [isProcessing, setIsProcessing] = useState(false);
    const [ventaResultado, setVentaResultado] = useState(null);

    // Método de pago y tipo de comprobante
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [tipoComprobante, setTipoComprobante] = useState('boleta');
    const [proximoCorrelativo, setProximoCorrelativo] = useState('');

    useEffect(() => {
        const fetchCorrelativo = async () => {
            try {
                let serie = 'B001';
                if (tipoComprobante === 'ticket') serie = 'T001';
                if (tipoComprobante === 'factura') serie = 'F001';
                const tipo = tipoComprobante.toUpperCase();
                const sgt = await ComprobanteService.obtenerSiguienteNumero(tipo, serie);
                setProximoCorrelativo(`${serie}-${sgt}`);
            } catch (error) {
                setProximoCorrelativo('...');
            }
        };
        fetchCorrelativo();
    }, [tipoComprobante, ventaResultado]);

    const cargarClientes = async () => {
        try {
            const data = await ClienteTiendaService.getAll();
            setClientes(data || []);
        } catch (error) {
        }
    };

    // --- Funciones del Escáner ---

    const handleEscaneoProducto = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const codigo = codigoEscaneado.trim();
            if (!codigo) return;

            const productoEncontrado = productos.find(p => String(p.id) === codigo);

            if (productoEncontrado) {
                if (productoEncontrado.stock <= 0) {
                    toast.error('Stock no suficiente (0). Intente seleccionando otro inventario en el menú superior.');
                } else {
                    agregarAlCarrito(productoEncontrado);
                }
            } else {
                toast.error('Producto no encontrado');
            }

            setCodigoEscaneado(''); // Limpia el input para el siguiente escaneo
        }
    };

    // --- Funciones del Carrito ---

    const agregarAlCarrito = (producto) => {
        const itemExistente = carrito.find(item => item.id === producto.id);
        if (itemExistente && itemExistente.cantidad + 1 > producto.stock) {
            toast.error(`Stock máximo alcanzado (${producto.stock}). Intente seleccionando otro inventario.`);
            return;
        }
        if (!itemExistente && producto.stock <= 0) {
            toast.error('Stock no suficiente (0). Intente seleccionando otro inventario en el menú superior.');
            return;
        }

        setCarrito(prev => {
            const existe = prev.find(item => item.id === producto.id);
            if (existe) {
                return prev.map(item =>
                    item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }
            return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const quitarDelCarrito = (idProducto) => {
        setCarrito(prev => prev.filter(item => item.id !== idProducto));
    };

    const actualizarCantidad = (idProducto, incremento) => {
        const itemTarget = carrito.find(i => i.id === idProducto);
        if (itemTarget && incremento > 0 && itemTarget.cantidad + incremento > itemTarget.stock) {
            toast.error(`Stock máximo alcanzado (${itemTarget.stock}). Intente seleccionando otro inventario.`);
            return;
        }

        setCarrito(prev => prev.map(item => {
            if (item.id === idProducto) {
                const nuevaCantidad = Math.max(1, item.cantidad + incremento);
                return { ...item, cantidad: nuevaCantidad };
            }
            return item;
        }));
    };

    const totalVenta = carrito.reduce((suma, item) => {
        const precioAplicable = item.cantidad > 3 ? item.precioMayor : item.precio;
        return suma + (precioAplicable * item.cantidad);
    }, 0);

    // --- Funciones de Cliente ---

    const buscarClienteParaVenta = () => {
        if (!documentoBusqueda.trim()) return;

        const clienteEncontrado = clientes.find(c => c.dni === documentoBusqueda.trim());
        if (clienteEncontrado) {
            setCliente(clienteEncontrado);
            setDocumentoBusqueda('');
        } else {
            // Si no existe, prellenamos el DNI/RUC y abrimos el modal
            setDatosNuevoCliente(prev => ({ ...prev, dni: documentoBusqueda.trim() }));
            setMostrarModalNuevoCliente(true);
        }
    };

    const handleRegistrarCliente = async (e) => {
        e.preventDefault();

        // Validación de longitud (8 para DNI o 11 para RUC)
        const docLength = datosNuevoCliente.dni?.trim().length;
        if (docLength !== 8 && docLength !== 11) {
            toast.warning('El documento debe ser un DNI (8 dígitos) o RUC (11 dígitos).');
            return;
        }

        try {
            // Guardar cliente en el backend usando el servicio de cliente de tienda
            const nuevo = await ClienteTiendaService.create({
                nombreCompleto: datosNuevoCliente.nombreCompleto,
                dni: datosNuevoCliente.dni,
                correo: datosNuevoCliente.correo || null,
                direccion: datosNuevoCliente.direccion || null
            });
            setCliente(nuevo);
            setMostrarModalNuevoCliente(false);
            setDocumentoBusqueda('');
            setDatosNuevoCliente({ nombreCompleto: '', dni: '', correo: '', direccion: '', origen: 'pos' });
            cargarClientes(); // Recargar la lista
            toast.success('Cliente registrado correctamente');
        } catch (error) {
            toast.error('Ocurrió un error al registrar el cliente. Verifique los datos.');
        }
    };

    // --- Procesar Venta ---

    const handleProcesarVenta = async () => {
        if (carrito.length === 0) {
            toast.warning('El carrito está vacío');
            return;
        }

        if (!inventarioSeleccionado) {
            toast.warning('Debe seleccionar un Inventario específico antes de procesar la venta');
            return;
        }

        if (!cliente) {
            toast.warning('Debe buscar y seleccionar un Cliente (DNI/RUC) antes de registrar la venta');
            setIsProcessing(false);
            return;
        }

        if (tipoComprobante === 'factura' && cliente.dni?.length !== 11) {
            toast.error('Para emitir Factura, el cliente debe tener un RUC válido de 11 dígitos.');
            setIsProcessing(false);
            return;
        }

        try {
            setIsProcessing(true);

            const productoList = carrito.map(item => ({
                idProducto: item.id,
                cantidad: item.cantidad
            }));

            const ventaPayload = {
                idClienteTienda: cliente.idClienteTienda || cliente.id,
                idInventario: parseInt(inventarioSeleccionado),
                formaPago: metodoPago.toUpperCase(),
                tipoDocumento: tipoComprobante.toUpperCase(),
                estado: 'PAGADO',
                productoList: productoList
            };

            const resultado = await VentaService.registrarVenta(ventaPayload);

            toast.success(`¡Venta Registrada con Éxito! Total: S/ ${totalVenta.toFixed(2)} - Pago: ${metodoPago.toUpperCase()}`);

            // Adjuntar datos extra para el ticket interno antes de limpiar
            resultado.items = [...carrito];
            resultado.clienteData = { ...cliente };
            resultado.subtotal = totalVenta.toFixed(2);
            resultado.fechaTicket = new Date().toLocaleString();

            setVentaResultado(resultado);
            setCarrito([]);
            setCliente(null);
            cargarProductos(inventarioSeleccionado);
        } catch (error) {
            const backendMsg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : "Error de comunicación con el servidor");
            toast.error(`No se pudo procesar: ${backendMsg}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const descargarTicketInterno = () => {
        if (!ventaResultado) return;
        const element = document.getElementById('ticket-interno-pdf');
        if (!element) return;

        const opt = {
            margin: [2, 2, 2, 2],
            filename: `Ticket_Interno_${ventaResultado.serieNumero}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: [80, 297], orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            toast.success('Ticket interno generado.');
        });
    };

    const productosFiltrados = !inventarioSeleccionado ? [] : productos.filter(p =>
        p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) &&
        (categoriaSeleccionada === 'todos' || p.categoria === categoriaSeleccionada) &&
        String(p.inventarioId) === String(inventarioSeleccionado)
    );

    return (
        <div className="pos-container flex-grow-1 bg-white d-flex w-100 shadow rounded-4 overflow-hidden">
            {/* Sección Izquierda: Catálogo de Productos */}
            <div className="pos-products-section flex-grow-1 p-4 d-flex flex-column h-100 bg-white" style={{ overflowY: 'auto' }}>
                <div className="pos-search-bar d-flex gap-2">
                    <select
                        className="form-select w-auto shadow-sm border-primary text-primary fw-bold"
                        value={inventarioSeleccionado}
                        onChange={e => {
                            const nuevoInventario = e.target.value;
                            if (carrito.length > 0) {
                                Swal.fire({
                                    title: '¿Cambiar de inventario?',
                                    text: "Si cambias de inventario, se vaciará tu carrito actual.",
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'Sí, cambiar y vaciar',
                                    cancelButtonText: 'Cancelar'
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        setCarrito([]);
                                        setInventarioSeleccionado(nuevoInventario);
                                        toast.info('El carrito se ha vaciado por el cambio de inventario.');
                                    }
                                });
                            } else {
                                setInventarioSeleccionado(nuevoInventario);
                            }
                        }}
                        style={{ borderRadius: '50px', paddingLeft: '1.2rem', paddingRight: '2.5rem' }}
                    >
                        <option value="" disabled>-- Seleccione su Inventario --</option>
                        {inventarios.map(inv => (
                            <option key={inv.idInventario || inv.id} value={inv.idInventario || inv.id}>{inv.nombre}</option>
                        ))}
                    </select>

                    <div className="position-relative flex-grow-1">
                        <i className="fas fa-search pos-search-icon"></i>
                        <input
                            type="text"
                            className="pos-search-input w-100"
                            placeholder="Buscar productos..."
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                        />
                    </div>
                </div>


                {inventarioSeleccionado ? (
                    <div className="products-grid mt-3">
                        {productosFiltrados.length > 0 ? productosFiltrados.map(producto => (
                            <div
                                key={producto.id}
                                className={`product-card position-relative overflow-hidden shadow-sm ${producto.stock <= 0 ? 'bg-light' : ''}`}
                                style={{
                                    borderLeft: `5px solid ${producto.stock <= 0 ? '#6c757d' : producto.stock < 10 ? '#dc3545' : producto.stock <= 15 ? '#ffc107' : '#198754'}`,
                                    opacity: producto.stock <= 0 ? 0.6 : 1,
                                    cursor: producto.stock <= 0 ? 'not-allowed' : 'pointer'
                                }}
                                onClick={() => {
                                    if (producto.stock <= 0) {
                                        toast.error('Stock no suficiente (0). Intente seleccionando otro inventario en el menú superior.');
                                        return;
                                    }
                                    agregarAlCarrito(producto);
                                }}
                            >
                                <div style={{ fontSize: '3rem', color: '#e9ecef' }}><i className="fas fa-box"></i></div>
                                <div className="d-flex flex-column h-100 justify-content-between">
                                    <h5 className="product-name fw-bold mb-1">{producto.nombre}</h5>
                                    <div>
                                        <div className="product-price text-primary fw-bold mb-1">S/ {producto.precio.toFixed(2)}</div>
                                        <div className={`badge rounded-pill ${producto.stock <= 0 ? 'bg-secondary' : producto.stock < 10 ? 'bg-danger' : producto.stock <= 15 ? 'bg-warning text-dark' : 'bg-success'}`}>
                                            <i className="fas fa-cubes me-1"></i> Stock: {producto.stock}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="d-flex flex-column justify-content-center align-items-center p-5 w-100 h-100" style={{ gridColumn: '1 / -1', minHeight: '350px' }}>
                                <div className="bg-light rounded-circle d-flex justify-content-center align-items-center mb-4 shadow-sm" style={{ width: '130px', height: '130px' }}>
                                    <i className="fas fa-box-open fa-4x text-secondary opacity-50"></i>
                                </div>
                                <h4 className="fw-bold text-secondary mb-2">Inventario Vacío</h4>
                                <p className="text-muted text-center" style={{ maxWidth: '450px' }}>Actualmente no hay productos registrados en el inventario seleccionado. Intente seleccionando otro diferente o recargue la página.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted p-5">
                        <i className="fas fa-dolly fa-4x mb-4 text-primary opacity-50"></i>
                        <h4 className="fw-bold">Seleccione un Inventario</h4>
                        <p className="text-center">Por favor, utilice el menú desplegable en la barra de búsqueda para elegir el inventario desde donde registrará las ventas.</p>
                    </div>
                )}
            </div>

            {/* Sección Derecha: Carrito de Venta */}
            <div className="pos-cart-section d-flex flex-column bg-white shadow-sm" style={{ width: '400px', borderLeft: '1px solid #e9ecef', height: '100%', maxHeight: '100%' }}>

                {/* 1. Header & Client Selector (Fixed Top) */}
                <div className="p-3 border-bottom bg-light">
                    <h5 className="mb-3 fw-bold text-dark"><i className="fas fa-shopping-cart text-primary me-2"></i>Venta Actual</h5>
                    {cliente ? (
                        <div className="d-flex justify-content-between align-items-center bg-white border border-primary rounded-3 p-2 shadow-sm">
                            <span className="text-primary fw-bold text-truncate" style={{ fontSize: '0.9rem' }}><i className="fas fa-user me-2"></i>{cliente.nombreCompleto}</span>
                            <button className="btn btn-sm text-danger p-0 m-0" onClick={() => setCliente(null)}>
                                <i className="fas fa-times-circle fs-5"></i>
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex gap-2">
                            <input
                                type="text"
                                className={`form-control form-control-sm rounded-3 ${documentoBusqueda.length === 8 ? 'text-primary border-primary border-2 fw-bold' : documentoBusqueda.length === 11 ? 'text-success border-success border-2 fw-bold' : ''}`}
                                placeholder="DNI / RUC..."
                                minLength={8}
                                maxLength={11}
                                value={documentoBusqueda}
                                onChange={e => setDocumentoBusqueda(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') buscarClienteParaVenta() }}
                            />
                            <button className="btn btn-sm btn-primary rounded-3 px-3" onClick={buscarClienteParaVenta}>
                                <i className="fas fa-search"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-primary rounded-3 px-3" onClick={() => { setDatosNuevoCliente({ ...datosNuevoCliente, dni: '' }); setMostrarModalNuevoCliente(true); }}>
                                <i className="fas fa-user-plus"></i>
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. Scanner Area (Fixed Top) */}
                <div className="p-3 bg-white border-bottom">
                    <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                        <span className="input-group-text bg-light border-0 text-primary px-3">
                            <i className="fas fa-barcode"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-0 shadow-none bg-light fw-bold"
                            placeholder="Escanea el código de barras..."
                            value={codigoEscaneado}
                            onChange={(e) => setCodigoEscaneado(e.target.value)}
                            onKeyDown={handleEscaneoProducto}
                            autoFocus
                        />
                    </div>
                </div>

                {/* 3. Cart Items (Scrollable Middle) - SOLUCION INFALIBLE DE SCROLL */}
                <div className="flex-grow-1 bg-light">
                    <div className=" top-0 start-0 w-100 h-100 p-3 d-flex flex-column" style={{ overflowY: 'auto' }}>
                        {carrito.length === 0 ? (
                            <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted m-3 p-4 bg-white rounded-4 border shadow-sm" style={{ borderStyle: 'dashed !important', borderWidth: '2px !important' }}>
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '100px', height: '100px' }}>
                                    <i className="fas fa-shopping-cart fa-3x text-primary opacity-50"></i>
                                </div>
                                <h5 className="fw-bold text-secondary mb-2">Tu carrito está vacío</h5>
                                <p className="text-center text-muted mb-0 px-3">Escanea el código de barras o selecciona productos del catálogo para comenzar la venta.</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3 mb-2">
                                {carrito.map(item => {
                                    const esPorMayor = item.cantidad > 3;
                                    const precioAplicable = esPorMayor ? item.precioMayor : item.precio;

                                    return (
                                        <div key={item.id} className="card border-0 shadow-sm rounded-4 overflow-hidden position-relative p-2">
                                            <div className="bg-primary position-absolute top-0 bottom-0 start-0" style={{ width: '5px' }}></div>
                                            <div className="card-body p-2 ps-4 d-flex align-items-center">

                                                <div className="flex-grow-1 me-3 overflow-hidden">
                                                    <h6 className="mb-1 fw-bold text-dark text-truncate" style={{ fontSize: '1rem' }}>{item.nombre}</h6>
                                                    <div className="d-flex align-items-center gap-2 mt-1">
                                                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">S/ {precioAplicable.toFixed(2)} c/u</span>
                                                        {esPorMayor && (
                                                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25" style={{ fontSize: '0.65rem' }}>
                                                                <i className="fas fa-tags me-1"></i>x Mayor
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center bg-light rounded-pill border p-1 me-4 shadow-sm">
                                                    <button className="btn btn-sm p-1 text-secondary border-0 hover-bg-light rounded-circle" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => actualizarCantidad(item.id, -1)}>
                                                        <i className="fas fa-minus" style={{ fontSize: '0.8rem' }}></i>
                                                    </button>
                                                    <span className="fw-bold text-center mx-2 fs-6" style={{ minWidth: '30px' }}>{item.cantidad}</span>
                                                    <button className="btn btn-sm p-1 text-secondary border-0 hover-bg-light rounded-circle" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => actualizarCantidad(item.id, 1)}>
                                                        <i className="fas fa-plus" style={{ fontSize: '0.8rem' }}></i>
                                                    </button>
                                                </div>

                                                <div className="text-end d-flex flex-column justify-content-center align-items-end" style={{ minWidth: '90px', borderLeft: '1px solid #dee2e6', paddingLeft: '1rem' }}>
                                                    <h5 className="fw-bold text-dark mb-2 m-0 text-nowrap">S/ {(precioAplicable * item.cantidad).toFixed(2)}</h5>
                                                    <button className="btn btn-outline-danger btn-sm rounded-pill p-1 px-3 d-flex align-items-center gap-1" onClick={() => quitarDelCarrito(item.id)}>
                                                        <i className="fas fa-trash-alt" style={{ fontSize: '0.75rem' }}></i> <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Quitar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Footer Checkout (Fixed Bottom) */}
                <div className="p-3 bg-white border-top shadow-lg">
                    {/* Opciones */}
                    <div className="row g-2 mb-3">
                        <div className="col-12">
                            <label className="form-label text-muted small fw-bold mb-1">COMPROBANTE</label>
                            <div className="d-flex gap-1">
                                {['ticket', 'boleta', 'factura'].map(tipo => (
                                    <button
                                        key={tipo}
                                        className={`btn btn-sm rounded-3 border fw-bold flex-grow-1 text-capitalize ${tipoComprobante === tipo ? 'btn-primary text-white border-primary' : 'btn-light text-secondary'}`}
                                        onClick={() => setTipoComprobante(tipo)}
                                    >
                                        {tipo}
                                    </button>
                                ))}
                            </div>
                            <div className="text-end mt-1">
                                <span className="badge bg-secondary opacity-75 fw-normal">Próximo: {proximoCorrelativo}</span>
                            </div>
                        </div>
                        <div className="col-12 mt-2">
                            <label className="form-label text-muted small fw-bold mb-1">MÉTODO DE PAGO</label>
                            <div className="row g-1">
                                {['efectivo', 'yape', 'plin', 'transferencia'].map(metodo => (
                                    <div className="col-6" key={metodo}>
                                        <button
                                            className={`btn btn-sm w-100 rounded-3 border fw-bold text-capitalize d-flex justify-content-center align-items-center gap-1 ${metodoPago === metodo ? 'btn-dark text-white border-dark' : 'btn-light text-secondary'}`}
                                            onClick={() => setMetodoPago(metodo)}
                                            style={{ padding: '0.4rem' }}
                                        >
                                            <i className={`fas fa-${metodo === 'efectivo' ? 'money-bill-wave' : metodo === 'transferencia' ? 'university' : 'mobile-alt'} ${metodoPago === metodo ? '' : 'text-primary'}`}></i>
                                            {metodo}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Total y Botón */}
                    <div className="bg-light rounded-3 p-3 mb-3 border border-primary border-opacity-25 d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-secondary text-uppercase" style={{ fontSize: '0.85rem' }}>Total</span>
                        <span className="fw-bold text-primary fs-4 mb-0">S/ {totalVenta.toFixed(2)}</span>
                    </div>

                    <button
                        className="btn btn-primary w-100 rounded-pill py-3 fw-bold fs-5 shadow-sm transition-all d-flex justify-content-center align-items-center gap-2"
                        onClick={handleProcesarVenta}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                PROCESANDO...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-check-circle"></i>COMPLETAR VENTA
                            </>
                        )}
                    </button>
                </div>
            </div>
            {/* Modal Nuevo Cliente */}
            {mostrarModalNuevoCliente && (
                <div className="modal-overlay">
                    <div className="modal-content-custom">
                        <h4 className="mb-4">Nuevo Cliente</h4>
                        <form onSubmit={handleRegistrarCliente}>
                            <div className="form-group">
                                <label className="form-label">Nombre Completo</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={datosNuevoCliente.nombreCompleto}
                                    onChange={e => setDatosNuevoCliente({ ...datosNuevoCliente, nombreCompleto: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">DNI / RUC</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    minLength={8}
                                    maxLength={11}
                                    value={datosNuevoCliente.dni}
                                    onChange={e => {
                                        const valorLimpio = e.target.value.replace(/\D/g, '');
                                        setDatosNuevoCliente({ ...datosNuevoCliente, dni: valorLimpio });
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Correo (Opcional)</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={datosNuevoCliente.correo}
                                    onChange={e => setDatosNuevoCliente({ ...datosNuevoCliente, correo: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dirección (Opcional)</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    value={datosNuevoCliente.direccion}
                                    onChange={e => setDatosNuevoCliente({ ...datosNuevoCliente, direccion: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button type="button" className="btn btn-secondary" onClick={() => setMostrarModalNuevoCliente(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Venta Exitosa */}
            {ventaResultado && (
                <div className="modal-overlay" style={{ zIndex: 1050 }}>
                    <div className="modal-content-custom text-center" style={{ maxWidth: '400px' }}>
                        <div className="mb-4">
                            <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h3 className="fw-bold mb-1">¡Venta Exitosa!</h3>
                        <p className="text-muted mb-4">{ventaResultado.mensaje || 'Comprobante generado correctamente'}</p>

                        <div className="bg-light p-3 rounded-3 mb-4 text-start border">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small fw-bold">N° de Venta:</span>
                                <span className="fw-bold">{ventaResultado.serieNumero}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small fw-bold">Cliente:</span>
                                <span className="fw-bold text-end" style={{ maxWidth: '60%' }}>{ventaResultado.cliente || 'CLIENTE GENERAL'}</span>
                            </div>
                            <div className="d-flex justify-content-between border-top pt-2 mt-2">
                                <span className="text-muted small fw-bold">Total:</span>
                                <span className="fw-bold text-primary fs-5">S/ {ventaResultado.total?.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="d-flex flex-column gap-2 mb-4">
                            {ventaResultado.enlacePdfTicket && (
                                <a href={ventaResultado.enlacePdfTicket} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark fw-bold d-flex align-items-center justify-content-center gap-2">
                                    <i className="fas fa-receipt"></i> DESCARGAR TICKET (SUNAT)
                                </a>
                            )}
                            {ventaResultado.enlacePdfA4 && (
                                <a href={ventaResultado.enlacePdfA4} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary fw-bold d-flex align-items-center justify-content-center gap-2">
                                    <i className="fas fa-file-pdf"></i> DESCARGAR A4 (SUNAT)
                                </a>
                            )}
                            {!ventaResultado.enlacePdfTicket && !ventaResultado.enlacePdfA4 && (
                                <button onClick={descargarTicketInterno} className="btn btn-outline-dark fw-bold d-flex align-items-center justify-content-center gap-2">
                                    <i className="fas fa-print"></i> DESCARGAR TICKET INTERNO
                                </button>
                            )}
                        </div>

                        <button
                            className="btn btn-primary w-100 fw-bold py-2 rounded-pill"
                            onClick={() => setVentaResultado(null)}
                        >
                            NUEVA VENTA
                        </button>
                    </div>
                </div>
            )}

            {/* Render oculto del ticket interno para html2pdf */}
            {ventaResultado && !ventaResultado.enlacePdfTicket && !ventaResultado.enlacePdfA4 && (
                <div style={{ display: 'none' }}>
                    <div id="ticket-interno-pdf" className="cot-pdf-paper bg-white text-dark p-2" style={{ width: '80mm', minHeight: '150mm', fontSize: '10px', fontFamily: 'monospace' }}>
                        <div className="text-center mb-2">
                            <img src={logo} alt="Logo" style={{ maxWidth: '50mm', maxHeight: '25mm', filter: 'grayscale(100%)' }} />
                            <div className="fw-bold" style={{ fontSize: '16px' }}>ASEO 360</div>
                            <div>RUC: 20611306963</div>
                            <div style={{ borderBottom: '1px solid #000', margin: '6px 0' }}></div>
                            <div className="fw-bold" style={{ fontSize: '14px' }}>TICKET VENTA</div>
                            <div>{ventaResultado.fechaTicket}</div>
                        </div>

                        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

                        <div className="mb-2">
                            <div className="d-flex gap-1 justify-content-start"><span className="fw-bold">Cliente:</span> <span>{ventaResultado.clienteData?.nombreCompleto || 'CLIENTE GENERAL'}</span></div>
                            <div className="d-flex gap-1 justify-content-start"><span className="fw-bold">Comprobante:</span> <span>{ventaResultado.serieNumero}</span></div>
                            <div className="d-flex gap-1 justify-content-start"><span className="fw-bold">PAGO:</span> <span>{metodoPago.toUpperCase()}</span></div>
                        </div>

                        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '15%', textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '4px' }}>CANT</th>
                                    <th style={{ width: '60%', textAlign: 'left', borderBottom: '1px dashed #000', paddingBottom: '4px' }}>DESCRIPCIÓN</th>
                                    <th style={{ width: '25%', textAlign: 'right', borderBottom: '1px dashed #000', paddingBottom: '4px' }}>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ventaResultado.items?.map((item, idx) => {
                                    const esPorMayor = item.cantidad > 3;
                                    const precioAplicable = esPorMayor ? item.precioMayor : item.precio;
                                    return (
                                        <tr key={idx}>
                                            <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '4px' }}>{item.cantidad}</td>
                                            <td style={{ textAlign: 'left', verticalAlign: 'top', paddingLeft: '4px', paddingTop: '4px' }}>
                                                {item.nombre}
                                                <div style={{ fontSize: '9px', color: '#555' }}>PU: S/ {precioAplicable.toFixed(2)}</div>
                                            </td>
                                            <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '4px', fontWeight: 'bold' }}>S/ {(precioAplicable * item.cantidad).toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

                        <div className="d-flex flex-column align-items-end mt-2">
                            <div className="d-flex justify-content-between w-75 fw-bold" style={{ fontSize: '13px', borderTop: '1px solid #000', paddingTop: '4px' }}>
                                <span>TOTAL:</span>
                                <span>S/ {ventaResultado.subtotal}</span>
                            </div>
                        </div>

                        <div style={{ borderBottom: '1px solid #000', margin: '8px 0' }}></div>

                        <div className="text-center mt-3" style={{ fontSize: '10px' }}>
                            <p>¡Gracias por su compra!</p>
                            <p className="fw-bold mt-4 pt-2" style={{ borderTop: '1px solid #000', display: 'inline-block', width: '60%' }}>ASEO 360</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PuntoVenta;
