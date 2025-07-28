import React, { useState, useEffect } from 'react';

const SistemaOperativoFormulario = ({ onSave, onCancel, sistemaOperativo, sistemasOperativosExistentes }) => {
    const [formData, setFormData] = useState({ nombre: '', version: '', descripcion: '' });
    const [errors, setErrors] = useState({});
    const [titulo, setTitulo] = useState('Crear Nuevo Sistema Operativo');

    useEffect(() => {
        if (sistemaOperativo) { // Modo Edición
            setTitulo('Editar Sistema Operativo');
            setFormData({ nombre: sistemaOperativo.nombre, version: sistemaOperativo.version, descripcion: sistemaOperativo.descripcion || '' });
        } else { // Modo Creación
            setTitulo('Crear Nuevo Sistema Operativo');
            setFormData({ nombre: '', version: '', descripcion: '' });
        }
        setErrors({});
    }, [sistemaOperativo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const nombreNormalizado = formData.nombre.trim().toLowerCase();
        const versionNormalizada = formData.version.trim().toLowerCase();
        let newErrors = {};

        if (!nombreNormalizado) newErrors.nombre = 'El campo "Nombre" es obligatorio.';
        if (!versionNormalizada) newErrors.version = 'El campo "Versión" es obligatorio.';

        const duplicado = sistemasOperativosExistentes.find(
            so => so.nombre.toLowerCase() === nombreNormalizado &&
                so.version.toLowerCase() === versionNormalizada &&
                so.id !== (sistemaOperativo ? sistemaOperativo.id : null)
        );

        if (duplicado) {
            newErrors.version = `La versión "${formData.version.trim()}" para este S.O. ya existe.`;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
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
                    <label className="form__label" htmlFor="nombre">Nombre del S.O. <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Ingrese el nombre del sistema operativo..."
                        value={formData.nombre}
                        onChange={handleChange}
                        className={`form__input ${errors.nombre ? 'form__input--error' : ''}`}
                        autoComplete="off"
                    />
                    {errors.nombre && <p className="form__error-text">{errors.nombre}</p>}
                </div>
                <div className="form__group">
                    <label className="form__label" htmlFor="version">Versión <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input
                        id="version"
                        name="version"
                        type="text"
                        placeholder="Ingrese la versión del sistema operativo..."
                        value={formData.version}
                        onChange={handleChange}
                        className={`form__input ${errors.version ? 'form__input--error' : ''}`}
                        autoComplete="off"
                    />
                    {errors.version && <p className="form__error-text">{errors.version}</p>}
                </div>
                <div className="form__group">
                    <label className="form__label" htmlFor="descripcion">Descripción (Opcional)</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        placeholder="Describe brevemente el sistema operativo..."
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

export default SistemaOperativoFormulario;
