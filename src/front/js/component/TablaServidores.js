import React, { useEffect, useState } from "react";

const TablaServidores = ({ setServidorActual, setModalVisible, handleDelete }) => {
    const [servidores, setServidores] = useState([]);
    const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
    const [servidorAEliminar, setServidorAEliminar] = useState(null);

    // 🔹 Obtener servidores desde la API al montar el componente
    useEffect(() => {
        const fetchServidores = async () => {
            try {
                console.log("Obteniendo servidores...");
                const response = await fetch("http://localhost:3001/api/servidores");

                if (!response.ok) {
                    throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Datos obtenidos:", data);
                setServidores(data); // 🔹 Actualizar estado con los datos recibidos
            } catch (error) {
                console.error("Error al cargar servidores:", error);
            }
        };

        fetchServidores();
    }, []); // 🔹 Se ejecuta solo al montar el componente

    const confirmarEliminacion = (servidor) => {
        setServidorAEliminar(servidor);
        setModalEliminarVisible(true);
    };

    const eliminarServidor = async () => {
        if (!servidorAEliminar) return;

        try {
            const response = await fetch(`http://localhost:3001/servidores/${servidorAEliminar.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Error al eliminar servidor: ${response.status} ${response.statusText}`);
            }

            setServidores(servidores.filter((s) => s.id !== servidorAEliminar.id)); // 🔹 Actualiza la lista
            setModalEliminarVisible(false);
            setServidorAEliminar(null);
        } catch (error) {
            console.error("Error al eliminar servidor:", error);
        }
    };

    return (
        <div>
            <h2 className="servidores-disponibles-title">Servidores Disponibles</h2>

            {/* 🔹 Mensaje de depuración para verificar si los datos están llegando */}
            {servidores.length === 0 && <p className="error-message">No se encontraron servidores.</p>}

            <table className="servidor-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>IP</th>
                        <th>Balanceador</th>
                        <th>VLAN</th>
                        <th>Descripción</th>
                        <th>Link</th>
                        <th>Servicio</th>
                        <th>Capa</th>
                        <th>Ambiente</th>
                        <th>Dominio</th>
                        <th>Sistema Operativo</th>
                        <th>Estatus</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {servidores.length > 0 ? (
                        servidores.map((servidor) =>
                            servidor.nombre ? (
                                <tr key={servidor.id}>
                                    <td>{servidor.nombre}</td>
                                    <td>{servidor.tipo}</td>
                                    <td>{servidor.ip}</td>
                                    <td>{servidor.balanceador}</td>
                                    <td>{servidor.vlan}</td>
                                    <td>{servidor.descripcion}</td>
                                    <td>
                                        {servidor.link ? (
                                            <a href={servidor.link} target="_blank" rel="noopener noreferrer">
                                                {servidor.link}
                                            </a>
                                        ) : "N/A"}
                                    </td>
                                    <td>{servidor.servicio?.nombre || "N/A"}</td>
                                    <td>{servidor.capa?.nombre || "N/A"}</td>
                                    <td>{servidor.ambiente?.nombre || "N/A"}</td>
                                    <td>{servidor.dominio?.nombre || "N/A"}</td>
                                    <td>{servidor.sistema_operativo?.nombre || "N/A"}</td>
                                    <td>{servidor.estatus?.nombre || "N/A"}</td>
                                    <td>
                                        <button className="editar-btn" onClick={() => {
                                            setServidorActual(servidor);
                                            setModalVisible(true);
                                        }}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="eliminar-btn" onClick={() => confirmarEliminacion(servidor)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ) : null
                        )
                    ) : (
                        <tr>
                            <td colSpan="14">No hay servidores disponibles.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* 🔹 Modal de Confirmación de Eliminación */}
            {modalEliminarVisible && (
                <div className="modal-overlay" onClick={() => setModalEliminarVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>¿Seguro que deseas eliminar este servidor?</h2>
                        <p><strong>{servidorAEliminar?.nombre}</strong></p>
                        <div className="modal-buttons">
                            <button className="guardar-btn" onClick={eliminarServidor}>Eliminar</button>
                            <button className="cerrar-btn" onClick={() => setModalEliminarVisible(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TablaServidores;