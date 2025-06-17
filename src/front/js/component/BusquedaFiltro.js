import React, { useState, useRef, useEffect } from "react";
// Importa el archivo CSS correspondiente a este componente

// --- Iconos SVG ---
const ServerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="2" y1="12" y2="12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /><line x1="6" x2="6.01" y1="16" y2="16" /><line x1="10" x2="10.01" y1="16" y2="16" /></svg>;
const TypeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;
const IpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>;
const BalanceadorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20V16" /></svg>;
const VlanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9.5l3.5-3.5L9 9.5" /><path d="M15 14.5l3.5 3.5L22 14.5" /><path d="M9 14.5L5.5 18 2 14.5" /><path d="M22 9.5L18.5 6 15 9.5" /><path d="M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const DescripcionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const ServiciosIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 010 2l-.15.08a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.38a2 2 0 00-.73-2.73l-.15-.08a2 2 0 010-2l.15-.08a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" /><circle cx="12" cy="12" r="3" /></svg>;
const LayersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>;
const OSIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 4 10 4 3 20 3 20 10 20 17" /><line x1="12" y1="10" x2="12" y2="17" /><line x1="4" y1="10" x2="20" y2="10" /></svg>;
const StatusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;

const FiltroDropdown = ({ filtroKey, label, data, filtroState, handleCheckboxChange, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) { setIsOpen(false); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const selectionCount = filtroState[filtroKey]?.length || 0;
    return (
        <div className={`filtro-grupo ${isOpen ? 'is-open' : ''}`} ref={dropdownRef}>
            <div className="filtro-label-con-icono">{icon}<label className="filtro-label">{label}</label></div>
            <div className="custom-select">
                <button type="button" className="custom-select__trigger" onClick={() => setIsOpen(!isOpen)}>
                    <span>{selectionCount > 0 ? `${selectionCount} seleccionado(s)` : "Seleccionar"}</span>
                    <div className={`chevron ${isOpen ? "open" : ""}`}></div>
                </button>
                <div className={`custom-select__panel ${isOpen ? "open" : ""}`}>
                    {data.map((item) => (
                        <label key={item.id} className="custom-select__option">
                            <input type="checkbox" value={item.id} checked={filtroState[filtroKey]?.includes(String(item.id))} onChange={(e) => handleCheckboxChange(e, filtroKey)} />
                            <span>{item.nombre}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const BusquedaFiltro = ({ filtro, setFiltro, buscarServidores, servicios, capas, ambientes, dominios, sistemasOperativos, estatus, cargando }) => {
    const handleInputChange = (e) => { setFiltro({ ...filtro, [e.target.name]: e.target.value }); };
    const handleCheckboxChange = (e, key) => {
        const { value, checked } = e.target;
        setFiltro((prev) => {
            const currentValues = prev[key] || [];
            const newValues = checked ? [...currentValues, value] : currentValues.filter((v) => v !== value);
            return { ...prev, [key]: newValues };
        });
    };

    const formFields = [
        // --- CAMBIO REALIZADO AQUÍ ---
        { type: 'text', name: "nombre", label: "Nombre", icon: <ServerIcon /> },
        { type: 'dropdown', key: "tipo", label: "Tipo", icon: <TypeIcon />, data: [{ id: "VIRTUAL", nombre: "Virtual" }, { id: "FISICO", nombre: "Físico" }] },
        { type: 'text', name: "ip", label: "Dirección IP", icon: <IpIcon /> },
        { type: 'text', name: "balanceador", label: "Balanceador", icon: <BalanceadorIcon /> },
        { type: 'text', name: "vlan", label: "VLAN", icon: <VlanIcon /> },
        { type: 'text', name: "descripcion", label: "Descripción", icon: <DescripcionIcon /> },
        { type: 'text', name: "link", label: "Enlace", icon: <LinkIcon /> },
        { type: 'dropdown', key: "servicios", label: "Servicios", data: servicios, icon: <ServiciosIcon /> },
        { type: 'dropdown', key: "capas", label: "Capas", data: capas, icon: <LayersIcon /> },
        { type: 'dropdown', key: "ambientes", label: "Ambientes", data: ambientes, icon: <GlobeIcon /> },
        { type: 'dropdown', key: "dominios", label: "Dominios", data: dominios, icon: <ShieldIcon /> },
        { type: 'dropdown', key: "sistemasOperativos", label: "Sistemas Operativos", data: sistemasOperativos, icon: <OSIcon /> },
        { type: 'dropdown', key: "estatus", label: "Estatus", data: estatus, icon: <StatusIcon /> },
    ];

    const itemsPerRow = 5;
    const splitIndex = Math.floor(formFields.length / itemsPerRow) * itemsPerRow;
    const mainGridFields = formFields.slice(0, splitIndex);
    const lastRowFields = formFields.slice(splitIndex);

    const renderField = (field) => {
        if (field.type === 'text') {
            return (
                <div key={field.name} className="filtro-grupo">
                    <div className="filtro-label-con-icono">{field.icon}<label className="filtro-label" htmlFor={field.name}>{field.label}</label></div>
                    <div className="input-con-icono">
                        <input type="text" id={field.name} name={field.name} placeholder={field.label + "..."} value={filtro[field.name]} onChange={handleInputChange} className="filtro-input" />
                    </div>
                </div>
            );
        }
        if (field.type === 'dropdown') {
            return <FiltroDropdown key={field.key} filtroKey={field.key} label={field.label} data={field.data} filtroState={filtro} handleCheckboxChange={handleCheckboxChange} icon={field.icon} />;
        }
        return null;
    };

    return (
        <form className="filtros-servidores" onSubmit={buscarServidores}>
            <div className="filtros-titulo-wrapper">
                <FilterIcon />
                <h2 className="filtros-titulo">Filtros de Búsqueda</h2>
            </div>

            <div className="filtro-grid">
                {mainGridFields.map(renderField)}
            </div>

            {lastRowFields.length > 0 && (
                <div className="filtro-ultima-fila">
                    {lastRowFields.map(renderField)}
                </div>
            )}

            <div className="filtro-acciones">
                <button className="buscar-servidores-btn" type="submit" disabled={cargando}>
                    <SearchIcon />
                    <span>{cargando ? "Buscando..." : "Buscar Servidores"}</span>
                </button>
            </div>
        </form>
    );
};

export default BusquedaFiltro;
