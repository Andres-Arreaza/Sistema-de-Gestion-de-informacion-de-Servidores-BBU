import React, { useState, useEffect } from 'react';

const AmbienteFormulario = ({ onSave, onCancel, ambiente, ambientesExistentes }) => {
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [error, setError] = useState('');
    const [titulo, setTitulo] = useState('Crear Nuevo Ambiente');

    useEffect(() => {
        if (ambiente) { // Modo Edición
            setTitulo('Editar Ambiente');
            setFormData({ nombre: ambiente.nombre, descripcion: ambiente.descripcion || '' });
        } else { // Modo Creación
            setTitulo('Crear Nuevo Ambiente');
            setFormData({ nombre: '', descripcion: '' });
        }
        setError('');
    }, [ambiente]);

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

        const duplicado = ambientesExistentes.find(
            a => a.nombre.toLowerCase() === nombreNormalizado && a.id !== (ambiente ? ambiente.id : null)
        );

        if (duplicado) {
            setError(`El ambiente "${formData.nombre.trim()}" ya existe.`);
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
                    <label htmlFor="nombre">Nombre del ambiente <span className="campo-obligatorio">*</span></label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Ingrese el nombre del ambiente..."
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
                        placeholder="Describe brevemente el ambiente..."
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

export default AmbienteFormulario;
