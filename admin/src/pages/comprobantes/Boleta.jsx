import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import './Boleta.css';
import logo from '../../assets/imagenes/logo.png';
import { ComprobanteService } from '../../services/ComprobanteService';

const Boleta = () => {
    const [modoVista, setModoVista] = useState('form');
    const [isGenerando, setIsGenerando] = useState(false);
    const [resultadoEmision, setResultadoEmision] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const [boletaData, setBoletaData] = useState({
        // Emisor (Fijo)
        razonSocialEmisor: 'INVERSIONES GENERALES T & C S.A.C.',
        rucEmisor: '206011306963',
        direccionEmisor: 'AV. PRINCIPAL 123 - LIMA',
        logoUrl: logo,

        // Documento
        serie: 'B001',
        numero: '',
        fechaEmision: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }),
        moneda: 'SOLES',

        // Cliente
        clienteNombre: '',
        clienteDoc: '',
        clienteDireccion: '',

        // Items
        items: [
            { codigo: '', descripcion: '', unidad: 'UND', cantidad: 1, precioUnitario: 0, total: 0 }
        ],

        // Totales
        opGravada: 0,
        igv: 0,
        importeTotal: 0,
        montoLetras: ''
    });

    // Calcular totales automáticamente cuando cambian los items
    useEffect(() => {
        const total = boletaData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
        const subtotal = total / 1.18;
        const igv = total - subtotal;

        setBoletaData(prev => ({
            ...prev,
            opGravada: subtotal.toFixed(2),
            igv: igv.toFixed(2),
            importeTotal: total.toFixed(2),
            montoLetras: convertirNumeroALetras(total)
        }));
    }, [boletaData.items]);

    // Obtener siguiente correlativo al montar o cambiar de serie
    useEffect(() => {
        const fetchNumero = async () => {
            if (boletaData.serie) {
                try {
                    const num = await ComprobanteService.obtenerSiguienteNumero('BOLETA', boletaData.serie);
                    setBoletaData(prev => ({ ...prev, numero: num }));
                } catch (error) {
                }
            }
        };
        fetchNumero();
    }, [boletaData.serie, refreshKey]);

    const convertirNumeroALetras = (num) => {
        return `SON: ${num.toFixed(2)} / 100 SOLES`;
    };

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBoletaData(prev => ({ ...prev, [name]: value }));
    };

    const handleCambioItem = (index, field, value) => {
        const nuevosItems = [...boletaData.items];
        nuevosItems[index][field] = value;

        if (field === 'cantidad' || field === 'precioUnitario') {
            const cant = parseFloat(nuevosItems[index].cantidad) || 0;
            const precio = parseFloat(nuevosItems[index].precioUnitario) || 0;
            nuevosItems[index].total = (cant * precio).toFixed(2);
        }

        setBoletaData(prev => ({ ...prev, items: nuevosItems }));
    };

    const agregarItem = () => {
        setBoletaData(prev => ({
            ...prev,
            items: [...prev.items, { codigo: '', descripcion: '', unidad: 'UND', cantidad: 1, precioUnitario: 0, total: 0 }]
        }));
    };

    const eliminarItem = (index) => {
        setBoletaData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    // --- VALIDACIÓN ---
    const validarFormulario = () => {
        const errores = [];

        if (!boletaData.serie.trim()) errores.push('La serie es obligatoria');
        if (!boletaData.numero || boletaData.numero.toString().trim() === '') errores.push('El número correlativo es obligatorio');
        if (!boletaData.fechaEmision) errores.push('La fecha de emisión es obligatoria');
        if (!boletaData.clienteNombre.trim()) errores.push('El nombre del cliente es obligatorio');

        // DNI/RUC opcional en boleta, pero si se llena debe ser 8 u 11 dígitos
        if (boletaData.clienteDoc.trim() && boletaData.clienteDoc.trim().length !== 8 && boletaData.clienteDoc.trim().length !== 11) {
            errores.push('El documento del cliente debe ser un DNI (8 dígitos) o RUC (11 dígitos)');
        }

        if (boletaData.items.length === 0) {
            errores.push('Debe agregar al menos un ítem');
        }

        const itemsInvalidos = boletaData.items.some(item =>
            !item.descripcion.trim() || !item.cantidad || parseFloat(item.cantidad) <= 0 || !item.precioUnitario || parseFloat(item.precioUnitario) <= 0
        );
        if (itemsInvalidos) {
            errores.push('Todos los ítems deben tener descripción, cantidad y precio unitario válidos');
        }

        if (errores.length > 0) {
            errores.forEach(e => toast.error(e));
            return false;
        }
        return true;
    };

    // --- GENERAR BOLETA (ENVIAR AL BACKEND) ---
    const handleGenerar = async () => {
        if (!validarFormulario()) return;

        try {
            setIsGenerando(true);

            // Determinar tipo de documento del cliente
            const docLength = boletaData.clienteDoc.trim().length;
            let clienteTipoDoc = '0'; // Sin documento
            if (docLength === 8) clienteTipoDoc = '1'; // DNI
            else if (docLength === 11) clienteTipoDoc = '6'; // RUC

            const payload = {
                tipoDocumento: 'BOLETA',
                serie: boletaData.serie,
                numero: parseInt(boletaData.numero),
                fechaEmision: boletaData.fechaEmision,
                moneda: boletaData.moneda === 'SOLES' ? 'PEN' : 'USD',
                clienteTipoDoc: clienteTipoDoc,
                clienteNumeroDoc: boletaData.clienteDoc.trim() || '00000000',
                clienteDenominacion: boletaData.clienteNombre.trim(),
                clienteDireccion: boletaData.clienteDireccion.trim() || null,
                condicionPago: 'CONTADO',
                items: boletaData.items.map(item => ({
                    cantidad: parseInt(item.cantidad),
                    unidadMedida: item.unidad || 'NIU',
                    descripcion: item.descripcion,
                    precioUnitario: parseFloat(item.precioUnitario)
                }))
            };

            const resultado = await ComprobanteService.emitirComprobante(payload);

            if (resultado.estadoSunat === 'RECHAZADO') {
                toast.error(resultado.mensaje || 'SUNAT rechazó la operación.');
            } else {
                setResultadoEmision(resultado);
                toast.success('¡Boleta emitida correctamente!');
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || 'Error al emitir la boleta. Verifique los datos.';
            toast.error(typeof msg === 'string' ? msg : 'Error al emitir la boleta.');
        } finally {
            setIsGenerando(false);
        }
    };

    // --- MODAL DE RESULTADO ---
    if (resultadoEmision) {
        return (
            <div className="container mt-4 mb-5">
                <div className="card shadow border-0 text-center" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <div className="card-body p-5">
                        <div className="mb-4">
                            <i className={`fas ${resultadoEmision.estadoSunat === 'RECHAZADO' ? 'fa-times-circle text-danger' : 'fa-check-circle text-success'}`} style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h3 className="fw-bold mb-1">
                            {resultadoEmision.estadoSunat === 'RECHAZADO' ? 'Error en la Emisión' : '¡Boleta Emitida!'}
                        </h3>
                        <p className="text-muted mb-4">{resultadoEmision.mensaje}</p>

                        <div className="bg-light p-3 rounded-3 mb-4 text-start border">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small fw-bold">Serie - Número:</span>
                                <span className="fw-bold">{resultadoEmision.serie}-{resultadoEmision.numero}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small fw-bold">Estado SUNAT:</span>
                                <span className={`badge ${resultadoEmision.estadoSunat === 'RECHAZADO' ? 'bg-danger' : 'bg-success'}`}>
                                    {resultadoEmision.estadoSunat}
                                </span>
                            </div>
                        </div>

                        <div className="d-flex flex-column gap-2 mb-4">
                            {resultadoEmision.enlacePdfTicket && (
                                <a href={resultadoEmision.enlacePdfTicket} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark fw-bold d-flex align-items-center justify-content-center gap-2">
                                    <i className="fas fa-receipt"></i> DESCARGAR TICKET
                                </a>
                            )}
                            {resultadoEmision.enlacePdfA4 && (
                                <a href={resultadoEmision.enlacePdfA4} target="_blank" rel="noopener noreferrer" className="btn btn-outline-success fw-bold d-flex align-items-center justify-content-center gap-2">
                                    <i className="fas fa-file-pdf"></i> DESCARGAR PDF A4
                                </a>
                            )}
                        </div>

                        <div className="d-flex gap-2">
                            <button className="btn btn-success flex-grow-1 fw-bold py-2 rounded-pill" onClick={() => {
                                setResultadoEmision(null);
                                setBoletaData(prev => ({
                                    ...prev,
                                    numero: '',
                                    clienteNombre: '',
                                    clienteDoc: '',
                                    clienteDireccion: '',
                                    items: [{ codigo: '', descripcion: '', unidad: 'UND', cantidad: 1, precioUnitario: 0, total: 0 }]
                                }));
                                setRefreshKey(prev => prev + 1);
                            }}>
                                <i className="fas fa-plus me-2"></i>NUEVA BOLETA
                            </button>
                            <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => {
                                setResultadoEmision(null);
                                setModoVista('preview');
                            }}>
                                <i className="fas fa-eye me-1"></i> Ver
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VISTA FORMULARIO ---
    if (modoVista === 'form') {
        return (
            <div className="container mt-4 mb-5">
                <div className="card shadow border-0">
                    <div className="card-header bg-success text-white d-flex justify-content-between align-items-center py-3">
                        <h5 className="mb-0"><i className="fas fa-file-invoice-dollar me-2"></i>Nueva Boleta de Venta</h5>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-dark btn-sm fw-bold border-white"
                                onClick={handleGenerar}
                                disabled={isGenerando}
                            >
                                {isGenerando ? (
                                    <><span className="spinner-border spinner-border-sm me-1"></span> Emitiendo...</>
                                ) : (
                                    <><i className="fas fa-paper-plane me-1"></i> Emitir a SUNAT</>
                                )}
                            </button>
                            <button className="btn btn-light text-success btn-sm fw-bold border-white" onClick={() => setModoVista('preview')}>
                                <i className="fas fa-eye me-1"></i> Vista Previa
                            </button>
                        </div>
                    </div>
                    <div className="card-body bg-light">
                        <div className="row g-3">
                            {/* Datos Doc */}
                            <div className="col-12"><h6 className="text-success border-bottom pb-2">1. Datos del Comprobante</h6></div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Serie <span className="text-danger">*</span></label>
                                <input type="text" className="form-control form-control-sm" name="serie" value={boletaData.serie} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Número <span className="text-danger">*</span></label>
                                <input type="number" className="form-control form-control-sm border-primary" name="numero" value={boletaData.numero} onChange={handleChange} placeholder="Correlativo" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Fecha <span className="text-danger">*</span></label>
                                <input type="date" className="form-control form-control-sm" name="fechaEmision" value={boletaData.fechaEmision} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Moneda</label>
                                <select className="form-select form-select-sm" name="moneda" value={boletaData.moneda} onChange={handleChange}>
                                    <option value="SOLES">Soles</option>
                                    <option value="DOLARES">Dólares</option>
                                </select>
                            </div>

                            {/* Cliente */}
                            <div className="col-12 mt-4"><h6 className="text-success border-bottom pb-2">2. Datos del Cliente</h6></div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">DNI / RUC</label>
                                <input type="text" className="form-control form-control-sm" name="clienteDoc" value={boletaData.clienteDoc} onChange={handleChange} placeholder="Opcional < 700" maxLength={11} />
                                {boletaData.clienteDoc.length > 0 && boletaData.clienteDoc.length !== 8 && boletaData.clienteDoc.length !== 11 && (
                                    <small className="text-danger">Debe ser 8 (DNI) u 11 (RUC) dígitos</small>
                                )}
                            </div>
                            <div className="col-md-5">
                                <label className="form-label small fw-bold">Nombre / Razón Social <span className="text-danger">*</span></label>
                                <input type="text" className="form-control form-control-sm" name="clienteNombre" value={boletaData.clienteNombre} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Dirección</label>
                                <input type="text" className="form-control form-control-sm" name="clienteDireccion" value={boletaData.clienteDireccion} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Items */}
                        <div className="mt-4">
                            <h6 className="text-success border-bottom pb-2">3. Detalle de la Venta <span className="text-danger">*</span></h6>
                            <table className="table table-bordered table-sm bg-white">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '80px' }}>Cant. <span className="text-danger">*</span></th>
                                        <th style={{ width: '80px' }}>Unidad</th>
                                        <th>Descripción <span className="text-danger">*</span></th>
                                        <th style={{ width: '100px' }}>P. Unit <span className="text-danger">*</span></th>
                                        <th style={{ width: '100px' }}>Total</th>
                                        <th style={{ width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {boletaData.items.map((item, index) => (
                                        <tr key={index}>
                                            <td><input type="number" className="form-control form-control-sm border-0" value={item.cantidad} min="1" onChange={(e) => handleCambioItem(index, 'cantidad', e.target.value)} /></td>
                                            <td><input type="text" className="form-control form-control-sm border-0" value={item.unidad} onChange={(e) => handleCambioItem(index, 'unidad', e.target.value)} /></td>
                                            <td><input type="text" className="form-control form-control-sm border-0" value={item.descripcion} onChange={(e) => handleCambioItem(index, 'descripcion', e.target.value)} placeholder="Descripción del producto/servicio" /></td>
                                            <td><input type="number" className="form-control form-control-sm border-0" value={item.precioUnitario} min="0" step="0.01" onChange={(e) => handleCambioItem(index, 'precioUnitario', e.target.value)} /></td>
                                            <td className="text-end align-middle bg-light">{parseFloat(item.total).toFixed(2)}</td>
                                            <td className="text-center"><button className="btn btn-sm text-danger" onClick={() => eliminarItem(index)} disabled={boletaData.items.length === 1}><i className="fas fa-times"></i></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="btn btn-sm btn-outline-success" onClick={agregarItem}>+ Agregar Ítem</button>

                            <div className="row justify-content-end mt-3">
                                <div className="col-md-4">
                                    <ul className="list-group">
                                        <li className="list-group-item d-flex justify-content-between"><span>Op. Gravada:</span> <strong>{boletaData.opGravada}</strong></li>
                                        <li className="list-group-item d-flex justify-content-between"><span>IGV (18%):</span> <strong>{boletaData.igv}</strong></li>
                                        <li className="list-group-item d-flex justify-content-between bg-light fw-bold"><span>Total:</span> <span className="text-success h5 mb-0">{boletaData.importeTotal}</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VISTA DOCUMENTO (PREVIEW/PRINT) ---
    return (
        <div className="boleta-container">
            <div className="action-bar d-flex gap-2 p-3 bg-white shadow-sm mb-3 rounded no-print">
                <button className="btn btn-secondary" onClick={() => setModoVista('form')} title="Editar">
                    <i className="fas fa-pencil-alt me-1"></i> Editar
                </button>
                <button className="btn btn-primary" onClick={() => window.print()} title="Imprimir">
                    <i className="fas fa-print me-1"></i> Imprimir
                </button>
                <button className="btn btn-danger" onClick={() => toast.info('Exportando a PDF...')} title="PDF">
                    <i className="fas fa-file-pdf me-1"></i> PDF
                </button>
                <button className="btn btn-success" onClick={() => toast.info('Exportando a Excel...')} title="Excel">
                    <i className="fas fa-file-excel me-1"></i> Excel
                </button>
            </div>

            <div className="boleta-paper">
                {/* Header */}
                <div className="boleta-header-grid">
                    <div className="qr-section">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=SUNAT_BOLETA_DEMO" alt="QR" className="qr-placeholder" />
                    </div>

                    <div className="header-company-info">
                        <img src={boletaData.logoUrl} alt="Logo" className="company-logo-img" />
                        <div className="company-name-title">{boletaData.razonSocialEmisor}</div>
                        <div className="company-details">{boletaData.direccionEmisor}</div>
                        <div className="company-details small">Telf: (01) 555-0909 | ventas@aseo360.com</div>
                    </div>

                    <div className="ruc-box">
                        <span className="ruc-number">RUC {boletaData.rucEmisor}</span>
                        <span className="ruc-title">BOLETA DE VENTA ELECTRÓNICA</span>
                        <span className="ruc-serie">{boletaData.serie} - {boletaData.numero}</span>
                    </div>
                </div>

                {/* Cliente Info */}
                <div className="customer-info-box">
                    <div className="info-row">
                        <span className="label-bold">Señor(es):</span>
                        <span className="value-text">{boletaData.clienteNombre || 'CLIENTE GENERAL'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label-bold">DNI/RUC:</span>
                        <span className="value-text">{boletaData.clienteDoc || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label-bold">Dirección:</span>
                        <span className="value-text">{boletaData.clienteDireccion || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label-bold">Fecha Emisión:</span>
                        <span className="value-text">{boletaData.fechaEmision}</span>
                        <span className="label-bold ms-4">Moneda:</span>
                        <span className="value-text">{boletaData.moneda}</span>
                    </div>
                </div>

                {/* Tabla Items */}
                <table className="items-table">
                    <thead>
                        <tr>
                            <th width="10%">Cant.</th>
                            <th width="10%">Unidad</th>
                            <th width="50%">Descripción</th>
                            <th width="15%">P. Unit</th>
                            <th width="15%">Importe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {boletaData.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="text-center">{item.cantidad}</td>
                                <td className="text-center">{item.unidad}</td>
                                <td>{item.descripcion}</td>
                                <td className="text-right">{parseFloat(item.precioUnitario).toFixed(2)}</td>
                                <td className="text-right">{parseFloat(item.total).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totales */}
                <div className="totals-section">
                    <div className="totals-box">
                        <div className="total-row">
                            <span className="total-label">Op. Gravada:</span>
                            <span className="total-value">{boletaData.opGravada}</span>
                        </div>
                        <div className="total-row">
                            <span className="total-label">I.G.V. (18%):</span>
                            <span className="total-value">{boletaData.igv}</span>
                        </div>
                        <div className="total-row grand-total">
                            <span className="total-label">IMPORTE TOTAL:</span>
                            <span className="total-value">{boletaData.importeTotal}</span>
                        </div>
                    </div>
                </div>

                <div className="amount-in-words">
                    {boletaData.montoLetras}
                </div>
            </div>
        </div>
    );
};

export default Boleta;
