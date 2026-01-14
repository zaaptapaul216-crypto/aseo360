import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faPlus, faSearch, faFileAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form } from 'react-bootstrap';

const Guides = () => {
    const [guides, setGuides] = useState([
        { id: 1, number: '001-000123', date: '2025-01-14', supplier: 'Distribuidora Limpieza Total', status: 'Entregado', items: 12 },
        { id: 2, number: '001-000124', date: '2025-01-15', supplier: 'Procter & Gamble Perú', status: 'En Tránsito', items: 50 },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add logic
        setShowModal(false);
        alert('Funcionalidad de registro de guía en desarrollo');
    };

    return (
        <Layout>
            <div className="container-fluid fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold m-0 text-dark">Guías de Remisión</h4>
                        <small className="text-muted">Control de ingresos y salidas de almacén</small>
                    </div>
                    <button className="btn btn-primary-custom" onClick={handleShow}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Nueva Guía
                    </button>
                </div>

                <div className="card-premium mb-4 p-3">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0"><FontAwesomeIcon icon={faSearch} /></span>
                        <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Buscar por número de guía o proveedor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="card-premium p-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary text-uppercase small">
                                <tr>
                                    <th className="px-4 py-3">Número</th>
                                    <th className="px-4 py-3">Fecha</th>
                                    <th className="px-4 py-3">Proveedor / Destino</th>
                                    <th className="px-4 py-3 text-center">Items</th>
                                    <th className="px-4 py-3 text-center">Estado</th>
                                    <th className="px-4 py-3 text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guides.map(guide => (
                                    <tr key={guide.id}>
                                        <td className="px-4 fw-bold text-primary">{guide.number}</td>
                                        <td className="px-4 text-muted"><FontAwesomeIcon icon={faCalendarAlt} className="me-1" /> {guide.date}</td>
                                        <td className="px-4 fw-semibold">{guide.supplier}</td>
                                        <td className="px-4 text-center">{guide.items}</td>
                                        <td className="px-4 text-center">
                                            <span className={`badge ${guide.status === 'Entregado' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {guide.status}
                                            </span>
                                        </td>
                                        <td className="px-4 text-end">
                                            <button className="btn btn-sm btn-outline-secondary">
                                                <FontAwesomeIcon icon={faFileAlt} /> Ver Detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold fs-5">Registrar Guía de Remisión</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Número de Guía</Form.Label>
                            <Form.Control type="text" placeholder="000-000000" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Proveedor</Form.Label>
                            <Form.Select>
                                <option>Seleccione Proveedor</option>
                                <option>Distribuidora Limpieza Total</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Fecha de Emisión</Form.Label>
                            <Form.Control type="date" required />
                        </Form.Group>
                        <div className="d-grid">
                            <Button type="submit" className="btn-primary-custom">Guardar Guía</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Layout>
    );
};

export default Guides;
