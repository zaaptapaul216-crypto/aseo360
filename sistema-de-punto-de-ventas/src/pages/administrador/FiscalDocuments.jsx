import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileInvoiceDollar, faSearch, faTrash, faHandHoldingUsd, faPercentage } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form } from 'react-bootstrap';
import { useData } from '../../context/DataContext';

const FiscalDocuments = () => {
    const { suppliers, clients } = useData();
    const [docs, setDocs] = useState([
        { id: 1, date: '2025-01-14', type: 'RETENCIÓN', number: 'R001-000001', entity: 'Distribuidora Limpieza Total', baseAmount: 1000.00, taxAmount: 30.00, ref: 'F001-2342' },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [newDoc, setNewDoc] = useState({ date: '', type: 'RETENCIÓN', number: '', entity: '', baseAmount: '', taxAmount: '', ref: '' });

    const handleSave = (e) => {
        e.preventDefault();
        setDocs([...docs, { ...newDoc, id: Date.now(), baseAmount: parseFloat(newDoc.baseAmount), taxAmount: parseFloat(newDoc.taxAmount) }]);
        setShowModal(false);
        setNewDoc({ date: '', type: 'RETENCIÓN', number: '', entity: '', baseAmount: '', taxAmount: '', ref: '' });
    };

    return (
        <Layout>
            <div className="container-fluid fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold m-0 text-dark">Comprobantes Fiscales</h4>
                    <Button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Emitir Comprobante
                    </Button>
                </div>

                <div className="row g-4 mb-4">
                    <div className="col-md-6">
                        <div className="card-premium h-100 bg-light-blue">
                            <div className="d-flex align-items-center">
                                <div className="p-3 bg-primary text-white rounded me-3">
                                    <FontAwesomeIcon icon={faHandHoldingUsd} size="2x" />
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-1">Agentes de Retención</h5>
                                    <small className="text-muted">Gestión de Comprobantes de Retención (3%)</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card-premium h-100 bg-light-green">
                            <div className="d-flex align-items-center">
                                <div className="p-3 bg-success text-white rounded me-3">
                                    <FontAwesomeIcon icon={faPercentage} size="2x" />
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-1">Percepción</h5>
                                    <small className="text-muted">Gestión de Comprobantes de Percepción (2%)</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-premium p-0 overflow-hidden">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-secondary text-uppercase small">
                            <tr>
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3">Tipo Documento</th>
                                <th className="px-4 py-3">Número</th>
                                <th className="px-4 py-3">Proveedor / Cliente</th>
                                <th className="px-4 py-3">Ref. Comprobante</th>
                                <th className="px-4 py-3 text-end">Monto Base</th>
                                <th className="px-4 py-3 text-end">Ret/Perc</th>
                                <th className="px-4 py-3 text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docs.map(d => (
                                <tr key={d.id}>
                                    <td className="px-4">{d.date}</td>
                                    <td className="px-4">
                                        <span className={`badge ${d.type === 'RETENCIÓN' ? 'bg-primary' : 'bg-success'}`}>{d.type}</span>
                                    </td>
                                    <td className="px-4 fw-bold">{d.number}</td>
                                    <td className="px-4 small">{d.entity}</td>
                                    <td className="px-4 small text-muted">{d.ref}</td>
                                    <td className="px-4 text-end">S/ {d.baseAmount.toFixed(2)}</td>
                                    <td className="px-4 text-end fw-bold">S/ {d.taxAmount.toFixed(2)}</td>
                                    <td className="px-4 text-end">
                                        <button className="btn btn-sm btn-link text-danger" onClick={() => setDocs(docs.filter(x => x.id !== d.id))}>
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
                    <Modal.Title className="fw-bold fs-5">Emitir Documento Fiscal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSave}>
                        <div className="row g-3">
                            <div className="col-12">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Tipo de Documento</Form.Label>
                                    <div className="d-flex gap-2">
                                        <Form.Check
                                            type="radio"
                                            label="Comprobante de Retención (3%)"
                                            name="docType"
                                            checked={newDoc.type === 'RETENCIÓN'}
                                            onChange={() => setNewDoc({ ...newDoc, type: 'RETENCIÓN' })}
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Comprobante de Percepción (2%)"
                                            name="docType"
                                            checked={newDoc.type === 'PERCEPCIÓN'}
                                            onChange={() => setNewDoc({ ...newDoc, type: 'PERCEPCIÓN' })}
                                        />
                                    </div>
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Fecha Emisión</Form.Label>
                                    <Form.Control type="date" required value={newDoc.date} onChange={e => setNewDoc({ ...newDoc, date: e.target.value })} />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Número (Serie-Corr.)</Form.Label>
                                    <Form.Control type="text" placeholder="R001-000..." required value={newDoc.number} onChange={e => setNewDoc({ ...newDoc, number: e.target.value })} />
                                </Form.Group>
                            </div>
                            <div className="col-12">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Entidad (Proveedor/Cliente)</Form.Label>
                                    <Form.Control list="entitiesList" type="text" required value={newDoc.entity} onChange={e => setNewDoc({ ...newDoc, entity: e.target.value })} />
                                    <datalist id="entitiesList">
                                        {suppliers.map(s => <option key={'s' + s.id} value={s.name} />)}
                                        {clients.map(c => <option key={'c' + c.id} value={c.name} />)}
                                    </datalist>
                                </Form.Group>
                            </div>
                            <div className="col-md-12">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Comprobante de Referencia</Form.Label>
                                    <Form.Control type="text" placeholder="F001-2345" required value={newDoc.ref} onChange={e => setNewDoc({ ...newDoc, ref: e.target.value })} />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Monto Base (S/)</Form.Label>
                                    <Form.Control type="number" step="0.01" required value={newDoc.baseAmount} onChange={e => setNewDoc({ ...newDoc, baseAmount: e.target.value })} />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Monto Ret/Perc (S/)</Form.Label>
                                    <Form.Control type="number" step="0.01" required value={newDoc.taxAmount} onChange={e => setNewDoc({ ...newDoc, taxAmount: e.target.value })} />
                                </Form.Group>
                            </div>

                            <div className="col-12">
                                <Button type="submit" className="btn-primary-custom w-100">Emitir Comprobante</Button>
                            </div>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Layout>
    );
};

export default FiscalDocuments;
