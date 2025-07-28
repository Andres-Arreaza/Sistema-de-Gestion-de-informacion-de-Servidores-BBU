import React, { useState, useEffect } from 'react';

const CapaFormulario = ({ onSave, onCancel, capa, capasExistentes }) => {
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [error, setError] = useState('');
    const [titulo, setTitulo] = useState('Crear Nueva Capa');

    useEffect(() => {
        if (capa) { // Modo Edición
            setTitulo('Editar Capa');
            setFormData({ nombre: capa.nombre, descripcion: capa.descripcion || '' });
        } else { // Modo Creación
            setTitulo('Crear Nueva Capa');
            setFormData({ nombre: '', descripcion: '' });
        }
        setError('');
    }, [capa]);

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

        const duplicado = capasExistentes.find(
            c => c.nombre.toLowerCase() === nombreNormalizado && c.id !== (capa ? capa.id : null)
        );

        if (duplicado) {
            setError(`La capa "${formData.nombre.trim()}" ya existe.`);
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
                    <label className="form__label" htmlFor="nombre">Nombre de la capa <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Ingresa el nombre de la capa..."
                        value={formData.nombre}
                        onChange={handleChange}
                        className={`form__input ${error ? 'input-error' : ''}`}
                        autoComplete="off"
                    />
                    {error && <p className="form__error-text">{error}</p>}
                </div>
                <div className="form__group">
                    <label className="form__label" htmlFor="descripcion">Descripción (Opcional)</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        placeholder="Describe brevemente la capa..."
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

export default CapaFormulario;
