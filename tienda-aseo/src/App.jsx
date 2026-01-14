import { Routes, Route } from 'react-router-dom'
import Navbar from './componentes/Navbar'
import Footer from './componentes/Footer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Checkout from './pages/Checkout'
import About from './pages/About'
import Login from './pages/Login'
import ProductDetail from './pages/ProductDetail'
import Contact from './pages/Contact'
import OrderConfirmation from './pages/OrderConfirmation'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
