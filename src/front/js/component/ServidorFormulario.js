import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

// --- Componente Reutilizable para Dropdowns de Selección Única ---
const SingleSelectDropdown = ({ name, label, options, selectedValue, onSelect, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cierra el dropdown si se hace clic fuera
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

    // Encuentra la etiqueta de la opción seleccionada para mostrarla en el botón
    const selectedOption = options.find(opt => String(opt.value) === String(selectedValue));
    const displayLabel = selectedOption ? selectedOption.label : "Seleccionar...";

    return (
        <div className={`form-field ${isOpen ? 'is-open' : ''}`} ref={dropdownRef}>
            <label>{label}</label>
            <div className="custom-select">
                <button type="button" className={`custom-select__trigger ${error ? 'input-error' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                    <span>{displayLabel}</span>
                    <div className={`chevron ${isOpen ? "open" : ""}`}></div>
                </button>
                <div className={`custom-select__panel ${isOpen ? "open" : ""}`}>
                    {options.map((option) => (
                        <div key={option.value} className={`custom-select__option ${String(selectedValue) === String(option.value) ? 'selected' : ''}`} onClick={() => handleOptionClick(option.value)}>
                            <input
                                type="radio"
                                id={`${name}-${option.value}`}
                                name={name}
                                value={option.value}
                                checked={String(selectedValue) === String(option.value)}
                                readOnly
                            />
                            <label htmlFor={`${name}-${option.value}`}>{option.label}</label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const ServidorFormulario = ({ servidorInicial, onSuccess, setModalVisible, esEdicion }) => {
    const [formData, setFormData] = useState({
        nombre: "", tipo: "", ip: "", balanceador: "", vlan: "",
        servicio_id: "", capa_id: "", ambiente_id: "", link: "",
        descripcion: "", dominio_id: "", sistema_operativo_id: "", estatus_id: "1"
    });
    const [errors, setErrors] = useState({});
    const [catalogos, setCatalogos] = useState({
        servicios: [], capas: [], ambientes: [], dominios: [], sistemasOperativos: [], estatus: []
    });

    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const urls = [
                    { name: "servicios", url: `${process.env.BACKEND_URL}/api/servicios` },
                    { name: "capas", url: `${process.env.BACKEND_URL}/api/capas` },
                    { name: "ambientes", url: `${process.env.BACKEND_URL}/api/ambientes` },
                    { name: "dominios", url: `${process.env.BACKEND_URL}/api/dominios` },
                    { name: "sistemasOperativos", url: `${process.env.BACKEND_URL}/api/sistemas_operativos` },
                    { name: "estatus", url: `${process.env.BACKEND_URL}/api/estatus` }
                ];
                const responses = await Promise.all(urls.map(item => fetch(item.url).then(res => res.json())));
                setCatalogos({
                    servicios: responses[0], capas: responses[1], ambientes: responses[2],
                    dominios: responses[3], sistemasOperativos: responses[4], estatus: responses[5]
                });
            } catch (error) {
                console.error("Error al cargar catálogos:", error);
            }
        };
        fetchCatalogos();
    }, []);

    useEffect(() => {
        if (esEdicion && servidorInicial) {
            setFormData({
                nombre: servidorInicial.nombre || "",
                tipo: servidorInicial.tipo || "",
                ip: servidorInicial.ip || "",
                balanceador: servidorInicial.balanceador || "",
                vlan: servidorInicial.vlan || "",
                servicio_id: servidorInicial.servicios?.[0]?.id || "",
                capa_id: servidorInicial.capas?.[0]?.id || "",
                ambiente_id: servidorInicial.ambientes?.[0]?.id || "",
                link: servidorInicial.link || "",
                descripcion: servidorInicial.descripcion || "",
                dominio_id: servidorInicial.dominios?.[0]?.id || "",
                sistema_operativo_id: servidorInicial.sistemasOperativos?.[0]?.id || "",
                estatus_id: servidorInicial.estatus?.[0]?.id?.toString() || "1"
            });
        }
    }, [servidorInicial, esEdicion]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: false }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = ["nombre", "tipo", "ip", "servicio_id", "capa_id", "ambiente_id", "dominio_id", "sistema_operativo_id", "estatus_id"];
        requiredFields.forEach(field => {
            if (!formData[field] || String(formData[field]).trim() === "") {
                newErrors[field] = true;
            }
        });
        return newErrors;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            Swal.fire({
                icon: "error",
                title: "Campos Incompletos",
                text: "Por favor, revisa los campos marcados en rojo.",
                heightAuto: false
            });
            return;
        }

        Swal.fire({
            title: esEdicion ? "Confirmar actualización" : "Confirmar creación",
            text: "¿Estás seguro de que deseas guardar los cambios?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#007953",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, guardar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const url = esEdicion
                    ? `${process.env.BACKEND_URL}/api/servidores/${servidorInicial.id}`
                    : `${process.env.BACKEND_URL}/api/servidores`;
                const method = esEdicion ? "PUT" : "POST";

                try {
                    const response = await fetch(url, {
                        method,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...formData, activo: true })
                    });
                    if (!response.ok) throw new Error('Error al guardar el servidor');

                    onSuccess(esEdicion ? "Servidor actualizado" : "Servidor creado");
                    setModalVisible(false);
                } catch (error) {
                    Swal.fire("Error", error.message, "error");
                }
            }
        });
    };

    return (
        <form onSubmit={handleFormSubmit} className="grid-form">
            <div className="grid-form-row">
                <div className="form-field">
                    <label>Nombre</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className={errors.nombre ? 'input-error' : ''} />
                </div>
                <SingleSelectDropdown name="tipo" label="Tipo" selectedValue={formData.tipo} onSelect={handleChange} error={errors.tipo}
                    options={[{ value: "FISICO", label: "FISICO" }, { value: "VIRTUAL", label: "VIRTUAL" }]} />
                <div className="form-field">
                    <label>IP</label>
                    <input type="text" name="ip" value={formData.ip} onChange={handleChange} className={errors.ip ? 'input-error' : ''} />
                </div>
                <div className="form-field">
                    <label>Balanceador</label>
                    <input type="text" name="balanceador" value={formData.balanceador} onChange={handleChange} />
                </div>
                <div className="form-field">
                    <label>VLAN</label>
                    <input type="text" name="vlan" value={formData.vlan} onChange={handleChange} />
                </div>
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
                <div className="form-field">
                    <label>Link</label>
                    <input type="text" name="link" value={formData.link} onChange={handleChange} />
                </div>
                <div className="form-field field-full-width">
                    <label>Descripción</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange}></textarea>
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
