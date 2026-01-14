import React, { useState, useEffect } from 'react';
import "./estilos/About.css";

// Import images (or use placeholders if specific ones aren't available)
import img1 from '../assets/imagenes/afiche2.png';
import img2 from '../assets/imagenes/afiche3.png';
import img3 from '../assets/imagenes/afiche4.png';
import img4 from '../assets/imagenes/afiche5.png';

const About = () => {
    const images = [img1, img2, img3, img4, img1, img2]; // Repeating to reach 6 as requested
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000); // Change every 3 seconds

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className="about-page">
            <h1 className="about-title">Sobre Nosotros</h1>
            <p className="about-intro">
                En <strong>Aseo360 Wholesale Pro</strong>, nos dedicamos a transformar la industria de la limpieza en el norte del país.
                Con más de 10 años de experiencia, somos el aliado estratégico para empresas, hospitales e industrias que buscan
                calidad certificada y suministros de alto rendimiento.
            </p>

            <div className="cards-container">
                <div className="info-card">
                    <h3 className="mission-title">Nuestra Misión</h3>
                    <p>
                        Proveer soluciones de higiene integrales que garanticen espacios seguros y saludables,
                        optimizando costos para nuestros socios comerciales.
                    </p>
                </div>
                <div className="info-card">
                    <h3 className="vision-title">Visión</h3>
                    <p>
                        Ser la red de distribución de insumos de limpieza más eficiente y sostenible de la región,
                        reconocida por nuestra innovación y servicio al cliente.
                    </p>
                </div>
            </div>

            {/* Bubble Carousel Section */}
            <div className="carousel-section">
                {/* Background Bubbles */}
                <div className="bg-bubble bubble-1"></div>
                <div className="bg-bubble bubble-2"></div>
                <div className="bg-bubble bubble-3"></div>
                <div className="bg-bubble bubble-4"></div>

                <h2>Nuestra Galería</h2>

                <div className="carousel-window">
                    {images.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`Slide ${index + 1}`}
                            className={`carousel-image ${index === currentIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>

                <div className="carousel-indicators">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`indicator ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;
