import React, { useState } from "react";

const ServidorTabla = ({ servidores, obtenerServidorPorId, eliminarServidor, abrirModalLink }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [servidorAEliminar, setServidorAEliminar] = useState(null);

    // 🔹 Filtra servidores activos antes de renderizar la tabla
    const servidoresFiltrados = servidores.filter((servidor) => servidor.activo === true);

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
                    {servidoresFiltrados.length > 0 ? (
                        servidoresFiltrados.map((servidor) => (
                            <tr key={servidor.id}>
                                <td>{servidor.nombre}</td>
                                <td>{servidor.tipo?.name || "N/A"}</td>
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