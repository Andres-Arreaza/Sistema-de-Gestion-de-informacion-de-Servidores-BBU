import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { BusquedaFiltro } from '../component/BusquedaFiltro'; // Asegúrate que la ruta es correcta
import Loading from '../component/Loading'; // Componente de carga que ya debes tener

// --- Icono para el botón de guardar ---
const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);


const EditorMasivo = () => {
    // --- Estados del componente ---
    const [filtro, setFiltro] = useState({});
    const [servidores, setServidores] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);

    // Almacena solo los cambios realizados por el usuario
    const [cambios, setCambios] = useState({});

    // Estados para los catálogos de los dropdowns
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
        setCambios({}); // Limpia cambios anteriores

        try {
            const queryParams = new URLSearchParams();
            for (const key in filtro) {
                if (filtro[key] && filtro[key].length > 0) {
                    if (Array.isArray(filtro[key])) {
                        filtro[key].forEach(val => queryParams.append(key, val));
                    } else {
                        queryParams.append(key, filtro[key]);
                    }
                }
            }

            const response = await fetch(`${process.env.BACKEND_URL}/api/servidores/buscar?${queryParams.toString()}`);
            if (!response.ok) throw new Error('Error en la respuesta del servidor');

            const data = await response.json();
            setServidores(data);

        } catch (error) {
            console.error("Error al buscar servidores:", error);
            Swal.fire("Error", "Ocurrió un error al realizar la búsqueda.", "error");
        } finally {
            setCargando(false);
        }
    };

    // --- Maneja los cambios en la tabla editable ---
    const handleCellChange = (servidorId, campo, valor) => {
        setCambios(prev => ({
            ...prev,
            [servidorId]: {
                ...prev[servidorId],
                [campo]: valor
            }
        }));

        setServidores(prev => prev.map(servidor =>
            servidor.id === servidorId ? { ...servidor, [campo]: valor } : servidor
        ));
    };

    // --- Función para guardar todos los cambios ---
    const handleGuardarCambios = async () => {
        const numCambios = Object.keys(cambios).length;
        if (numCambios === 0) {
            Swal.fire("Sin cambios", "No se ha modificado ningún servidor.", "info");
            return;
        }

        const result = await Swal.fire({
            title: `¿Confirmar cambios?`,
            text: `Se actualizarán ${numCambios} servidor(es). Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#007953',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setCargando(true);
            const promesas = Object.keys(cambios).map(id => {
                const servidorActualizado = cambios[id];
                return fetch(`${process.env.BACKEND_URL}/api/servidores/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(servidorActualizado)
                });
            });

            try {
                const responses = await Promise.all(promesas);
                const errores = responses.filter(res => !res.ok);

                if (errores.length > 0) {
                    throw new Error(`${errores.length} servidor(es) no se pudieron actualizar.`);
                }

                Swal.fire('¡Guardado!', `${numCambios} servidor(es) han sido actualizados.`, 'success');
                setCambios({}); // Limpiar cambios después de guardar
            } catch (error) {
                console.error("Error al guardar cambios:", error);
                Swal.fire('Error', `Ocurrió un problema: ${error.message}`, 'error');
            } finally {
                setCargando(false);
            }
        }
    };

    // --- Renderizado de la tabla editable ---
    const renderTablaEditable = () => (
        <div className="editor-tabla-container">
            <table className="editor-tabla">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>IP</th>
                        <th>Servicio</th>
                        <th>Capa</th>
                        <th>Ambiente</th>
                        <th>Estatus</th>
                    </tr>
                </thead>
                <tbody>
                    {servidores.map(servidor => (
                        <tr key={servidor.id}>
                            <td>
                                <input
                                    type="text"
                                    value={servidor.nombre}
                                    onChange={(e) => handleCellChange(servidor.id, 'nombre', e.target.value)}
                                />
                            </td>
                            <td>
                                <select
                                    value={servidor.tipo}
                                    onChange={(e) => handleCellChange(servidor.id, 'tipo', e.target.value)}
                                >
                                    <option value="VIRTUAL">Virtual</option>
                                    <option value="FISICO">Físico</option>
                                </select>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={servidor.ip}
                                    onChange={(e) => handleCellChange(servidor.id, 'ip', e.target.value)}
                                />
                            </td>
                            <td>
                                <select value={servidor.servicio_id} onChange={(e) => handleCellChange(servidor.id, 'servicio_id', e.target.value)}>
                                    {catalogos.servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                </select>
                            </td>
                            <td>
                                <select value={servidor.capa_id} onChange={(e) => handleCellChange(servidor.id, 'capa_id', e.target.value)}>
                                    {catalogos.capas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </td>
                            <td>
                                <select value={servidor.ambiente_id} onChange={(e) => handleCellChange(servidor.id, 'ambiente_id', e.target.value)}>
                                    {catalogos.ambientes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                                </select>
                            </td>
                            <td>
                                <select value={servidor.estatus_id} onChange={(e) => handleCellChange(servidor.id, 'estatus_id', e.target.value)}>
                                    {catalogos.estatus.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="editor-masivo-container">
            <BusquedaFiltro
                filtro={filtro}
                setFiltro={setFiltro}
                buscarServidores={buscarServidores}
                cargando={cargando}
                {...catalogos}
            />

            <div className="resultados-editor">
                {cargando && <Loading />}
                {!cargando && busquedaRealizada && servidores.length > 0 && (
                    <>
                        <div className="editor-acciones">
                            <button className="guardar-cambios-btn" onClick={handleGuardarCambios} disabled={Object.keys(cambios).length === 0}>
                                <SaveIcon />
                                Guardar Cambios
                            </button>
                        </div>
                        {renderTablaEditable()}
                    </>
                )}
                {!cargando && busquedaRealizada && servidores.length === 0 && (
                    <div className="no-resultados">
                        <p>No se encontraron servidores con los filtros seleccionados.</p>
                    </div>
                )}
                {!cargando && !busquedaRealizada && (
                    <div className="no-resultados">
                        <p>Realiza una búsqueda para empezar a editar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorMasivo;
