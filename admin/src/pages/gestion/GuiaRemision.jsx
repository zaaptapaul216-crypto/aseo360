import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import './GuiaRemision.css';
import logo from '../../assets/imagenes/logo.png';
import { ComprobanteService } from '../../services/ComprobanteService';

const fmtFechaCompleta = (f) => {
    if (!f) return '—';
    try {
        let date;
        if (Array.isArray(f)) {
            const [y, m, d, h, min, s] = f;
            date = new Date(y, m - 1, d, h || 0, min || 0, s || 0);
        } else if (typeof f === 'string') {
            const parts = f.split(/[-T: .]/);
            if (parts.length >= 3) {
                const [y, m, d, h, min, s] = parts.map(Number);
                date = new Date(y, m - 1, d, h || 0, min || 0, s || 0);
            } else {
                date = new Date(f);
            }
        } else {
            date = new Date(f);
        }
        return date.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
    } catch { return f; }
};

const GuiaRemision = () => {
    // Mode: 'form' (editing) or 'preview' (viewing/printing)
    const [viewMode, setViewMode] = useState('form');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [activeTab, setActiveTab] = useState('listado');
    const [guias, setGuias] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoadingGuias, setIsLoadingGuias] = useState(false);

    // Estado con datos por defecto y estructura
    const [guiaData, setGuiaData] = useState({
        // Emisor
        razonSocialEmisor: 'INVERSIONES GENERALES T & C S.A.C.',
        rucEmisor: '20601130696',
        direccionEmisor: 'AV. PRINCIPAL 123 - LIMA',
        logoUrl: logo, // Usar logo importado

        // Documento
        serie: 'T001',
        numero: '',
        fechaEmision: '',
        fechaTraslado: '',

        // Documento Relacionado
        docRelacionadoDocumento: '',
        docRelacionadoSerie: '',
        docRelacionadoNumero: '',
        docRelacionadoRuc: '',

        // Traslado
        motivoTraslado: 'VENTA',
        modalidadTraslado: 'TRANSPORTE PRIVADO',
        pesoBruto: '',
        unidadPeso: 'KGM',
        bultos: '1',

        // Direcciones
        puntoPartida: '',
        puntoPartidaUbigeo: '',
        puntoLlegada: '',
        puntoLlegadaUbigeo: '',

        // Destinatario
        destinatarioRazon: '',
        destinatarioDoc: '',
        destinatarioDireccion: '',

        // Transportista (Público)
        transportistaRazon: '',
        transportistaDoc: '',

        // Vehiculo & Conductor (Privado)
        vehiculoPlaca: '',
        conductorDoc: '',
        conductorNombre: '',
        conductorApellido: '',
        conductorLicencia: '',

        // Items
        items: [
            { codigo: '', descripcion: '', unidad: 'NIU', cantidad: '1', peso: '' }
        ]
    });

    // Obtener siguiente correlativo al montar o cambiar de serie en modo emitir
    useEffect(() => {
        const fetchNumero = async () => {
            if (guiaData.serie && activeTab === 'emitir' && viewMode === 'form') {
                try {
                    const num = await ComprobanteService.obtenerSiguienteNumeroGuia(guiaData.serie);
                    setGuiaData(prev => ({ ...prev, numero: num }));
                } catch (error) {
                }
            }
        };
        fetchNumero();
    }, [guiaData.serie, activeTab, viewMode]);

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setGuiaData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...guiaData.items];
        newItems[index][field] = value;
        setGuiaData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setGuiaData(prev => ({
            ...prev,
            items: [...prev.items, { codigo: '', descripcion: '', unidad: 'NIU', cantidad: '', peso: '' }]
        }));
    };

    const removeItem = (index) => {
        setGuiaData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleGenerarSunat = async () => {
        try {
            setIsSubmitting(true);

            // Mapeamos motivoTraslado 
            let motivoCode = '01'; // VENTA
            if (guiaData.motivoTraslado === 'COMPRA') motivoCode = '02';
            if (guiaData.motivoTraslado === 'TRASLADO ENTRE ESTABLECIMIENTOS') motivoCode = '04';

            // Mapeamos modalidadTraslado 
            let modalidadCode = String(guiaData.modalidadTraslado).toUpperCase().includes('PÚBLICO') ? '01' : '02';

            const payload = {
                documento: "guia_remision_remitente",
                serie: guiaData.serie,
                numero: guiaData.numero.toString(),
                fecha_de_emision: guiaData.fechaEmision,
                hora_de_emision: new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Lima' }),
                modalidad_de_transporte: modalidadCode,
                motivo_de_traslado: motivoCode,
                fecha_inicio_de_traslado: guiaData.fechaTraslado,
                fecha_entrega_a_transportista: guiaData.fechaTraslado,
                destinatario_tipo_de_documento: guiaData.destinatarioDoc?.length === 11 ? "6" : "1",
                destinatario_numero_de_documento: guiaData.destinatarioDoc,
                destinatario_denominacion: guiaData.destinatarioRazon,
                destinatario_direccion: guiaData.destinatarioDireccion,

                punto_de_partida_ubigeo: guiaData.puntoPartidaUbigeo,
                punto_de_partida_direccion: guiaData.puntoPartida,
                punto_de_llegada_ubigeo: guiaData.puntoLlegadaUbigeo,
                // Usamos la misma dirección del destinatario si el puntoLlegada está vacío o por defecto
                punto_de_llegada_direccion: guiaData.puntoLlegada || guiaData.destinatarioDireccion,

                peso_bruto_total: parseFloat(guiaData.pesoBruto).toString(),
                peso_bruto_unidad_de_medida: String(guiaData.unidadPeso || "KGM").trim().substring(0, 3).toUpperCase().padEnd(3, 'M'),
                numero_de_bultos: parseInt(guiaData.bultos) || 1,
                observaciones: null,
                documentos_relacionados: guiaData.docRelacionadoSerie ? [
                    {
                        documento: guiaData.docRelacionadoDocumento || "factura",
                        serie: guiaData.docRelacionadoSerie,
                        numero: String(guiaData.docRelacionadoNumero),
                        ruc_emisor: String(guiaData.docRelacionadoRuc || guiaData.rucEmisor)
                    }
                ] : [],
                items: guiaData.items.map((item, idx) => {
                    let unit = String(item.unidad || "NIU").trim().toUpperCase();
                    if (unit === 'UND') unit = 'NIU';
                    return {
                        codigo_interno: item.codigo || `ITEM${idx + 1}`,
                        descripcion: item.descripcion,
                        unidad_de_medida: unit.substring(0, 3).padEnd(3, 'U'),
                        cantidad: parseFloat(item.cantidad) || 1
                    };
                })
            };

            if (modalidadCode === '01') {
                payload.transportista = {
                    ruc: String(guiaData.transportistaDoc || ""),
                    denominacion: String(guiaData.transportistaRazon || ""),
                    numero_registro_MTC: "00001",
                    numero_autorizacion: "00001",
                    codigo_entidad_autorizadora: "00001"
                };
            } else {
                payload.vehiculos = [
                    { vehiculo: "principal", numero_de_placa: String(guiaData.vehiculoPlaca || "") }
                ];
                payload.conductores = [
                    {
                        conductor: "principal",
                        tipo_de_documento: guiaData.conductorDoc?.length === 11 ? "6" : "1",
                        numero_de_documento: String(guiaData.conductorDoc || ""),
                        nombres: String(guiaData.conductorNombre || ""),
                        apellidos: String(guiaData.conductorApellido || ""),
                        numero_licencia_conducir: String(guiaData.conductorLicencia || "") || "Q12345678"
                    }
                ];
            }

            await ComprobanteService.enviarGuiaRemision(payload);
            toast.success('Guía enviada exitosamente a SUNAT.');
        } catch (error) {
            const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchGuias = async (pageNumber = 0) => {
        try {
            setIsLoadingGuias(true);
            const data = await ComprobanteService.listarGuiasRemision(pageNumber, 15);
            setGuias(data.content);
            setTotalPages(data.totalPages);
            setPage(data.number);
        } catch (error) {
            toast.error('Error al cargar historial de guías');
        } finally {
            setIsLoadingGuias(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'listado') {
            fetchGuias(page);
        }
    }, [activeTab, page]);

    // --- VISTA FORMULARIO (INPUTS) ---
    if (viewMode === 'form') {
        return (
            <div className="container mt-4 mb-5">
                <div className="card shadow border-0">
                    <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
                        <h5 className="mb-0"><i className="fas fa-file-invoice me-2"></i>Gestión de Guías de Remisión</h5>
                        {activeTab === 'emitir' && (
                            <div className="d-flex gap-2">
                                <button className="btn btn-warning btn-sm fw-bold border-white" onClick={handleGenerarSunat} disabled={isSubmitting}>
                                    {isSubmitting ? <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> : <i className="fas fa-check-circle me-1"></i>}
                                    Generar a SUNAT
                                </button>
                                <button className="btn btn-outline-light btn-sm fw-bold" onClick={() => setViewMode('preview')}>
                                    <i className="fas fa-eye me-1"></i> Vista Previa
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="card-header bg-white border-bottom p-0">
                        <ul className="nav nav-tabs px-3 pt-3">
                            <li className="nav-item">
                                <button
                                    className={`nav-link fw-bold ${activeTab === 'listado' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('listado')}
                                >
                                    <i className="fas fa-list me-2"></i>Historial de Guías
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link fw-bold ${activeTab === 'emitir' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('emitir')}
                                >
                                    <i className="fas fa-plus-circle me-2"></i>Emitir Nueva Guía
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="card-body bg-light">
                        {activeTab === 'emitir' && (
                            <>
                                <div className="row g-3">
                            {/* Sección Emisor & Doc */}
                            <div className="col-12"><h6 className="text-primary border-bottom pb-2">1. Datos del Documento</h6></div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Serie</label>
                                <input type="text" className="form-control form-control-sm" name="serie" value={guiaData.serie} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Número</label>
                                <input type="text" className="form-control form-control-sm border-primary" name="numero" value={guiaData.numero} onChange={handleChange} placeholder="Correlativo" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Fecha Emisión (*)</label>
                                <input type="date" className="form-control form-control-sm" name="fechaEmision" value={guiaData.fechaEmision} onChange={handleChange} required />
                            </div>
                            {/* RUC Emisor ha sido ocultado para no pedirlo de nuevo, ya existe por detrás */}

                            {/* Sección Doc Relacionado */}
                            <div className="col-12 mt-4"><h6 className="text-primary border-bottom pb-2">1.1 Documento Relacionado (Opcional)</h6></div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Tipo Doc</label>
                                <select className="form-select form-select-sm" name="docRelacionadoDocumento" value={guiaData.docRelacionadoDocumento || 'factura'} onChange={handleChange}>
                                    <option value="factura">Factura</option>
                                    <option value="boleta">Boleta</option>
                                    <option value="ticket">Ticket</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Serie</label>
                                <input type="text" className="form-control form-control-sm" name="docRelacionadoSerie" value={guiaData.docRelacionadoSerie} onChange={handleChange} placeholder="Ej: F001" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Número</label>
                                <input type="text" className="form-control form-control-sm" name="docRelacionadoNumero" value={guiaData.docRelacionadoNumero} onChange={handleChange} />
                            </div>
                            {/* RUC Emisor Doc ha sido ocultado, enviará el principal de la empresa */}

                            {/* Sección Traslado */}
                            <div className="col-12 mt-4"><h6 className="text-primary border-bottom pb-2">2. Datos del Traslado</h6></div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Fecha Inicio Traslado</label>
                                <input type="date" className="form-control form-control-sm" name="fechaTraslado" value={guiaData.fechaTraslado} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Motivo Traslado</label>
                                <select className="form-select form-select-sm" name="motivoTraslado" value={guiaData.motivoTraslado} onChange={handleChange}>
                                    <option value="VENTA">Venta</option>
                                    <option value="COMPRA">Compra</option>
                                    <option value="TRASLADO ENTRE ESTABLECIMIENTOS">Traslado entre establecimientos</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Peso Bruto Total</label>
                                <input type="text" className="form-control form-control-sm" name="pesoBruto" value={guiaData.pesoBruto} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Unidad Peso</label>
                                <input type="text" className="form-control form-control-sm" name="unidadPeso" value={guiaData.unidadPeso} onChange={handleChange} />
                            </div>

                            {/* Sección Puntos */}
                            <div className="col-12 mt-4"><h6 className="text-primary border-bottom pb-2">3. Origen y Destino</h6></div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold text-muted">Ubigeo Partida (*)</label>
                                <input type="text" className="form-control form-control-sm " name="puntoPartidaUbigeo" value={guiaData.puntoPartidaUbigeo} onChange={handleChange} maxLength="6" placeholder="Ej: 150101" required />
                            </div>
                            <div className="col-md-10">
                                <label className="form-label small fw-bold text-muted">Punto de Partida (Dirección Completa) (*)</label>
                                <textarea className="form-control form-control-sm " rows="1" name="puntoPartida" value={guiaData.puntoPartida} onChange={handleChange} required></textarea>
                            </div>
                            <div className="col-md-2 mt-3">
                                <label className="form-label small fw-bold text-muted">Ubigeo Llegada (*)</label>
                                <input type="text" className="form-control form-control-sm " name="puntoLlegadaUbigeo" value={guiaData.puntoLlegadaUbigeo} onChange={handleChange} maxLength="6" placeholder="Ej: 150101" required />
                            </div>
                            <div className="col-md-10 mt-3">
                                <label className="form-label small fw-bold text-muted">Punto de Llegada (Dirección Completa) (*)</label>
                                <textarea className="form-control form-control-sm " rows="1" name="puntoLlegada" value={guiaData.puntoLlegada} onChange={handleChange} required></textarea>
                            </div>

                            {/* Sección Destinatario */}
                            <div className="col-12 mt-4"><h6 className="text-primary border-bottom pb-2">4. Destinatario</h6></div>
                            <div className="col-md-9">
                                <label className="form-label small fw-bold text-muted">Razón Social Destinatario (*)</label>
                                <input type="text" className="form-control form-control-sm " name="destinatarioRazon" value={guiaData.destinatarioRazon} onChange={handleChange} placeholder="Ej: MI EMPRESA S.A.C." required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted">RUC / Doc Destinatario (*)</label>
                                <input type="text" className="form-control form-control-sm " name="destinatarioDoc" value={guiaData.destinatarioDoc} onChange={handleChange} maxLength="11" placeholder="Ej: 20600000000" required />
                            </div>
                            <div className="col-md-12 mt-3">
                                <label className="form-label small fw-bold text-muted">Dirección Destinatario (*)</label>
                                <textarea className="form-control form-control-sm " rows="1" name="destinatarioDireccion" value={guiaData.destinatarioDireccion} onChange={handleChange} placeholder="Ej: Av. Las Primaveras 123" required></textarea>
                            </div>

                            {/* Sección Transporte */}
                            <div className="col-12 mt-4 d-flex justify-content-between align-items-center border-bottom pb-2">
                                <h6 className="text-primary mb-0">5. Transporte</h6>
                                <div className="form-check form-switch ms-3">
                                    <input className="form-check-input" type="checkbox" id="switchModalidad"
                                        checked={guiaData.modalidadTraslado === 'TRANSPORTE PÚBLICO'}
                                        onChange={(e) => setGuiaData(p => ({ ...p, modalidadTraslado: e.target.checked ? 'TRANSPORTE PÚBLICO' : 'TRANSPORTE PRIVADO' }))}
                                    />
                                    <label className="form-check-label small fw-bold text-muted" htmlFor="switchModalidad">
                                        {guiaData.modalidadTraslado === 'TRANSPORTE PÚBLICO' ? 'Público (Empresa Transporte)' : 'Privado (Vehículo Propio)'}
                                    </label>
                                </div>
                            </div>

                            {guiaData.modalidadTraslado === 'TRANSPORTE PÚBLICO' ? (
                                <>
                                    <div className="col-md-8">
                                        <label className="form-label small fw-bold text-muted">Razón Social Transportista (*)</label>
                                        <input type="text" className="form-control form-control-sm " name="transportistaRazon" value={guiaData.transportistaRazon} onChange={handleChange} placeholder="Ej: SHALOM EMPRESARIAL S.A.C." required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-muted">RUC Transportista (*)</label>
                                        <input type="text" className="form-control form-control-sm " name="transportistaDoc" value={guiaData.transportistaDoc} onChange={handleChange} maxLength="11" required />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-muted">DNI Conductor (*)</label>
                                        <input type="text" className="form-control form-control-sm " name="conductorDoc" value={guiaData.conductorDoc} onChange={handleChange} maxLength="8" required />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-muted">Nombres Conductor (*)</label>
                                        <input type="text" className="form-control form-control-sm " name="conductorNombre" value={guiaData.conductorNombre} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-muted">Apellidos Conductor (*)</label>
                                        <input type="text" className="form-control form-control-sm " name="conductorApellido" value={guiaData.conductorApellido} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold">Licencia Conducir</label>
                                        <input type="text" className="form-control form-control-sm" name="conductorLicencia" value={guiaData.conductorLicencia} onChange={handleChange} placeholder="Ej: Q43101919" />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-muted">Placa del Vehículo (*)</label>
                                        <input type="text" className="form-control form-control-sm " name="vehiculoPlaca" value={guiaData.vehiculoPlaca} onChange={handleChange} placeholder="Ej: ABC123" required />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Tabla Items */}
                        <div className="mt-4">
                            <h6 className="text-primary border-bottom pb-2">6. Bienes a Transportar</h6>
                            <table className="table table-bordered table-sm bg-white">
                                <thead className="table-light">
                                    <tr>
                                        <th>Código</th>
                                        <th>Descripción</th>
                                        <th style={{ width: '100px' }}>Unidad</th>
                                        <th style={{ width: '100px' }}>Cant.</th>
                                        <th style={{ width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {guiaData.items.map((item, index) => (
                                        <tr key={index}>
                                            <td><input type="text" className="form-control form-control-sm border-0" value={item.codigo} onChange={(e) => handleItemChange(index, 'codigo', e.target.value)} placeholder="Cod" /></td>
                                            <td><input type="text" className="form-control form-control-sm border-0" value={item.descripcion} onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)} placeholder="Descripción" /></td>
                                            <td><input type="text" className="form-control form-control-sm border-0" value={item.unidad} onChange={(e) => handleItemChange(index, 'unidad', e.target.value)} /></td>
                                            <td><input type="text" className="form-control form-control-sm border-0" value={item.cantidad} onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)} /></td>
                                            <td className="text-center"><button className="btn btn-sm text-muted" onClick={() => removeItem(index)}><i className="fas fa-times"></i></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="btn btn-sm btn-outline-primary" onClick={addItem}>+ Agregar Bien</button>
                        </div>
                        </>
                        )}
                        
                        {activeTab === 'listado' && (
                            <div className="table-responsive">
                                {isLoadingGuias ? (
                                    <div className="text-center p-5"><span className="spinner-border text-primary"></span></div>
                                ) : (
                                    <>
                                        <table className="table table-hover table-sm">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>Fecha</th>
                                                    <th>Comprobante</th>
                                                    <th>Destinatario</th>
                                                    <th>Doc. Destino</th>
                                                    <th>Estado</th>
                                                    <th className="text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {guias.length === 0 ? (
                                                    <tr><td colSpan="6" className="text-center">No hay guías registradas.</td></tr>
                                                ) : (
                                                    guias.map(g => (
                                                        <tr key={g.id}>
                                                             <td>{fmtFechaCompleta(g.fechaEmision)}</td>
                                                            <td><span className="badge bg-secondary">{g.serie}-{g.numero}</span></td>
                                                            <td>{g.destinatarioDenominacion}</td>
                                                            <td>{g.destinatarioDocumento}</td>
                                                            <td>
                                                                <span className={`badge ${g.estadoSunat === 'ACEPTADO' ? 'bg-success' : g.estadoSunat === 'RECHAZADO' ? 'bg-danger' : 'bg-warning'}`}>
                                                                    {g.estadoSunat}
                                                                </span>
                                                            </td>
                                                            <td className="text-center">
                                                                <div className="btn-group">
                                                                    {g.enlacePdfA4 && (
                                                                        <a href={g.enlacePdfA4} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-danger" title="Ver PDF">
                                                                            <i className="fas fa-file-pdf"></i>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>

                                        {/* Paginación */}
                                        {totalPages > 1 && (
                                            <nav className="d-flex justify-content-center mt-3">
                                                <ul className="pagination pagination-sm">
                                                    <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={() => setPage(page - 1)}>Anterior</button>
                                                    </li>
                                                    {[...Array(totalPages).keys()].map(p => (
                                                        <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                                            <button className="page-link" onClick={() => setPage(p)}>{p + 1}</button>
                                                        </li>
                                                    ))}
                                                    <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={() => setPage(page + 1)}>Siguiente</button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- VISTA DOCUMENTO (PREVIEW/PRINT) ---
    return (
        <div className="guia-container">
            {/* Action Bar (Solo Pantalla) */}
            <div className="action-bar">
                <button className="btn btn-secondary btn-float" onClick={() => setViewMode('form')} title="Volver a Editar">
                    <i className="fas fa-pencil-alt"></i>
                </button>
                <button className="btn btn-primary btn-float" onClick={() => window.print()} title="Imprimir">
                    <i className="fas fa-print"></i>
                </button>
            </div>

            <div className="guia-paper">
                {/* 1. Header Grid: QR - Company - RUC */}
                <div className="guia-header-grid">
                    <div className="qr-section">
                        {/* QR Placeholder: replace with actual QR generator if needed */}
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=SUNAT_GUIA_REMISSION_DEMO" alt="QR" className="qr-placeholder" />
                    </div>

                    <div className="header-company-info">
                        <img src={guiaData.logoUrl} alt="Logo" className="company-logo-img" />
                        <div className="company-name-title">{guiaData.razonSocialEmisor}</div>
                        <div className="company-details">{guiaData.direccionEmisor}</div>
                        <div className="company-details small">Emisión Electrónica Principal</div>
                        <div className="mt-2 fw-bold">Fecha de Emisión: {guiaData.fechaEmision}</div>
                    </div>

                    <div className="ruc-box">
                        <span className="ruc-number">RUC {guiaData.rucEmisor}</span>
                        <span className="ruc-title">GUÍA DE REMISIÓN ELECTRÓNICA REMITENTE</span>
                        <span className="ruc-serie">{guiaData.serie} - {guiaData.numero}</span>
                    </div>
                </div>

                {/* 2. Grid Format for Addresses and Transfer Info */}
                <div className="addresses-grid">
                    {/* Columna Izquierda */}
                    <div className="info-column">
                        <div className="info-block">
                            <span className="label-bold">Fecha de entrega de bienes al transportista:</span>
                            <span className="value-text">{guiaData.fechaTraslado}</span>
                        </div>
                        <div className="info-block">
                            <span className="label-bold">Motivo de Traslado:</span>
                            <span className="value-text">{guiaData.motivoTraslado}</span>
                        </div>
                        {guiaData.docRelacionadoSerie && (
                            <div className="info-block mt-2">
                                <span className="label-bold">Documento Relacionado:</span>
                                <span className="value-text text-uppercase d-block">{guiaData.docRelacionadoDocumento} {guiaData.docRelacionadoSerie}-{guiaData.docRelacionadoNumero}</span>
                            </div>
                        )}
                    </div>

                    {/* Columna Derecha */}
                    <div className="info-column">
                        <div className="address-box">
                            <span className="label-bold d-block">Punto de Partida:</span>
                            <span className="value-text">{guiaData.puntoPartida}</span>
                        </div>
                        <div className="address-box">
                            <span className="label-bold d-block">Punto de Llegada:</span>
                            <span className="value-text">{guiaData.puntoLlegada}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Destinatario Line */}
                <div className="info-block mt-3 border-top pt-2">
                    <div>
                        <span className="label-bold">Datos del Destinatario:</span>
                        <span className="value-text me-3">{guiaData.destinatarioRazon}</span>
                        <span className="label-bold">RUC/DOC:</span>
                        <span className="value-text">{guiaData.destinatarioDoc}</span>
                    </div>
                    <div className="mt-1">
                        <span className="label-bold">Dirección:</span>
                        <span className="value-text">{guiaData.destinatarioDireccion}</span>
                    </div>
                </div>

                {/* 4. Table */}
                <div className="mt-2">
                    <div className="label-bold mb-1">Bienes por transportar:</div>
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Código</th>
                                <th>Descripción Detallada</th>
                                <th>Unidad de Medida</th>
                                <th>Cantidad</th>
                                <th>Peso Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {guiaData.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="text-center">{idx + 1}</td>
                                    <td className="text-center">{item.codigo}</td>
                                    <td>{item.descripcion}</td>
                                    <td className="text-center">{item.unidad}</td>
                                    <td className="text-center">{item.cantidad}</td>
                                    <td className="text-center">{item.peso}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 5. Footer Info (Weights & Transport) */}
                <div className="footer-grid">
                    <div>
                        <div className="info-block">
                            <span className="label-bold">Unidad de Medida del Peso Bruto:</span>
                            <span className="value-text">{guiaData.unidadPeso}</span>
                        </div>
                        <div className="info-block">
                            <span className="label-bold">Peso Bruto total de la carga:</span>
                            <span className="value-text">{guiaData.pesoBruto}</span>
                        </div>
                        <div className="info-block mt-3">
                            <span className="label-bold d-block mb-1">Datos del traslado:</span>
                            <div>Modalidad de Traslado: {guiaData.modalidadTraslado}</div>
                        </div>
                    </div>

                    <div>
                        <div className="info-block">
                            {/* Espacio para datos adicionales o indicadores */}
                        </div>
                        <div className="info-block mt-3">
                            {guiaData.modalidadTraslado === 'TRANSPORTE PÚBLICO' ? (
                                <>
                                    <span className="label-bold d-block mb-1">Datos del transportista:</span>
                                    <div>{guiaData.transportistaRazon}</div>
                                    <div>RUC: {guiaData.transportistaDoc}</div>
                                </>
                            ) : (
                                <>
                                    <span className="label-bold d-block mb-1">Datos del Transporte Privado:</span>
                                    <div>Vehículo (Placa): {guiaData.vehiculoPlaca}</div>
                                    <div>Conductor: {guiaData.conductorNombre} {guiaData.conductorApellido}</div>
                                    <div>DNI: {guiaData.conductorDoc} {guiaData.conductorLicencia ? `| Licencia: ${guiaData.conductorLicencia}` : ''}</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuiaRemision;
