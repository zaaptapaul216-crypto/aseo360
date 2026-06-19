import React, { useState, useEffect } from 'react';
import { ComprobanteService } from '../../services/ComprobanteService';
import { VentaService } from '../../services/VentaService';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import logo from '../../assets/imagenes/logo.png';

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

const Comprobantes = () => {
    const [comprobantes, setComprobantes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [isAnulando, setIsAnulando] = useState(false);
    const [isConsultando, setIsConsultando] = useState(false);
    const [ticketPrintData, setTicketPrintData] = useState(null);

    // Estados de paginación
    const [paginaActual, setPaginaActual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalElementos, setTotalElementos] = useState(0);

    useEffect(() => {
        cargarComprobantes(paginaActual);
    }, [paginaActual]);

    const cargarComprobantes = async (page = 0) => {
        try {
            setCargando(true);
            const data = await ComprobanteService.listar(page, 15);
            const content = data.content || [];

            setComprobantes(content);
            setPaginaActual(data.number !== undefined ? data.number : page);
            setTotalPaginas(data.totalPages || 1);
            setTotalElementos(data.totalElements || content.length);
        } catch (error) {
            toast.error('Ocurrió un error al cargar la lista de comprobantes.');
        } finally {
            setCargando(false);
        }
    };

    const handleAnular = async (comp) => {
        const r = await Swal.fire({
            title: `¿Anular esta ${comp.tipoDocumento}?`,
            text: `${comp.serie}-${comp.numero} — Esta acción notificará a la SUNAT y no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'Cancelar'
        });

        if (r.isConfirmed) {
            try {
                setIsAnulando(true);
                toast.info(`Iniciando anulación de ${comp.tipoDocumento} ${comp.serie}-${comp.numero} en SUNAT...`);
                await ComprobanteService.anular(comp.id);
                toast.success('Comprobante anulado exitosamente.');
                cargarComprobantes(paginaActual);
            } catch (error) {
                const backendMsg = error.response?.data?.message || error.response?.data || "Ocurrió un error al intentar anular el comprobante.";
                toast.error(typeof backendMsg === 'string' ? backendMsg : 'Error al anular.');
            } finally {
                setIsAnulando(false);
            }
        }
    };

    const handleConsultarEstado = async (comp) => {
        try {
            setIsConsultando(true);
            toast.info(`Consultando estado de ${comp.tipoDocumento} ${comp.serie}-${comp.numero} en SUNAT...`);
            const res = await ComprobanteService.consultarEstado(comp.id);
            toast.success(`Estado actualizado: ${res.estadoSunat}`);
            cargarComprobantes(paginaActual);
        } catch (error) {
            const backendMsg = error.response?.data?.message || error.response?.data || "Ocurrió un error al intentar consultar el estado.";
            toast.error(typeof backendMsg === 'string' ? backendMsg : 'Error al consultar estado.');
        } finally {
            setIsConsultando(false);
        }
    };

    const handleDescargarTicketInterno = async (comp) => {
        try {
            toast.info('Obteniendo detalles del ticket...');
            if (!comp.venta || !comp.venta.idVenta) {
                toast.error('La información de la venta original no está disponible (ID de venta nulo).');
                return;
            }
            const detalles = await VentaService.getDetallesPorVentaId(comp.venta.idVenta);

            // Map the details and the sale into an object to render
            const dataToPrint = {
                fechaTicket: comp.fechaEmision ? new Date(comp.fechaEmision).toLocaleString('es-PE') : new Date().toLocaleString(),
                clienteData: { nombreCompleto: comp.clienteNombre || 'CLIENTE GENERAL' },
                serieNumero: `${comp.serie}-${comp.numero}`,
                metodoPago: comp.venta?.formaPago || 'EFECTIVO',
                subtotal: comp.totalComprobante?.toFixed(2) || '0.00',
                items: detalles.map(d => ({
                    cantidad: d.cantidad,
                    nombre: d.producto?.nombre,
                    precioTotalItem: parseFloat(d.precioUnitario) * parseInt(d.cantidad),
                    precioUnitario: parseFloat(d.precioUnitario)
                }))
            };

            setTicketPrintData(dataToPrint);

            // Give React a cycle to render the hidden div, then generate PDF
            setTimeout(() => {
                const element = document.getElementById('historial-ticket-interno-pdf');
                if (!element) {
                    toast.error('No se pudo encontrar el contenedor del PDF');
                    return;
                }
                const opt = {
                    margin: [2, 2, 2, 2],
                    filename: `Ticket_Interno_${comp.serie}-${comp.numero}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: [80, 297], orientation: 'portrait' }
                };

                html2pdf().set(opt).from(element).save().then(() => {
                    toast.success('Ticket interno generado.');
                    setTicketPrintData(null); // Clear data
                });
            }, 300);

        } catch (error) {
            toast.error('No se pudo generar el ticket interno.');
            setTicketPrintData(null);
        }
    };

    const comprobantesFiltrados = comprobantes.filter(c => {
        const query = filtro.toLowerCase();
        return (
            c.id?.toString().includes(query) ||
            c.serie?.toLowerCase().includes(query) ||
            c.numero?.toString().includes(query) ||
            c.clienteNombre?.toLowerCase().includes(query) ||
            c.clienteDocumento?.includes(query) ||
            c.tipoDocumento?.toLowerCase().includes(query)
        );
    });

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'ACEPTADO': return <span className="badge bg-success rounded-pill"><i className="fas fa-check-circle me-1"></i>ACEPTADO</span>;
            case 'RECHAZADO': return <span className="badge bg-danger rounded-pill"><i className="fas fa-times-circle me-1"></i>RECHAZADO</span>;
            default: return <span className="badge bg-warning text-dark rounded-pill"><i className="fas fa-clock me-1"></i>{estado || 'PENDIENTE'}</span>;
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: '#094e8a', fontWeight: '800' }}>
                    <i className="fas fa-file-invoice-dollar me-2"></i>ADMINISTRADOR DE COMPROBANTES
                </h2>
                <button className="btn btn-outline-primary shadow-sm" onClick={() => cargarComprobantes(0)} disabled={cargando}>
                    <i className="fas fa-sync-alt me-2"></i>Actualizar
                </button>
            </div>

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body bg-light rounded-3">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 text-muted">
                            <i className="fas fa-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Buscar comprobante por cliente, serie, número o tipo..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th className="ps-4">ID</th>
                                    <th>Serie - Número</th>
                                    <th>Fecha Emisión</th>
                                    <th>Cliente</th>
                                    <th>Tipo</th>
                                    <th className="text-end">Total</th>
                                    <th className="text-center">Estado SUNAT</th>
                                    <th className="text-center">PDF</th>
                                    <th className="text-center pe-4">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-5 text-muted">
                                            <div className="spinner-border spinner-border-sm me-2"></div>
                                            Cargando comprobantes...
                                        </td>
                                    </tr>
                                ) : comprobantesFiltrados.length > 0 ? (
                                    comprobantesFiltrados.map((comp) => (
                                        <tr key={comp.id} className={comp.estadoSunat === 'RECHAZADO' ? 'table-danger' : ''}>
                                            <td className="ps-4 fw-bold">{comp.id}</td>
                                            <td className="fw-bold">{comp.serie}-{comp.numero}</td>
                                             <td>
                                                 {fmtFechaCompleta(comp.fechaEmision)}
                                             </td>
                                            <td>
                                                <div className="fw-bold text-truncate" style={{ maxWidth: '200px' }}>
                                                    {comp.clienteNombre || 'Sin nombre'}
                                                </div>
                                                <small className="text-muted">{comp.clienteDocumento || '-'}</small>
                                            </td>
                                            <td>
                                                <span className={`badge ${comp.tipoDocumento === 'FACTURA' ? 'bg-primary' : 'bg-success'}`}>
                                                    <i className={`fas ${comp.tipoDocumento === 'FACTURA' ? 'fa-building' : 'fa-receipt'} me-1`}></i>
                                                    {comp.tipoDocumento}
                                                </span>
                                            </td>
                                            <td className="text-end fw-bold">
                                                S/ {comp.totalComprobante?.toFixed(2) || '0.00'}
                                            </td>
                                            <td className="text-center">
                                                {getEstadoBadge(comp.estadoSunat)}
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex gap-1 justify-content-center">
                                                    {comp.enlacePdfA4 && (
                                                        <a href={comp.enlacePdfA4} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm" title="PDF A4">
                                                            <i className="fas fa-file-pdf"></i>
                                                        </a>
                                                    )}
                                                    {comp.enlacePdfTicket && (
                                                        <a href={comp.enlacePdfTicket} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-sm" title="Ticket SUNAT">
                                                            <i className="fas fa-receipt"></i>
                                                        </a>
                                                    )}
                                                    {!comp.enlacePdfA4 && !comp.enlacePdfTicket && comp.tipoDocumento === 'TICKET' && (
                                                        <button
                                                            className="btn btn-outline-dark btn-sm fw-bold shadow-sm"
                                                            onClick={() => handleDescargarTicketInterno(comp)}
                                                            title="Descargar Ticket Interno"
                                                        >
                                                            <i className="fas fa-print"></i> TICKET
                                                        </button>
                                                    )}
                                                    {!comp.enlacePdfA4 && !comp.enlacePdfTicket && comp.tipoDocumento !== 'TICKET' && (
                                                        <span className="text-muted small">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-center pe-4">
                                                <div className="d-flex flex-column gap-2 align-items-center">
                                                    {comp.estadoSunat === 'ANULADO' ? (
                                                        <span className="badge bg-danger rounded-pill"><i className="fas fa-ban me-1"></i>Anulado</span>
                                                    ) : (
                                                        <button
                                                            className="btn btn-outline-danger btn-sm rounded-pill fw-bold w-100"
                                                            onClick={() => handleAnular(comp)}
                                                            disabled={isAnulando || isConsultando}
                                                            title="Anular Comprobante en la SUNAT"
                                                        >
                                                            <i className="fas fa-times-circle me-1"></i>Anular
                                                        </button>
                                                    )}
                                                    {comp.tipoDocumento !== 'TICKET' && (
                                                        <button
                                                            className="btn btn-outline-info btn-sm rounded-pill fw-bold w-100"
                                                            onClick={() => handleConsultarEstado(comp)}
                                                            disabled={isAnulando || isConsultando}
                                                            title="Consultar Estado en SUNAT"
                                                        >
                                                            <i className="fas fa-sync-alt me-1"></i>Consultar Estado
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center py-5 text-muted">
                                            <i className="fas fa-file-excel fa-3x mb-3 text-secondary opacity-50 d-block"></i>
                                            <h5>No hay comprobantes emitidos o visibles con este filtro.</h5>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Controles de Paginación */}
            {totalPaginas > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-muted small">
                        Mostrando página {paginaActual + 1} de {totalPaginas} ({totalElementos} comprobantes en total)
                    </span>
                    <nav aria-label="Navegación de comprobantes">
                        <ul className="pagination mb-0 shadow-sm">
                            <li className={`page-item ${paginaActual === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPaginaActual(paginaActual - 1)}>
                                    <i className="fas fa-chevron-left me-1"></i> Anterior
                                </button>
                            </li>

                            {[...Array(totalPaginas)].map((_, idx) => {
                                if (idx === 0 || idx === totalPaginas - 1 || Math.abs(idx - paginaActual) <= 2) {
                                    return (
                                        <li key={idx} className={`page-item ${paginaActual === idx ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setPaginaActual(idx)}>
                                                {idx + 1}
                                            </button>
                                        </li>
                                    );
                                } else if (Math.abs(idx - paginaActual) === 3) {
                                    return <li key={idx} className="page-item disabled"><span className="page-link">...</span></li>;
                                }
                                return null;
                            })}

                            <li className={`page-item ${paginaActual === totalPaginas - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPaginaActual(paginaActual + 1)}>
                                    Siguiente <i className="fas fa-chevron-right ms-1"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* Render oculto del ticket interno para html2pdf */}
            {ticketPrintData && (
                <div style={{ display: 'none' }}>
                    <div id="historial-ticket-interno-pdf" className="bg-white text-dark p-2" style={{ width: '80mm', minHeight: '150mm', fontSize: '10px', fontFamily: 'monospace' }}>
                        <div className="text-center mb-2">
                            <img src={logo} alt="Logo" style={{ maxWidth: '50mm', maxHeight: '25mm', filter: 'grayscale(100%)' }} />
                            <div className="fw-bold" style={{ fontSize: '16px' }}>ASEO 360</div>
                            <div>RUC: 20611306963</div>
                            <div style={{ borderBottom: '1px solid #000', margin: '6px 0' }}></div>
                            <div className="fw-bold" style={{ fontSize: '14px' }}>Copia - TICKET VENTA</div>
                            <div>{ticketPrintData.fechaTicket}</div>
                        </div>

                        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

                        <div className="mb-2">
                            <div className="d-flex gap-1 justify-content-start"><span className="fw-bold">Cliente:</span> <span>{ticketPrintData.clienteData?.nombreCompleto || 'CLIENTE GENERAL'}</span></div>
                            <div className="d-flex gap-1 justify-content-start"><span className="fw-bold">Comprobante:</span> <span>{ticketPrintData.serieNumero}</span></div>
                            <div className="d-flex gap-1 justify-content-start"><span className="fw-bold">PAGO:</span> <span>{ticketPrintData.metodoPago}</span></div>
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
                                {ticketPrintData.items?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '4px' }}>{item.cantidad}</td>
                                        <td style={{ textAlign: 'left', verticalAlign: 'top', paddingLeft: '4px', paddingTop: '4px' }}>
                                            {item.nombre}
                                            <div style={{ fontSize: '9px', color: '#555' }}>PU: S/ {item.precioUnitario.toFixed(2)}</div>
                                        </td>
                                        <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '4px', fontWeight: 'bold' }}>S/ {item.precioTotalItem.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

                        <div className="d-flex flex-column align-items-end mt-2">
                            <div className="d-flex justify-content-between w-75 fw-bold" style={{ fontSize: '13px', borderTop: '1px solid #000', paddingTop: '4px' }}>
                                <span>TOTAL:</span>
                                <span>S/ {ticketPrintData.subtotal}</span>
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

export default Comprobantes;
