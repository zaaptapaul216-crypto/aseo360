import { useState } from "react";
import logo from "../assets/imagenes/logo.png";
import "./estilos/Navbar.css";
import "./estilos/BubbleEffect.css";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="main-navbar">
      <div className="navbar-container">

        {/* LOGO */}
        <div className="logo-container">
          <img src={logo} alt="Aseo Logo" />
          <span className="brand-text">Aseo360</span>
        </div>

        {/* MENÚ */}
        <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
          <Link to="/" className="nav-item">Inicio</Link>
          <Link to="/catalogo" className="nav-item">Catálogo</Link>
          <Link to="/nosotros" className="nav-item">Nosotros</Link>
          <Link to="/contacto" className="nav-item">Contacto</Link>
        </nav>

        {/* BUSCADOR */}
        <div className="search-bar">
          <i className="fas fa-search" style={{ color: '#90A4AE', marginRight: '8px' }}></i>
          <input placeholder="Buscar producto..." />
        </div>

        {/* ACCIONES */}
        <div className="navbar-actions">
          <Link to="/login" className="nav-item">
            <i className="fas fa-user"></i> Acceso
          </Link>

          <Link to="/checkout" className="btn-cart">
            <i className="fas fa-shopping-cart"></i> Pedido
            <span className="cart-badge">{cartCount}</span>
          </Link>

          {/* BOTÓN HAMBURGUESA */}
          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <i className="fas fa-bars"></i>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
