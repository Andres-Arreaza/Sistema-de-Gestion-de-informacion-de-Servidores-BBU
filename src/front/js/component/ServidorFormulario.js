import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import Icon from './Icon'; // Asegúrate de tener un componente Icon.js

// --- Componente Reutilizable para Dropdowns de Selección Única ---
const SingleSelectDropdown = ({ name, label, options, selectedValue, onSelect, error, required = true }) => {
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
        <div className={`form__group ${isOpen ? 'is-open' : ''}`} ref={dropdownRef}>
            <label className="form__label">{label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}</label>
            <div className="custom-select">
                <button type="button" className={`form__input custom-select__trigger ${error ? 'form__input--error' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                    <span>{displayLabel}</span>
                    <div className={`chevron ${isOpen ? "open" : ""}`}></div>
                </button>
                <div className={`custom-select__panel ${isOpen ? "open" : ""}`}>
                    {options.map((option) => (
                        <label
                            key={option.value}
                            className={`custom-select__option ${String(selectedValue) === String(option.value) ? 'selected' : ''}`}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={String(selectedValue) === String(option.value)}
                                onChange={() => handleOptionClick(option.value)}
                            />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>
            {error && <p className="form__error-text">{error}</p>}
        </div>
    );
};

// --- Componente Reutilizable para Dropdowns de Selección Múltiple ---
const MultiSelectDropdown = ({ name, label, options, selectedValues, onSelect, error }) => {
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

    const handleCheckboxChange = (value) => {
        const newSelectedValues = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value];
        onSelect({ target: { name, value: newSelectedValues } });
    };

    let displayLabel = "Seleccionar...";
    if (selectedValues.length === 1) {
        const selectedOption = options.find(opt => String(opt.value) === String(selectedValues[0]));
        displayLabel = selectedOption ? selectedOption.label : "Seleccionar...";
    } else if (selectedValues.length > 1) {
        const selectedLabels = options.filter(opt => selectedValues.includes(String(opt.value))).map(opt => opt.label);
        displayLabel = selectedLabels.join(', ');
    }

    return (
        <div className={`form__group ${isOpen ? 'is-open' : ''}`} ref={dropdownRef}>
            <label className="form__label">{label}</label>
            <div className="custom-select">
                <button type="button" className={`form__input custom-select__trigger ${error ? 'form__input--error' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                    <span>{displayLabel}</span>
                    <div className={`chevron ${isOpen ? "open" : ""}`}></div>
                </button>
                <div className={`custom-select__panel ${isOpen ? "open" : ""}`}>
                    {options.map((option) => (
                        <label key={option.value} className="custom-select__option">
                            <input type="checkbox" checked={selectedValues.includes(String(option.value))} onChange={() => handleCheckboxChange(String(option.value))} />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>
            {error && <p className="form__error-text">{error}</p>}
        </div>
    );
};

// --- Componente de Campo de Texto Reutilizable ---
const CampoTexto = ({ name, label, value, onChange, error, placeholder = '', required = true }) => (
    <div className="form__group">
        <label className="form__label" htmlFor={name}>{label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}</label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`form__input ${error ? 'form__input--error' : ''}`}
            placeholder={placeholder || label + "..."}
        />
        {error && <p className="form__error-text">{error}</p>}
    </div>
);

// --- Componente Principal del Formulario ---
const ServidorFormulario = ({ servidorInicial, onSuccess, setModalVisible, esEdicion, onSaveRow }) => {
    const [formData, setFormData] = useState({
        nombre: "", tipo: "", ip_mgmt: "", ip_real: "", ip_mask25: "", balanceador: "", vlan: "",
        servicio_id: "", capa_id: "", ambiente_id: "", link: "", aplicacion_id: "",
        descripcion: "", dominio_id: "", sistema_operativo_id: "", estatus_id: "", ecosistema_id: ""
    });
    const [errors, setErrors] = useState({});
    const [catalogos, setCatalogos] = useState({
        servicios: [], capas: [], ambientes: [], dominios: [], sistemasOperativos: [], estatus: [], ecosistemas: [], aplicaciones: []
    });
    const [allServers, setAllServers] = useState([]);

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
                    { name: "ecosistemas", url: `${backendUrl}/api/ecosistemas` },
                    { name: "aplicaciones", url: `${backendUrl}/api/aplicaciones` },
                    { name: "allServers", url: `${backendUrl}/api/servidores` }
                ];
                const responses = await Promise.all(urls.map(async item => {
                    try {
                        const res = await fetch(item.url);
                        if (!res.ok) {
                            const contentType = res.headers.get('content-type');
                            let errorMsg = `Error HTTP ${res.status} al cargar ${item.name}`;
                            if (contentType && contentType.includes('application/json')) {
                                const errJson = await res.json();
                                errorMsg = errJson.error || errorMsg;
                            } else {
                                errorMsg = await res.text();
                            }
                            throw new Error(errorMsg);
                        }
                        const contentType = res.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            return await res.json();
                        } else {
                            return [];
                        }
                    } catch (err) {
                        console.error(`Error al cargar ${item.name}:`, err);
                        return [];
                    }
                }));
                setCatalogos({
                    servicios: responses[0] || [], capas: responses[1] || [], ambientes: responses[2] || [],
                    dominios: responses[3] || [], sistemasOperativos: responses[4] || [], estatus: responses[5] || [],
                    ecosistemas: responses[6] || [], aplicaciones: responses[7] || []
                });
                setAllServers(responses[8] || []);
            } catch (error) {
                console.error("Error al cargar datos:", error);
            }
        };
        fetchAllData();
    }, []);

    useEffect(() => {
        if (servidorInicial) {
            const dataToSet = { ...servidorInicial };

            // Asegura que los campos IP y otros existan
            dataToSet.ip_mgmt = servidorInicial.ip_mgmt || "";
            dataToSet.ip_real = servidorInicial.ip_real || "";
            dataToSet.ip_mask25 = servidorInicial.ip_mask25 || "";
            dataToSet.aplicacion_id = servidorInicial.aplicacion_id ? String(servidorInicial.aplicacion_id) : "";
            delete dataToSet.errors;
            setFormData(dataToSet);
            // Manejo de errores
            if (servidorInicial.errors) {
                const camposInvalidos = [
                    'tipo', 'servicio_id', 'ecosistema_id', 'aplicacion_id', 'capa_id', 'ambiente_id', 'dominio_id', 'sistema_operativo_id', 'estatus_id'
                ];
                const errorObj = {};
                camposInvalidos.forEach(key => {
                    if (servidorInicial.errors[key]) {
                        errorObj[key] = 'Valor inválido';
                    }
                });
                setErrors(errorObj);
            } else {
                setErrors({});
            }
        } else {
            setFormData({
                nombre: "", tipo: "", ip_mgmt: "", ip_real: "", ip_mask25: "", balanceador: "", vlan: "",
                servicio_id: "", capa_id: "", ambiente_id: "", link: "", aplicacion_id: "",
                descripcion: "", dominio_id: "", sistema_operativo_id: "", estatus_id: "1", ecosistema_id: ""
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
        const newErrors = { ...errors };
        const requiredFields = ["nombre", "tipo", "servicio_id", "capa_id", "ambiente_id", "dominio_id", "sistema_operativo_id", "estatus_id", "balanceador", "vlan"];

        // Limpiar errores específicos de "Debe ingresar al menos una IP." de la validación anterior
        if (newErrors.ip_mgmt === "Debe ingresar al menos una IP.") delete newErrors.ip_mgmt;
        if (newErrors.ip_real === "Debe ingresar al menos una IP.") delete newErrors.ip_real;
        if (newErrors.ip_mask25 === "Debe ingresar al menos una IP.") delete newErrors.ip_mask25;

        requiredFields.forEach(field => {
            let isEmpty = !formData[field] || (Array.isArray(formData[field]) ? formData[field].length === 0 : String(formData[field]).trim() === "");
            if (isEmpty) {
                if (["tipo", "dominio_id", "capa_id", "balanceador", "vlan"].includes(field)) {
                    if (newErrors[field] === 'Valor inválido' || newErrors[field] === 'Valor inválido. Este campo es obligatorio.') {
                        newErrors[field] = 'Este campo es obligatorio.';
                    } else if (!newErrors[field]) {
                        newErrors[field] = "Este campo es obligatorio.";
                    }
                } else {
                    if (newErrors[field] === 'Valor inválido' || newErrors[field] === 'Valor inválido. Este campo es obligatorio.') {
                        newErrors[field] = 'Este campo es obligatorio.';
                    } else if (!newErrors[field]) {
                        newErrors[field] = "Este campo es obligatorio.";
                    }
                }
            } else {
                // Si un campo requerido ahora tiene valor, limpiar su error de "obligatorio"
                if (newErrors[field] === "Este campo es obligatorio." || newErrors[field] === 'Valor inválido. Este campo es obligatorio.') {
                    delete newErrors[field];
                }
            }
        });

        // Validar que al menos uno de los tres campos de IP esté lleno (no vacío, no solo espacios)
        const idActual = servidorInicial?.id;
        const ipFields = ["ip_mgmt", "ip_real"]; // ip_mask25 se excluye de la validación de unicidad
        const servidoresArray = Array.isArray(allServers) ? allServers : [];
        const ipMgmt = formData.ip_mgmt && formData.ip_mgmt.trim() !== "" ? formData.ip_mgmt.trim() : null;
        const ipReal = formData.ip_real && formData.ip_real.trim() !== "" ? formData.ip_real.trim() : null;
        const ipMask25 = formData.ip_mask25 && formData.ip_mask25.trim() !== "" ? formData.ip_mask25.trim() : null;
        const ipList = [ipMgmt, ipReal].filter(ip => ip); // ip_mask25 se excluye de la validación de duplicados internos
        if (!ipMgmt && !ipReal && !ipMask25) {
            // Si todos están vacíos, mostrar el error en los tres campos de IP
            newErrors.ip_mgmt = "Debe ingresar al menos una IP.";
            newErrors.ip_real = "Debe ingresar al menos una IP.";
            newErrors.ip_mask25 = "Debe ingresar al menos una IP.";
        } else {
            // Si hay IPs repetidas entre los campos MGMT y Real
            if (ipMgmt && ipReal && ipMgmt === ipReal) {
                if (ipMgmt && ipList.filter(ip => ip === ipMgmt).length > 1) newErrors.ip_mgmt = "IP repetida en otro campo.";
                if (ipReal && ipList.filter(ip => ip === ipReal).length > 1) newErrors.ip_real = "IP repetida en otro campo.";
            } else {
                // Si ya no son duplicados, limpiar errores previos de duplicidad interna
                if (newErrors.ip_mgmt === "IP repetida en otro campo.") delete newErrors.ip_mgmt;
                if (newErrors.ip_real === "IP repetida en otro campo.") delete newErrors.ip_real;
            }
        }
        // Validar que ninguna IP esté repetida en ningún campo de ningún servidor existente si tienen valor
        ipFields.forEach(f => {
            if (formData[f] && formData[f].trim() !== "") {
                let conflictFound = false;
                for (const s of servidoresArray) {
                    if (s.id !== idActual) {
                        if (s.ip_mgmt === formData[f] || s.ip_real === formData[f]) {
                            newErrors[f] = `La IP ya está en uso en otro servidor.`;
                            conflictFound = true;
                            break; // Se encontró un conflicto para este campo IP, no es necesario seguir buscando
                        }
                    }
                }
                // Si no se encontró conflicto, limpiar cualquier error de unicidad previo para este campo
                if (!conflictFound && newErrors[f] === `La IP ya está en uso en otro servidor.`) {
                    delete newErrors[f];
                }
            } else {
                // Si el campo ahora está vacío, limpiar cualquier error de unicidad previo
                if (newErrors[f] === `La IP ya está en uso en otro servidor.`) {
                    delete newErrors[f];
                }
            }
        });
        if (formData.nombre && servidoresArray.some(s => s.nombre && s.nombre.toLowerCase() === formData.nombre.toLowerCase() && s.id !== idActual)) {
            newErrors.nombre = 'Este nombre ya está en uso.';
        } else {
            // Limpiar error de nombre duplicado si ya no hay conflicto
            if (newErrors.nombre === 'Este nombre ya está en uso.') delete newErrors.nombre;
        }
        if (formData.link && formData.link.trim() && servidoresArray.some(s => s.link === formData.link && s.id !== idActual)) {
            newErrors.link = 'Este link ya está en uso.';
        } else {
            // Limpiar error de link duplicado si ya no hay conflicto
            if (newErrors.link === 'Este link ya está en uso.') delete newErrors.link;
        }

        return newErrors;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const guardarServidor = async (datosParaEnviar) => {
            const backendUrl = process.env.BACKEND_URL;
            const url = esEdicion ? `${backendUrl}/api/servidores/${servidorInicial.id}` : `${backendUrl}/api/servidores`;
            const method = esEdicion ? "PUT" : "POST";

            console.log("Enviando datos al backend:", datosParaEnviar); // Log para ver los datos

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...datosParaEnviar, activo: true })
                });
                const contentType = response.headers.get('content-type');
                let data;
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }
                if (!response.ok) {
                    throw new Error(data && data.error ? data.error : (typeof data === 'string' ? data : 'Error al guardar el servidor'));
                }

                Swal.fire({
                    title: "¡Guardado!",
                    text: `El servidor ha sido ${esEdicion ? 'actualizado' : 'creado'} exitosamente.`,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });

                if (onSuccess) onSuccess();
                if (setModalVisible) setModalVisible(false);

                return data;
            } catch (error) {
                Swal.fire("Error", error.message, "error");
            }
        };

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
                    confirmButtonColor: "var(--color-primario)",
                    cancelButtonColor: "var(--color-texto-secundario)",
                    confirmButtonText: "Guardar",
                    cancelButtonText: "Volver"
                }).then((result) => {
                    if (result.isConfirmed) {
                        guardarServidor(formData);
                    }
                });
            } else {
                guardarServidor(formData);
            }
        }
    };


    return (
        <form onSubmit={handleFormSubmit} className="form grid-form" style={{ boxSizing: 'border-box' }}>
            <div className="form__row">
                <CampoTexto name="nombre" label="Nombre" value={formData.nombre || ''} onChange={handleChange} error={errors.nombre} />
                <SingleSelectDropdown name="tipo" label="Tipo" selectedValue={formData.tipo} onSelect={handleChange} error={errors.tipo}
                    options={[{ value: "FISICO", label: "FISICO" }, { value: "VIRTUAL", label: "VIRTUAL" }]} />
                <CampoTexto name="ip_mgmt" label="IP MGMT" value={formData.ip_mgmt || ''} onChange={handleChange} error={errors.ip_mgmt} />
                <CampoTexto name="ip_real" label="IP Real" value={formData.ip_real || ''} onChange={handleChange} error={errors.ip_real} />
                <CampoTexto name="ip_mask25" label="IP Mask/25" value={formData.ip_mask25 || ''} onChange={handleChange} error={errors.ip_mask25} />
                <CampoTexto name="balanceador" label="Balanceador" value={formData.balanceador || ''} onChange={handleChange} error={errors.balanceador} />
                <CampoTexto name="vlan" label="VLAN" value={formData.vlan || ''} onChange={handleChange} error={errors.vlan} />
                <SingleSelectDropdown name="servicio_id" label="Servicio" selectedValue={formData.servicio_id} onSelect={handleChange} error={errors.servicio_id}
                    options={catalogos.servicios.map(s => ({ value: s.id, label: s.nombre }))} />
                <SingleSelectDropdown name="ecosistema_id" label="Ecosistema" selectedValue={formData.ecosistema_id} onSelect={handleChange} error={errors.ecosistema_id}
                    options={catalogos.ecosistemas.map(e => ({ value: e.id, label: e.nombre }))} required={false} />
                <SingleSelectDropdown
                    name="aplicacion_id"
                    label="Aplicación"
                    selectedValue={formData.aplicacion_id}
                    onSelect={handleChange}
                    error={errors.aplicacion_id}
                    options={catalogos.aplicaciones.map(app => ({ value: app.id, label: `${app.nombre} - V${app.version}` }))}
                    required={false}
                />
                <SingleSelectDropdown name="capa_id" label="Capa" selectedValue={formData.capa_id} onSelect={handleChange} error={errors.capa_id}
                    options={catalogos.capas.map(c => ({ value: c.id, label: c.nombre }))} />
                <SingleSelectDropdown name="ambiente_id" label="Ambiente" selectedValue={formData.ambiente_id} onSelect={handleChange} error={errors.ambiente_id}
                    options={catalogos.ambientes.map(a => ({ value: a.id, label: a.nombre }))} />
                <SingleSelectDropdown name="dominio_id" label="Dominio" selectedValue={formData.dominio_id} onSelect={handleChange} error={errors.dominio_id}
                    options={catalogos.dominios.map(d => ({ value: d.id, label: d.nombre }))} />
                <SingleSelectDropdown name="sistema_operativo_id" label="Sistema Operativo" selectedValue={formData.sistema_operativo_id} onSelect={handleChange} error={errors.sistema_operativo_id}
                    options={catalogos.sistemasOperativos.map(so => ({ value: so.id, label: `${so.nombre} - V${so.version}` }))} />
                <SingleSelectDropdown name="estatus_id" label="Estatus" selectedValue={formData.estatus_id} onSelect={handleChange} error={errors.estatus_id}
                    options={catalogos.estatus.map(e => ({ value: e.id, label: e.nombre }))} />
                <CampoTexto name="link" label="Link" value={formData.link || ''} onChange={handleChange} error={errors.link} required={false} />
                <CampoTexto name="descripcion" label="Descripción" value={formData.descripcion || ''} onChange={handleChange} error={errors.descripcion} required={false} />
            </div>
            <div className="form__actions">
                <button type="button" className="btn btn--secondary" onClick={() => setModalVisible(false)}>Cancelar</button>
                <button type="submit" className="btn btn--primary">Guardar</button>
            </div>
        </form>
    );
};

export default ServidorFormulario;
