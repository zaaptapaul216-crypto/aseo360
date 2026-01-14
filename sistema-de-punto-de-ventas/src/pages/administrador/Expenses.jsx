import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileInvoiceDollar, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form } from 'react-bootstrap';
import { useData } from '../../context/DataContext';

const Expenses = () => {
    const { suppliers } = useData();
    const [expenses, setExpenses] = useState([
        { id: 1, date: '2025-01-10', supplier: 'Distribuidora Limpieza Total', type: 'FACTURA', number: 'F001-2342', total: 1540.50, desc: 'Compra de detergentes mensual' },
        { id: 2, date: '2025-01-12', supplier: 'Servicios de Luz del Sur', type: 'RECIBO', number: '12345678', total: 120.00, desc: 'Pago de servicio eléctrico' },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [newExpense, setNewExpense] = useState({ date: '', supplier: '', type: 'FACTURA', number: '', total: '', desc: '' });

    const handleSave = (e) => {
        e.preventDefault();
        setExpenses([...expenses, { ...newExpense, id: Date.now(), total: parseFloat(newExpense.total) }]);
        setShowModal(false);
        setNewExpense({ date: '', supplier: '', type: 'FACTURA', number: '', total: '', desc: '' });
    };

    return (
        <Layout>
            <div className="container-fluid fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold m-0 text-dark">Registro de Gastos y Compras</h4>
                    <Button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Registrar Gasto
                    </Button>
                </div>

                <div className="card-premium p-0 overflow-hidden">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-secondary text-uppercase small">
                            <tr>
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3">Proveedor / Entidad</th>
                                <th className="px-4 py-3">Documento</th>
                                <th className="px-4 py-3">Descripción</th>
                                <th className="px-4 py-3 text-end">Monto Total</th>
                                <th className="px-4 py-3 text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(ex => (
                                <tr key={ex.id}>
                                    <td className="px-4">{ex.date}</td>
                                    <td className="px-4 fw-bold">{ex.supplier}</td>
                                    <td className="px-4"><span className="badge bg-light text-dark border">{ex.type} {ex.number}</span></td>
                                    <td className="px-4 small text-muted">{ex.desc}</td>
                                    <td className="px-4 text-end fw-bold text-danger">- S/ {ex.total.toFixed(2)}</td>
                                    <td className="px-4 text-end">
                                        <button className="btn btn-sm btn-link text-danger" onClick={() => setExpenses(expenses.filter(e => e.id !== ex.id))}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold fs-5">Registrar Comprobante de Gasto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSave}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Fecha Emisión</Form.Label>
                                    <Form.Control type="date" required value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Tipo Documento</Form.Label>
                                    <Form.Select value={newExpense.type} onChange={e => setNewExpense({ ...newExpense, type: e.target.value })}>
                                        <option>FACTURA</option>
                                        <option>BOLETA</option>
                                        <option>RECIBO</option>
                                        <option>TICKET</option>
                                        <option>OTRO</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Serie-Número</Form.Label>
                                    <Form.Control type="text" placeholder="F001-0000..." required value={newExpense.number} onChange={e => setNewExpense({ ...newExpense, number: e.target.value })} />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Monto Total (S/)</Form.Label>
                                    <Form.Control type="number" step="0.01" required value={newExpense.total} onChange={e => setNewExpense({ ...newExpense, total: e.target.value })} />
                                </Form.Group>
                            </div>
                            <div className="col-12">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Proveedor</Form.Label>
                                    <Form.Control list="suppliersList" type="text" placeholder="Buscar o escribir..." required value={newExpense.supplier} onChange={e => setNewExpense({ ...newExpense, supplier: e.target.value })} />
                                    <datalist id="suppliersList">
                                        {suppliers.map(s => <option key={s.id} value={s.name} />)}
                                    </datalist>
                                </Form.Group>
                            </div>
                            <div className="col-12">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Descripción / Concepto</Form.Label>
                                    <Form.Control as="textarea" rows={2} value={newExpense.desc} onChange={e => setNewExpense({ ...newExpense, desc: e.target.value })} />
                                </Form.Group>
                            </div>
                            <div className="col-12">
                                <Button type="submit" className="btn-primary-custom w-100">Registrar Gasto</Button>
                            </div>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Layout>
    );
};

export default Expenses;
