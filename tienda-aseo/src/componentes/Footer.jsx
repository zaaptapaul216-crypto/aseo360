import React from "react";
import "./estilos/Footer.css";

const Footer = () => {
  return (
    // Contenedor principal del footer
    <footer className="footer">

      {/* Contenedor que divide el footer en columnas */}
      <div className="footer-container">

        {/* ===== COLUMNA 1 - LOGO Y DESCRIPCIÓN ===== */}
        <div className="footer-section">
          <div className="footer-logo">
            <span className="logo-text">ASEO360</span>
          </div>
          <p>
            Líderes en distribución de suministros de limpieza profesional en el norte del país.
            Comprometidos con la excelencia y la salud pública.
          </p>
        </div>

        {/* ===== COLUMNA 2 - REDES SOCIALES ===== */}
        <div className="footer-section">
          <h4>Síguenos</h4>
          <div className="icons">
            <a href="#"><i className="fab fa-facebook"></i> Facebook</a>
            <a href="#"><i className="fab fa-twitter"></i> Twitter</a>
            <a href="#"><i className="fab fa-instagram"></i> Instagram</a>
            <a href="#"><i className="fab fa-linkedin"></i> LinkedIn</a>
            <a href="#"><i className="fab fa-tiktok"></i> TikTok</a>
          </div>
        </div>

        {/* ===== COLUMNA 3 - NAVEGACIÓN ===== */}
        <div className="footer-section">
          <h4>Navegación</h4>
          <ul>
            <li>Producto</li>
            <li>Catálogo Mayorista</li>
            <li>Sobre Nosotros</li>
            <li>Sostenibilidad</li>
          </ul>
        </div>

        {/* ===== COLUMNA 4 - ATENCIÓN AL CLIENTE ===== */}
        <div className="footer-section">
          <h4>Atención al Cliente</h4>
          <ul>
            <li>Estado de Pedido</li>
            <li>Términos de Envío</li>
            <li>Política de Devolución</li>
            <li>Soporte Técnico</li>
          </ul>
        </div>

      </div>

      {/* ===== PARTE INFERIOR ===== */}
      <div className="footer-bottom">
        © 2024 Aseo360. Todos los derechos reservados.
      </div>

    </footer>
  );
};

export default Footer;
