import React, { useState } from "react";

const HomeFiltro = ({
    filtro,
    setFiltro,
    buscarServidores,
    servicios,
    capas,
    ambientes,
    dominios,
    sistemasOperativos,
    estatus
}) => {
    const [openDropdown, setOpenDropdown] = useState({
        servicios: false,
        capas: false,
        ambientes: false,
        dominios: false,
        sistemasOperativos: false,
        estatus: false,
    });

    const handleCheckboxChange = (e, key) => {
        const { value, checked } = e.target;
        setFiltro((prev) => {
            const arr = prev[key];
            return { ...prev, [key]: checked ? [...arr, value] : arr.filter(v => v !== value) };
        });
    };

    const handleInputChange = (e) => {
        setFiltro({ ...filtro, [e.target.name]: e.target.value });
    };

    const toggleDropdown = (key) => {
        setOpenDropdown(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <form className="filtros-servidores" onSubmit={buscarServidores}>
            <div className="filtros-servidores-campos-segundo">
                {["nombre", "tipo", "ip", "balanceador", "vlan", "descripcion", "link"].map((campo) => (
                    <div key={campo} className="filtros-columna">
                        <label className="filtros-label-texto" htmlFor={campo}>
                            {campo.charAt(0).toUpperCase() + campo.slice(1)}
                        </label>
                        <input
                            type="text"
                            id={campo}
                            name={campo}
                            placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                            value={filtro[campo]}
                            onChange={handleInputChange}
                        />
                    </div>
                ))}
            </div>

            <div className="filtros-servidores-campos">
                {[
                    { key: "servicios", data: servicios },
                    { key: "capas", data: capas },
                    { key: "ambientes", data: ambientes },
                    { key: "dominios", data: dominios },
                    { key: "sistemasOperativos", data: sistemasOperativos },
                    { key: "estatus", data: estatus }
                ].map(({ key, data }) => (
                    <div key={key} className="filtros-columna">
                        <span className="filtros-label" onClick={() => toggleDropdown(key)}
                            style={{ cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                                {openDropdown[key] ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                            </span>
                        </span>
                        <div className={`filtro-dropdown-content${openDropdown[key] ? " open" : ""}`}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                {data.map(item => (
                                    <label key={item.id} style={{ display: "flex", alignItems: "center", marginBottom: "2px" }}>
                                        <input
                                            type="checkbox"
                                            value={item.id}
                                            checked={filtro[key].includes(String(item.id))}
                                            onChange={(e) => handleCheckboxChange(e, key)}
                                        />
                                        {item.nombre}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="buscar-servidores-btn" type="submit">
                Buscar servidores
            </button>
        </form>
    );
};

export default HomeFiltro;