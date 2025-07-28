import React, { useState, useEffect } from 'react';

const DominioFormulario = ({ onSave, onCancel, dominio, dominiosExistentes }) => {
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [error, setError] = useState('');
    const [titulo, setTitulo] = useState('Crear Nuevo Dominio');

    useEffect(() => {
        if (dominio) { // Modo Edición
            setTitulo('Editar Dominio');
            setFormData({ nombre: dominio.nombre, descripcion: dominio.descripcion || '' });
        } else { // Modo Creación
            setTitulo('Crear Nuevo Dominio');
            setFormData({ nombre: '', descripcion: '' });
        }
        setError('');
    }, [dominio]);

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

        const duplicado = dominiosExistentes.find(
            d => d.nombre.toLowerCase() === nombreNormalizado && d.id !== (dominio ? dominio.id : null)
        );

        if (duplicado) {
            setError(`El dominio "${formData.nombre.trim()}" ya existe.`);
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
                    <label className="form__label" htmlFor="nombre">Nombre del dominio <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Ingrese el nombre del dominio..."
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
                        placeholder="Describe brevemente el dominio..."
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

export default DominioFormulario;
