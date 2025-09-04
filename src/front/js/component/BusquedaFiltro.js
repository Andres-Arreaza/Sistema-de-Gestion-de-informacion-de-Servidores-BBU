import React, { useState, useRef, useEffect } from "react";
import Icon from './Icon'; // Asegúrate de tener un componente Icon.js

// Componente para los dropdowns de selección múltiple
const FiltroDropdown = ({ filtroKey, label, data, filtroState, handleCheckboxChange, icon }) => {
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

    const selectionCount = filtroState[filtroKey]?.length || 0;
    return (
        <div className="form__group" ref={dropdownRef}>
            <label className="form__label">{icon} {label}</label>
            <div className="custom-select">
                <button type="button" className="form__input custom-select__trigger" onClick={() => setIsOpen(!isOpen)}>
                    <span>{selectionCount > 0 ? `${selectionCount} seleccionado(s)` : "Seleccionar"}</span>
                    <div className={`chevron ${isOpen ? "open" : ""}`}></div>
                </button>
                <div className={`custom-select__panel ${isOpen ? "open" : ""}`}>
                    {data.map((item) => (
                        <label key={item.id} className="custom-select__option">
                            <input
                                type="checkbox"
                                value={item.id}
                                checked={filtroState[filtroKey]?.includes(String(item.id))}
                                onChange={(e) => handleCheckboxChange(e, filtroKey)}
                            />
                            <span>{item.nombre}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Componente principal del formulario de filtros
export const BusquedaFiltro = ({ filtro, setFiltro, buscarServidores, servicios, capas, ambientes, dominios, sistemasOperativos, estatus, ecosistemas, cargando }) => {
    const handleInputChange = (e) => {
        setFiltro({ ...filtro, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e, key) => {
        const { value, checked } = e.target;
        setFiltro((prev) => {
            const currentValues = prev[key] || [];
            // Para ecosistemas, guardar como string (id) y usar la clave correcta para el backend
            if (key === 'ecosistemas') {
                const newValues = checked ? [...currentValues, String(value)] : currentValues.filter((v) => v !== String(value));
                return { ...prev, ecosistemas: newValues };
            }
            const newValues = checked ? [...currentValues, value] : currentValues.filter((v) => v !== value);
            return { ...prev, [key]: newValues };
        });
    };

    // Función para eliminar duplicados de los catálogos basándose en el nombre
    const getUniqueItems = (array) => {
        if (!array) return [];
        // Si el nombre es un número, mostrar el id como label
        return Array.from(new Map(array.map(item => [item.id, { ...item, nombre: isNaN(item.nombre) ? item.nombre : String(item.id) }])).values());
    };

    const uniqueServicios = getUniqueItems(servicios);
    const uniqueCapas = getUniqueItems(capas);
    const uniqueAmbientes = getUniqueItems(ambientes);
    const uniqueDominios = getUniqueItems(dominios);
    const uniqueEstatus = getUniqueItems(estatus);
    const uniqueEcosistemas = (typeof ecosistemas !== 'undefined' && ecosistemas)
        ? Array.from(new Map(ecosistemas.map(item => [item.nombre, item])).values())
        : [];

    const uniqueSistemasOperativos = sistemasOperativos
        ? Array.from(new Map(sistemasOperativos.map(item => [`${item.nombre} - V${item.version}`, item])).values())
        : [];

    const formFields = [
        { type: 'text', name: "nombre", label: "Nombre", icon: <Icon name="server" size={16} /> },
        { type: 'dropdown', key: "tipo", label: "Tipo", icon: <Icon name="type" size={16} />, data: [{ id: "VIRTUAL", nombre: "Virtual" }, { id: "FISICO", nombre: "Físico" }] },
        { type: 'text', name: "ip_mgmt", label: "IP MGMT", icon: <Icon name="ip" size={16} /> },
        { type: 'text', name: "ip_real", label: "IP Real", icon: <Icon name="ip" size={16} /> },
        { type: 'text', name: "ip_mask25", label: "IP Mask/25", icon: <Icon name="ip" size={16} /> },
        { type: 'text', name: "balanceador", label: "Balanceador", icon: <Icon name="balanceador" size={16} /> },
        { type: 'text', name: "vlan", label: "VLAN", icon: <Icon name="vlan" size={16} /> },
        { type: 'dropdown', key: "servicios", label: "Servicios", data: uniqueServicios, icon: <Icon name="servicios" size={16} /> },
        { type: 'dropdown', key: "ecosistemas", label: "Ecosistemas", data: uniqueEcosistemas.map(e => ({ id: e.id, nombre: e.nombre })), icon: <Icon name="ecosistema" size={16} /> },
        { type: 'dropdown', key: "capas", label: "Capas", data: uniqueCapas, icon: <Icon name="layers" size={16} /> },
        { type: 'dropdown', key: "ambientes", label: "Ambientes", data: uniqueAmbientes, icon: <Icon name="globe" size={16} /> },
        { type: 'dropdown', key: "dominios", label: "Dominios", data: uniqueDominios, icon: <Icon name="shield" size={16} /> },
        { type: 'dropdown', key: "sistemasOperativos", label: "Sistemas Operativos", data: uniqueSistemasOperativos.map(so => ({ id: so.id, nombre: `${so.nombre} - V${so.version}` })), icon: <Icon name="os" size={16} /> },
        { type: 'dropdown', key: "estatus", label: "Estatus", data: uniqueEstatus, icon: <Icon name="status" size={16} /> },
        { type: 'text', name: "link", label: "Link", icon: <Icon name="link" size={16} /> },
        { type: 'text', name: "descripcion", label: "Descripción", icon: <Icon name="descripcion" size={16} /> },
    ];

    const renderField = (field) => {
        if (field.type === 'text') {
            return (
                <div key={field.name} className="form__group">
                    <label className="form__label">{field.icon} {field.label}</label>
                    <input
                        type="text"
                        id={field.name}
                        name={field.name}
                        placeholder={field.label + "..."}
                        value={filtro[field.name]}
                        onChange={handleInputChange}
                        className="form__input"
                    />
                </div>
            );
        }
        if (field.type === 'dropdown') {
            return <FiltroDropdown
                key={field.key}
                filtroKey={field.key}
                label={field.label}
                data={field.data}
                filtroState={filtro}
                handleCheckboxChange={handleCheckboxChange}
                icon={field.icon}
            />;
        }
        return null;
    };

    return (
        <form className="form filter-form" onSubmit={buscarServidores}>
            <div className="form__header">
                <Icon name="filter" size={24} />
                <h2 className="form__title">Filtros de Búsqueda</h2>
            </div>

            <div className="form__grid">
                <div className="form__group" style={{ gridColumn: '1 / -1', marginBottom: '0.2em', alignItems: 'flex-start' }}>
                    <label className="checkbox-exacta" htmlFor="busqueda-exacta">
                        <input
                            id="busqueda-exacta"
                            type="checkbox"
                            checked={filtro.busquedaExacta || false}
                            onChange={e => setFiltro({ ...filtro, busquedaExacta: e.target.checked })}
                        />
                        <span style={{ userSelect: 'none' }}>Coincidencia exacta</span>
                    </label>
                </div>
                {formFields.map(renderField)}
            </div>

            <div className="form__actions">
                <button className="btn btn--primary" type="submit" disabled={cargando}>
                    <Icon name="search" />
                    <span>{cargando ? "Buscando..." : "Buscar Servidores"}</span>
                </button>
            </div>
        </form>
    );
};

export default BusquedaFiltro;
