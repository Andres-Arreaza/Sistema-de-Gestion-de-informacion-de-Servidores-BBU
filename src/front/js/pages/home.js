import React, { useEffect, useState } from "react";
import Search from "../pages/Loading"; // Asegúrate de que la ruta sea correcta

export const Home = () => {
    // Estados para los filtros tipo checkbox
    const [servicios, setServicios] = useState([]);
    const [capas, setCapas] = useState([]);
    const [ambientes, setAmbientes] = useState([]);
    const [dominios, setDominios] = useState([]);
    const [sistemasOperativos, setSistemasOperativos] = useState([]);
    const [estatus, setEstatus] = useState([]);

    // Estados para los filtros seleccionados
    const [filtro, setFiltro] = useState({
        servicios: [],
        capas: [],
        ambientes: [],
        dominios: [],
        sistemasOperativos: [],
        estatus: [],
        nombre: "",
        tipo: "",
        ip: "",
        balanceador: "",
        vlan: "",
        link: ""
    });

    // Estado para los resultados
    const [servidores, setServidores] = useState([]);

    // Estado para saber si los filtros están cargando
    const [loadingFiltros, setLoadingFiltros] = useState(true);

    // Cargar opciones de filtros al montar
    useEffect(() => {
        const fetchData = async () => {
            const urls = [
                { key: "servicios", url: "http://localhost:3001/api/servicios" },
                { key: "capas", url: "http://localhost:3001/api/capas" },
                { key: "ambientes", url: "http://localhost:3001/api/ambientes" },
                { key: "dominios", url: "http://localhost:3001/api/dominios" },
                { key: "sistemasOperativos", url: "http://localhost:3001/api/sistemas_operativos" },
                { key: "estatus", url: "http://localhost:3001/api/estatus" }
            ];
            for (const { key, url } of urls) {
                try {
                    const res = await fetch(url);
                    const data = await res.json();
                    if (key === "servicios") setServicios(data);
                    if (key === "capas") setCapas(data);
                    if (key === "ambientes") setAmbientes(data);
                    if (key === "dominios") setDominios(data);
                    if (key === "sistemasOperativos") setSistemasOperativos(data);
                    if (key === "estatus") setEstatus(data);
                } catch (e) { }
            }
            // Espera 1 segundo extra antes de ocultar el loader
            setTimeout(() => setLoadingFiltros(false), 650);
        };
        fetchData();
    }, []);

    // Manejar cambios en los filtros tipo checkbox
    const handleCheckboxChange = (e, key) => {
        const value = e.target.value;
        setFiltro((prev) => {
            const arr = prev[key];
            if (e.target.checked) {
                return { ...prev, [key]: [...arr, value] };
            } else {
                return { ...prev, [key]: arr.filter((v) => v !== value) };
            }
        });
    };

    // Manejar cambios en los filtros tipo texto
    const handleInputChange = (e) => {
        setFiltro({ ...filtro, [e.target.name]: e.target.value });
    };

    // Buscar servidores
    const buscarServidores = async (e) => {
        e.preventDefault();
        // Construir query params
        const params = new URLSearchParams();

        if (filtro.nombre) params.append("nombre", filtro.nombre);
        if (filtro.tipo) params.append("tipo", filtro.tipo);
        if (filtro.ip) params.append("ip", filtro.ip);
        if (filtro.balanceador) params.append("balanceador", filtro.balanceador);
        if (filtro.vlan) params.append("vlan", filtro.vlan);
        if (filtro.link) params.append("link", filtro.link);

        if (filtro.servicios.length > 0) filtro.servicios.forEach(id => params.append("servicios", id));
        if (filtro.capas.length > 0) filtro.capas.forEach(id => params.append("capas", id));
        if (filtro.ambientes.length > 0) filtro.ambientes.forEach(id => params.append("ambientes", id));
        if (filtro.dominios.length > 0) filtro.dominios.forEach(id => params.append("dominios", id));
        if (filtro.sistemasOperativos.length > 0) filtro.sistemasOperativos.forEach(id => params.append("sistemas_operativos", id));
        if (filtro.estatus.length > 0) filtro.estatus.forEach(id => params.append("estatus", id));

        // Realizar la búsqueda
        const res = await fetch(`http://localhost:3001/api/servidores/busqueda?${params.toString()}`);
        const data = await res.json();
        setServidores(data);
    };

    // ...parte 1...
    return (
        <div>
            {/* Gradiente y título */}
            <div className="home-container">
                <div className="linea-blanca-3"></div>
                <h1 className="title">Gerencia de Operaciones de Canales Virtuales y Medios de Pagos</h1>
                <p className="subtitle">"Gestiona y visualiza los servidores"</p>
                <div className="linea-blanca-4"></div>
            </div>

            <h2 className="busqueda-title">Búsqueda de servidores</h2>

            {/* Mostrar loader o filtros */}
            {loadingFiltros ? (
                <Search />
            ) : (
                <form className="filtros-servidores" onSubmit={buscarServidores}>
                    <div className="filtros-servidores-campos">
                        <div className="filtros-columna">
                            <span className="filtros-label">Servicios</span>
                            {servicios.map(s => (
                                <label key={s.id}>
                                    <input
                                        type="checkbox"
                                        value={s.id}
                                        checked={filtro.servicios.includes(String(s.id))}
                                        onChange={e => handleCheckboxChange(e, "servicios")}
                                    />
                                    {s.nombre}
                                </label>
                            ))}
                        </div>
                        <div className="filtros-columna">
                            <span className="filtros-label">Capas</span>
                            {capas.map(c => (
                                <label key={c.id}>
                                    <input
                                        type="checkbox"
                                        value={c.id}
                                        checked={filtro.capas.includes(String(c.id))}
                                        onChange={e => handleCheckboxChange(e, "capas")}
                                    />
                                    {c.nombre}
                                </label>
                            ))}
                        </div>
                        <div className="filtros-columna">
                            <span className="filtros-label">Ambientes</span>
                            {ambientes.map(a => (
                                <label key={a.id}>
                                    <input
                                        type="checkbox"
                                        value={a.id}
                                        checked={filtro.ambientes.includes(String(a.id))}
                                        onChange={e => handleCheckboxChange(e, "ambientes")}
                                    />
                                    {a.nombre}
                                </label>
                            ))}
                        </div>
                        <div className="filtros-columna">
                            <span className="filtros-label">Dominios</span>
                            {dominios.map(d => (
                                <label key={d.id}>
                                    <input
                                        type="checkbox"
                                        value={d.id}
                                        checked={filtro.dominios.includes(String(d.id))}
                                        onChange={e => handleCheckboxChange(e, "dominios")}
                                    />
                                    {d.nombre}
                                </label>
                            ))}
                        </div>
                        <div className="filtros-columna">
                            <span className="filtros-label">Sistemas Operativos</span>
                            {sistemasOperativos.map(so => (
                                <label key={so.id}>
                                    <input
                                        type="checkbox"
                                        value={so.id}
                                        checked={filtro.sistemasOperativos.includes(String(so.id))}
                                        onChange={e => handleCheckboxChange(e, "sistemasOperativos")}
                                    />
                                    {so.nombre}
                                </label>
                            ))}
                        </div>
                        <div className="filtros-columna">
                            <span className="filtros-label">Estatus</span>
                            {estatus.map(es => (
                                <label key={es.id}>
                                    <input
                                        type="checkbox"
                                        value={es.id}
                                        checked={filtro.estatus.includes(String(es.id))}
                                        onChange={e => handleCheckboxChange(e, "estatus")}
                                    />
                                    {es.nombre}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="filtros-servidores-campos-segundo">
                        <div className="filtros-columna">
                            <label className="filtros-label-texto" htmlFor="nombre">Nombre</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                placeholder="Nombre"
                                value={filtro.nombre}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="filtros-columna">
                            <label className="filtros-label-texto" htmlFor="tipo">Tipo</label>
                            <input
                                type="text"
                                id="tipo"
                                name="tipo"
                                placeholder="Tipo"
                                value={filtro.tipo}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="filtros-columna">
                            <label className="filtros-label-texto" htmlFor="ip">IP</label>
                            <input
                                type="text"
                                id="ip"
                                name="ip"
                                placeholder="IP"
                                value={filtro.ip}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="filtros-columna">
                            <label className="filtros-label-texto" htmlFor="balanceador">Balanceador</label>
                            <input
                                type="text"
                                id="balanceador"
                                name="balanceador"
                                placeholder="Balanceador"
                                value={filtro.balanceador}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="filtros-columna">
                            <label className="filtros-label-texto" htmlFor="vlan">VLAN</label>
                            <input
                                type="text"
                                id="vlan"
                                name="vlan"
                                placeholder="VLAN"
                                value={filtro.vlan}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="filtros-columna">
                            <label className="filtros-label-texto" htmlFor="link">Link</label>
                            <input
                                type="text"
                                id="link"
                                name="link"
                                placeholder="Link"
                                value={filtro.link}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <button className="buscar-servidores-btn" type="submit">
                        Buscar servidores
                    </button>
                </form>
            )}
            {/* Resultados */}
            <div className="servicios-container">
                <h2 className="services-title">Resultados de la búsqueda</h2>
                {servidores.length === 0 ? (
                    <div className="no-services">No hay servidores para mostrar.</div>
                ) : (
                    <table className="tabla-servidores">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>IP</th>
                                <th>Balanceador</th>
                                <th>VLAN</th>
                                <th>Link</th>
                                <th>Servicios</th>
                                <th>Capas</th>
                                <th>Ambientes</th>
                                <th>Dominios</th>
                                <th>S.O.</th>
                                <th>Estatus</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servidores.map((srv) => (
                                <tr key={srv.id}>
                                    <td>{srv.nombre}</td>
                                    <td>{srv.tipo}</td>
                                    <td>{srv.ip}</td>
                                    <td>{srv.balanceador}</td>
                                    <td>{srv.vlan}</td>
                                    <td>{srv.link}</td>
                                    <td>
                                        {Array.isArray(srv.servicios)
                                            ? srv.servicios.map(s => s.nombre).join(", ")
                                            : srv.servicios}
                                    </td>
                                    <td>
                                        {Array.isArray(srv.capas)
                                            ? srv.capas.map(c => c.nombre).join(", ")
                                            : srv.capas}
                                    </td>
                                    <td>
                                        {Array.isArray(srv.ambientes)
                                            ? srv.ambientes.map(a => a.nombre).join(", ")
                                            : srv.ambientes}
                                    </td>
                                    <td>
                                        {Array.isArray(srv.dominios)
                                            ? srv.dominios.map(d => d.nombre).join(", ")
                                            : srv.dominios}
                                    </td>
                                    <td>
                                        {Array.isArray(srv.sistemasOperativos)
                                            ? srv.sistemasOperativos.map(so => so.nombre).join(", ")
                                            : srv.sistemasOperativos}
                                    </td>
                                    <td>
                                        {Array.isArray(srv.estatus)
                                            ? srv.estatus.map(es => es.nombre).join(", ")
                                            : srv.estatus}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
