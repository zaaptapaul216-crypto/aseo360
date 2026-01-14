import React from 'react';
import "./estilos/Contact.css";

const Contact = () => {
    return (
        <div className="contact-page">
            <div className="contact-container">
                <h1>Contáctanos</h1>
                <p className="contact-subtitle">Estamos aquí para ayudar a su empresa con las mejores soluciones de limpieza.</p>

                <div className="contact-grid">
                    <div className="contact-form-box">
                        <form>
                            <div className="form-group">
                                <label>Nombre Completo</label>
                                <input type="text" placeholder="Su nombre" />
                            </div>
                            <div className="form-group">
                                <label>Correo Electrónico</label>
                                <input type="email" placeholder="ejemplo@empresa.com" />
                            </div>
                            <div className="form-group">
                                <label>Asunto</label>
                                <select>
                                    <option>Consulta General</option>
                                    <option>Cotización Mayorista</option>
                                    <option>Soporte Técnico</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Mensaje</label>
                                <textarea rows="5" placeholder="¿En qué podemos ayudarle?"></textarea>
                            </div>
                            <button type="submit" className="btn-send">Enviar Mensaje</button>
                        </form>
                    </div>

                    <div className="contact-info-box">
                        <h3>Información de Contacto</h3>
                        <div className="info-item">
                            <span className="icon">📍</span>
                            <p>Av. Industrial 123, Parque Industrial<br />Trujillo, Perú</p>
                        </div>
                        <div className="info-item">
                            <span className="icon">📞</span>
                            <p>+51 987 654 321</p>
                        </div>
                        <div className="info-item">
                            <span className="icon">✉️</span>
                            <p>ventas@aseo360.com</p>
                        </div>

                        <div className="map-placeholder">
                            <p>Mapa de Ubicación</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
