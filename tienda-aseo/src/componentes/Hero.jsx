import React from "react";
import "./estilos/Hero.css"
import heroImg from "../assets/imagenes/afiche1.png";

const Hero = () => {
  return (
    <section className="hero-section">
      {/* Burbujas de fondo */}
      <div className="bubble-container">
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>

      {/* Contenido del Hero */}
      <div className="hero-content">
        <div className="text-content">
          <span className="badge">SUMINISTRO CERTIFICADO</span>

          <h1>
            Limpieza que <br />
            <span className="highlight">transforma</span> <br />
            espacios.
          </h1>

          <p className="subtitle">
            El aliado estratégico para su negocio. Distribución mayorista de
            productos biodegradables y químicos de alto rendimiento con entrega
            inmediata.
          </p>

          <div className="cta-group">
            <button className="btn primary">
              Explorar Catálogo &rarr;
            </button>
            <button className="btn secondary">
              Precios Mayoristas
            </button>
          </div>
        </div>

        <div className="image-content">
          <div className="card-inner">
            <img
              src={heroImg}
              alt="Anti-bacterial Soap"
              className="hero-product-img"
            />
            <div className="floating-bubble-1"></div>
            <div className="floating-bubble-2"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
