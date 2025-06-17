import React, { useEffect, useState } from "react";
// Se elimina la importación del componente Loading
// import Loading from "../component/Loading";
import BusquedaFiltro from "../component/BusquedaFiltro";
import HomeTabla from "../component/BusquedaTabla";
// Importa el archivo CSS para esta página

export const Busqueda = () => {
    // Estado consolidado para las opciones de los filtros.
    const [opcionesFiltro, setOpcionesFiltro] = useState({
        servicios: [],
        capas: [],
        ambientes: [],
        dominios: [],
        sistemasOperativos: [],
        estatus: []
    });

    // Estado para los valores seleccionados en el filtro
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

    // Estados para los resultados y el control de la UI
    const [servidores, setServidores] = useState([]);
    // Se eliminan los estados de carga
    // const [cargandoFiltros, setCargandoFiltros] = useState(true);
    // const [realizandoBusqueda, setRealizandoBusqueda] = useState(false);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);

    useEffect(() => {
        const urls = [
            { key: "servicios", url: process.env.BACKEND_URL + "/api/servicios" },
            { key: "capas", url: process.env.BACKEND_URL + "/api/capas" },
            { key: "ambientes", url: process.env.BACKEND_URL + "/api/ambientes" },
            { key: "dominios", url: process.env.BACKEND_URL + "/api/dominios" },
            { key: "sistemasOperativos", url: process.env.BACKEND_URL + "/api/sistemas_operativos" },
            { key: "estatus", url: process.env.BACKEND_URL + "/api/estatus" }
        ];

        const fetchAllOptions = async () => {
            try {
                const responses = await Promise.all(
                    urls.map(item => fetch(item.url).then(res => {
                        if (!res.ok) throw new Error(`Fallo al cargar ${item.key}`);
                        return res.json();
                    }))
                );
                const nuevasOpciones = {
                    servicios: responses[0],
                    capas: responses[1],
                    ambientes: responses[2],
                    dominios: responses[3],
                    sistemasOperativos: responses[4],
                    estatus: responses[5]
                };
                setOpcionesFiltro(nuevasOpciones);
            } catch (error) {
                console.error("Error al cargar los filtros:", error);
            }
            // Se elimina la lógica de setCargandoFiltros
        };
        fetchAllOptions();
    }, []);

    const buscarServidores = async (e) => {
        e.preventDefault();
        // Ya no se activa un estado de carga
        setBusquedaRealizada(true);
        setServidores([]);

        const params = new URLSearchParams();
        Object.keys(filtro).forEach((key) => {
            if (Array.isArray(filtro[key]) && filtro[key].length > 0) {
                filtro[key].forEach(id => params.append(key, id));
            } else if (!Array.isArray(filtro[key]) && filtro[key]) {
                params.append(key, filtro[key]);
            }
        });

        try {
            const res = await fetch(`${process.env.BACKEND_URL}/api/servidores/busqueda?${params.toString()}`);
            if (!res.ok) throw new Error('La búsqueda de servidores falló');
            const data = await res.json();
            setServidores(data);
        } catch (error) {
            console.error("Error al buscar servidores:", error);
        }
        // Ya no se desactiva un estado de carga
    };

    return (
        <div className="busqueda-wrapper">
            {/* 1. Sección superior con el gradiente (Hero) */}
            <div className="busqueda-hero-section">
                <div className="title-section">
                    <div className="decorative-line-top"></div>
                    <h1 className="main-title">Búsqueda Avanzada</h1>
                    <p className="subtitle busqueda-subtitle">"Encuentra servidores con precisión"</p>
                    <div className="decorative-line-bottom"></div>
                </div>
            </div>

            {/* 2. Área de contenido principal (filtros y resultados) */}
            <div className="busqueda-content-area">
                {/* Se renderiza el filtro directamente sin comprobar el estado de carga */}
                <BusquedaFiltro
                    filtro={filtro}
                    setFiltro={setFiltro}
                    buscarServidores={buscarServidores}
                    servicios={opcionesFiltro.servicios}
                    capas={opcionesFiltro.capas}
                    ambientes={opcionesFiltro.ambientes}
                    dominios={opcionesFiltro.dominios}
                    sistemasOperativos={opcionesFiltro.sistemasOperativos}
                    estatus={opcionesFiltro.estatus}
                    // La prop 'cargando' se puede eliminar si BusquedaFiltro ya no la necesita
                    cargando={false}
                />

                {busquedaRealizada && (
                    <div>
                        {/* Se eliminó la comprobación de realizandoBusqueda */}
                        {servidores.length > 0 ? (
                            <HomeTabla servidores={servidores} />
                        ) : (
                            <p className="no-resultados-mensaje">No se encontraron servidores que coincidan con los criterios de búsqueda.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
