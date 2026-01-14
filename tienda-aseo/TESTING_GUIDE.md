# Guía de Pruebas del Sistema Aseo360

Este documento te guiará para verificar que todo el sistema (Backend + POS + Tienda) funcione correctamente e integrado.

## 1. Backend (El Cerebro)
**Estado:** Debe estar corriendo en IntelliJ.
*   Si ves errores en IntelliJ, recuerda hacer: `File > Invalidate Caches > Invalidate and Restart`.
*   El backend debe decir "Started BackendApplication" en la consola.

## 2. Sistema POS (Gestión)
**URL:** `http://localhost:5173/admin` (o la ruta que uses para el panel)

### Prueba de Inventario y SUNAT
1.  Ve a **Inventario**.
2.  Intenta agregar un **Proveedor**.
3.  En el campo RUC, escribe un RUC real (ej. `20100070970` que es Supermercados Peruanos).
4.  Haz clic en el botón de búsqueda 🔍.
5.  ¡Debería autocompletar la Razón Social y Dirección! (Gracias a la API SUNAT integrada).

### Prueba de API Backend
1.  Crea un producto nuevo:
    *   Nombre: `Limpiador Multiusos 1L`
    *   Precio: `15.50`
    *   Stock: `50`
    *   Categoría: `Hogar`
2.  Guárdalo. Si no sale error, el backend está guardando en MySQL correctamente.

## 3. Tienda Online (Clientes)
**URL:** `http://localhost:5173/`

### Prueba de Integración
1.  Ve a la página **Catálogo**.
2.  Busca el "Limpiador Multiusos 1L" que creaste en el POS.
3.  ¡Debería aparecer ahí! Esto confirma que el POS y la Tienda están conectados a la misma base de datos.
4.  Entra al detalle del producto y verifica que el precio y stock sean los mismos.

## Solución de Problemas Comunes
*   **"Error de red" o "Network Error"**: El backend no está corriendo en el puerto 8080.
*   **Productos vacíos**: La base de datos está vacía. Crea productos desde el POS primero.
*   **Carga infinita**: Revisa la consola del navegador (F12) para ver si hay errores de conexión.
