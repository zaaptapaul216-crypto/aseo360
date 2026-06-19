import React, { useState } from 'react';
import './Login.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/imagenes/logo.png';

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            // Spring Boot envía {"mensaje": "texto"} o un string directo o un error genérico
            const backendMsg = err.response?.data?.mensaje || err.response?.data?.message || err.response?.data || err.message || 'Error al iniciar sesión';
            setError(typeof backendMsg === 'string' ? backendMsg : 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card shadow-lg">

                <div className="login-header text-center">
                    <img src={logo} alt="Aseo360 Logo" className="login-logo mb-3" />
                    <h3 className="fw-bold text-primary">Panel Administrativo</h3>
                    <p className="text-muted small">
                        Bienvenido de nuevo, por favor inicia sesión
                    </p>
                </div>

                <div className="login-body mt-4">

                    {error && (
                        <div className="alert alert-danger py-2 small d-flex align-items-center">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* CORREO */}
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">
                                Correo electrónico
                            </label>

                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="fas fa-envelope text-muted"></i>
                                </span>

                                <input
                                    type="email"
                                    className="form-control bg-light border-start-0 ps-0"
                                    placeholder="Ingresa tu correo"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* CONTRASEÑA */}
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted">
                                Contraseña
                            </label>

                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="fas fa-lock text-muted"></i>
                                </span>

                                <input
                                    type="password"
                                    className="form-control bg-light border-start-0 ps-0"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* BOTÓN */}
                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 fw-bold shadow-sm rounded-pill d-flex align-items-center justify-content-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                ></span>
                            ) : (
                                <i className="fas fa-sign-in-alt me-2"></i>
                            )}
                            {loading ? 'Validando...' : 'INICIAR SESIÓN'}
                        </button>

                    </form>
                </div>

                <div className="login-footer text-center mt-4">
                    <p className="small text-muted mb-0">
                        © 2026 INVERSIONES T&C - ASEO360
                    </p>
                    <div className="small text-primary fw-bold">
                        Soporte Técnico: 937036199
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
