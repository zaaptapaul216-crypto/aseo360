// Importa React y los hooks necesarios desde la librería react
import React, {
  createContext, // Crea un contexto global
  useState,      // Maneja estados
  useContext,    // Consume el contexto
  useEffect      // Ejecuta efectos secundarios
} from 'react';

// Crea el contexto del carrito
const CartContext = createContext();

// Hook personalizado para acceder fácilmente al carrito desde cualquier componente
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

// Componente proveedor del contexto del carrito
export const CartProvider = ({ children }) => {

    // Estado del carrito
    // Se inicializa leyendo los datos guardados en localStorage (persistencia)
    const [cart, setCart] = useState(() => {

        // Obtiene el carrito guardado en el navegador
        const saved = localStorage.getItem('cart');

        // Si existe, lo convierte de JSON a objeto
        // Si no existe, devuelve un arreglo vacío
        return saved ? JSON.parse(saved) : [];
    });

    // useEffect que se ejecuta cada vez que el carrito cambia
    useEffect(() => {

        // Guarda el carrito actualizado en localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

    }, [cart]); // Dependencia: se ejecuta solo cuando cambia "cart"

    // Función para agregar un producto al carrito
    const addToCart = (product) => {

        // Actualiza el estado usando el valor anterior
        setCart(prev => {

            // Busca si el producto ya existe en el carrito
            const existing = prev.find(item => item.id === product.id);

            // Si el producto ya existe
            if (existing) {

                // Devuelve el carrito actualizando solo la cantidad
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 } // Incrementa cantidad
                        : item
                );
            }

            // Si el producto no existe, lo agrega con cantidad inicial 1
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    // Función para eliminar un producto del carrito por su ID
    const removeFromCart = (id) => {

        // Filtra el carrito eliminando el producto con el ID indicado
        setCart(prev => prev.filter(item => item.id !== id));
    };

    // Función para vaciar completamente el carrito
    const clearCart = () => setCart([]);

    // Calcula el total de productos en el carrito
    // Suma todas las cantidades
    const cartCount = cart.reduce(
        (acc, item) => acc + item.quantity,
        0
    );

    // Calcula el precio total del carrito
    // Multiplica precio por cantidad y suma todo
    const cartTotal = cart.reduce(
        (acc, item) => acc + (item.price * item.quantity),
        0
    );

    // Retorna el proveedor del contexto
    return (
        <CartContext.Provider
            value={{
                cart,            // Lista de productos
                addToCart,       // Función para agregar productos
                removeFromCart,  // Función para eliminar productos
                clearCart,       // Función para vaciar el carrito
                cartCount,       // Cantidad total de productos
                cartTotal        // Precio total del carrito
            }}
        >
            {/* Renderiza los componentes hijos */}
            {children}
        </CartContext.Provider>
    );
};
