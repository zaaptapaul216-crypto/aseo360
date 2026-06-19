import { toast } from 'sonner';

/**
 * Maneja errores de respuesta del backend de manera uniforme.
 * - Si el backend devuelve un mapa de `errores` (validación de @Valid), los muestra
 *   y devuelve el mapa para que el componente pueda marcar campos con error.
 * - En cualquier otro caso, muestra un solo toast con el mensaje de error.
 *
 * @param {Error} error – El error capturado de Axios
 * @param {function} [setErrores] – Setter opcional para poblar errores inline en el formulario
 */
export function manejarErrorBackend(error, setErrores) {
    const data = error.response?.data;

    // Errores de validación de @Valid (MethodArgumentNotValidException)
    if (data?.errores && typeof data.errores === 'object') {
        if (setErrores) setErrores(data.errores);
        const primerMsg = Object.values(data.errores)[0];
        toast.error(primerMsg || 'Por favor complete todos los campos obligatorios.');
        return data.errores;
    }

    // Mensaje genérico del backend (message o error)
    const mensaje = data?.message || data?.error || (typeof data === 'string' ? data : null) || error.message;
    toast.error(mensaje || 'Ocurrió un error inesperado.');
    return null;
}
