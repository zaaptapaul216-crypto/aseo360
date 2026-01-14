import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faCashRegister, faBoxes, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useData();
    const [selectedRole, setSelectedRole] = useState('vendedor');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        login(selectedRole);

        if (selectedRole === 'admin') navigate('/admin');
        else if (selectedRole === 'vendedor') navigate('/pos');
        else if (selectedRole === 'almacenero') navigate('/inventory');
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-gradient-premium">
            {/* Background decoration or image */}

            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-5 col-lg-4">
                        <div className="card-premium fade-in">
                            <div className="text-center mb-4">
                                <div className="mb-3">
                                    {/* Logo Placeholder */}
                                    <span className="h1 text-primary"><FontAwesomeIcon icon={faCashRegister} /></span>
                                </div>
                                <h2 className="fw-bold text-dark">ASEO360</h2>
                                <p className="text-muted small">Sistema de Punto de Venta & Facturación</p>
                            </div>

                            <form onSubmit={handleLogin}>
                                <div className="mb-4">
                                    <label className="form-label text-uppercase small fw-bold text-muted">Seleccione su Rol</label>
                                    <div className="d-grid gap-2">
                                        <button
                                            type="button"
                                            className={`btn ${selectedRole === 'admin' ? 'btn-primary-custom' : 'btn-outline-secondary'} text - start`}
                                            onClick={() => setSelectedRole('admin')}
                                        >
                                            <FontAwesomeIcon icon={faUserTie} className="me-2" /> Administrador
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${selectedRole === 'vendedor' ? 'btn-primary-custom' : 'btn-outline-secondary'} text - start`}
                                            onClick={() => setSelectedRole('vendedor')}
                                        >
                                            <FontAwesomeIcon icon={faCashRegister} className="me-2" /> Vendedor
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${selectedRole === 'almacenero' ? 'btn-primary-custom' : 'btn-outline-secondary'} text - start`}
                                            onClick={() => setSelectedRole('almacenero')}
                                        >
                                            <FontAwesomeIcon icon={faBoxes} className="me-2" /> Almacenero
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-muted small">Usuario</label>
                                    <input type="text" className="form-control" placeholder="Ingrese su usuario" required />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-muted small">Contraseña</label>
                                    <input type="password" className="form-control" placeholder="••••••••" required />
                                </div>

                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary-custom btn-lg shadow-sm">
                                        Ingresar al Sistema <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                                    </button>
                                </div>
                            </form>

                            <div className="text-center mt-4">
                                <small className="text-muted">© 2026 Aseo360. Todos los derechos reservados.</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
