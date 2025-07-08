import React, { useState, useEffect } from 'react';

const EstatusFormulario = ({ onSave, onCancel, estatus, estatusExistentes }) => {
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [error, setError] = useState('');
    const [titulo, setTitulo] = useState('Crear Nuevo Estatus');

    useEffect(() => {
        if (estatus) { // Modo Edición
            setTitulo('Editar Estatus');
            setFormData({ nombre: estatus.nombre, descripcion: estatus.descripcion || '' });
        } else { // Modo Creación
            setTitulo('Crear Nuevo Estatus');
            setFormData({ nombre: '', descripcion: '' });
        }
        setError('');
    }, [estatus]);

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

        const duplicado = estatusExistentes.find(
            e => e.nombre.toLowerCase() === nombreNormalizado && e.id !== (estatus ? estatus.id : null)
        );

        if (duplicado) {
            setError(`El estatus "${formData.nombre.trim()}" ya existe.`);
            return;
        }

        onSave(formData);
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h2 className="form-title">{titulo}</h2>
                <button onClick={onCancel} className="close-button-form">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="servicio-form-fields">
                <div className="form-field">
                    <label htmlFor="nombre">Nombre del estatus <span className="campo-obligatorio">*</span></label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Ej: Activo, Inactivo, Mantenimiento"
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
                        placeholder="Describe brevemente el estatus..."
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

export default EstatusFormulario;
