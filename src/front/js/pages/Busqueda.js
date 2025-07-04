import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { BusquedaFiltro } from '../component/BusquedaFiltro'; // Asegúrate que la ruta es correcta
import { BusquedaTabla } from '../component/BusquedaTabla';   // Asegúrate que la ruta es correcta
import Loading from '../component/Loading';                   // Asegúrate de tener este componente

export const Busqueda = () => {
    const [filtro, setFiltro] = useState({
        nombre: '', ip: '', balanceador: '', vlan: '', descripcion: '', link: '',
        tipo: [], servicios: [], capas: [], ambientes: [], dominios: [], sistemasOperativos: [], estatus: [],
    });
    const [servidores, setServidores] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);
    const [catalogos, setCatalogos] = useState({
        servicios: [], capas: [], ambientes: [], dominios: [], sistemasOperativos: [], estatus: []
    });

    // --- Carga inicial de catálogos ---
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const backendUrl = process.env.BACKEND_URL;
                const urls = [
                    { name: "servicios", url: `${backendUrl}/api/servicios` },
                    { name: "capas", url: `${backendUrl}/api/capas` },
                    { name: "ambientes", url: `${backendUrl}/api/ambientes` },
                    { name: "dominios", url: `${backendUrl}/api/dominios` },
                    { name: "sistemasOperativos", url: `${backendUrl}/api/sistemas_operativos` },
                    { name: "estatus", url: `${backendUrl}/api/estatus` }
                ];
                const responses = await Promise.all(urls.map(item => fetch(item.url).then(res => res.json())));
                setCatalogos({
                    servicios: responses[0] || [], capas: responses[1] || [], ambientes: responses[2] || [],
                    dominios: responses[3] || [], sistemasOperativos: responses[4] || [], estatus: responses[5] || []
                });
            } catch (error) {
                console.error("Error al cargar catálogos:", error);
                Swal.fire("Error", "No se pudieron cargar los catálogos para los filtros.", "error");
            }
        };
        fetchCatalogos();
    }, []);

    // --- Función para buscar servidores ---
    const buscarServidores = async (e) => {
        if (e) e.preventDefault();
        setCargando(true);
        setBusquedaRealizada(true);
        setServidores([]);

        try {
            const queryParams = new URLSearchParams();
            for (const key in filtro) {
                if (filtro[key] && filtro[key].length > 0) {
                    // CORRECCIÓN: Mapear la clave del frontend a la del backend
                    const backendKey = key === 'sistemasOperativos' ? 'sistemas_operativos' : key;
                    if (Array.isArray(filtro[key])) {
                        filtro[key].forEach(val => queryParams.append(backendKey, val));
                    } else {
                        queryParams.append(backendKey, filtro[key]);
                    }
                }
            }

            const apiUrl = `${process.env.BACKEND_URL}/api/servidores/busqueda?${queryParams.toString()}`;
            const response = await fetch(apiUrl);

            if (!response.ok) throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);

            const data = await response.json();
            setServidores(data);

        } catch (error) {
            Swal.fire("Error de Búsqueda", `${error.message}`, "error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="page-container">
            <div className="editor-hero-section">
                <div className="title-section">
                    <div className="decorative-line-top"></div>
                    <h1 className="main-title">Búsqueda de Servidores</h1>
                    <p className="subtitle">"Encuentra servidores por criterios específicos"</p>
                    <div className="decorative-line-bottom"></div>
                </div>
            </div>

            <div className="editor-masivo-container">
                <BusquedaFiltro
                    filtro={filtro}
                    setFiltro={setFiltro}
                    buscarServidores={buscarServidores}
                    cargando={cargando}
                    {...catalogos}
                />

                {busquedaRealizada && (
                    <div className="">
                        {cargando ? <Loading /> :
                            <BusquedaTabla
                                servidores={servidores}
                                catalogos={catalogos}
                            />
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default Busqueda;
