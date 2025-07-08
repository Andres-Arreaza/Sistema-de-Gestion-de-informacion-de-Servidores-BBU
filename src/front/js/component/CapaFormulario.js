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
        <div className="form-container">
            <div className="form-header">
                <h2 className="form-title">{titulo}</h2>
                <button onClick={onCancel} className="close-button-form">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="servicio-form-fields">
                <div className="form-field">
                    <label htmlFor="nombre">Nombre de la capa <span className="campo-obligatorio">*</span></label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Ingresa el nombre de la capa..."
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
                        placeholder="Describe brevemente la capa..."
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

export default CapaFormulario;
