import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEdit,
    faTrash,
    faSearch,
    faPhone,
    faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form } from 'react-bootstrap';
import { useData } from '../../context/DataContext';
import { clientService } from '../../services/api';

const Clients = () => {
    const { clients, addClient, updateClient, deleteClient } = useData();

    const initialClient = {
        type: 'DNI',
        docNumber: '',
        name: '',
        phone: '',
        email: '',
        address: ''
    };

    const initialItem = {
        product: '',
        voucherType: 'Boleta',
        quantity: 1,
        price: 0,
        total: 0
    };

    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [clientForm, setClientForm] = useState(initialClient);
    const [items, setItems] = useState([{ ...initialItem }]);

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setClientForm(initialClient);
        setItems([{ ...initialItem }]);
    };

    const handleShow = () => setShowModal(true);

    const handleEdit = (client) => {
        setEditingId(client.id);
        setClientForm(client);
        setItems(client.items?.length ? client.items : [{ ...initialItem }]);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Eliminar cliente?')) {
            deleteClient(id);
        }
    };

    // ======================
    // PRODUCTOS
    // ======================
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            [field]: value
        };

        if (field === 'quantity' || field === 'price') {
            newItems[index].total =
                Number(newItems[index].quantity) *
                Number(newItems[index].price);
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems(prev => [...prev, { ...initialItem }]);
    };

    const removeItem = (index) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    // ======================
    // SUBMIT
    // ======================
    const handleSubmit = (e) => {
        e.preventDefault();

        const cleanItems = items.filter(item => item.product.trim() !== '');

        const clientData = {
            ...clientForm,
            items: cleanItems,
            grandTotal
        };

        if (editingId) {
            updateClient({ ...clientData, id: editingId });
        } else {
            addClient(clientData);
        }

        handleClose();
    };

    const filteredClients = clients.filter(c =>
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.docNumber && c.docNumber.includes(searchTerm))
    );

    return (
        <Layout>
            <div className="container-fluid">
                <div className="d-flex justify-content-between mb-4">
                    <h4 className="fw-bold">Cartera de Clientes</h4>
                    <button className="btn btn-primary-custom" onClick={handleShow}>
                        <FontAwesomeIcon icon={faPlus} /> Nuevo Cliente
                    </button>
                </div>

                <div className="card-premium mb-3 p-3">
                    <div className="input-group">
                        <span className="input-group-text">
                            <FontAwesomeIcon icon={faSearch} />
                        </span>
                        <input
                            className="form-control"
                            placeholder="Buscar por DNI/RUC o Nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="card-premium p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Documento</th>
                                    <th>Cliente</th>
                                    <th>Contacto</th>
                                    <th>Total</th>
                                    <th className="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map(client => (
                                    <React.Fragment key={client.id}>
                                        <tr>
                                            <td>
                                                <span className="badge bg-secondary me-2">
                                                    {client.type}
                                                </span>
                                                {client.docNumber}
                                            </td>
                                            <td>{client?.name || 'Sin Nombre'}</td>
                                            <td className="small">
                                                <div>
                                                    <FontAwesomeIcon icon={faPhone} /> {client.phone || '-'}
                                                </div>
                                                <div>
                                                    <FontAwesomeIcon icon={faEnvelope} /> {client.email || '-'}
                                                </div>
                                            </td>
                                            <td className="fw-bold">
                                                S/ {(client.grandTotal || 0).toFixed(2)}
                                            </td>
                                            <td className="text-end">
                                                <Button variant="link" onClick={() => handleEdit(client)}>
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    className="text-danger"
                                                    onClick={() => handleDelete(client.id)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </Button>
                                            </td>
                                        </tr>

                                        {/* PRODUCTOS */}
                                        {client.items && client.items.length > 0 && (
                                            <tr className="bg-light">
                                                <td colSpan="5">
                                                    <table className="table table-sm mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th>Producto</th>
                                                                <th>Comprobante</th>
                                                                <th>Cant.</th>
                                                                <th>Precio</th>
                                                                <th>Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {client.items.map((item, i) => (
                                                                <tr key={i}>
                                                                    <td>{item.product}</td>
                                                                    <td>{item.voucherType}</td>
                                                                    <td>{item.quantity}</td>
                                                                    <td>S/ {(item.price || 0).toFixed(2)}</td>
                                                                    <td className="fw-bold">
                                                                        S/ {(item.total || 0).toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            <Modal show={showModal} onHide={handleClose} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingId ? 'Editar Cliente' : 'Registrar Cliente'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <Form.Select
                                    value={clientForm.type}
                                    onChange={(e) =>
                                        setClientForm({ ...clientForm, type: e.target.value })
                                    }
                                >
                                    <option>DNI</option>
                                    <option>RUC</option>
                                    <option>CE</option>
                                </Form.Select>
                            </div>

                            <div className="col-md-8">
                                <div className="input-group">
                                    <Form.Control
                                        placeholder="Nro Documento"
                                        value={clientForm.docNumber}
                                        onChange={(e) =>
                                            setClientForm({ ...clientForm, docNumber: e.target.value })
                                        }
                                        maxLength={clientForm.type === 'RUC' ? 11 : 8}
                                        required
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={async () => {
                                            if (!clientForm.docNumber) return;
                                            setLoadingSearch(true);
                                            try {
                                                const response = await clientService.validateDocument(clientForm.docNumber);
                                                const data = response.data;

                                                if (data.success) {
                                                    let name = '';
                                                    let address = '';

                                                    if (data.razonSocial) {
                                                        name = data.razonSocial;
                                                        address = data.direccion;
                                                        setClientForm(prev => ({
                                                            ...prev,
                                                            type: 'RUC',
                                                            name: name,
                                                            address: address
                                                        }));
                                                    } else if (data.nombreCompleto) {
                                                        name = data.nombreCompleto;
                                                        setClientForm(prev => ({
                                                            ...prev,
                                                            type: 'DNI',
                                                            name: name
                                                        }));
                                                    }
                                                } else {
                                                    alert('Documento no encontrado');
                                                }
                                            } catch (error) {
                                                console.error(error);
                                                alert('Error al consultar documento');
                                            } finally {
                                                setLoadingSearch(false);
                                            }
                                        }}
                                        disabled={loadingSearch}
                                    >
                                        {loadingSearch ? '...' : <FontAwesomeIcon icon={faSearch} />}
                                    </Button>
                                </div>
                            </div>


                            <div className="col-12">
                                <Form.Control
                                    placeholder="Nombre / Razón Social"
                                    value={clientForm.name}
                                    onChange={(e) =>
                                        setClientForm({ ...clientForm, name: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <hr />
                            <h6 className="fw-bold">Productos</h6>

                            {items.map((item, index) => (
                                <div className="row g-2" key={index}>
                                    <div className="col-md-4">
                                        <Form.Control
                                            placeholder="Producto"
                                            value={item.product}
                                            onChange={(e) =>
                                                handleItemChange(index, 'product', e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="col-md-2">
                                        <Form.Select
                                            value={item.voucherType}
                                            onChange={(e) =>
                                                handleItemChange(index, 'voucherType', e.target.value)
                                            }
                                        >
                                            <option>Boleta</option>
                                            <option>Factura</option>
                                        </Form.Select>
                                    </div>

                                    <div className="col-md-2">
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleItemChange(index, 'quantity', Number(e.target.value))
                                            }
                                        />
                                    </div>

                                    <div className="col-md-2">
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            value={item.price}
                                            onChange={(e) =>
                                                handleItemChange(index, 'price', Number(e.target.value))
                                            }
                                        />
                                    </div>

                                    <div className="col-md-1 fw-bold">
                                        S/ {item.total.toFixed(2)}
                                    </div>

                                    <div className="col-md-1">
                                        <Button
                                            variant="link"
                                            className="text-danger"
                                            onClick={() => removeItem(index)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button variant="outline-primary" size="sm" onClick={addItem}>
                                <FontAwesomeIcon icon={faPlus} /> Agregar producto
                            </Button>

                            <div className="text-end fw-bold fs-5 mt-3">
                                Total: S/ {grandTotal.toFixed(2)}
                            </div>

                            <Button type="submit" className="btn-primary-custom w-100 mt-3">
                                Guardar
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Layout>
    );
};

export default Clients;
