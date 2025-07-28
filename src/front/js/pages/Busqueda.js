import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { BusquedaFiltro } from '../component/BusquedaFiltro';
import { BusquedaTabla } from '../component/BusquedaTabla';
import Loading from '../component/Loading';

export const Busqueda = () => {
    const [filtro, setFiltro] = useState({
        nombre: '', ip: '', balanceador: '', vlan: '', descripcion: '', link: '',
        tipo: [], servicios: [], capas: [], ambientes: [], dominios: [], sistemasOperativos: [], estatus: [],
    });
    const [servidores, setServidores] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        setServidores([]);

        try {
            const queryParams = new URLSearchParams();
            for (const key in filtro) {
                if (filtro[key] && filtro[key].length > 0) {
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

            if (data.length === 0) {
                Swal.fire({
                    title: "Sin Resultados",
                    text: "No se encontraron servidores que coincidan con los filtros aplicados.",
                    icon: "info",
                    timer: 3000,
                    showConfirmButton: false,
                });
            } else {
                setIsModalOpen(true);
            }

        } catch (error) {
            Swal.fire("Error de Búsqueda", `${error.message}`, "error");
        } finally {
            setCargando(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="page-container">
            <BusquedaFiltro
                filtro={filtro}
                setFiltro={setFiltro}
                buscarServidores={buscarServidores}
                cargando={cargando}
                {...catalogos}
            />

            {isModalOpen && (
                <div className="modal__overlay" onClick={handleCloseModal}>
                    <div className="modal__content modal-content-busqueda" onClick={(e) => e.stopPropagation()}>
                        {/* Se elimina el modal__header de aquí */}
                        <div className="modal__body">
                            {cargando ? <Loading /> :
                                <BusquedaTabla
                                    servidores={servidores}
                                    catalogos={catalogos}
                                    onClose={handleCloseModal} // Se pasa la función de cierre como prop
                                />
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Busqueda;
