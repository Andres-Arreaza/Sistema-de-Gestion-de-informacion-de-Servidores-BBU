import React, { useState, useEffect } from 'react';

const SistemaOperativoFormulario = ({ onSave, onCancel, sistemaOperativo, sistemasOperativosExistentes }) => {
    // CAMBIO: Se añade 'version' al estado del formulario
    const [formData, setFormData] = useState({ nombre: '', version: '', descripcion: '' });
    const [errors, setErrors] = useState({});
    const [titulo, setTitulo] = useState('Crear Nuevo Sistema Operativo');

    useEffect(() => {
        if (sistemaOperativo) { // Modo Edición
            setTitulo('Editar Sistema Operativo');
            // CAMBIO: Se rellena el campo 'version' al editar
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
        // Limpia el error del campo que se está modificando
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const nombreNormalizado = formData.nombre.trim().toLowerCase();
        const versionNormalizada = formData.version.trim().toLowerCase();
        let newErrors = {};

        // Validaciones
        if (!nombreNormalizado) newErrors.nombre = 'El campo "Nombre" es obligatorio.';
        if (!versionNormalizada) newErrors.version = 'El campo "Versión" es obligatorio.';

        // CAMBIO: Se valida que la combinación de nombre y versión no esté duplicada
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
        <div className="form-container">
            <div className="form-header">
                <h2 className="form-title">{titulo}</h2>
                <button onClick={onCancel} className="close-button-form">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="servicio-form-fields">
                <div className="form-field">
                    <label htmlFor="nombre">Nombre del S.O. <span className="campo-obligatorio">*</span></label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Ingrese el nombre del sistema operativo.."
                        value={formData.nombre}
                        onChange={handleChange}
                        className={errors.nombre ? 'input-error' : ''}
                        autoComplete="off"
                    />
                    {errors.nombre && <p className="error-mensaje">{errors.nombre}</p>}
                </div>
                {/* CAMBIO: Nuevo campo para la versión */}
                <div className="form-field">
                    <label htmlFor="version">Versión <span className="campo-obligatorio">*</span></label>
                    <input
                        id="version"
                        name="version"
                        type="text"
                        placeholder="Ingrese la versión del sistema operativo..."
                        value={formData.version}
                        onChange={handleChange}
                        className={errors.version ? 'input-error' : ''}
                        autoComplete="off"
                    />
                    {errors.version && <p className="error-mensaje">{errors.version}</p>}
                </div>
                <div className="form-field">
                    <label htmlFor="descripcion">Descripción (Opcional)</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        placeholder="Describe brevemente el sistema operativo..."
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

export default SistemaOperativoFormulario;
