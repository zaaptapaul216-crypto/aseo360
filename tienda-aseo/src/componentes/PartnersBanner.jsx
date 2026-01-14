import React from 'react';
import './estilos/PartnersBanner.css';

const PartnersBanner = () => {
    return (
        <section className="partners-section">
            <div className="partners-container">

                <div className="partners-text">
                    <h2>Únete a nuestra Red <br /> de Socios Mayoristas</h2>
                    <p>Obtén acceso a la lista de precios exclusiva, asesoría técnica personalizada y entregas prioritarias en 24 horas.</p>
                    <div className="partners-actions">
                        <input type="email" placeholder="Correo electrónico corporativo" className="email-input" />
                        <button className="btn-request">Solicitar Catálogo</button>
                    </div>
                </div>

                <div className="benefits-grid">
                    <div className="benefit-card">
                        <span className="benefit-icon">
                            <i className="fas fa-truck-fast"></i>
                        </span>
                        <h4>Envío Veloz</h4>
                        <p>Logística propia para entregas el mismo día.</p>
                    </div>
                    <div className="benefit-card">
                        <span className="benefit-icon">
                            <i className="fas fa-leaf"></i>
                        </span>
                        <h4>Sostenible</h4>
                        <p>Fórmulas que cuidan el medio ambiente.</p>
                    </div>
                    <div className="benefit-card">
                        <span className="benefit-icon">
                            <i className="fas fa-shield-halved"></i>
                        </span>
                        <h4>Certificado</h4>
                        <p>Registro sanitario DIGESA vigente.</p>
                    </div>
                    <div className="benefit-card">
                        <span className="benefit-icon">
                            <i className="fas fa-credit-card"></i>
                        </span>
                        <h4>Crédito Pro</h4>
                        <p>Facilidades de pago para empresas.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default PartnersBanner;
