import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form } from 'react-bootstrap';
import { useData } from '../../context/DataContext';
import { clientService } from '../../services/api';

const Inventory = () => {
    const { products, addProduct, updateProduct, deleteProduct, suppliers, addSupplier } = useData();
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);

    // Quick Add Supplier State
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [newSupplier, setNewSupplier] = useState({ ruc: '', name: '', phone: '', email: '', address: '' });

    // Form State
    const [currentProduct, setCurrentProduct] = useState({ id: null, code: '', name: '', category: 'Limpieza', price: '', cost: '', stock: '' });
    const [isEditing, setIsEditing] = useState(false);

    const handleClose = () => {
        setShowModal(false);
        setCurrentProduct({ id: null, code: '', name: '', category: 'Limpieza', price: '', cost: '', stock: '' });
        setIsEditing(false);
    };

    const handleShow = () => setShowModal(true);

    const handleEdit = (product) => {
        setCurrentProduct(product);
        setIsEditing(true);
        handleShow();
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Está seguro de eliminar este producto?')) {
            deleteProduct(id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const p = {
            ...currentProduct,
            price: parseFloat(currentProduct.price),
            cost: parseFloat(currentProduct.cost),
            stock: parseInt(currentProduct.stock)
        };

        if (isEditing) {
            updateProduct(p);
        } else {
            addProduct(p);
        }
        handleClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct({ ...currentProduct, [name]: value });
    };

    const filteredProducts = products.filter(p =>
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (showLowStock ? p.stock < 10 : true)
    );

    const handleQuickAddSupplier = async () => {
        if (!newSupplier.ruc) return alert('Ingrese Ruc');

        // Si tiene nombre directo, guardar
        if (newSupplier.name) {
            addSupplier({ ...newSupplier, id: Date.now() }); // Fallback to local context for now
            setNewSupplier({ ruc: '', name: '', phone: '', email: '', address: '' });
            setShowSupplierModal(false);
            return;
        }

        // Si no tiene nombre, intentar buscar
        try {
            const response = await clientService.validateDocument(newSupplier.ruc);
            if (response.data.success && response.data.razonSocial) {
                setNewSupplier(prev => ({ ...prev, name: response.data.razonSocial, address: response.data.direccion }));
            } else {
                alert('RUC no encontrado, por favor ingrese la Razón Social manualmente.');
            }
        } catch (error) {
            console.error(error);
            alert('Error al consultar RUC. Ingrese los datos manualmente.');
        }
    };

    // Helper to get supplier name
    const getSupplierName = (id) => {
        const s = suppliers.find(sup => sup.id.toString() === id?.toString());
        return s ? s.name : '-';
    };

    return (
        <Layout>
            <div className="container-fluid fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold m-0 text-dark">Gestión de Inventario</h4>
                    <button className="btn btn-primary-custom" onClick={handleShow}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Agregar Producto
                    </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="card-premium mb-4 p-3">
                    <div className="d-flex gap-3">
                        <div className="input-group flex-grow-1">
                            <span className="input-group-text bg-white border-end-0"><FontAwesomeIcon icon={faSearch} /></span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Buscar por nombre o código..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="form-check form-switch d-flex align-items-center bg-white border rounded px-3">
                            <input
                                className="form-check-input me-2"
                                type="checkbox"
                                role="switch"
                                id="lowStockSwitch"
                                checked={showLowStock}
                                onChange={() => setShowLowStock(!showLowStock)}
                            />
                            <label className="form-check-label text-muted small fw-bold" htmlFor="lowStockSwitch">Ver Bajo Stock</label>
                        </div>
                    </div>
                </div>

                {/* Product Table */}
                <div className="card-premium p-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary text-uppercase small">
                                <tr>
                                    <th className="px-4 py-3">Código</th>
                                    <th className="px-4 py-3">Producto</th>
                                    <th className="px-4 py-3">Categoría</th>
                                    <th className="px-4 py-3">Proveedor</th>
                                    <th className="px-4 py-3">Costo</th>
                                    <th className="px-4 py-3">P. Venta</th>
                                    <th className="px-4 py-3 text-center">Stock</th>
                                    <th className="px-4 py-3 text-center">Estado</th>
                                    <th className="px-4 py-3 text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length > 0 ? filteredProducts.map(product => (
                                    <tr key={product.id}>
                                        <td className="px-4 fw-bold text-muted">{product.code}</td>
                                        <td className="px-4 fw-semibold">{product.name}</td>
                                        <td className="px-4"><span className="badge bg-light text-dark border">{product.category}</span></td>
                                        <td className="px-4 text-muted small">{getSupplierName(product.supplier)}</td>
                                        <td className="px-4">S/ {product.cost ? product.cost.toFixed(2) : '-'}</td>
                                        <td className="px-4 fw-bold">S/ {product.price.toFixed(2)}</td>
                                        <td className="px-4 text-center">{product.stock}</td>
                                        <td className="px-4 text-center">
                                            {product.stock === 0 ? (
                                                <span className="badge bg-danger">Agotado</span>
                                            ) : product.stock < 10 ? (
                                                <span className="badge bg-warning text-dark">Bajo Stock</span>
                                            ) : (
                                                <span className="badge bg-success">En Stock</span>
                                            )}
                                        </td>
                                        <td className="px-4 text-end">
                                            <button className="btn btn-sm btn-link text-primary me-2" onClick={() => handleEdit(product)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className="btn btn-sm btn-link text-danger" onClick={() => handleDelete(product.id)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="9" className="text-center py-5 text-muted">
                                            <FontAwesomeIcon icon={faBoxOpen} size="2x" className="mb-2" />
                                            <p className="m-0">No se encontraron productos</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleClose} centered backdrop="static">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">Código</Form.Label>
                                    <Form.Control type="text" name="code" value={currentProduct.code} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">Categoría</Form.Label>
                                    <Form.Select name="category" value={currentProduct.category} onChange={handleChange}>
                                        <option>Limpieza</option>
                                        <option>Desinfección</option>
                                        <option>Papelería</option>
                                        <option>Higiene</option>
                                        <option>Seguridad</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-12">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">Nombre del Producto</Form.Label>
                                    <Form.Control type="text" name="name" value={currentProduct.name} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">Costo (S/)</Form.Label>
                                    <Form.Control type="number" step="0.01" name="cost" value={currentProduct.cost} onChange={handleChange} />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">P. Venta (S/)</Form.Label>
                                    <Form.Control type="number" step="0.01" name="price" value={currentProduct.price} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">Stock</Form.Label>
                                    <Form.Control type="number" name="stock" value={currentProduct.stock} onChange={handleChange} required />
                                </Form.Group>
                            </div>

                            <div className="col-12">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">Proveedor</Form.Label>
                                    <div className="input-group">
                                        <Form.Select name="supplier" value={currentProduct.supplier || ''} onChange={handleChange}>
                                            <option value="">Seleccione Proveedor</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </Form.Select>
                                        <Button variant="outline-secondary" onClick={() => setShowSupplierModal(true)}>
                                            <FontAwesomeIcon icon={faPlus} />
                                        </Button>
                                    </div>
                                </Form.Group>
                            </div>
                            <div className="col-12">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">Imagen del Producto</Form.Label>
                                    <div className="border rounded p-3 text-center bg-light">
                                        <div className="mb-2">
                                            <FontAwesomeIcon icon={faBoxOpen} size="3x" className="text-secondary opacity-50" />
                                        </div>
                                        <Form.Control type="file" size="sm" className="mb-2" accept="image/*" />
                                        <div className="small text-muted">Haga clic o arrastre una imagen aquí</div>
                                    </div>
                                </Form.Group>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="light" onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" className="btn-primary-custom px-4">
                            {isEditing ? 'Guardar Cambios' : 'Registrar Producto'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>


            {/* Quick Add Supplier Modal */}
            <Modal show={showSupplierModal} onHide={() => setShowSupplierModal(false)} centered size="sm">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold fs-5">Nuevo Proveedor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="small text-muted mb-3">Agregue un proveedor rápidamente para continuar con el registro.</p>
                    <Form.Group className="mb-2">
                        <Form.Label className="small fw-bold">RUC</Form.Label>
                        <div className="input-group">
                            <Form.Control type="text" value={newSupplier.ruc} onChange={(e) => setNewSupplier({ ...newSupplier, ruc: e.target.value })} maxLength="11" />
                            <Button variant="outline-secondary" onClick={handleQuickAddSupplier} title="Buscar RUC de Proveedor">
                                <FontAwesomeIcon icon={faSearch} />
                            </Button>
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Razón Social</Form.Label>
                        <Form.Control type="text" value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} />
                    </Form.Group>
                    <Button className="btn-primary-custom w-100" onClick={handleQuickAddSupplier} disabled={!newSupplier.name}>Guardar Proveedor</Button>
                </Modal.Body>
            </Modal>
        </Layout>
    );
};

export default Inventory;
