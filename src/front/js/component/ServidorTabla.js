import React, { useState, useEffect } from "react";

const ServidorTabla = ({ obtenerServidorPorId, eliminarServidor, abrirModalLink }) => {
    const [servidores, setServidores] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [servidorAEliminar, setServidorAEliminar] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const servidoresPorPagina = 10;

    // 🔹 Obtener servidores desde la API
    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/servidores`)
            .then((response) => response.json())
            .then((data) => {
                const servidoresFiltrados = data.filter((servidor) => servidor.activo === true);
                setServidores(servidoresFiltrados);
            })
            .catch((error) => console.error("Error al obtener servidores:", error));
    }, []);

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
                                <td>{servidor.servicios?.[0]?.nombre || "N/A"}</td>
                                <td>{servidor.capas?.[0]?.nombre || "N/A"}</td>
                                <td>{servidor.ambientes?.[0]?.nombre || "N/A"}</td>
                                <td>{servidor.balanceador}</td>
                                <td>{servidor.vlan}</td>
                                <td>{servidor.dominios?.[0]?.nombre || "N/A"}</td>
                                <td>{servidor.sistemasOperativos?.[0]?.nombre || "N/A"}</td>
                                <td>{servidor.estatus?.[0]?.nombre || "N/A"}</td>
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
                            <button onClick={() => {
                                eliminarServidor(servidorAEliminar);
                                setModalVisible(false);
                            }} className="confirmar-btn">Sí, eliminar</button>
                            <button onClick={() => setModalVisible(false)} className="cancelar-btn">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServidorTabla;