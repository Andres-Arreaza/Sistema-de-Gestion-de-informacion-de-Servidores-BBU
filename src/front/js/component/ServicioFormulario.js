import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Se elimina useOutletContext
import Loading from './Loading';

/**
 * Componente de formulario para crear o editar un Servicio.
 * Recibe toda la lógica y datos como props desde un componente padre.
 * @param {object} props - Propiedades del componente.
 * @param {function} props.onSave - Función para guardar el formulario, llamada al hacer submit.
 * @param {function} props.onCancel - Función para cancelar la operación y cerrar el formulario.
 * @param {object} props.servicio - El objeto de servicio actual (solo en modo edición).
 * @param {array} props.serviciosExistentes - Array de todos los servicios para validación de duplicados.
 */
const ServicioFormulario = ({ onSave, onCancel, servicio, serviciosExistentes }) => {
    // Hooks de React Router para navegación y obtener el ID de la URL
    const navigate = useNavigate();
    const { id } = useParams();

    // Estados locales para manejar los datos del formulario, errores y el título
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [error, setError] = useState('');
    const [titulo, setTitulo] = useState('Crear Nuevo Servicio');

    // Efecto que se ejecuta cuando el componente se monta o cuando cambia el servicio a editar.
    // Rellena el formulario si estamos en modo "edición".
    useEffect(() => {
        if (servicio) { // Modo Edición: si se pasó un servicio como prop
            setTitulo('Editar Servicio');
            setFormData({ nombre: servicio.nombre, descripcion: servicio.descripcion || '' });
        } else { // Modo Creación
            setTitulo('Crear Nuevo Servicio');
            setFormData({ nombre: '', descripcion: '' });
        }
        setError(''); // Limpia cualquier error previo al cambiar de modo.
    }, [servicio]); // Depende del objeto 'servicio' que viene por props

    // Maneja los cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Limpia el error al empezar a escribir.
    };

    // Maneja el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        const nombreNormalizado = formData.nombre.trim().toLowerCase();

        // Validación de campo obligatorio
        if (!nombreNormalizado) {
            setError('El campo "Nombre" es obligatorio.');
            return;
        }

        // Validación de duplicados usando la lista de servicios pasada por props
        const servicioDuplicado = serviciosExistentes.find(
            s => s.nombre.toLowerCase() === nombreNormalizado && s.id !== (servicio ? servicio.id : null)
        );

        if (servicioDuplicado) {
            setError(`El servicio "${formData.nombre.trim()}" ya existe.`);
            return;
        }

        // Llama a la función onSave pasada por el componente padre
        onSave(formData);
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h2 className="form-title">{titulo}</h2>
                {/* Usa la función onCancel pasada por props para cerrar */}
                <button onClick={onCancel} className="close-button-form">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="servicio-form-fields">
                <div className="form-field">
                    <label htmlFor="nombre">Nombre del servicio <span className="campo-obligatorio">*</span></label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Ingresa el nombre del servicio..."
                        value={formData.nombre}
                        onChange={handleChange}
                        className={error ? 'input-error' : ''}
                        autoComplete="off"
                    />
                    {error && <p className="error-mensaje">{error}</p>}
                </div>
                <div className="form-field">
                    <label htmlFor="descripcion">Descripción (Opcional)</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        placeholder="Describe brevemente el servicio..."
                        value={formData.descripcion}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-buttons">
                    {/* Usa la función onCancel pasada por props */}
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    );
};

export default ServicioFormulario;
