import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faMinus, faPlus, faMoneyBillWave, faFileInvoiceDollar, faReceipt, faUserPlus, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { Modal, Form, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext';

const POS = () => {
    const { products, clients, addClient, addSale } = useData();
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Client State
    const [selectedClient, setSelectedClient] = useState(null);
    const [showClientModal, setShowClientModal] = useState(false);
    const [newClient, setNewClient] = useState({ type: 'DNI', docNumber: '', name: '', phone: '', email: '', address: '' });

    // Payment & Document State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [amountRendered, setAmountRendered] = useState('');
    const [documentType, setDocumentType] = useState('BOLETA');

    // Calculations
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const change = amountRendered ? parseFloat(amountRendered) - total : 0;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Methods
    const handleQuickAddClient = () => {
        if (!newClient.name || !newClient.docNumber) return alert('Ingrese Documento y Nombre');
        const newClientId = Date.now();
        addClient({ ...newClient, id: newClientId });
        setSelectedClient(newClientId); // Auto-select new client
        setNewClient({ type: 'DNI', docNumber: '', name: '', phone: '', email: '', address: '' });
        setShowClientModal(false);
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };



    // Transaction State
    const [finalizedSale, setFinalizedSale] = useState(null);

    const handlePayment = () => {
        if (cart.length === 0) return alert('El carrito está vacío');
        // Default amount rendered to total if empty
        if (!amountRendered) setAmountRendered(total.toFixed(2));
        setShowPaymentModal(true);
    };

    const confirmPayment = () => {
        if (documentType === 'FACTURA' && (!selectedClient || selectedClient === '')) {
            return alert('Para emitir FACTURA debe seleccionar un cliente.');
        }

        const saleData = {
            items: cart,
            total: total,
            client: clients.find(c => c.id == selectedClient) || { name: 'Cliente General' },
            paymentMethod: paymentMethod,
            documentType: documentType,
            amountRendered: parseFloat(amountRendered),
            change: parseFloat(amountRendered) - total,
            date: new Date().toLocaleDateString()
        };

        const newSale = addSale(saleData); // Save to Context
        setFinalizedSale(newSale); // Use the saved sale with generated ID/Ref
        setShowPaymentModal(false);
        setShowInvoiceModal(true);
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    // Invoice State
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    return (
        <Layout>
            <div className="row h-100 g-4 fade-in">
                {/* Product Grid */}
                <div className="col-md-8 d-flex flex-column h-100">
                    <div className="card-premium mb-3 d-flex flex-row align-items-center">
                        <div className="input-group input-group-lg">
                            <span className="input-group-text bg-transparent border-0"><FontAwesomeIcon icon={faSearch} /></span>
                            <input
                                type="text"
                                className="form-control border-0 bg-transparent"
                                placeholder="Buscar productos por nombre o código de barras..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="row g-3 overflow-auto" style={{ maxHeight: '80vh' }}>
                        {filteredProducts.map(product => (
                            <div className="col-md-4 col-lg-3" key={product.id}>
                                <div className="card-premium h-100 p-0 overflow-hidden cursor-pointer" onClick={() => addToCart(product)} role="button">
                                    <div style={{ height: '140px', backgroundColor: '#e2e8f0' }} className="d-flex align-items-center justify-content-center text-muted">
                                        <FontAwesomeIcon icon={faBoxOpen} size="3x" className="opacity-50" />
                                    </div>
                                    <div className="p-3">
                                        <h6 className="fw-bold text-truncate mb-1">{product.name}</h6>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="text-secondary fw-bold">S/ {product.price.toFixed(2)}</span>
                                            <small className="text-muted">{product.category}</small>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className={`fw-bold ${product.stock < 5 ? 'text-danger' : 'text-success'}`}>
                                                Stock: {product.stock}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart & Checkout */}
                <div className="col-md-4 d-flex flex-column h-100">
                    <div className="card-premium h-100 d-flex flex-column p-0">
                        <div className="p-3 border-bottom bg-light rounded-top-3">
                            <h5 className="fw-bold m-0 mb-3"><FontAwesomeIcon icon={faReceipt} className="me-2" /> Detalle de Venta</h5>

                            {/* Client Section */}
                            {selectedClient ? (
                                (() => {
                                    const clientData = clients.find(c => c.id == selectedClient);
                                    return clientData ? (
                                        <div className="bg-white border rounded p-3 position-relative border-primary shadow-sm">
                                            <button
                                                className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 text-danger"
                                                onClick={() => setSelectedClient(null)}
                                                title="Cambiar Cliente"
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                                                    <FontAwesomeIcon icon={faUserPlus} />
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold m-0 text-primary">{clientData.name}</h6>
                                                    <small className="text-muted fw-bold">{clientData.type}: {clientData.docNumber}</small>
                                                </div>
                                            </div>
                                            <div className="small text-muted mt-2 border-top pt-2">
                                                <div className="row g-1">
                                                    <div className="col-12"><strong className="text-dark">Dir:</strong> {clientData.address || '-'}</div>
                                                    <div className="col-6"><strong className="text-dark">Tel:</strong> {clientData.phone || '-'}</div>
                                                    <div className="col-6"><strong className="text-dark">Email:</strong> {clientData.email || '-'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning m-0">Cliente no encontrado <button className="btn-link p-0 border-0" onClick={() => setSelectedClient(null)}>Reset</button></div>
                                    );
                                })()
                            ) : (
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0"><FontAwesomeIcon icon={faSearch} className="text-muted" /></span>
                                    <Form.Select
                                        className="border-start-0"
                                        value={selectedClient || ''}
                                        onChange={(e) => setSelectedClient(e.target.value)}
                                        style={{ maxWidth: '70%' }}
                                    >
                                        <option value="">-- Seleccionar Cliente --</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.docNumber})</option>
                                        ))}
                                    </Form.Select>
                                    <Button className="btn-primary-custom flex-grow-1" onClick={() => setShowClientModal(true)}>
                                        <FontAwesomeIcon icon={faPlus} className="me-1" /> Nuevo
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Cart Items */}
                        <div className="flex-grow-1 overflow-auto p-3">
                            {cart.length === 0 ? (
                                <div className="text-center text-muted mt-5">
                                    <FontAwesomeIcon icon={faBoxOpen} size="3x" className="mb-3 opacity-50" />
                                    <p className="mb-0 fw-bold">Carrito Vacío</p>
                                    <small>Agregue productos para comenzar</small>
                                </div>
                            ) : (
                                <>
                                    <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                        <span className="small fw-bold text-muted">PRODUCTO</span>
                                        <span className="small fw-bold text-muted">CANT / TOTAL</span>
                                    </div>
                                    {cart.map(item => (
                                        <div key={item.id} className="d-flex align-items-center mb-3 pb-3 border-bottom border-light">
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1 fw-bold text-dark">{item.name}</h6>
                                                <span className="badge bg-light text-dark border">P. Unit: S/ {item.price.toFixed(2)}</span>
                                            </div>
                                            <div className="d-flex flex-column align-items-end">
                                                <div className="d-flex align-items-center mb-1">
                                                    <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => updateQty(item.id, -1)} disabled={item.qty <= 1}>-</button>
                                                    <span className="mx-2 fw-bold" style={{ minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                                                    <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => updateQty(item.id, 1)}>+</button>
                                                </div>
                                                <div className="fw-bold text-primary">S/ {(item.price * item.qty).toFixed(2)}</div>
                                            </div>
                                            <button className="btn btn-sm text-danger ms-2" onClick={() => removeFromCart(item.id)}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Totals & Actions */}
                        <div className="p-3 border-top bg-light rounded-bottom-3">
                            <div className="row g-2 mb-3">
                                <div className="col-6">
                                    <label className="form-label small fw-bold text-muted mb-1">Documento</label>
                                    <Form.Select size="sm" value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="fw-bold text-center border-dark">
                                        <option value="BOLETA">BOLETA</option>
                                        <option value="FACTURA">FACTURA</option>
                                        <option value="TICKET">TICKET</option>
                                    </Form.Select>
                                </div>
                                <div className="col-6">
                                    <label className="form-label small fw-bold text-muted mb-1">Pago</label>
                                    <Form.Select size="sm" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="fw-bold text-center border-primary text-primary">
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Tarjeta">Tarjeta</option>
                                        <option value="Yape">Yape</option>
                                    </Form.Select>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between mb-1 small text-muted">
                                <span>Cant. Artículos:</span>
                                <span className="fw-bold">{cart.reduce((acc, item) => acc + item.qty, 0)} items</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted">Subtotal</span>
                                <span>S/ {(total / 1.18).toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted">IGV (18%)</span>
                                <span>S/ {(total - (total / 1.18)).toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 pt-2 border-top">
                                <span className="h4 fw-bold text-dark">TOTAL</span>
                                <span className="h4 fw-bold text-success">S/ {total.toFixed(2)}</span>
                            </div>

                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-success btn-lg shadow-sm fw-bold"
                                    onClick={handlePayment}
                                    disabled={cart.length === 0}
                                >
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" /> COBRAR
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Quick Add Client Modal */}
            <Modal show={showClientModal} onHide={() => setShowClientModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold fs-5">Nuevo Cliente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <Form.Group>
                                <Form.Label className="small fw-bold">Tipo Doc.</Form.Label>
                                <Form.Select value={newClient.type} onChange={(e) => setNewClient({ ...newClient, type: e.target.value })}>
                                    <option value="DNI">DNI</option>
                                    <option value="RUC">RUC</option>
                                    <option value="CE">C.E.</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                        <div className="col-md-8">
                            <Form.Group>
                                <Form.Label className="small fw-bold">Nro. Documento</Form.Label>
                                <Form.Control type="text" value={newClient.docNumber} onChange={(e) => setNewClient({ ...newClient, docNumber: e.target.value })} maxLength={newClient.type === 'RUC' ? 11 : 8} />
                            </Form.Group>
                        </div>
                        <div className="col-12">
                            <Form.Group>
                                <Form.Label className="small fw-bold">Nombre / Razón Social</Form.Label>
                                <Form.Control type="text" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group>
                                <Form.Label className="small fw-bold">Teléfono</Form.Label>
                                <Form.Control type="text" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group>
                                <Form.Label className="small fw-bold">Email</Form.Label>
                                <Form.Control type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
                            </Form.Group>
                        </div>
                        <div className="col-12">
                            <Form.Group>
                                <Form.Label className="small fw-bold">Dirección</Form.Label>
                                <Form.Control type="text" value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} />
                            </Form.Group>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowClientModal(false)}>Cancelar</Button>
                    <Button className="btn-primary-custom" onClick={handleQuickAddClient}>Guardar Cliente</Button>
                </Modal.Footer>
            </Modal>

            {/* Payment & Configuration Modal */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered backdrop="static">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Detalle de Pago</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-light">
                    <div className="row">
                        {/* Order Summary Column */}
                        <div className="col-md-6 border-end">
                            <h6 className="fw-bold mb-3">Resumen de Venta</h6>

                            <div className="mb-3 p-2 bg-white rounded border">
                                <small className="text-muted d-block fw-bold">Cliente</small>
                                <span>{clients.find(c => c.id == selectedClient)?.name || 'Cliente Público'}</span>
                                <small className="d-block text-muted">{clients.find(c => c.id == selectedClient)?.docNumber || '-'}</small>
                            </div>

                            <div className="mb-3 row">
                                <div className="col-6">
                                    <div className="p-2 bg-white rounded border">
                                        <small className="text-muted d-block fw-bold">Comprobante</small>
                                        <span className="fw-bold text-primary">{documentType}</span>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-2 bg-white rounded border">
                                        <small className="text-muted d-block fw-bold">Pago</small>
                                        <span className="fw-bold text-dark">{paymentMethod}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded border overflow-hidden">
                                <div className="p-2 bg-light border-bottom">
                                    <small className="fw-bold text-muted">Productos ({cart.length})</small>
                                </div>
                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <table className="table table-sm mb-0 small">
                                        <tbody>
                                            {cart.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.qty} x {item.name}</td>
                                                    <td className="text-end fw-bold">{(item.price * item.qty).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-2 bg-light border-top d-flex justify-content-between">
                                    <span className="fw-bold">Total</span>
                                    <span className="fw-bold text-primary">S/ {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Input Column */}
                        <div className="col-md-6 d-flex flex-column justify-content-center ps-4">
                            <div className="text-center mb-4">
                                <h2 className="display-5 fw-bold text-primary">S/ {total.toFixed(2)}</h2>
                                <small className="text-muted text-uppercase fw-bold">Monto a Cobrar</small>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Monto Recibido</Form.Label>
                                <Form.Control
                                    type="number"
                                    size="lg"
                                    value={amountRendered}
                                    onChange={(e) => setAmountRendered(e.target.value)}
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </Form.Group>

                            {amountRendered && (
                                <div className={`alert text-center mb-0 ${change >= 0 ? 'alert-success' : 'alert-danger'}`}>
                                    <small className="d-block fw-bold text-muted">{change >= 0 ? 'Vuelto' : 'Faltante'}</small>
                                    <span className="h4 fw-bold">S/ {Math.abs(change).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowPaymentModal(false)}>Cancelar</Button>
                    <Button
                        className="btn-success btn-lg px-4"
                        disabled={!amountRendered || change < 0}
                        onClick={confirmPayment}
                    >
                        Generar Comprobante
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Final Receipt / Invoice Modal */}
            <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} size="lg" centered backdrop="static">
                <Modal.Header className="border-0 pb-0 bg-light">
                    <Modal.Title className="fw-bold text-success"><FontAwesomeIcon icon={faReceipt} className="me-2" /> Comprobante Generado</Modal.Title>
                    <button type="button" className="btn-close" onClick={() => setShowInvoiceModal(false)}></button>
                </Modal.Header>
                <Modal.Body className="bg-light">
                    {finalizedSale && (
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-5">
                                {/* Header */}
                                <div className="text-center mb-4">
                                    <h4 className="fw-bold mb-1">ASEO 360 S.A.C.</h4>
                                    <small className="text-muted d-block">RUC: 20123456789</small>
                                    <small className="text-muted d-block">Av. Principal 123, Lima</small>
                                    <div className="border border-dark rounded p-2 d-inline-block mt-3 px-4">
                                        <h5 className="m-0 fw-bold">{finalizedSale.documentType} ELECTRÓNICA</h5>
                                        <p className="m-0 small">E001 - {Math.floor(Math.random() * 10000).toString().padStart(8, '0')}</p>
                                    </div>
                                </div>

                                {/* Client & Date Info */}
                                <div className="row mb-4 small">
                                    <div className="col-6">
                                        <p className="mb-1"><strong>Cliente:</strong> {finalizedSale.client ? finalizedSale.client.name : 'Cliente General'}</p>
                                        <p className="mb-1"><strong>Documento:</strong> {finalizedSale.client ? `${finalizedSale.client.type} ${finalizedSale.client.docNumber}` : '-'}</p>
                                        <p className="mb-1"><strong>Dirección:</strong> {finalizedSale.client?.address || '-'}</p>
                                    </div>
                                    <div className="col-6 text-end">
                                        <p className="mb-1"><strong>Fecha:</strong> {finalizedSale.date}</p>
                                        <p className="mb-1"><strong>Forma de Pago:</strong> {finalizedSale.paymentMethod}</p>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <table className="table table-sm table-bordered mb-4 small">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Cant.</th>
                                            <th>Descripción</th>
                                            <th className="text-end">P. Unit</th>
                                            <th className="text-end">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {finalizedSale.items.map(item => (
                                            <tr key={item.id}>
                                                <td className="text-center">{item.qty}</td>
                                                <td>{item.name}</td>
                                                <td className="text-end">{item.price.toFixed(2)}</td>
                                                <td className="text-end">{(item.price * item.qty).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" className="text-end fw-bold">Subtotal</td>
                                            <td className="text-end">{(finalizedSale.total / 1.18).toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" className="text-end fw-bold">IGV (18%)</td>
                                            <td className="text-end">{(finalizedSale.total - (finalizedSale.total / 1.18)).toFixed(2)}</td>
                                        </tr>
                                        <tr className="bg-light">
                                            <td colSpan="3" className="text-end fw-bold">TOTAL A PAGAR</td>
                                            <td className="text-end fw-bold fs-6">S/ {finalizedSale.total.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>

                                {/* Footer (Payment Details) */}
                                <div className="row bg-light rounded p-2 mx-0 mb-3">
                                    <div className="col text-center">
                                        <small className="d-block text-muted">Importe Pagado</small>
                                        <strong className="text-dark">S/ {finalizedSale.amountRendered.toFixed(2)}</strong>
                                    </div>
                                    <div className="col text-center border-start">
                                        <small className="d-block text-muted">Vuelto</small>
                                        <strong className="text-success">S/ {finalizedSale.change.toFixed(2)}</strong>
                                    </div>
                                </div>

                                <div className="text-center text-muted small mt-4">
                                    <p className="mb-1">Gracias por su compra en ASEO360</p>
                                    <p className="mb-0">Representación impresa del Comprobante Electrónico</p>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 bg-light">
                    <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>Cerrar</Button>
                    <Button className="btn-primary-custom" onClick={() => { setShowInvoiceModal(false); setCart([]); setAmountRendered(''); setSelectedClient(null); alert('Documento enviado a imprimir'); }}>
                        <FontAwesomeIcon icon={faReceipt} className="me-2" /> Imprimir
                    </Button>
                </Modal.Footer>
            </Modal>
        </Layout>
    );
};

export default POS;
