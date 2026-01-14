import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productService } from '../services/api';
import "./estilos/Catalog.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const Catalog = () => {
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        presentation: [],
        aroma: []
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getAll();
            setProducts(response.data);
            setError(null);
        } catch (err) {
            console.error("Error loading products:", err);
            // Fallback a mock data si falla el backend (opcional, para demo)
            setError('No se pudieron cargar los productos del servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (type, value) => {
        setFilters(prev => {
            const current = prev[type];
            if (current.includes(value)) {
                return { ...prev, [type]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [type]: [...current, value] };
            }
        });
    };

    const filteredProducts = products.filter(product => {
        // Adaptar filtros a los datos reales del backend si tienen esos campos
        // Por ahora asumimos filtrado básico o mock properties si el backend no las devuelve
        // Mejorar esto según el modelo Product.java
        const matchPresentation = filters.presentation.length === 0 || true;
        const matchAroma = filters.aroma.length === 0 || true;
        return matchPresentation && matchAroma;
    });

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
                    <p>Cargando catálogo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="catalog-page">
            <div className="catalog-container">
                {/* Sidebar Filters */}
                <aside className="catalog-sidebar">
                    <div className="filter-group">
                        <h3>Filtros</h3>
                        {/* 
                           TODO: Generar filtros dinámicos basados en los datos reales 
                           Por ahora ocultos o estáticos
                        */}
                        <div className="filter-section">
                            <h4>Presentación</h4>
                            <label><input type="checkbox" onChange={() => handleFilterChange('presentation', '1 Litro')} /> 1 Litro</label>
                            <label><input type="checkbox" onChange={() => handleFilterChange('presentation', 'Galón')} /> Galón</label>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <main className="catalog-main">
                    <div className="catalog-header">
                        <h2>Catálogo de Productos ({filteredProducts.length})</h2>
                        <select className="sort-select">
                            <option>Más Populares</option>
                            <option>Menor Precio</option>
                            <option>Mayor Precio</option>
                        </select>
                    </div>

                    {error && (
                        <div className="alert alert-warning">
                            <FontAwesomeIcon icon={faExclamationCircle} /> {error}
                            <br />
                            <small>Mostrando catálogo vacío. Asegúrate de que el backend esté corriendo en puerto 8080.</small>
                        </div>
                    )}

                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <div className="product-card-catalog" key={product.id}>
                                <div className="prod-img-box" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                                    <span className="badge-new">NUEVO</span>
                                    {/* Usar imagen del backend o placeholder */}
                                    <img
                                        src={product.imageUrl || 'https://via.placeholder.com/300?text=Producto'}
                                        alt={product.name}
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=Aseo360'; }}
                                    />
                                </div>
                                <div className="prod-info">
                                    <h5>{product.category || 'Limpieza'}</h5>
                                    <h4 onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>{product.name}</h4>
                                    <p className="prod-price">S/ {product.price?.toFixed(2) || '0.00'}</p>
                                    <button className="btn-add-cart" onClick={() => navigate(`/product/${product.id}`)}>
                                        👁️ Ver Detalle
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && !error && (
                            <div className="no-results text-center py-5">
                                <p>No hay productos disponibles por ahora.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Catalog;
