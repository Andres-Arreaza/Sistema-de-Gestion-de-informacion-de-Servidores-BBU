import React, { useState, useEffect } from "react";

const ServidorTabla = ({ obtenerServidorPorId, eliminarServidor, abrirModalLink, servidores, setServidores }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [servidorAEliminar, setServidorAEliminar] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const servidoresPorPagina = 10;

    // 🔹 Función para obtener servidores actualizados desde la API
    const actualizarServidores = async () => {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/servidores`);
            const data = await response.json();
            const servidoresFiltrados = data.filter((servidor) => servidor.activo === true);
            setServidores(servidoresFiltrados);  // 🔹 Actualiza la lista de servidores
        } catch (error) {
            console.error("Error al obtener servidores:", error);
        }
    };

    // 🔹 Ejecutar `actualizarServidores()` cuando se monte el componente
    useEffect(() => {
        actualizarServidores();
    }, []);

    // 🔹 Llamar `actualizarServidores()` después de eliminar un servidor
    const handleEliminarServidor = async (servidor) => {
        await eliminarServidor(servidor);
        actualizarServidores();  // 🔹 Recarga la tabla tras eliminar
        setModalVisible(false);
    };

    // 🔹 Calcula el número total de páginas
    const totalPaginas = Math.ceil(servidores.length / servidoresPorPagina);

    // 🔹 Determina los servidores que se mostrarán en la página actual
    const indiceInicial = (paginaActual - 1) * servidoresPorPagina;
    const indiceFinal = indiceInicial + servidoresPorPagina;
    const servidoresPaginados = servidores.slice(indiceInicial, indiceFinal);

    return (
        <div>
            <table className="tabla-servidores">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>IP</th>
                        <th>Servicio</th>
                        <th>Capa</th>
                        <th>Ambiente</th>
                        <th>Balanceador</th>
                        <th>VLAN</th>
                        <th>Dominio</th>
                        <th>S.O.</th>
                        <th>Estatus</th>
                        <th>Descripción</th>
                        <th>Link</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {servidoresPaginados.length > 0 ? (
                        servidoresPaginados.map((servidor) => (
                            <tr key={servidor.id}>
                                <td>{servidor.nombre}</td>
                                <td>{servidor.tipo || "N/A"}</td>
                                <td>{servidor.ip}</td>
                                <td>{servidor.servicio?.nombre || "N/A"}</td>
                                <td>{servidor.capa?.nombre || "N/A"}</td>
                                <td>{servidor.ambiente?.nombre || "N/A"}</td>
                                <td>{servidor.balanceador}</td>
                                <td>{servidor.vlan}</td>
                                <td>{servidor.dominio?.nombre || "N/A"}</td>
                                <td>{servidor.sistema_operativo?.nombre || "N/A"}</td>
                                <td>{servidor.estatus?.nombre || "N/A"}</td>
                                <td>{servidor.descripcion}</td>
                                <td>
                                    <button className="ver-link-btn icon-btn" onClick={() => abrirModalLink(servidor)}>
                                        <span className="material-symbols-outlined">visibility</span>
                                    </button>
                                </td>
                                <td>
                                    <button className="editar-btn icon-btn" onClick={() => obtenerServidorPorId(servidor.id)}>
                                        <span className="material-icons"><i className="fas fa-edit"></i></span>
                                    </button>
                                    <button className="eliminar-btn icon-btn" onClick={() => {
                                        setServidorAEliminar(servidor);
                                        setModalVisible(true);
                                    }}>
                                        <span className="material-icons"><i className="fas fa-trash"></i></span>
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="14">No hay servidores disponibles.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* 🔹 Paginación */}
            {totalPaginas > 1 && (
                <div className="paginacion-servidores">
                    <button
                        onClick={() => setPaginaActual(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className="paginacion-btn"
                    >
                        <span className="material-symbols-outlined">arrow_back_ios</span>
                    </button>
                    <span className="pagina-numero">Página {paginaActual} de {totalPaginas}</span>
                    <button
                        onClick={() => setPaginaActual(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        className="paginacion-btn"
                    >
                        <span className="material-symbols-outlined">arrow_forward_ios</span>
                    </button>
                </div>
            )}

            {/* 🔹 Modal de Confirmación para eliminar servidor */}
            {modalVisible && (
                <div className="modal-confirmacion">
                    <div className="modal-content">
                        <h3>¿Seguro que quieres eliminar {servidorAEliminar?.nombre}?</h3>
                        <p>Esta acción no se puede deshacer.</p>
                        <div className="modal-buttons">
                            <button onClick={() => handleEliminarServidor(servidorAEliminar)} className="confirmar-btn">Sí, eliminar</button>
                            <button onClick={() => setModalVisible(false)} className="cancelar-btn">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServidorTabla;