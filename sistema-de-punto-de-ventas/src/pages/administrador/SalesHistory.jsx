import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faSearch, faEye, faDownload, faFilePdf, faFileCode } from '@fortawesome/free-solid-svg-icons';



import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ... imports

import { useData } from '../../context/DataContext';

const SalesHistory = () => {
    const { sales } = useData();

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Historial de Ventas - ASEO360", 14, 16);
        doc.autoTable({
            startY: 20,
            head: [['Fecha', 'Documento', 'Cliente', 'Tipo', 'Total', 'Estado']],
            body: sales.map(s => [s.date, s.sunat_ref, s.client?.name || '-', s.type, `S/ ${s.total.toFixed(2)}`, s.status]),
        });
        doc.save('reporte_ventas.pdf');
    };

    const exportToExcel = () => {
        const workSheet = XLSX.utils.json_to_sheet(sales.map(s => ({
            Fecha: s.date,
            Documento: s.sunat_ref,
            Cliente: s.client?.name || '-',
            Tipo: s.type,
            Total: s.total,
            Estado: s.status
        })));
        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, "Ventas");
        XLSX.writeFile(workBook, "reporte_ventas.xlsx");
    };

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);

    const handleOpenDetail = (sale) => {
        setSelectedSale(sale);
        setShowDetailModal(true);
    };

    return (
        <Layout>
            <div className="container-fluid fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold m-0 text-dark">Historial de Ventas & Documentos</h4>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-success" onClick={exportToExcel}>
                            <FontAwesomeIcon icon={faFileAlt} className="me-2" /> Excel
                        </button>
                        <button className="btn btn-primary-custom" onClick={exportToPDF}>
                            <FontAwesomeIcon icon={faDownload} className="me-2" /> PDF
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="card-premium mb-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-0"><FontAwesomeIcon icon={faSearch} /></span>
                                <input type="text" className="form-control border-0 bg-transparent" placeholder="Buscar por RUC, Cliente o Serie..." />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select border-0 bg-light">
                                <option>Todos los Tipos</option>
                                <option>Facturas</option>
                                <option>Boletas</option>
                                <option>Notas de Crédito</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <input type="date" className="form-control border-0 bg-light" />
                        </div>
                    </div>
                </div>

                {/* Sales Table */}
                <div className="card-premium p-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary text-uppercase small">
                                <tr>
                                    <th className="px-4 py-3">Emisión</th>
                                    <th className="px-4 py-3">Documento</th>
                                    <th className="px-4 py-3">Cliente</th>
                                    <th className="px-4 py-3">Productos</th> {/* Added Column */}
                                    <th className="px-4 py-3">Tipo</th>
                                    <th className="px-4 py-3 text-end">Total</th>
                                    <th className="px-4 py-3 text-center">Estado</th>
                                    <th className="px-4 py-3 text-center">Opciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map(sale => (
                                    <tr key={sale.id}>
                                        <td className="px-4 text-muted">{sale.date}</td>
                                        <td className="px-4 fw-bold text-primary">{sale.sunat_ref}</td>
                                        <td className="px-4 fw-semibold">{sale.client?.name || 'Cliente General'}</td>
                                        <td className="px-4">
                                            <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={sale.items.map(i => `${i.qty} x ${i.name}`).join(', ')}>
                                                {sale.items.map(i => <span key={i.id || i.name} className="badge bg-light text-dark border me-1">{i.qty} x {i.name}</span>)}
                                            </div>
                                        </td>
                                        <td className="px-4">
                                            <span className={`badge border ${sale.type === 'FACTURA' ? 'bg-primary-subtle text-primary border-primary' : sale.type === 'BOLETA' ? 'bg-info-subtle text-info border-info' : 'bg-warning-subtle text-warning border-warning'}`}>
                                                {sale.type}
                                            </span>
                                        </td>
                                        <td className="px-4 text-end fw-bold">S/ {sale.total.toFixed(2)}</td>
                                        <td className="px-4 text-center">
                                            <span className="badge bg-success">{sale.status || 'Aceptado'}</span>
                                        </td>
                                        <td className="px-4 text-center">
                                            <button className="btn btn-sm btn-link text-muted" title="Ver Detalle" onClick={() => handleOpenDetail(sale)}><FontAwesomeIcon icon={faEye} /></button>
                                            <button className="btn btn-sm btn-link text-danger" title="Descargar PDF"><FontAwesomeIcon icon={faFilePdf} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sale Detail Modal */}
                {selectedSale && (
                    <div className={`modal fade ${showDetailModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 shadow">
                                <div className="modal-header border-0 bg-light">
                                    <h5 className="modal-title fw-bold text-primary">Detalle de Venta: {selectedSale.sunat_ref}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <p className="mb-1"><small className="text-muted fw-bold">Cliente</small></p>
                                            <h6 className="fw-bold">{selectedSale.client?.name || 'Cliente General'}</h6>
                                        </div>
                                        <div className="col-md-6 text-end">
                                            <p className="mb-1"><small className="text-muted fw-bold">Fecha de Emisión</small></p>
                                            <h6 className="fw-bold">{selectedSale.date}</h6>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold border-bottom pb-2 mb-3">Productos</h6>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Cant.</th>
                                                    <th>Descripción</th>
                                                    <th className="text-end">P. Unit</th>
                                                    <th className="text-end">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedSale.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="text-center">{item.qty}</td>
                                                        <td>{item.name}</td>
                                                        <td className="text-end">{item.price.toFixed(2)}</td>
                                                        <td className="text-end">{(item.price * item.qty).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-light">
                                                    <td colSpan="3" className="text-end fw-bold">TOTAL</td>
                                                    <td className="text-end fw-bold">S/ {selectedSale.total.toFixed(2)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Cerrar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SalesHistory;
