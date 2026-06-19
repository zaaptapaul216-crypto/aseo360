import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import './Factura.css';
import logo from '../../assets/imagenes/logo.png';
import { ComprobanteService } from '../../services/ComprobanteService';

const Factura = () => {
    const [modoVista, setModoVista] = useState('form');
    const [isGenerando, setIsGenerando] = useState(false);
    const [resultadoEmision, setResultadoEmision] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [incluirGuia, setIncluirGuia] = useState(false);
    const [guiaExtra, setGuiaExtra] = useState({
        numeroGuia: '',
        fechaTraslado: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }),
        puntoPartidaUbigeo: '',
        puntoPartida: '',
        puntoLlegadaUbigeo: '',
        puntoLlegada: '',
        pesoBruto: '',
        unidadPeso: 'KGM',
        bultos: '1',
        modalidad: 'PRIVADO',
        // Privado
        vehiculoPlaca: '',
        conductorDoc: '',
        conductorNombre: '',
        conductorApellido: '',
        conductorLicencia: '',
        // Público
        transportistaRazon: '',
        transportistaDoc: ''
    });

    const handleGuiaChange = (e) => {
        const { name, value } = e.target;
        setGuiaExtra(prev => ({ ...prev, [name]: value }));
    };

    const [facturaData, setFacturaData] = useState({
        // Emisor (Fijo)
        razonSocialEmisor: 'INVERSIONES GENERALES T & C S.A.C.',
        rucEmisor: '20601130696',
        direccionEmisor: 'AV. PRINCIPAL 123 - LIMA',
        logoUrl: logo,

        // Documento
        serie: 'F001',
        numero: '',
        fechaEmision: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }),
        moneda: 'SOLES',

        // Cliente (Empresa)
        clienteRazonSocial: '',
        clienteRuc: '',
        clienteDireccion: '',

        // Condiciones
        condicionPago: 'CONTADO',
        fechaVencimiento: '',
        cuotas: [{ importe: '', fechaDePago: '' }],

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

    // Calcular totales automáticamente
    useEffect(() => {
        const total = facturaData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
        const subtotal = total / 1.18;
        const igv = total - subtotal;

        setFacturaData(prev => ({
            ...prev,
            opGravada: subtotal.toFixed(2),
            igv: igv.toFixed(2),
            importeTotal: total.toFixed(2),
            montoLetras: convertirNumeroALetras(total)
        }));
    }, [facturaData.items]);

    // Obtener siguiente correlativo al montar o cambiar de serie
    useEffect(() => {
        const fetchNumero = async () => {
            if (facturaData.serie) {
                try {
                    const num = await ComprobanteService.obtenerSiguienteNumero('FACTURA', facturaData.serie);
                    setFacturaData(prev => ({ ...prev, numero: num }));
                } catch (error) {
                }
            }
        };
        fetchNumero();
    }, [facturaData.serie, refreshKey]);

    // Obtener siguiente correlativo para la Guía de Remisión adjunta
    useEffect(() => {
        const fetchNumeroGuia = async () => {
            if (incluirGuia) {
                try {
                    const num = await ComprobanteService.obtenerSiguienteNumeroGuia('T001');
                    setGuiaExtra(prev => ({ ...prev, numeroGuia: num }));
                } catch (error) {
                }
            }
        };
        fetchNumeroGuia();
    }, [incluirGuia, refreshKey]);

    const convertirNumeroALetras = (num) => {
        return `SON: ${num.toFixed(2)} / 100 SOLES`;
    };

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFacturaData(prev => ({ ...prev, [name]: value }));
    };

    const handleCambioItem = (index, field, value) => {
        const nuevosItems = [...facturaData.items];
        nuevosItems[index][field] = value;

        if (field === 'cantidad' || field === 'precioUnitario') {
            const cant = parseFloat(nuevosItems[index].cantidad) || 0;
            const precio = parseFloat(nuevosItems[index].precioUnitario) || 0;
            nuevosItems[index].total = (cant * precio).toFixed(2);
        }

        setFacturaData(prev => ({ ...prev, items: nuevosItems }));
    };

    const agregarItem = () => {
        setFacturaData(prev => ({
            ...prev,
            items: [...prev.items, { codigo: '', descripcion: '', unidad: 'UND', cantidad: 1, precioUnitario: 0, total: 0 }]
        }));
    };

    const eliminarItem = (index) => {
        setFacturaData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    // --- VALIDACIÓN ---
    const validarFormulario = () => {
        const errores = [];

        if (!facturaData.serie.trim()) errores.push('La serie es obligatoria');
        if (!facturaData.numero || facturaData.numero.toString().trim() === '') errores.push('El número correlativo es obligatorio');
        if (!facturaData.fechaEmision) errores.push('La fecha de emisión es obligatoria');

        // RUC obligatorio para factura (11 dígitos)
        if (!facturaData.clienteRuc.trim()) {
            errores.push('El RUC del cliente es obligatorio para Factura');
        } else if (facturaData.clienteRuc.trim().length !== 11) {
            errores.push('El RUC del cliente debe tener exactamente 11 dígitos');
        }

        if (!facturaData.clienteRazonSocial.trim()) {
            errores.push('La razón social del cliente es obligatoria');
        }

        // Si crédito, fecha de vencimiento obligatoria
        if (facturaData.condicionPago === 'CREDITO' && !facturaData.fechaVencimiento) {
            errores.push('La fecha de vencimiento es obligatoria para pago a Crédito');
        }

        if (facturaData.items.length === 0) {
            errores.push('Debe agregar al menos un ítem');
        }

        const itemsInvalidos = facturaData.items.some(item =>
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

    // --- GENERAR FACTURA (ENVIAR AL BACKEND) ---
    const handleGenerar = async () => {
        if (!validarFormulario()) return;

        // Validar campos de Guía ANTES de enviar nada (atomicidad)
        if (incluirGuia) {
            const erroresGuia = [];
            if (!guiaExtra.numeroGuia.trim()) erroresGuia.push('El número de Guía es obligatorio');
            if (!guiaExtra.fechaTraslado) erroresGuia.push('La fecha de traslado es obligatoria');
            if (!guiaExtra.pesoBruto || parseFloat(guiaExtra.pesoBruto) <= 0) erroresGuia.push('El peso bruto es obligatorio');
            if (!guiaExtra.unidadPeso || guiaExtra.unidadPeso.trim() === '') erroresGuia.push('La unidad de peso es obligatoria');
            if (!guiaExtra.puntoPartidaUbigeo.trim()) erroresGuia.push('El ubigeo de partida es obligatorio');
            if (!guiaExtra.puntoPartida.trim()) erroresGuia.push('La dirección de partida es obligatoria');
            if (!guiaExtra.puntoLlegadaUbigeo.trim()) erroresGuia.push('El ubigeo de llegada es obligatorio');
            if (!guiaExtra.puntoLlegada.trim()) erroresGuia.push('La dirección de llegada es obligatoria');
            if (guiaExtra.modalidad === 'PÚBLICO') {
                if (!guiaExtra.transportistaRazon.trim()) erroresGuia.push('La razón social del transportista es obligatoria');
                if (!guiaExtra.transportistaDoc.trim()) erroresGuia.push('El RUC del transportista es obligatorio');
            } else {
                if (!guiaExtra.vehiculoPlaca.trim()) erroresGuia.push('La placa del vehículo es obligatoria');
                if (!guiaExtra.conductorDoc.trim()) erroresGuia.push('El DNI del conductor es obligatorio');
            }
            if (erroresGuia.length > 0) {
                erroresGuia.forEach(e => toast.error(e));
                return;
            }
        }

        try {
            setIsGenerando(true);

            const payload = {
                tipoDocumento: 'FACTURA',
                serie: facturaData.serie,
                numero: parseInt(facturaData.numero),
                fechaEmision: facturaData.fechaEmision,
                moneda: facturaData.moneda === 'SOLES' ? 'PEN' : 'USD',
                clienteTipoDoc: '6', // RUC siempre para factura
                clienteNumeroDoc: facturaData.clienteRuc.trim(),
                clienteDenominacion: facturaData.clienteRazonSocial.trim(),
                clienteDireccion: facturaData.clienteDireccion.trim() || null,
                condicionPago: facturaData.condicionPago,
                fechaVencimiento: facturaData.condicionPago === 'CREDITO' ? facturaData.fechaVencimiento : null,
                cuotas: facturaData.condicionPago === 'CREDITO' ? facturaData.cuotas.filter(c => c.importe && c.fechaDePago).map(c => ({ importe: parseFloat(c.importe), fechaDePago: c.fechaDePago })) : null,
                items: facturaData.items.map(item => ({
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
                toast.success('¡Factura emitida correctamente!');
            }

            // Si se incluye Guía de Remisión, enviarla después de la Factura
            if (incluirGuia) {
                try {
                    const modalidadCode = guiaExtra.modalidad === 'PÚBLICO' ? '01' : '02';
                    const payloadGuia = {
                        documento: "guia_remision_remitente",
                        serie: "T001",
                        numero: guiaExtra.numeroGuia.toString(),
                        fecha_de_emision: facturaData.fechaEmision,
                        hora_de_emision: new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Lima' }),
                        modalidad_de_transporte: modalidadCode,
                        motivo_de_traslado: "01",
                        fecha_inicio_de_traslado: guiaExtra.fechaTraslado,
                        fecha_entrega_a_transportista: guiaExtra.fechaTraslado,
                        destinatario_tipo_de_documento: facturaData.clienteRuc?.length === 11 ? "6" : "1",
                        destinatario_numero_de_documento: facturaData.clienteRuc,
                        destinatario_denominacion: facturaData.clienteRazonSocial,
                        destinatario_direccion: facturaData.clienteDireccion,
                        punto_de_partida_ubigeo: guiaExtra.puntoPartidaUbigeo,
                        punto_de_partida_direccion: guiaExtra.puntoPartida,
                        punto_de_llegada_ubigeo: guiaExtra.puntoLlegadaUbigeo,
                        punto_de_llegada_direccion: guiaExtra.puntoLlegada,
                        peso_bruto_total: guiaExtra.pesoBruto.toString(),
                        peso_bruto_unidad_de_medida: String(guiaExtra.unidadPeso || "KGM").trim().substring(0, 3).toUpperCase().padEnd(3, 'M'),
                        numero_de_bultos: parseInt(guiaExtra.bultos) || 1,
                        observaciones: null,
                        documentos_relacionados: [{
                            documento: "factura",
                            serie: resultado.serie || facturaData.serie,
                            numero: resultado.numero ? resultado.numero.toString() : facturaData.numero.toString(),
                            ruc_emisor: facturaData.rucEmisor
                        }],
                        items: facturaData.items.map(item => {
                            let unit = String(item.unidad || "NIU").trim().toUpperCase();
                            if (unit === 'UND') unit = 'NIU';
                            return {
                                codigo_interno: item.codigo || item.descripcion?.substring(0, 5) || "ITEM",
                                descripcion: item.descripcion || "Item",
                                unidad_de_medida: unit.substring(0, 3).padEnd(3, 'U'),
                                cantidad: parseFloat(item.cantidad) || 1
                            };
                        })
                    };

                    if (modalidadCode === '01') {
                        payloadGuia.transportista = {
                            ruc: guiaExtra.transportistaDoc || facturaData.rucEmisor,
                            denominacion: guiaExtra.transportistaRazon || facturaData.razonSocialEmisor,
                            numero_registro_MTC: "123",
                            numero_autorizacion: "123",
                            codigo_entidad_autorizadora: "123"
                        };
                    } else {
                        payloadGuia.vehiculos = [{ vehiculo: "principal", numero_de_placa: guiaExtra.vehiculoPlaca || "" }];
                        payloadGuia.conductores = [{
                            conductor: "principal",
                            tipo_de_documento: guiaExtra.conductorDoc?.length === 11 ? "6" : "1",
                            numero_de_documento: String(guiaExtra.conductorDoc || ""),
                            nombres: guiaExtra.conductorNombre || "",
                            apellidos: guiaExtra.conductorApellido || "",
                            numero_licencia_conducir: guiaExtra.conductorLicencia || ""
                        }];
                    }

                    await ComprobanteService.enviarGuiaRemision(payloadGuia);
                    toast.success('¡Guía de Remisión emitida correctamente!');
                } catch (guiaError) {
                    const guiaMsg = guiaError.response?.data?.message || guiaError.response?.data || 'Error al emitir la Guía de Remisión.';
                    toast.error(typeof guiaMsg === 'string' ? guiaMsg : 'Error al emitir la Guía de Remisión.');
                }
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || 'Error al emitir la factura. Verifique los datos.';
            toast.error(typeof msg === 'string' ? msg : 'Error al emitir la factura.');
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
                            {resultadoEmision.estadoSunat === 'RECHAZADO' ? 'Error en la Emisión' : '¡Factura Emitida!'}
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
                                <a href={resultadoEmision.enlacePdfA4} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary fw-bold d-flex align-items-center justify-content-center gap-2">
                                    <i className="fas fa-file-pdf"></i> DESCARGAR PDF A4
                                </a>
                            )}
                        </div>

                        <div className="d-flex gap-2">
                            <button className="btn btn-primary flex-grow-1 fw-bold py-2 rounded-pill" onClick={() => {
                                setResultadoEmision(null);
                                setFacturaData(prev => ({
                                    ...prev,
                                    numero: '',
                                    clienteRazonSocial: '',
                                    clienteRuc: '',
                                    clienteDireccion: '',
                                    condicionPago: 'CONTADO',
                                    fechaVencimiento: '',
                                    cuotas: [{ importe: '', fechaDePago: '' }],
                                    items: [{ codigo: '', descripcion: '', unidad: 'UND', cantidad: 1, precioUnitario: 0, total: 0 }]
                                }));
                                setRefreshKey(prev => prev + 1);
                            }}>
                                <i className="fas fa-plus me-2"></i>NUEVA FACTURA
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
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
                        <h5 className="mb-0"><i className="fas fa-file-invoice-dollar me-2"></i>Nueva Factura Electrónica</h5>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-success btn-sm fw-bold border-white"
                                onClick={handleGenerar}
                                disabled={isGenerando}
                            >
                                {isGenerando ? (
                                    <><span className="spinner-border spinner-border-sm me-1"></span> Emitiendo...</>
                                ) : (
                                    <><i className="fas fa-paper-plane me-1"></i> Emitir a SUNAT</>
                                )}
                            </button>
                            <button className="btn btn-light text-primary btn-sm fw-bold border-white" onClick={() => setModoVista('preview')}>
                                <i className="fas fa-eye me-1"></i> Vista Previa
                            </button>
                        </div>
                    </div>
                    <div className="card-body bg-light">
                        <div className="row g-3">
                            {/* Datos Doc */}
                            <div className="col-12"><h6 className="text-primary border-bottom pb-2">1. Datos del Comprobante</h6></div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Serie <span className="text-danger">*</span></label>
                                <input type="text" className="form-control form-control-sm" name="serie" value={facturaData.serie} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Número <span className="text-danger">*</span></label>
                                <input type="number" className="form-control form-control-sm border-primary" name="numero" value={facturaData.numero} onChange={handleChange} placeholder="Correlativo" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Fecha <span className="text-danger">*</span></label>
                                <input type="date" className="form-control form-control-sm" name="fechaEmision" value={facturaData.fechaEmision} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Moneda</label>
                                <select className="form-select form-select-sm" name="moneda" value={facturaData.moneda} onChange={handleChange}>
                                    <option value="SOLES">Soles</option>
                                    <option value="DOLARES">Dólares</option>
                                </select>
                            </div>

                            {/* Condiciones de Pago */}
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Condición de Pago</label>
                                <div className="d-flex gap-2">
                                    {['CONTADO', 'CREDITO'].map(cond => (
                                        <button
                                            key={cond}
                                            type="button"
                                            className={`btn btn-sm flex-grow-1 fw-bold ${facturaData.condicionPago === cond ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                                            onClick={() => setFacturaData(prev => ({ ...prev, condicionPago: cond }))}
                                        >
                                            {cond === 'CONTADO' ? '💵 Contado' : '📅 Crédito'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {facturaData.condicionPago === 'CREDITO' && (
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Fecha de Vencimiento <span className="text-danger">*</span></label>
                                    <input type="date" className="form-control form-control-sm" name="fechaVencimiento" value={facturaData.fechaVencimiento} onChange={handleChange} />
                                </div>
                            )}
                            {facturaData.condicionPago === 'CREDITO' && (
                                <div className="col-12 mt-3">
                                    <label className="form-label small fw-bold">Cuotas de Pago</label>
                                    {facturaData.cuotas.map((cuota, idx) => (
                                        <div key={idx} className="d-flex gap-2 mb-2 align-items-center">
                                            <span className="badge bg-secondary">{idx + 1}</span>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                placeholder="Importe"
                                                step="0.01"
                                                value={cuota.importe}
                                                onChange={(e) => {
                                                    const nuevas = [...facturaData.cuotas];
                                                    nuevas[idx].importe = e.target.value;
                                                    setFacturaData(prev => ({ ...prev, cuotas: nuevas }));
                                                }}
                                                style={{ maxWidth: '150px' }}
                                            />
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={cuota.fechaDePago}
                                                onChange={(e) => {
                                                    const nuevas = [...facturaData.cuotas];
                                                    nuevas[idx].fechaDePago = e.target.value;
                                                    setFacturaData(prev => ({ ...prev, cuotas: nuevas }));
                                                }}
                                                style={{ maxWidth: '180px' }}
                                            />
                                            {facturaData.cuotas.length > 1 && (
                                                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => {
                                                    setFacturaData(prev => ({ ...prev, cuotas: prev.cuotas.filter((_, i) => i !== idx) }));
                                                }}>
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => {
                                        setFacturaData(prev => ({ ...prev, cuotas: [...prev.cuotas, { importe: '', fechaDePago: '' }] }));
                                    }}>
                                        <i className="fas fa-plus me-1"></i>Agregar Cuota
                                    </button>
                                </div>
                            )}

                            {/* Cliente */}
                            <div className="col-12 mt-4"><h6 className="text-primary border-bottom pb-2">2. Datos del Cliente (Empresa)</h6></div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">RUC <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className={`form-control form-control-sm ${facturaData.clienteRuc.length > 0 && facturaData.clienteRuc.length !== 11 ? 'is-invalid' : facturaData.clienteRuc.length === 11 ? 'is-valid' : ''}`}
                                    name="clienteRuc"
                                    value={facturaData.clienteRuc}
                                    onChange={handleChange}
                                    placeholder="Ej: 20..."
                                    maxLength={11}
                                />
                                {facturaData.clienteRuc.length > 0 && facturaData.clienteRuc.length !== 11 && (
                                    <div className="invalid-feedback">El RUC debe tener 11 dígitos</div>
                                )}
                            </div>
                            <div className="col-md-5">
                                <label className="form-label small fw-bold">Razón Social <span className="text-danger">*</span></label>
                                <input type="text" className="form-control form-control-sm" name="clienteRazonSocial" value={facturaData.clienteRazonSocial} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Dirección</label>
                                <input type="text" className="form-control form-control-sm" name="clienteDireccion" value={facturaData.clienteDireccion} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Items */}
                        <div className="mt-4">
                            <h6 className="text-primary border-bottom pb-2">3. Detalle de la Venta <span className="text-danger">*</span></h6>
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
                                    {facturaData.items.map((item, index) => (
                                        <tr key={index}>
                                            <td><input type="number" className="form-control form-control-sm border-0" value={item.cantidad} min="1" onChange={(e) => handleCambioItem(index, 'cantidad', e.target.value)} /></td>
                                            <td><input type="text" className="form-control form-control-sm border-0" value={item.unidad} onChange={(e) => handleCambioItem(index, 'unidad', e.target.value)} /></td>
                                            <td><input type="text" className="form-control form-control-sm border-0" value={item.descripcion} onChange={(e) => handleCambioItem(index, 'descripcion', e.target.value)} placeholder="Descripción del producto/servicio" /></td>
                                            <td><input type="number" className="form-control form-control-sm border-0" value={item.precioUnitario} min="0" step="0.01" onChange={(e) => handleCambioItem(index, 'precioUnitario', e.target.value)} /></td>
                                            <td className="text-end align-middle bg-light">{parseFloat(item.total).toFixed(2)}</td>
                                            <td className="text-center"><button className="btn btn-sm text-danger" onClick={() => eliminarItem(index)} disabled={facturaData.items.length === 1}><i className="fas fa-times"></i></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="btn btn-sm btn-outline-primary" onClick={agregarItem}>+ Agregar Ítem</button>

                            <div className="row justify-content-end mt-3">
                                <div className="col-md-4">
                                    <ul className="list-group">
                                        <li className="list-group-item d-flex justify-content-between"><span>Op. Gravada:</span> <strong>{facturaData.opGravada}</strong></li>
                                        <li className="list-group-item d-flex justify-content-between"><span>IGV (18%):</span> <strong>{facturaData.igv}</strong></li>
                                        <li className="list-group-item d-flex justify-content-between bg-light fw-bold"><span>Total:</span> <span className="text-primary h5 mb-0">{facturaData.importeTotal}</span></li>
                                    </ul>
                                </div>
                            </div>

                            {/* === SECCIÓN OPCIONAL: GUÍA DE REMISIÓN === */}
                            <div className="mt-4 border-top pt-3">
                                <div className="form-check form-switch d-flex align-items-center gap-2 mb-3">
                                    <input className="form-check-input" type="checkbox" id="switchGuia" checked={incluirGuia}
                                        onChange={(e) => setIncluirGuia(e.target.checked)} style={{ transform: 'scale(1.3)' }} />
                                    <label className="form-check-label fw-bold text-info" htmlFor="switchGuia">
                                        <i className="fas fa-truck me-1"></i> Incluir Guía de Remisión
                                    </label>
                                </div>

                                {incluirGuia && (
                                    <div className="border rounded p-3 bg-white">
                                        <h6 className="text-info border-bottom pb-2 mb-3"><i className="fas fa-truck me-1"></i> Datos de la Guía de Remisión</h6>
                                        <p className="text-muted small mb-3"><i className="fas fa-info-circle me-1"></i> Los datos del destinatario, documento relacionado e items se tomarán automáticamente de la factura.</p>

                                        <div className="row g-2">
                                            {/* Datos de despacho */}
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">Nro. Guía <span className="text-danger">*</span></label>
                                                <input type="text" className="form-control form-control-sm border-primary" name="numeroGuia" value={guiaExtra.numeroGuia} onChange={handleGuiaChange} placeholder="Correlativo" />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">Fecha Traslado <span className="text-danger">*</span></label>
                                                <input type="date" className="form-control form-control-sm" name="fechaTraslado" value={guiaExtra.fechaTraslado} onChange={handleGuiaChange} />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label small fw-bold">Peso Bruto <span className="text-danger">*</span></label>
                                                <input type="number" className="form-control form-control-sm" name="pesoBruto" value={guiaExtra.pesoBruto} onChange={handleGuiaChange} placeholder="Ej: 1.9" step="0.1" />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label small fw-bold">Unidad Peso <span className="text-danger">*</span></label>
                                                <input type="text" className="form-control form-control-sm" name="unidadPeso" value={guiaExtra.unidadPeso} onChange={handleGuiaChange} placeholder="Ej: KGM" />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label small fw-bold">Nro. Bultos</label>
                                                <input type="number" className="form-control form-control-sm" name="bultos" value={guiaExtra.bultos} onChange={handleGuiaChange} min="1" />
                                            </div>

                                            {/* Punto de Partida */}
                                            <div className="col-12 mt-3"><span className="fw-bold small text-secondary">📍 Punto de Partida</span></div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">Ubigeo <span className="text-danger">*</span></label>
                                                <input type="text" className="form-control form-control-sm" name="puntoPartidaUbigeo" value={guiaExtra.puntoPartidaUbigeo} onChange={handleGuiaChange} maxLength="6" placeholder="Ej: 150132" />
                                            </div>
                                            <div className="col-md-9">
                                                <label className="form-label small fw-bold">Dirección <span className="text-danger">*</span></label>
                                                <input type="text" className="form-control form-control-sm" name="puntoPartida" value={guiaExtra.puntoPartida} onChange={handleGuiaChange} placeholder="Ej: Av. Principal 123 - Lima" />
                                            </div>

                                            {/* Punto de Llegada */}
                                            <div className="col-12 mt-2"><span className="fw-bold small text-secondary">📍 Punto de Llegada</span></div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">Ubigeo <span className="text-danger">*</span></label>
                                                <input type="text" className="form-control form-control-sm" name="puntoLlegadaUbigeo" value={guiaExtra.puntoLlegadaUbigeo} onChange={handleGuiaChange} maxLength="6" placeholder="Ej: 150122" />
                                            </div>
                                            <div className="col-md-9">
                                                <label className="form-label small fw-bold">Dirección <span className="text-danger">*</span></label>
                                                <input type="text" className="form-control form-control-sm" name="puntoLlegada" value={guiaExtra.puntoLlegada} onChange={handleGuiaChange} placeholder="Ej: Cal. Mendiburu 855" />
                                            </div>

                                            {/* Modalidad */}
                                            <div className="col-12 mt-3"><span className="fw-bold small text-secondary">🚛 Transporte</span></div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Modalidad</label>
                                                <select className="form-select form-select-sm" name="modalidad" value={guiaExtra.modalidad} onChange={handleGuiaChange}>
                                                    <option value="PRIVADO">Transporte Privado</option>
                                                    <option value="PÚBLICO">Transporte Público</option>
                                                </select>
                                            </div>

                                            {guiaExtra.modalidad === 'PÚBLICO' ? (
                                                <>
                                                    <div className="col-md-4">
                                                        <label className="form-label small fw-bold">Razón Social Transportista <span className="text-danger">*</span></label>
                                                        <input type="text" className="form-control form-control-sm" name="transportistaRazon" value={guiaExtra.transportistaRazon} onChange={handleGuiaChange} placeholder="Ej: Shalom S.A.C." />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label small fw-bold">RUC Transportista <span className="text-danger">*</span></label>
                                                        <input type="text" className="form-control form-control-sm" name="transportistaDoc" value={guiaExtra.transportistaDoc} onChange={handleGuiaChange} maxLength="11" placeholder="Ej: 20512528458" />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="col-md-4">
                                                        <label className="form-label small fw-bold">Placa Vehículo <span className="text-danger">*</span></label>
                                                        <input type="text" className="form-control form-control-sm" name="vehiculoPlaca" value={guiaExtra.vehiculoPlaca} onChange={handleGuiaChange} placeholder="Ej: F6Y931" />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label small fw-bold">DNI Conductor <span className="text-danger">*</span></label>
                                                        <input type="text" className="form-control form-control-sm" name="conductorDoc" value={guiaExtra.conductorDoc} onChange={handleGuiaChange} maxLength="11" placeholder="Ej: 47101979" />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label small fw-bold">Nombres Conductor</label>
                                                        <input type="text" className="form-control form-control-sm" name="conductorNombre" value={guiaExtra.conductorNombre} onChange={handleGuiaChange} placeholder="Ej: Juan" />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label small fw-bold">Apellidos Conductor</label>
                                                        <input type="text" className="form-control form-control-sm" name="conductorApellido" value={guiaExtra.conductorApellido} onChange={handleGuiaChange} placeholder="Ej: Gonzales" />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label small fw-bold">Nro. Licencia</label>
                                                        <input type="text" className="form-control form-control-sm" name="conductorLicencia" value={guiaExtra.conductorLicencia} onChange={handleGuiaChange} placeholder="Ej: Q43101919" />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VISTA DOCUMENTO (PREVIEW/PRINT) ---
    return (
        <div className="factura-container">
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

            <div className="factura-paper">
                {/* Header */}
                <div className="factura-header-grid">
                    <div className="qr-section">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=SUNAT_FACTURA_DEMO" alt="QR" className="qr-placeholder" />
                    </div>

                    <div className="header-company-info">
                        <img src={facturaData.logoUrl} alt="Logo" className="company-logo-img" />
                        <div className="company-name-title">{facturaData.razonSocialEmisor}</div>
                        <div className="company-details">{facturaData.direccionEmisor}</div>
                        <div className="company-details small">Telf: (01) 555-0909 | ventas@aseo360.com</div>
                    </div>

                    <div className="ruc-box">
                        <span className="ruc-number">RUC {facturaData.rucEmisor}</span>
                        <span className="ruc-title">FACTURA ELECTRÓNICA</span>
                        <span className="ruc-serie">{facturaData.serie} - {facturaData.numero}</span>
                    </div>
                </div>

                {/* Cliente Info */}
                <div className="customer-info-box">
                    <div className="info-row">
                        <span className="label-bold">Señor(es):</span>
                        <span className="value-text">{facturaData.clienteRazonSocial || 'CLIENTE EMPRESA S.A.C.'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label-bold">RUC:</span>
                        <span className="value-text">{facturaData.clienteRuc || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label-bold">Dirección:</span>
                        <span className="value-text">{facturaData.clienteDireccion || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label-bold">Fecha Emisión:</span>
                        <span className="value-text">{facturaData.fechaEmision}</span>
                        <span className="label-bold ms-4">Moneda:</span>
                        <span className="value-text">{facturaData.moneda}</span>
                        {facturaData.condicionPago === 'CREDITO' && (
                            <>
                                <span className="label-bold ms-4">Condición:</span>
                                <span className="value-text">CRÉDITO - Vence: {facturaData.fechaVencimiento}</span>
                            </>
                        )}
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
                        {facturaData.items.map((item, idx) => (
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
                            <span className="total-value">{facturaData.opGravada}</span>
                        </div>
                        <div className="total-row">
                            <span className="total-label">I.G.V. (18%):</span>
                            <span className="total-value">{facturaData.igv}</span>
                        </div>
                        <div className="total-row grand-total">
                            <span className="total-label">IMPORTE TOTAL:</span>
                            <span className="total-value">{facturaData.importeTotal}</span>
                        </div>
                    </div>
                </div>

                <div className="amount-in-words">
                    {facturaData.montoLetras}
                </div>
            </div>
        </div>
    );
};

export default Factura;
