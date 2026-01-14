import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faTruckMoving, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form } from 'react-bootstrap';

import { useData } from '../../context/DataContext';

const Suppliers = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState({ id: null, ruc: '', name: '', phone: '', email: '', address: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentSupplier({ id: null, ruc: '', name: '', phone: '', email: '', address: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            updateSupplier(currentSupplier);
        } else {
            addSupplier(currentSupplier);
        }
        handleClose();
    };

    const handleEdit = (supplier) => {
        setCurrentSupplier(supplier);
        setIsEditing(true);
        handleShow();
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Eliminar este proveedor?')) {
            deleteSupplier(id);
        }
    };

    const handleChange = (e) => {
        setCurrentSupplier({ ...currentSupplier, [e.target.name]: e.target.value });
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ruc.includes(searchTerm)
    );

    return (
        <Layout>
            <div className="container-fluid fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold m-0 text-dark">Gestión de Proveedores</h4>
                    <button className="btn btn-primary-custom" onClick={handleShow}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Nuevo Proveedor
                    </button>
                </div>

                {/* Search Bar */}
                <div className="card-premium mb-4">
                    <div className="input-group">
                        <span className="input-group-text bg-transparent border-0"><FontAwesomeIcon icon={faSearch} /></span>
                        <input
                            type="text"
                            className="form-control border-0 bg-transparent"
                            placeholder="Buscar por RUC o Razón Social..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Suppliers List */}
                <div className="card-premium p-0 text-dark">
                    {filteredSuppliers.length > 0 ? (
                        <div className="list-group list-group-flush">
                            {filteredSuppliers.map(supplier => (
                                <div key={supplier.id} className="list-group-item p-3 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-light p-3 me-3 text-secondary">
                                            <FontAwesomeIcon icon={faTruckMoving} size="lg" />
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">{supplier.name}</h6>
                                            <div className="small text-muted mb-1">
                                                <span className="me-3">RUC: {supplier.ruc}</span>
                                                <span><FontAwesomeIcon icon={faPhone} className="me-1" /> {supplier.phone}</span>
                                            </div>
                                            <div className="small text-muted">
                                                <FontAwesomeIcon icon={faEnvelope} className="me-1" /> {supplier.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(supplier)}>
                                            <FontAwesomeIcon icon={faEdit} /> Editar
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(supplier.id)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-5 text-center text-muted">No se encontraron proveedores</div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">{isEditing ? 'Editar Proveedor' : 'Registrar Proveedor'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">RUC</Form.Label>
                            <Form.Control type="text" name="ruc" value={currentSupplier.ruc} onChange={handleChange} required maxLength="11" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Razón Social</Form.Label>
                            <Form.Control type="text" name="name" value={currentSupplier.name} onChange={handleChange} required />
                        </Form.Group>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold">Teléfono</Form.Label>
                                <Form.Control type="text" name="phone" value={currentSupplier.phone} onChange={handleChange} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold">Email</Form.Label>
                                <Form.Control type="email" name="email" value={currentSupplier.email} onChange={handleChange} />
                            </div>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Dirección</Form.Label>
                            <Form.Control type="text" name="address" value={currentSupplier.address} onChange={handleChange} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="light" onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" className="btn-primary-custom px-4">Guardar</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Layout>
    );
};

export default Suppliers;
