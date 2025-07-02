import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

// --- Componente Reutilizable para Dropdowns de Selección Única ---
const SingleSelectDropdown = ({ name, label, options, selectedValue, onSelect, error, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOptionClick = (value) => {
        onSelect({ target: { name, value: String(value) } });
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => String(opt.value) === String(selectedValue));
    const displayLabel = selectedOption ? selectedOption.label : "Seleccionar...";

    return (
        <div className={`form-field ${isOpen ? 'is-open' : ''}`} ref={dropdownRef}>
            <div className="filtro-label-con-icono">{icon}<label>{label}</label></div>
            <div className="custom-select">
                <button type="button" className={`custom-select__trigger ${error ? 'input-error' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                    <span>{displayLabel}</span>
                    <div className={`chevron ${isOpen ? "open" : ""}`}></div>
                </button>
                <div className={`custom-select__panel ${isOpen ? "open" : ""}`}>
                    {options.map((option) => (
                        <label
                            key={option.value}
                            className={`custom-select__option ${String(selectedValue) === String(option.value) ? 'selected' : ''}`}
                            onClick={() => handleOptionClick(option.value)}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={String(selectedValue) === String(option.value)}
                                readOnly
                            />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>
            {error && <p className="error-mensaje">{error}</p>}
        </div>
    );
};

// --- Componente de Campo de Texto Reutilizable ---
const CampoTexto = ({ name, label, value, onChange, error, icon, placeholder = '' }) => (
    <div className="form-field">
        <div className="filtro-label-con-icono">{icon}<label htmlFor={name}>{label}</label></div>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={error ? 'input-error' : ''}
            placeholder={placeholder || label + "..."}
        />
        {error && <p className="error-mensaje">{error}</p>}
    </div>
);


const ServidorFormulario = ({ servidorInicial, onSuccess, setModalVisible, esEdicion, onSaveRow }) => {
    const [formData, setFormData] = useState({
        nombre: "", tipo: "", ip: "", balanceador: "", vlan: "",
        servicio_id: "", capa_id: "", ambiente_id: "", link: "",
        descripcion: "", dominio_id: "", sistema_operativo_id: "", estatus_id: ""
    });
    const [errors, setErrors] = useState({});
    const [catalogos, setCatalogos] = useState({
        servicios: [], capas: [], ambientes: [], dominios: [], sistemasOperativos: [], estatus: []
    });
    const [allServers, setAllServers] = useState([]);

    // --- Carga de datos inicial (catálogos y servidores existentes) ---
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const backendUrl = process.env.BACKEND_URL;
                const urls = [
                    { name: "servicios", url: `${backendUrl}/api/servicios` },
                    { name: "capas", url: `${backendUrl}/api/capas` },
                    { name: "ambientes", url: `${backendUrl}/api/ambientes` },
                    { name: "dominios", url: `${backendUrl}/api/dominios` },
                    { name: "sistemasOperativos", url: `${backendUrl}/api/sistemas_operativos` },
                    { name: "estatus", url: `${backendUrl}/api/estatus` },
                    { name: "allServers", url: `${backendUrl}/api/servidores` }
                ];
                const responses = await Promise.all(urls.map(item => fetch(item.url).then(res => res.json())));
                setCatalogos({
                    servicios: responses[0] || [], capas: responses[1] || [], ambientes: responses[2] || [],
                    dominios: responses[3] || [], sistemasOperativos: responses[4] || [], estatus: responses[5] || []
                });
                setAllServers(responses[6] || []);
            } catch (error) {
                console.error("Error al cargar datos:", error);
            }
        };
        fetchAllData();
    }, []);

    useEffect(() => {
        if (servidorInicial) {
            const dataToSet = { ...servidorInicial };
            delete dataToSet.errors;
            setFormData(dataToSet);
            setErrors(servidorInicial.errors || {});
        } else {
            setFormData({
                nombre: "", tipo: "", ip: "", balanceador: "", vlan: "",
                servicio_id: "", capa_id: "", ambiente_id: "", link: "",
                descripcion: "", dominio_id: "", sistema_operativo_id: "", estatus_id: "1"
            });
            setErrors({});
        }
    }, [servidorInicial]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = ["nombre", "tipo", "ip", "balanceador", "vlan", "servicio_id", "capa_id", "ambiente_id", "dominio_id", "sistema_operativo_id", "estatus_id"];

        requiredFields.forEach(field => {
            if (!formData[field] || String(formData[field]).trim() === "") {
                newErrors[field] = "Este campo es obligatorio.";
            }
        });

        const idActual = servidorInicial?.id;
        if (formData.nombre && allServers.some(s => s.nombre.toLowerCase() === formData.nombre.toLowerCase() && s.id !== idActual)) {
            newErrors.nombre = 'Este nombre ya está en uso.';
        }
        if (formData.ip && allServers.some(s => s.ip === formData.ip && s.id !== idActual)) {
            newErrors.ip = 'Esta IP ya está en uso.';
        }
        if (formData.link && formData.link.trim() && allServers.some(s => s.link === formData.link && s.id !== idActual)) {
            newErrors.link = 'Este link ya está en uso.';
        }

        return newErrors;
    };

    const guardarServidor = () => {
        const url = esEdicion ? `${process.env.BACKEND_URL}/api/servidores/${servidorInicial.id}` : `${process.env.BACKEND_URL}/api/servidores`;
        const method = esEdicion ? "PUT" : "POST";
        fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, activo: true })
        })
            .then(response => {
                if (!response.ok) throw new Error('Error al guardar el servidor');
                return response.json();
            })
            .then(() => {
                onSuccess(esEdicion ? "Servidor actualizado" : "Servidor creado");
                setModalVisible(false);
            })
            .catch(error => {
                Swal.fire("Error", error.message, "error");
            });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (onSaveRow) {
            onSaveRow(formData);
        } else {
            const camposOpcionalesVacios = [];
            if (!formData.link.trim()) camposOpcionalesVacios.push("Link");
            if (!formData.descripcion.trim()) camposOpcionalesVacios.push("Descripción");

            if (camposOpcionalesVacios.length > 0) {
                const camposTexto = camposOpcionalesVacios.join(' y ');
                Swal.fire({
                    title: "Campos opcionales vacíos",
                    text: `El campo ${camposTexto} está vacío. ¿Deseas guardar de todas formas?`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#007953",
                    cancelButtonColor: "#6c757d",
                    confirmButtonText: "Guardar",
                    cancelButtonText: "Volver"
                }).then((result) => {
                    if (result.isConfirmed) {
                        guardarServidor();
                    }
                });
            } else {
                guardarServidor();
            }
        }
    };

    return (
        <form onSubmit={handleFormSubmit} className="grid-form">
            <div className="grid-form-row">
                <CampoTexto name="nombre" label="Nombre" value={formData.nombre || ''} onChange={handleChange} error={errors.nombre} />
                <SingleSelectDropdown name="tipo" label="Tipo" selectedValue={formData.tipo} onSelect={handleChange} error={errors.tipo}
                    options={[{ value: "FISICO", label: "FISICO" }, { value: "VIRTUAL", label: "VIRTUAL" }]} />
                <CampoTexto name="ip" label="IP" value={formData.ip || ''} onChange={handleChange} error={errors.ip} />
                <CampoTexto name="balanceador" label="Balanceador" value={formData.balanceador || ''} onChange={handleChange} error={errors.balanceador} />
                <CampoTexto name="vlan" label="VLAN" value={formData.vlan || ''} onChange={handleChange} error={errors.vlan} />
            </div>
            <div className="grid-form-row">
                <SingleSelectDropdown name="servicio_id" label="Servicio" selectedValue={formData.servicio_id} onSelect={handleChange} error={errors.servicio_id}
                    options={catalogos.servicios.map(s => ({ value: s.id, label: s.nombre }))} />
                <SingleSelectDropdown name="capa_id" label="Capa" selectedValue={formData.capa_id} onSelect={handleChange} error={errors.capa_id}
                    options={catalogos.capas.map(c => ({ value: c.id, label: c.nombre }))} />
                <SingleSelectDropdown name="ambiente_id" label="Ambiente" selectedValue={formData.ambiente_id} onSelect={handleChange} error={errors.ambiente_id}
                    options={catalogos.ambientes.map(a => ({ value: a.id, label: a.nombre }))} />
                <SingleSelectDropdown name="dominio_id" label="Dominio" selectedValue={formData.dominio_id} onSelect={handleChange} error={errors.dominio_id}
                    options={catalogos.dominios.map(d => ({ value: d.id, label: d.nombre }))} />
                <SingleSelectDropdown name="sistema_operativo_id" label="Sistema Operativo" selectedValue={formData.sistema_operativo_id} onSelect={handleChange} error={errors.sistema_operativo_id}
                    options={catalogos.sistemasOperativos.map(so => ({ value: so.id, label: so.nombre }))} />
            </div>
            <div className="grid-form-row">
                <SingleSelectDropdown name="estatus_id" label="Estatus" selectedValue={formData.estatus_id} onSelect={handleChange} error={errors.estatus_id}
                    options={catalogos.estatus.map(e => ({ value: e.id, label: e.nombre }))} />
                <CampoTexto name="link" label="Link" value={formData.link || ''} onChange={handleChange} error={errors.link} />
                <div className="form-field field-full-width">
                    <label>Descripción</label>
                    <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange}></textarea>
                </div>
            </div>
            <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setModalVisible(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
            </div>
        </form>
    );
};

export default ServidorFormulario;
