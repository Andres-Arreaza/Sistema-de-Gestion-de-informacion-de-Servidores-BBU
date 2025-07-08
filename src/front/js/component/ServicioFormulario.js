import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Loading from './Loading'; // Asegúrate de que la ruta es correcta

const ServicioFormulario = ({ onSave, onCancel, servicio, serviciosExistentes }) => {
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [error, setError] = useState('');
    const [titulo, setTitulo] = useState('Crear Nuevo Servicio');

    // Este useEffect se ejecuta cuando el prop 'servicio' cambia
    useEffect(() => {
        if (servicio) {
            setTitulo('Editar Servicio');
            setFormData({ nombre: servicio.nombre, descripcion: servicio.descripcion || '' });
        } else {
            setTitulo('Crear Nuevo Servicio');
            setFormData({ nombre: '', descripcion: '' });
        }
        setError(''); // Limpia errores al cambiar de modo
    }, [servicio]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const nombreNormalizado = formData.nombre.trim().toLowerCase();

        if (!nombreNormalizado) {
            setError('El campo "Nombre" es obligatorio.');
            return;
        }

        // La validación de duplicados ahora usa la lista pasada por props
        const servicioDuplicado = (serviciosExistentes || []).find(
            s => s.nombre.toLowerCase() === nombreNormalizado && s.id !== servicio?.id
        );

        if (servicioDuplicado) {
            setError(`El servicio "${formData.nombre.trim()}" ya existe.`);
            return;
        }

        // La función onSave se recibe del padre y contiene la lógica de guardado
        if (onSave) {
            onSave(formData);
        } else {
            console.error("La función para guardar (onSave) no fue proporcionada como prop.");
            Swal.fire('Error de Implementación', 'No se pudo encontrar la función para guardar.', 'error');
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h2 className="form-title">{titulo}</h2>
                <button onClick={onCancel} className="close-button-form">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="servicio-form-fields">
                <div className="form-field">
                    <label htmlFor="nombre">Nombre del servicio <span className="campo-obligatorio">*</span></label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Ej: API Gateway"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={error ? 'input-error' : ''}
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
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    );
};

export default ServicioFormulario;
