import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./estilos/Login.css";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Use navigate for immediate feedback
        alert('Ingresando...');
        navigate('/');
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-box">
                    <h2>Acceso Socios</h2>
                    <p className="login-subtitle">Ingresa a tu cuenta mayorista</p>

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ejemplo@empresa.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-login">Ingresar</button>
                        <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
                    </form>

                    <div className="login-footer">
                        <p>¿No eres socio aún? <a href="#">Solicitar Afiliación</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
