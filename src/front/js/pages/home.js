import React, { useEffect, useState } from "react";
import Loading from "../component/Loading"; // Asegúrate de que la ruta sea correcta
import HomeFiltro from "../component/HomeFiltro";
import HomeTabla from "../component/HomeTabla";

export const Home = () => {
    const [servicios, setServicios] = useState([]);
    const [capas, setCapas] = useState([]);
    const [ambientes, setAmbientes] = useState([]);
    const [dominios, setDominios] = useState([]);
    const [sistemasOperativos, setSistemasOperativos] = useState([]);
    const [estatus, setEstatus] = useState([]);

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
        descripcion: "",
        link: ""
    });

    const [servidores, setServidores] = useState([]);
    const [loadingFiltros, setLoadingFiltros] = useState(true);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false); // 🔹 Estado para controlar la búsqueda

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
            setTimeout(() => setLoadingFiltros(false), 650);
        };
        fetchData();
    }, []);

    const buscarServidores = async (e) => {
        e.preventDefault();
        setBusquedaRealizada(true); // 🔹 Solo mostramos resultados después de buscar

        const params = new URLSearchParams();
        Object.keys(filtro).forEach((key) => {
            if (Array.isArray(filtro[key])) {
                filtro[key].forEach(id => params.append(key, id));
            } else if (filtro[key]) {
                params.append(key, filtro[key]);
            }
        });

        const res = await fetch(`http://localhost:3001/api/servidores/busqueda?${params.toString()}`);
        const data = await res.json();
        setServidores(data);
    };

    return (
        <div>
            <div className="home-container">
                <div className="linea-blanca-3"></div>
                <h1 className="title">Gerencia de Operaciones de Canales Virtuales y Medios de Pagos</h1>
                <p className="subtitle">"Gestiona y visualiza los servidores"</p>
                <div className="linea-blanca-4"></div>
            </div>

            <h2 className="busqueda-title">Búsqueda de servidores</h2>

            {loadingFiltros ? <Loading /> : (
                <HomeFiltro
                    filtro={filtro}
                    setFiltro={setFiltro}
                    buscarServidores={buscarServidores}
                    servicios={servicios}
                    capas={capas}
                    ambientes={ambientes}
                    dominios={dominios}
                    sistemasOperativos={sistemasOperativos}
                    estatus={estatus}
                />
            )}

            {busquedaRealizada && <HomeTabla servidores={servidores} />}
        </div>
    );
};