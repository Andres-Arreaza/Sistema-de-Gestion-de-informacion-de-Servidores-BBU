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
        <div className="modal__content">
            <div className="modal__header">
                <h2 className="modal__title">{titulo}</h2>
                {/* Se elimina el texto de adentro del botón */}
                <button onClick={onCancel} className="btn-close" />
            </div>
            <form onSubmit={handleSubmit} className="form modal__body">
                <div className="form__group">
                    <label className="form__label" htmlFor="nombre">Nombre del ambiente <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Ingresa el nombre del ambiente..."
                        value={formData.nombre}
                        onChange={handleChange}
                        className={`form__input ${error ? 'form__input--error' : ''}`}
                        autoComplete="off"
                    />
                    {error && <p className="form__error-text">{error}</p>}
                </div>
                <div className="form__group">
                    <label className="form__label" htmlFor="descripcion">Descripción (Opcional)</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        placeholder="Describe brevemente el ambiente..."
                        value={formData.descripcion}
                        onChange={handleChange}
                        className="form__input"
                    />
                </div>

                <div className="form__actions">
                    <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn btn--primary">Guardar</button>
                </div>
            </form>
        </div>
    );
};

export default AmbienteFormulario;
