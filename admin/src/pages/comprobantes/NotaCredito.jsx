import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import logo from '../../assets/imagenes/logo.png';
import './NotaCredito.css';

const NotaCredito = () => {
    const [modoVista, setModoVista] = useState('form');

    // Estado inicial mejorado para ERP (Nota de Crédito)
    const estadoInicial = {
        razonSocialEmisor: 'INVERSIONES GENERALES T & C S.A.C.',
        rucEmisor: '206011306963',
        direccionEmisor: 'AV. PRINCIPAL 123 - LIMA',
        logoUrl: logo,

        // Cabecera principal
        fechaEmision: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }),
        tipoCambio: '3.356',
        serie: 'BC01',
        numero: '00000001',
        diasVencimiento: '0',
        fechaVencimiento: new Date().toISOString().split('T')[0],
        moneda: 'SOLES',

        // Selecciones
        establecimiento: 'DOMICILIO FISCAL',
        almacen: 'ALM. CHICLAYO',
        listaPrecio: 'PRINCIPAL',
        vendedor: 'JOSSELINE KIMBERLY REAT...',

        // Cliente
        clienteNombre: 'CLIENTE VARIOS',
        clienteDocumento: '00000000',
        clienteDireccion: 'DOMICILIO FISCAL - PRINCIPAL',
        clienteEmail: '',
        proyecto: '',

        // Específicos Nota de Crédito
        motivo: 'ANULACION DE LA OPERACION',
        formaPago: 'CONTADO',
        docReferencia: '', // Serie y número del documento afectado
        exportacion: false,
        igvPercent: '18',

        // Detalle y Totales
        items: [],
        totalDetalle: 0,
        importeDescuento: 0,
        subtotal: 0,
        igv: 0,
        isc: 0,
        importeTotal: 0,
        montoLetras: ''
    };

    const [notaData, setNotaData] = useState(estadoInicial);

    // Calcular totales avanzados
    useEffect(() => {
        const totalDetalleSuma = notaData.items.reduce((sum, item) => sum + (parseFloat(item.totalDetalle) || 0), 0);
        const totalDesc = notaData.items.reduce((sum, item) => {
            const cant = parseFloat(item.cantidad) || 0;
            const precio = parseFloat(item.precioUnitario) || 0;
            const sub = cant * precio;
            return sum + (sub - (parseFloat(item.total) || 0));
        }, 0);

        const total = notaData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
        const igvFactor = (parseFloat(notaData.igvPercent) || 0) / 100;
        const subtotal = total / (1 + igvFactor);
        const igv = total - subtotal;

        setNotaData(prev => ({
            ...prev,
            totalDetalle: totalDetalleSuma.toFixed(2),
            importeDescuento: totalDesc.toFixed(2),
            subtotal: subtotal.toFixed(2),
            igv: igv.toFixed(2),
            isc: (0).toFixed(2),
            importeTotal: total.toFixed(2),
            montoLetras: `SON: ${total.toFixed(2)} / 100 SOLES`
        }));
    }, [notaData.items, notaData.igvPercent]);

    const handleCambioItem = (index, field, value) => {
        const nuevosItems = [...notaData.items];
        const item = { ...nuevosItems[index] };

        if (field === 'afectoIgv' || field === 'exonerado' || field === 'gratuito') {
            item[field] = value === 'true' || value === true;
        } else {
            item[field] = value;
        }

        // Cálculos de línea
        const cant = parseFloat(item.cantidad) || 0;
        const precio = parseFloat(item.precioUnitario) || 0;
        const sub = cant * precio;
        item.totalDetalle = sub.toFixed(2);

        // En Nota de Crédito el total suele ser igual al detalle menos descuentos si los hay
        // Para simplificar usaremos el mismo sistema que los otros documentos
        item.total = sub.toFixed(2);

        nuevosItems[index] = item;
        setNotaData(prev => ({ ...prev, items: nuevosItems }));
    };

    const agregarItem = () => {
        setNotaData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    codigo: '',
                    descripcion: '',
                    unidad: 'UND',
                    afectoIgv: true,
                    exonerado: false,
                    gratuito: false,
                    precioUnitario: 0,
                    cantidad: 1,
                    totalDetalle: 0,
                    total: 0
                }
            ]
        }));
    };

    const eliminarItem = (index) => {
        if (notaData.items.length > 0) {
            setNotaData(prev => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNotaData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleGenerar = () => {
        toast.info('Nota de Crédito GENERADA (pendiente guardar en BD).');
    };

    if (modoVista === 'form') {
        return (
            <div className="container-fluid mt-3 mb-5 px-4">
                {/* Barra de Acciones Superior */}
                <div className="d-flex justify-content-end gap-2 mb-3 bg-white p-2 shadow-sm rounded">
                    <button className="btn btn-sm btn-primary px-3">
                        <i className="fas fa-plus me-1"></i> Nuevo
                    </button>
                    <button className="btn btn-sm btn-outline-secondary px-3">
                        <i className="fas fa-search me-1"></i> Buscar
                    </button>
                    <button className="btn btn-sm btn-outline-danger px-3">
                        <i className="fas fa-eraser me-1"></i> Limpiar
                    </button>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white border-bottom py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold text-dark text-danger">Registrar Nota de Crédito</h5>
                            <div className="d-flex gap-2">
                                <button className="btn btn-warning btn-sm px-3" onClick={() => toast.info('Generando Guía...')}>
                                    <i className="fas fa-truck me-1"></i> Generar Guía
                                </button>
                                <button className="btn btn-success btn-sm px-3">
                                    <i className="fas fa-file-excel me-1"></i> Excel
                                </button>
                                <button className="btn btn-danger btn-sm px-3">
                                    <i className="fas fa-file-pdf me-1"></i> Pdf
                                </button>
                                <button className="btn btn-outline-primary btn-sm px-3" onClick={() => window.print()}>
                                    <i className="fas fa-print me-1"></i> Imprimir
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-4 bg-white">
                        <div className="row g-3">
                            {/* Fila 1: Fecha/TC, Contingencia/Serie/Doc, Vencimiento, Moneda */}
                            <div className="col-md-3">
                                <label className="form-label small text-muted mb-1">Fecha / Tipo de Cambio:</label>
                                <div className="input-group input-group-sm">
                                    <input type="date" className="form-control" name="fechaEmision" value={notaData.fechaEmision} onChange={handleChange} />
                                    <input type="text" className="form-control" style={{ maxWidth: '80px' }} name="tipoCambio" value={notaData.tipoCambio} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted mb-1">Contingencia / Serie / Documento:</label>
                                <div className="input-group input-group-sm">
                                    <div className="input-group-text"><input type="checkbox" className="form-check-input mt-0" /></div>
                                    <input type="text" className="form-control" style={{ maxWidth: '80px' }} name="serie" value={notaData.serie} onChange={handleChange} />
                                    <input type="text" className="form-control" name="numero" value={notaData.numero} readOnly />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted mb-1">Días / Fecha de Vencimiento:</label>
                                <div className="input-group input-group-sm">
                                    <input type="number" className="form-control" style={{ maxWidth: '60px' }} name="diasVencimiento" value={notaData.diasVencimiento} onChange={handleChange} />
                                    <input type="date" className="form-control" name="fechaVencimiento" value={notaData.fechaVencimiento} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted mb-1 text-danger fw-bold">* Moneda:</label>
                                <select className="form-select form-select-sm" name="moneda" value={notaData.moneda} onChange={handleChange}>
                                    <option value="SOLES">SOLES</option>
                                    <option value="DOLARES">DOLARES</option>
                                </select>
                            </div>

                            {/* Fila 2: Establecimiento, Almacén, Lista Precio, Vendedor */}
                            <div className="col-md-3">
                                <label className="form-label small text-muted mb-1 text-danger fw-bold">* Establecimiento:</label>
                                <select className="form-select form-select-sm" name="establecimiento" value={notaData.establecimiento} onChange={handleChange}>
                                    <option value="DOMICILIO FISCAL">DOMICILIO FISCAL</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted mb-1">Almacén:</label>
                                <select className="form-select form-select-sm" name="almacen" value={notaData.almacen} onChange={handleChange}>
                                    <option value="ALM. CHICLAYO">ALM. CHICLAYO</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small text-muted mb-1 text-danger fw-bold">* Lista de Precio:</label>
                                <select className="form-select form-select-sm" name="listaPrecio" value={notaData.listaPrecio} onChange={handleChange}>
                                    <option value="PRINCIPAL">PRINCIPAL</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted mb-1">Vendedor:</label>
                                <select className="form-select form-select-sm" name="vendedor" value={notaData.vendedor} onChange={handleChange}>
                                    <option value="JOSSELINE KIMBERLY REAT...">JOSSELINE KIMBERLY REAT...</option>
                                </select>
                            </div>

                            {/* Fila 3: Nro Documento, Cliente, IGV */}
                            <div className="col-md-3">
                                <label className="form-label small text-muted mb-1">Nro Documento:</label>
                                <div className="input-group input-group-sm">
                                    <input type="text" className="form-control" name="clienteDocumento" value={notaData.clienteDocumento} onChange={handleChange} />
                                    <button className="btn btn-outline-secondary"><i className="fas fa-search"></i></button>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small text-muted mb-1">Cliente:</label>
                                <div className="input-group input-group-sm">
                                    <input type="text" className="form-control" name="clienteNombre" value={notaData.clienteNombre} onChange={handleChange} placeholder="Búsqueda de Cliente" />
                                    <button className="btn btn-outline-secondary"><i className="fas fa-search"></i></button>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted mb-1">IGV:</label>
                                <select className="form-select form-select-sm" name="igvPercent" value={notaData.igvPercent} onChange={handleChange}>
                                    <option value="18">18%</option>
                                    <option value="0">0%</option>
                                </select>
                            </div>

                            {/* Fila 4: Dirección, Forma de Pago, Motivo */}
                            <div className="col-md-6">
                                <label className="form-label small text-muted mb-1">Dirección:</label>
                                <select className="form-select form-select-sm" name="clienteDireccion" value={notaData.clienteDireccion} onChange={handleChange}>
                                    <option value="">Seleccione Dirección</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted mb-1 text-danger fw-bold text-dark">* Forma de Pago:</label>
                                <select className="form-select form-select-sm" name="formaPago" value={notaData.formaPago} onChange={handleChange}>
                                    <option value="CONTADO">CONTADO</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted mb-1 text-danger fw-bold">* Motivo:</label>
                                <select className="form-select form-select-sm" name="motivo" value={notaData.motivo} onChange={handleChange}>
                                    <option value="ANULACION DE LA OPERACION">ANULACION DE LA OPERACION</option>
                                </select>
                            </div>

                            {/* Fila 5: Observación, Proyecto */}
                            <div className="col-md-9">
                                <label className="form-label small text-muted mb-1">Observación:</label>
                                <input type="text" className="form-control form-control-sm" name="observacion" value={notaData.observacion} onChange={handleChange} placeholder="Ingresar Observación" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted mb-1">Proyecto:</label>
                                <input type="text" className="form-control form-control-sm" name="proyecto" value={notaData.proyecto} onChange={handleChange} />
                            </div>

                            <div className="col-md-12 mt-3">
                                <button className="btn btn-sm btn-primary px-3 shadow-sm rounded-pill fw-bold" onClick={() => toast.info('Importar Factura / Boleta logic here')}>
                                    <i className="fas fa-plus me-1"></i> Importar Factura / Boleta
                                </button>
                            </div>
                        </div>

                        {/* Pestañas de Detalle */}
                        <div className="mt-4">
                            <ul className="nav nav-tabs border-0 bg-light rounded-top p-1">
                                <li className="nav-item">
                                    <button className="nav-link active border-0 bg-transparent text-primary small fw-bold"><i className="fas fa-list me-2"></i>Detalle de Productos y Servicios</button>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link border-0 bg-transparent text-muted small fw-bold"><i className="fas fa-link me-2"></i>Detalle de Referencias</button>
                                </li>
                            </ul>

                            <div className="table-responsive border rounded-bottom bg-white" style={{ minHeight: '200px' }}>
                                <table className="table table-hover table-sm align-middle mb-0" style={{ minWidth: '1200px', fontSize: '11px' }}>
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="text-center px-2 py-3" style={{ width: '120px' }}>Código</th>
                                            <th className="px-2 py-3" style={{ width: '400px' }}>Nombre</th>
                                            <th className="text-center px-2 py-3">Unidad Medida</th>
                                            <th className="text-center px-2 py-3">Afecto IGV</th>
                                            <th className="text-center px-2 py-3">Exonerado</th>
                                            <th className="text-center px-2 py-3">Gratuito</th>
                                            <th className="text-end px-2 py-3">Precio Unitario</th>
                                            <th className="text-center px-2 py-3">Cantidad</th>
                                            <th className="text-end px-2 py-3">Total</th>
                                            <th className="text-end px-2 py-3">Total</th>
                                            <th className="text-center px-2 py-3" style={{ width: '50px' }}><i className="fas fa-cog"></i></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notaData.items.map((item, index) => (
                                            <tr key={index}>
                                                <td><input type="text" className="form-control form-control-sm border-0 bg-transparent text-center" value={item.codigo} onChange={(e) => handleCambioItem(index, 'codigo', e.target.value)} /></td>
                                                <td><input type="text" className="form-control form-control-sm border-0 bg-transparent" value={item.descripcion} onChange={(e) => handleCambioItem(index, 'descripcion', e.target.value)} /></td>
                                                <td><input type="text" className="form-control form-control-sm border-0 bg-transparent text-center" value={item.unidad} onChange={(e) => handleCambioItem(index, 'unidad', e.target.value)} /></td>
                                                <td className="text-center">
                                                    <input type="checkbox" className="form-check-input" checked={item.afectoIgv} onChange={(e) => handleCambioItem(index, 'afectoIgv', e.target.checked)} />
                                                </td>
                                                <td className="text-center">
                                                    <input type="checkbox" className="form-check-input" checked={item.exonerado} onChange={(e) => handleCambioItem(index, 'exonerado', e.target.checked)} />
                                                </td>
                                                <td className="text-center">
                                                    <input type="checkbox" className="form-check-input" checked={item.gratuito} onChange={(e) => handleCambioItem(index, 'gratuito', e.target.checked)} />
                                                </td>
                                                <td><input type="number" className="form-control form-control-sm border-0 bg-transparent text-end" value={item.precioUnitario} onChange={(e) => handleCambioItem(index, 'precioUnitario', e.target.value)} /></td>
                                                <td><input type="number" className="form-control form-control-sm border-0 bg-transparent text-center" value={item.cantidad} onChange={(e) => handleCambioItem(index, 'cantidad', e.target.value)} /></td>
                                                <td className="text-end">{item.total}</td>
                                                <td className="text-end fw-bold text-primary">{item.total}</td>
                                                <td className="text-center">
                                                    <button className="btn btn-sm text-danger" onClick={() => eliminarItem(index)}>
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {notaData.items.length === 0 && (
                                            <tr>
                                                <td colSpan="11" className="text-center py-5 text-muted">
                                                    <i className="fas fa-folder-open h2 d-block mb-3 opacity-25"></i>
                                                    Pulse el botón "+ Agregar" para añadir productos.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 d-flex justify-content-end">
                                <button className="btn btn-sm btn-primary px-3 shadow-sm rounded-pill fw-bold" onClick={agregarItem}>
                                    <i className="fas fa-plus me-1"></i> Agregar
                                </button>
                            </div>

                            <div className="row justify-content-between mt-4 pt-3 border-top">
                                <div className="col-md-4">
                                    <div className="form-check small text-muted">
                                        <input type="checkbox" className="form-check-input" id="exportacion" name="exportacion" checked={notaData.exportacion} onChange={handleChange} />
                                        <label className="form-check-label" htmlFor="exportacion">Exportación</label>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm bg-white">
                                        <div className="card-body p-0">
                                            <div className="d-flex justify-content-between p-2 small"><span>Total Detalle:</span> <strong>{notaData.totalDetalle}</strong></div>
                                            <div className="d-flex justify-content-between p-2 small border-top"><span>Importe Descuento:</span> <strong>{notaData.importeDescuento}</strong></div>
                                            <div className="d-flex justify-content-between p-2 small border-top"><span>Sub Total:</span> <strong>{notaData.subtotal}</strong></div>
                                            <div className="d-flex justify-content-between p-2 small border-top"><span>IGV:</span> <strong className="text-primary">{notaData.igv}</strong></div>
                                            <div className="d-flex justify-content-between p-2 small border-top"><span>ISC:</span> <strong>{notaData.isc}</strong></div>
                                            <div className="d-flex justify-content-between p-3 border-top bg-light">
                                                <span className="fw-bold">Total:</span>
                                                <strong className="h5 mb-0 text-danger">{notaData.importeTotal}</strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 d-flex gap-2">
                                        <button className="btn btn-outline-secondary w-50 shadow-sm rounded-pill py-2 fw-bold" onClick={() => setModoVista('preview')}>Cancelar</button>
                                        <button className="btn btn-primary w-50 shadow-sm rounded-pill py-2 fw-bold" onClick={handleGenerar}>Guardar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="nota-credito-container">
            {/* Action Bar for Preview Mode */}
            <div className="action-bar d-print-none d-flex gap-2 p-3 bg-white shadow-sm mb-3 rounded no-print mx-auto" style={{ maxWidth: '800px' }}>
                <button className="btn btn-secondary" onClick={() => setModoVista('form')} title="Editar">
                    <i className="fas fa-edit me-1"></i> Editar
                </button>
                <button className="btn btn-primary" onClick={handleGenerar} title="Guardar">
                    <i className="fas fa-save me-1"></i> Guardar
                </button>
                <button className="btn btn-danger" onClick={() => window.print()} title="Imprimir">
                    <i className="fas fa-print me-1"></i> Imprimir
                </button>
                <button className="btn btn-warning" onClick={() => toast.info('Generando Guía...')} title="Generar Guía">
                    <i className="fas fa-truck me-1"></i> Generar Guía
                </button>
                <button className="btn btn-success" onClick={() => toast.info('Excel')}>
                    <i className="fas fa-file-excel me-1"></i> Excel
                </button>
            </div>

            <div className="nota-credito-paper mx-auto shadow-lg">
                <div className="nota-credito-header-grid">
                    <div className="qr-section">
                        <div className="qr-placeholder text-muted small text-center">QR CODE</div>
                    </div>
                    <div className="header-company-info">
                        <img src={notaData.logoUrl} alt="Logo" className="company-logo-img" />
                        <h1 className="company-name-title">{notaData.razonSocialEmisor}</h1>
                        <div className="company-details">
                            <p className="mb-0">{notaData.direccionEmisor}</p>
                            <p className="mb-0">Tel: (01) 456-7890 | Email: ventas@tyc.com.pe</p>
                        </div>
                    </div>
                    <div className="ruc-section">
                        <div className="ruc-box">
                            <span className="ruc-number">RUC: {notaData.rucEmisor}</span>
                            <span className="ruc-title">NOTA DE CRÉDITO ELECTRÓNICA</span>
                            <span className="ruc-serie">{notaData.serie} - {notaData.numero}</span>
                        </div>
                    </div>
                </div>

                <div className="customer-info-box">
                    <div className="row">
                        <div className="col-8">
                            <div className="info-row"><span className="label-bold">Cliente:</span> <span className="value-text">{notaData.clienteNombre}</span></div>
                            <div className="info-row"><span className="label-bold">RUC/DNI:</span> <span className="value-text">{notaData.clienteDocumento}</span></div>
                            <div className="info-row"><span className="label-bold">Dirección:</span> <span className="value-text small">{notaData.clienteDireccion}</span></div>
                            <div className="info-row"><span className="label-bold">Doc. Afectado:</span> <span className="value-text small">{notaData.docReferencia || '-'}</span></div>
                        </div>
                        <div className="col-4 border-start">
                            <div className="info-row"><span className="label-bold">Fecha Emisión:</span> <span className="value-text">{notaData.fechaEmision}</span></div>
                            <div className="info-row"><span className="label-bold">Motivo:</span> <span className="value-text">{notaData.motivo}</span></div>
                            <div className="info-row"><span className="label-bold">Moneda:</span> <span className="value-text">{notaData.moneda}</span></div>
                            <div className="info-row"><span className="label-bold">Forma Pago:</span> <span className="value-text">{notaData.formaPago}</span></div>
                        </div>
                    </div>
                </div>

                <table className="items-table">
                    <thead>
                        <tr>
                            <th width="10%">Código</th>
                            <th width="40%">Descripción</th>
                            <th width="10%">Unidad</th>
                            <th width="10%">Cant.</th>
                            <th width="15%">P. Unit</th>
                            <th width="15%">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notaData.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="text-center">{item.codigo}</td>
                                <td>{item.descripcion}</td>
                                <td className="text-center">{item.unidad}</td>
                                <td className="text-center">{item.cantidad}</td>
                                <td className="text-right">{parseFloat(item.precioUnitario).toFixed(2)}</td>
                                <td className="text-right">{parseFloat(item.total).toFixed(2)}</td>
                            </tr>
                        ))}
                        {notaData.items.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-muted small">Sin items en el detalle</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="totals-section">
                    <div className="totals-box">
                        <div className="total-row">
                            <span className="total-label">Total Detalle:</span>
                            <span className="total-value">{notaData.totalDetalle}</span>
                        </div>
                        <div className="total-row">
                            <span className="total-label">Subtotal:</span>
                            <span className="total-value">{notaData.subtotal}</span>
                        </div>
                        <div className="total-row">
                            <span className="total-label">I.G.V. ({notaData.igvPercent}%):</span>
                            <span className="total-value">{notaData.igv}</span>
                        </div>
                        <div className="total-row grand-total">
                            <span className="total-label">TOTAL {notaData.moneda}:</span>
                            <span className="total-value">{notaData.importeTotal}</span>
                        </div>
                    </div>
                </div>

                <div className="amount-in-words">
                    {notaData.montoLetras}
                </div>

                <div className="mt-5 pt-4 d-flex justify-content-between">
                    <div className="text-center border-top px-5" style={{ minWidth: '200px' }}>
                        <div className="mt-2 small">Emitido por</div>
                    </div>
                    <div className="text-center border-top px-5" style={{ minWidth: '200px' }}>
                        <div className="mt-2 small">Recibido por</div>
                    </div>
                </div>

                <div className="mt-4 text-center small text-muted fst-italic">
                    Representación impresa de la Nota de Crédito Electrónica generada desde el Sistema ERP
                </div>
            </div>
        </div>
    );
};

export default NotaCredito;
