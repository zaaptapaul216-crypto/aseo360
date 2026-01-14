import React from 'react';
import './estilos/Categorias.css';

import cat1 from '../assets/imagenes/afiche2.png';
import cat2 from '../assets/imagenes/afiche3.png';
import cat3 from '../assets/imagenes/afiche4.png';
import cat4 from '../assets/imagenes/afiche5.png';

const Categories = () => {
    const categories = [
        {
            title: "Desinfectantes",
            desc: "Grado Hospitalario & Industrial",
            price: "DESDE S/ 45.00",
            image: cat1,
            badge: "ECO-FRIENDLY",
            badgeColor: "#22C55E"
        },
        {
            title: "Limpiatodo",
            desc: "Multisuperficies Concentrado",
            price: "DESDE S/ 28.00",
            image: cat2,
            badge: "PREMIUM",
            badgeColor: "#3B82F6"
        },
        {
            title: "Detergentes",
            desc: "Biodegradables de Alta Eficiencia",
            price: "DESDE S/ 62.00",
            image: cat3,
            badge: "ECO-FRIENDLY",
            badgeColor: "#22C55E"
        },
        {
            title: "Accesorios",
            desc: "Herramientas Pro y Equipamiento",
            price: "DESDE S/ 15.00",
            image: cat4
        }
    ];

    return (
        <section className="categorias-section">
            <div className="section-header">
                <div className="header-text">
                    <h2>Categorías Especializadas</h2>
                    <p>
                        Soluciones integrales diseñadas para el sector industrial,
                        comercial y salud con estándares internacionales de calidad.
                    </p>
                </div>
                <a href="#" className="view-all">Ver todas las líneas →</a>
            </div>

            <div className="categorias-grid">
                {categories.map((cat, index) => (
                    <article className="category-card" key={index}>

                        {cat.badge && (
                            <span
                                className="cat-badge"
                                style={{ backgroundColor: cat.badgeColor }}
                            >
                                {cat.badge}
                            </span>
                        )}

                        <div className="card-image-container">
                            <img
                                src={cat.image}
                                alt={cat.title}
                                className="cat-image"
                            />
                        </div>

                        <div className="card-details">
                            <h3>{cat.title}</h3>
                            <p className="cat-desc">{cat.desc}</p>

                            <div className="cat-footer">
                                <span className="cat-price">{cat.price}</span>
                                <span className="arrow-icon">→</span>
                            </div>
                        </div>

                    </article>
                ))}
            </div>
        </section>
    );
};

export default Categories;
