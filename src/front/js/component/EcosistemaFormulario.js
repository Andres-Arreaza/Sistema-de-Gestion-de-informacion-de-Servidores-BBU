import React, { useState, useEffect } from 'react';

const EcosistemaFormulario = ({ onSave, onCancel, ecosistema, ecosistemasExistentes }) => {
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [error, setError] = useState('');
    const [titulo, setTitulo] = useState('Crear Nuevo Ecosistema');

    useEffect(() => {
        if (ecosistema) {
            setTitulo('Editar Ecosistema');
            setFormData({ nombre: ecosistema.nombre, descripcion: ecosistema.descripcion || '' });
        } else {
            setTitulo('Crear Nuevo Ecosistema');
            setFormData({ nombre: '', descripcion: '' });
        }
        setError('');
    }, [ecosistema]);

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

        const ecosistemaDuplicado = ecosistemasExistentes.find(
            s => s.nombre.toLowerCase() === nombreNormalizado && s.id !== (ecosistema ? ecosistema.id : null)
        );

        if (ecosistemaDuplicado) {
            setError(`El ecosistema "${formData.nombre.trim()}" ya existe.`);
            return;
        }

        onSave(formData);
    };

    return (
        <div className="modal__content">
            <div className="modal__header">
                <h2 className="modal__title">{titulo}</h2>
                <button onClick={onCancel} className="btn-close" />
            </div>

            <form onSubmit={handleSubmit} className="form modal__body">
                <div className="form__group">
                    <label className="form__label" htmlFor="nombre">Nombre del ecosistema <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Ingresa el nombre del ecosistema..."
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
                        placeholder="Describe brevemente el ecosistema..."
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

export default EcosistemaFormulario;