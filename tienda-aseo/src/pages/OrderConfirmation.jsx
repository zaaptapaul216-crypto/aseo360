import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./estilos/OrderConfirmation.css";

const OrderConfirmation = () => {
    const orderId = "AS-82941-2024";
    const navigate = useNavigate();

    return (
        <div className="confirmation-wrapper">
            <div className="confirmation-container-v4">

                {/* Success Icon */}
                <div className="success-icon-large">
                    <div className="icon-circle">
                        <div className="icon-circle">
                            <i className="fas fa-check-circle" style={{ fontSize: '60px', color: '#1e88e5' }}></i>
                        </div>
                    </div>
                </div>

                {/* Main Message */}
                <div className="success-message">
                    <h1>¡Gracias por tu compra!</h1>
                    <p className="order-number">Pedido <span>#{orderId}</span></p>
                    <p className="confirmation-text">
                        Tu pedido ha sido confirmado y está siendo preparado.
                        Te enviaremos actualizaciones por correo electrónico.
                    </p>
                </div>

                {/* Delivery Estimate */}
                <div className="delivery-estimate">
                    <div className="estimate-icon"><i className="fas fa-truck"></i></div>
                    <div className="estimate-text">
                        <strong>Entrega estimada</strong>
                        <span>Jueves, 12 de Enero · 9:00 AM - 6:00 PM</span>
                    </div>
                </div>

                {/* Order Details */}
                <div className="order-details-section">
                    <h2>Detalles del pedido</h2>

                    <div className="detail-item">
                        <span className="detail-label">Productos</span>
                        <div className="products-mini">
                            <div>Detergente Industrial 20L × 2</div>
                            <div>Desinfectante Pino 5L × 5</div>
                        </div>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Dirección de envío</span>
                        <span className="detail-value">Av. Santa Victoria 102, Chiclayo, Lambayeque</span>
                    </div>

                    <div className="detail-item total-item">
                        <span className="detail-label">Total pagado</span>
                        <span className="detail-value total-value">S/ 215.00</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-section">
                    <button
                        className="btn-action primary"
                        onClick={() => navigate('/')}
                    >
                        Volver a la tienda
                    </button>

                    <button
                        className="btn-action secondary"
                        onClick={() => {
                            const msg = `Hola, consulta sobre pedido #${orderId}`;
                            window.open(`https://wa.me/51922382024?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                    >
                        <span className="whatsapp-icon"><i className="fab fa-whatsapp"></i></span>
                        Contactar soporte
                    </button>
                </div>

                {/* Footer Info */}
                <div className="footer-info">
                    <p>¿Necesitas ayuda? Estamos disponibles de lunes a sábado, 9AM - 6PM</p>
                </div>

            </div>
        </div>
    );
};

export default OrderConfirmation;
