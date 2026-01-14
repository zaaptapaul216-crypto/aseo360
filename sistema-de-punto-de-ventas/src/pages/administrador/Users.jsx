import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faUserTie, faUserShield, faUserTag } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form } from 'react-bootstrap';

// Mock Users
const initialUsers = [
    { id: 1, name: 'Juan Perez', email: 'juan@aseo360.com', role: 'Administrador', status: 'Activo' },
    { id: 2, name: 'Maria Lopez', email: 'maria@aseo360.com', role: 'Vendedor', status: 'Activo' },
    { id: 3, name: 'Carlos Ruiz', email: 'carlos@aseo360.com', role: 'Almacenero', status: 'Activo' },
];

const Users = () => {
    const [users, setUsers] = useState(initialUsers);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState({ id: null, name: '', email: '', role: 'Vendedor', password: '' });

    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentUser({ id: null, name: '', email: '', role: 'Vendedor', password: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            setUsers(users.map(u => u.id === currentUser.id ? { ...currentUser, status: 'Activo' } : u));
        } else {
            setUsers([...users, { ...currentUser, id: users.length + 1, status: 'Activo' }]);
        }
        handleClose();
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setIsEditing(true);
        handleShow();
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Seguro que desea dar de baja a este usuario?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const handleChange = (e) => {
        setCurrentUser({ ...currentUser, [e.target.name]: e.target.value });
    };

    return (
        <Layout>
            <div className="container-fluid fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold m-0 text-dark">Gestión de Usuarios</h4>
                    <button className="btn btn-primary-custom" onClick={handleShow}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Nuevo Trabajador
                    </button>
                </div>

                <div className="card-premium p-0 overflow-hidden">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-secondary text-uppercase small">
                            <tr>
                                <th className="px-4 py-3">Nombre</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Rol</th>
                                <th className="px-4 py-3 text-center">Estado</th>
                                <th className="px-4 py-3 text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-4 fw-bold">{user.name}</td>
                                    <td className="px-4 text-muted">{user.email}</td>
                                    <td className="px-4">
                                        <span className={`badge ${user.role === 'Administrador' ? 'bg-primary' : user.role === 'Vendedor' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            <FontAwesomeIcon icon={user.role === 'Administrador' ? faUserShield : faUserTag} className="me-1" />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 text-center">
                                        <span className="badge bg-light text-success border border-success">Active</span>
                                    </td>
                                    <td className="px-4 text-end">
                                        <button className="btn btn-sm btn-link text-primary me-2" onClick={() => handleEdit(user)}>
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button className="btn btn-sm btn-link text-danger" onClick={() => handleDelete(user.id)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">{isEditing ? 'Editar Usuario' : 'Registrar Trabajador'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre Completo</Form.Label>
                            <Form.Control type="text" name="name" value={currentUser.name} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" name="email" value={currentUser.email} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Rol</Form.Label>
                            <Form.Select name="role" value={currentUser.role} onChange={handleChange}>
                                <option value="Administrador">Administrador</option>
                                <option value="Vendedor">Vendedor</option>
                                <option value="Almacenero">Almacenero</option>
                            </Form.Select>
                        </Form.Group>
                        {!isEditing && (
                            <Form.Group className="mb-3">
                                <Form.Label>Contraseña</Form.Label>
                                <Form.Control type="password" name="password" value={currentUser.password} onChange={handleChange} required />
                            </Form.Group>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="light" onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" className="btn-primary-custom">Guardar</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Layout>
    );
};

export default Users;
