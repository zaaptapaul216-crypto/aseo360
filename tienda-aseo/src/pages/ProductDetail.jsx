import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productService } from '../services/api'; // Importar servicio
import "./estilos/ProductDetail.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await productService.getById(id);
                setProduct(response.data);
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError("No se pudo cargar el producto.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            alert(`¡${product.name} agregado al carrito!`);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-not-found">
                <h2>{error || "Producto no encontrado"}</h2>
                <button className="btn-back" onClick={() => navigate('/catalogo')}>Volver al Catálogo</button>
            </div>
        );
    }

    return (
        <div className="product-detail-page">
            <button className="btn-back" onClick={() => navigate('/catalogo')}>&larr; Volver al Catálogo</button>

            <div className="detail-container">
                <div className="detail-image-box">
                    <img
                        src={product.imageUrl || 'https://via.placeholder.com/500?text=Producto'}
                        alt={product.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/500?text=Aseo360'; }}
                    />
                </div>

                <div className="detail-info">
                    <span className="detail-category">{product.category || 'General'}</span>
                    <h1>{product.name}</h1>
                    <p className="detail-price">S/ {product.price?.toFixed(2)}</p>

                    <div className="detail-meta">
                        <p><strong>Código:</strong> {product.code}</p>
                        <p><strong>Stock Disponible:</strong> {product.stock}</p>
                        {/* Adapter fields if they exist in backend or fallback */}
                        {product.presentation && <p><strong>Presentación:</strong> {product.presentation}</p>}
                    </div>

                    <div className="detail-description">
                        <h3>Descripción</h3>
                        <p>{product.description || 'Sin descripción disponible.'}</p>
                    </div>

                    <div className="detail-actions">
                        <button
                            className="btn-add-large"
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                        >
                            {product.stock > 0 ? '🛒 Agregar al Carrito' : '🚫 Agotado'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
