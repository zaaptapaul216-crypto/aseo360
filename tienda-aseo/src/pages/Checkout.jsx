import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import "./estilos/Checkout.css";

const Checkout = () => {
    const { cart, cartTotal, removeFromCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState('card');
    const navigate = useNavigate();

    const handleConfirmOrder = () => {
        // Here you would typically validate the form and send data to backend
        // For now, we just navigate to confirmation
        navigate('/pedido-confirmado');
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">

                {/* Shipping Form (Left) */}
                <div className="checkout-form-section">
                    <h2>Información de Envío</h2>
                    <form className="shipping-form">
                        <div className="form-row">
                            <input type="text" placeholder="Nombres" />
                            <input type="text" placeholder="Apellidos" />
                        </div>
                        <input type="text" placeholder="Dirección / Calle / Avenida" />
                        <div className="form-row">
                            <input type="text" placeholder="Distrito" />
                            <input type="text" placeholder="Ciudad" />
                        </div>
                        <div className="form-row">
                            <input type="tel" placeholder="Teléfono / Celular" />
                            <input type="email" placeholder="Correo Electrónico" />
                        </div>
                        <textarea placeholder="Referencia o Notas Adicionales"></textarea>
                    </form>

                    <div className="payment-options">
                        <h3>Método de Pago</h3>
                        <div className="payment-methods">
                            <label className="payment-method">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="method-card">
                                    <span>💳 Tarjeta Crédito/Débito</span>
                                </span>
                            </label>
                            <label className="payment-method">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="yape"
                                    checked={paymentMethod === 'yape'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="method-card">
                                    <span>📱 Yape / Plin</span>
                                </span>
                            </label>
                            <label className="payment-method">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="transfer"
                                    checked={paymentMethod === 'transfer'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="method-card">
                                    <span>🏦 Transferencia</span>
                                </span>
                            </label>
                        </div>

                        {/* Conditional Content */}
                        <div className="payment-details-box">
                            {paymentMethod === 'card' && (
                                <div className="card-form animate-fade-in">
                                    <input type="text" placeholder="Número de Tarjeta" className="payment-input full" />
                                    <div className="form-row">
                                        <input type="text" placeholder="MM/YY" className="payment-input" />
                                        <input type="text" placeholder="CVC" className="payment-input" />
                                    </div>
                                    <input type="text" placeholder="Nombre en la Tarjeta" className="payment-input full" />
                                </div>
                            )}

                            {paymentMethod === 'yape' && (
                                <div className="yape-info animate-fade-in">
                                    <p className="instruction">Escanea el QR o yapea al número:</p>
                                    <p className="phone-number">987 654 321</p>
                                    <p className="owner">Titular: Aseo360 SAC</p>
                                    <div className="qr-placeholder">
                                        <span>[QR Code Aquí]</span>
                                    </div>
                                    <label className="upload-label">
                                        Adjuntar Captura de Pago:
                                        <input type="file" className="file-input" />
                                    </label>
                                </div>
                            )}

                            {paymentMethod === 'transfer' && (
                                <div className="transfer-info animate-fade-in">
                                    <p className="instruction">Realiza la transferencia a la siguiente cuenta:</p>
                                    <div className="bank-details">
                                        <p><strong>BCP Soles:</strong> 191-12345678-0-99</p>
                                        <p><strong>CCI:</strong> 002-191-12345678099-54</p>
                                        <p><strong>Titular:</strong> Aseo360 SAC</p>
                                    </div>
                                    <label className="upload-label">
                                        Adjuntar Voucher:
                                        <input type="file" className="file-input" />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <button className="btn-confirm-order" onClick={handleConfirmOrder}>Confirmar Pedido</button>
                </div>

                {/* Order Summary (Right) */}
                <div className="order-summary">
                    <h3>Resumen del Pedido</h3>

                    <div className="summary-items">
                        {cart.length === 0 ? (
                            <p style={{ color: '#888', fontStyle: 'italic' }}>El carrito está vacío</p>
                        ) : (
                            cart.map(item => (
                                <div className="summary-item" key={item.id}>
                                    <div className="item-info">
                                        <span>{item.name} <small>x{item.quantity}</small></span>
                                        <span className="item-price">S/ {(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    <button className="btn-remove" onClick={() => removeFromCart(item.id)} title="Eliminar producto">
                                        🗑️
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="summary-totals">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>S/ {cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>Envío</span>
                            <span>S/ 15.00</span>
                        </div>
                        <div className="total-row final">
                            <span>Total</span>
                            <span>S/ {(cartTotal + (cart.length > 0 ? 15 : 0)).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
