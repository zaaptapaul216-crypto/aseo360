import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import './OrdenCompra.css';
import logo from '../../assets/imagenes/logo.png';

const OrdenCompra = () => {
    const [modoVista, setModoVista] = useState('form');

    const estadoInicial = {
        razonSocialEmisor: 'INVERSIONES GENERALES T & C S.A.C.',
        rucEmisor: '206011306963',
        direccionEmisor: 'AV. PRINCIPAL 123 - LIMA',
        logoUrl: logo,

        fechaEmision: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }),
        serie: 'OC01',
        numero: '00000000',
        moneda: 'SOLES',
        igvPercent: '18',

        // Datos del Proveedor
        proveedorNombre: '',
        proveedorRuc: '',
        proveedorDireccion: '',
        proveedorContacto: '',

        // Condiciones
        condicionesPago: 'CONTADO',
        fechaEntrega: new Date().toISOString().split('T')[0],
        lugarEntrega: 'ALMACÉN CENTRAL',
        referencia: '',
        observacion: '',

        items: [],
        subtotal: 0,
        igv: 0,
        importeTotal: 0,
        montoLetras: ''
    };

    const [ocData, setOcData] = useState(estadoInicial);

    useEffect(() => {
        const total = ocData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
        const igvFactor = (parseFloat(ocData.igvPercent) || 0) / 100;
        const subtotal = total / (1 + igvFactor);
        const igv = total - subtotal;

        setOcData(prev => ({
            ...prev,
            subtotal: subtotal.toFixed(2),
            igv: igv.toFixed(2),
            importeTotal: total.toFixed(2),
            montoLetras: `SON: ${parseFloat(total).toFixed(2)} / 100 SOLES`
        }));
    }, [ocData.items, ocData.igvPercent]);

    const handleLimpiar = async () => {
        const r = await Swal.fire({ title: '¿Limpiar la orden de compra?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'No' });
        if (r.isConfirmed) {
            setOcData(estadoInicial);
        }
    };

    const handleNuevo = () => {
        setOcData({
            ...estadoInicial,
            numero: (parseInt(ocData.numero) + 1).toString().padStart(8, '0')
        });
        setModoVista('form');
    };

    const handleGenerar = () => {
        toast.success('Orden de Compra GENERADA (pendiente guardar en BD).');
    };

    const exportToExcel = () => {
        const worksheetData = [
            ["ORDEN DE COMPRA", "", "", "", ""],
            ["Nro Documento:", `${ocData.serie}-${ocData.numero}`, "", "Fecha:", ocData.fechaEmision],
            ["Proveedor:", ocData.proveedorNombre, "", "RUC Proveedor:", ocData.proveedorRuc],
            ["Cond. Pago:", ocData.condicionesPago, "", "Moneda:", ocData.moneda],
            ["Fecha Entrega:", ocData.fechaEntrega, "", "Lugar Entrega:", ocData.lugarEntrega],
            [],
            ["It.", "Código", "Descripción", "U.M.", "Cant.", "P. Unit.", "Total"]
        ];

        ocData.items.forEach((item, index) => {
            worksheetData.push([
                index + 1,
                item.codigo,
                item.descripcion,
                item.unidad,
                parseFloat(item.cantidad),
                parseFloat(item.precioUnitario),
                parseFloat(item.total)
            ]);
        });

        worksheetData.push([]);
        worksheetData.push(["", "", "", "", "", "Subtotal:", parseFloat(ocData.subtotal)]);
        worksheetData.push(["", "", "", "", "", `IGV (${ocData.igvPercent}%):`, parseFloat(ocData.igv)]);
        worksheetData.push(["", "", "", "", "", "TOTAL:", parseFloat(ocData.importeTotal)]);

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "OrdenCompra");
        XLSX.writeFile(workbook, `OrdenCompra_${ocData.serie}_${ocData.numero}.xlsx`);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOcData(prev => ({ ...prev, [name]: value }));
    };

    const handleCambioItem = (index, field, value) => {
        const nuevosItems = [...ocData.items];
        nuevosItems[index][field] = value;

        if (['cantidad', 'precioUnitario'].includes(field)) {
            const cant = parseFloat(nuevosItems[index].cantidad) || 0;
            const precio = parseFloat(nuevosItems[index].precioUnitario) || 0;
            nuevosItems[index].total = (cant * precio).toFixed(2);
        }
        setOcData(prev => ({ ...prev, items: nuevosItems }));
    };

    const agregarItem = () => {
        setOcData(prev => ({
            ...prev,
            items: [...prev.items, { codigo: '', descripcion: '', unidad: 'UND', cantidad: 1, precioUnitario: 0, total: '0.00' }]
        }));
    };

    const eliminarItem = (index) => {
        setOcData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    if (modoVista === 'form') {
        return (
            <div className="container mt-4 mb-5">
                <div className="d-flex gap-2 mb-3">
                    <button className="btn btn-outline-dark" onClick={handleNuevo}><i className="fas fa-plus me-1"></i> Nuevo</button>
                    <button className="btn btn-outline-danger" onClick={handleLimpiar}><i className="fas fa-eraser me-1"></i> Limpiar</button>
                </div>

                <div className="card shadow border-0">
                    <div className="card-header bg-success text-white d-flex justify-content-between align-items-center py-3">
                        <h5 className="mb-0 fw-bold"><i className="fas fa-shopping-cart me-2"></i>Registrar Orden de Compra</h5>
                    </div>
                    <div className="card-body bg-light p-4">
                        <div className="row g-3">
                            {/* Cabecera */}
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Fecha Emisión:</label>
                                <input type="date" className="form-control form-control-sm" name="fechaEmision" value={ocData.fechaEmision} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Serie / Número:</label>
                                <div className="input-group input-group-sm">
                                    <input type="text" className="form-control bg-light" value={ocData.serie} readOnly />
                                    <input type="text" className="form-control" name="numero" value={ocData.numero} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Moneda:</label>
                                <select className="form-select form-select-sm" name="moneda" value={ocData.moneda} onChange={handleChange}>
                                    <option value="SOLES">SOLES</option>
                                    <option value="DOLARES">DOLARES</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">IGV %:</label>
                                <input type="number" className="form-control form-control-sm" name="igvPercent" value={ocData.igvPercent} onChange={handleChange} />
                            </div>

                            {/* Proveedor */}
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-success">RUC Proveedor:</label>
                                <div className="input-group input-group-sm">
                                    <input type="text" className="form-control" name="proveedorRuc" value={ocData.proveedorRuc} onChange={handleChange} />
                                    <button className="btn btn-outline-secondary"><i className="fas fa-search"></i></button>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Razón Social:</label>
                                <input type="text" className="form-control form-control-sm" name="proveedorNombre" value={ocData.proveedorNombre} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Contacto:</label>
                                <input type="text" className="form-control form-control-sm" name="proveedorContacto" value={ocData.proveedorContacto} onChange={handleChange} />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label small fw-bold">Dirección Proveedor:</label>
                                <input type="text" className="form-control form-control-sm" name="proveedorDireccion" value={ocData.proveedorDireccion} onChange={handleChange} />
                            </div>

                            {/* Condiciones */}
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Forma de Pago:</label>
                                <select className="form-select form-select-sm" name="condicionesPago" value={ocData.condicionesPago} onChange={handleChange}>
                                    <option value="CONTADO">CONTADO</option>
                                    <option value="CREDITO 15 DIAS">CREDITO 15 DIAS</option>
                                    <option value="CREDITO 30 DIAS">CREDITO 30 DIAS</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Fecha Entrega:</label>
                                <input type="date" className="form-control form-control-sm" name="fechaEntrega" value={ocData.fechaEntrega} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Lugar de Entrega:</label>
                                <input type="text" className="form-control form-control-sm" name="lugarEntrega" value={ocData.lugarEntrega} onChange={handleChange} />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label small fw-bold">Observaciones:</label>
                                <textarea className="form-control form-control-sm" name="observacion" rows="2" value={ocData.observacion} onChange={handleChange}></textarea>
                            </div>
                        </div>

                        {/* Detalle */}
                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="fw-bold mb-0 text-success">Detalle de Compra</h6>
                                <button className="btn btn-success btn-sm" onClick={agregarItem}><i className="fas fa-plus me-1"></i> Agregar Item</button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm bg-white small mb-0">
                                    <thead className="table-success text-center">
                                        <tr>
                                            <th>Código</th>
                                            <th>Descripción</th>
                                            <th>U.M.</th>
                                            <th>Cant.</th>
                                            <th>P. Unit.</th>
                                            <th>Total</th>
                                            <th style={{ width: '40px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ocData.items.map((item, index) => (
                                            <tr key={index} className="align-middle">
                                                <td><input type="text" className="form-control form-control-sm border-0 bg-transparent" value={item.codigo} onChange={(e) => handleCambioItem(index, 'codigo', e.target.value)} /></td>
                                                <td><input type="text" className="form-control form-control-sm border-0 bg-transparent" value={item.descripcion} onChange={(e) => handleCambioItem(index, 'descripcion', e.target.value)} /></td>
                                                <td><input type="text" className="form-control form-control-sm border-0 bg-transparent text-center" value={item.unidad} onChange={(e) => handleCambioItem(index, 'unidad', e.target.value)} /></td>
                                                <td><input type="number" className="form-control form-control-sm border-0 bg-transparent text-center" value={item.cantidad} onChange={(e) => handleCambioItem(index, 'cantidad', e.target.value)} /></td>
                                                <td><input type="number" className="form-control form-control-sm border-0 bg-transparent text-end" value={item.precioUnitario} onChange={(e) => handleCambioItem(index, 'precioUnitario', e.target.value)} /></td>
                                                <td className="text-end fw-bold">{item.total}</td>
                                                <td className="text-center">
                                                    <button className="btn btn-link text-danger p-0" onClick={() => removeItem(index)}><i className="fas fa-trash-alt"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {ocData.items.length === 0 && (
                                            <tr><td colSpan="7" className="text-center py-5 text-muted bg-white">No hay items agregados</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="row justify-content-end mt-4">
                                <div className="col-md-4">
                                    <ul className="list-group mb-3">
                                        <li className="list-group-item d-flex justify-content-between"><span>Subtotal:</span> <strong>{ocData.subtotal}</strong></li>
                                        <li className="list-group-item d-flex justify-content-between"><span>IGV ({ocData.igvPercent}%):</span> <strong>{ocData.igv}</strong></li>
                                        <li className="list-group-item d-flex justify-content-between bg-success text-white fw-bold">
                                            <span>TOTAL {ocData.moneda}:</span>
                                            <span>{ocData.importeTotal}</span>
                                        </li>
                                    </ul>
                                    <div className="d-grid">
                                        <button className="btn btn-success py-3 fw-bold" onClick={handleGenerar}><i className="fas fa-save me-2"></i> GUARDAR ORDEN DE COMPRA</button>
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
        <div className="orden-compra-container">
            <div className="action-bar no-print">
                <button className="btn btn-secondary btn-float" onClick={() => setModoVista('form')} title="Regresar al Formulario"><i className="fas fa-arrow-left"></i></button>
                <button className="btn btn-primary btn-float" onClick={() => window.print()} title="Imprimir Orden de Compra"><i className="fas fa-print"></i></button>
                <button className="btn btn-success btn-float" onClick={exportToExcel} title="Exportar a Excel"><i className="fas fa-file-excel"></i></button>
            </div>

            <div className="orden-compra-paper mx-auto my-5 shadow-lg">
                <div className="header-grid mb-5">
                    <div className="logo-section text-center">
                        <img src={ocData.logoUrl} alt="Logo" className="img-fluid mb-2" style={{ maxHeight: '70px' }} />
                    </div>
                    <div className="company-info text-center">
                        <h4 className="fw-bold mb-1 text-uppercase" style={{ color: '#27ae60' }}>{ocData.razonSocialEmisor}</h4>
                        <p className="small text-muted mb-0">{ocData.direccionEmisor}</p>
                        <p className="small text-muted mb-0">RUC: {ocData.rucEmisor}</p>
                    </div>
                    <div className="ruc-section text-center p-3 border border-3 border-success rounded">
                        <div className="bg-success text-white py-2 mb-2 fw-bold h5">ORDEN DE COMPRA</div>
                        <div className="fw-bold h5 mb-0 text-success">{ocData.serie} - {ocData.numero}</div>
                    </div>
                </div>

                <div className="row g-4 mb-4">
                    <div className="col-7">
                        <div className="p-3 border rounded bg-light border-success-subtle h-100">
                            <h6 className="fw-bold text-success border-bottom pb-2 mb-3"><i className="fas fa-truck me-2"></i>PROVEEDOR</h6>
                            <div className="mb-1"><span className="fw-bold small">Razón Social:</span> <span className="small">{ocData.proveedorNombre}</span></div>
                            <div className="mb-1"><span className="fw-bold small">RUC:</span> <span className="small">{ocData.proveedorRuc}</span></div>
                            <div className="mb-1"><span className="fw-bold small">Contacto:</span> <span className="small">{ocData.proveedorContacto}</span></div>
                            <div className="mb-0"><span className="fw-bold small">Dirección:</span> <span className="small">{ocData.proveedorDireccion}</span></div>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="p-3 border rounded bg-light border-success-subtle h-100">
                            <h6 className="fw-bold text-success border-bottom pb-2 mb-3"><i className="fas fa-info-circle me-2"></i>DETALLES</h6>
                            <div className="mb-1"><span className="fw-bold small">Fecha Emisión:</span> <span className="small">{ocData.fechaEmision}</span></div>
                            <div className="mb-1"><span className="fw-bold small">Fecha Entrega:</span> <span className="small">{ocData.fechaEntrega}</span></div>
                            <div className="mb-1"><span className="fw-bold small">Cond. Pago:</span> <span className="small">{ocData.condicionesPago}</span></div>
                            <div className="mb-0"><span className="fw-bold small">Moneda:</span> <span className="small">{ocData.moneda}</span></div>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h6 className="fw-bold text-success"><i className="fas fa-map-marker-alt me-2"></i>LUGAR DE ENTREGA: <span className="fw-normal text-dark">{ocData.lugarEntrega}</span></h6>
                </div>

                <table className="table table-bordered oc-table mb-4">
                    <thead className="bg-success text-white text-center small">
                        <tr>
                            <th>It.</th>
                            <th>CÓDIGO</th>
                            <th>DESCRIPCIÓN</th>
                            <th>U.M.</th>
                            <th>CANT.</th>
                            <th>P. UNIT.</th>
                            <th>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="small">
                        {ocData.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="text-center">{idx + 1}</td>
                                <td className="text-center">{item.codigo}</td>
                                <td>{item.descripcion}</td>
                                <td className="text-center">{item.unidad}</td>
                                <td className="text-center">{item.cantidad}</td>
                                <td className="text-end">{item.precioUnitario}</td>
                                <td className="text-end fw-bold">{item.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="row justify-content-end mb-5">
                    <div className="col-4">
                        <div className="d-flex justify-content-between mb-1 small"><span>Subtotal:</span> <span>{ocData.subtotal}</span></div>
                        <div className="d-flex justify-content-between mb-1 small"><span>IGV ({ocData.igvPercent}%):</span> <span>{ocData.igv}</span></div>
                        <div className="d-flex justify-content-between fw-bold border-top border-success pt-2 mt-2 h5 text-success"><span>TOTAL {ocData.moneda}:</span> <span>{ocData.importeTotal}</span></div>
                    </div>
                </div>

                <div className="mb-5">
                    <h6 className="fw-bold small text-success border-bottom pb-1 mb-2">OBSERVACIONES:</h6>
                    <p className="small text-muted">{ocData.observacion || 'Sin observaciones'}</p>
                </div>

                <div className="mt-5 pt-5 row text-center">
                    <div className="col-4">
                        <div className="border-top border-success pt-2 mx-3">
                            <span className="small fw-bold">SOLICITADO POR</span>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="border-top border-success pt-2 mx-3">
                            <span className="small fw-bold">AUTORIZADO POR</span>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="border-top border-success pt-2 mx-3">
                            <span className="small fw-bold">LOGÍSTICA / COMPRAS</span>
                        </div>
                    </div>
                </div>

                <div className="mt-5 text-center small text-muted fst-italic">
                    Esta Orden de Compra es una representación impresa de un documento electrónico generado por el Sistema ERP.
                </div>
            </div>
        </div>
    );
};

export default OrdenCompra;
