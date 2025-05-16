import React, { useState, useEffect } from "react";

const TablaServidores = ({ servidores, setServidores, setServidorActual }) => {
    const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
    const [servidorAEliminar, setServidorAEliminar] = useState(null);
    const [mensajeEliminacion, setMensajeEliminacion] = useState(""); // 🔹 Estado para alerta roja

    useEffect(() => {
        const fetchServidores = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/servidores");
                if (!response.ok) {
                    throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                setServidores(data);
            } catch (error) {
                console.error("Error al cargar servidores:", error);
            }
        };

        fetchServidores();
    }, []);

    const confirmarEliminar = (servidor) => {
        setServidorAEliminar(servidor);
        setModalEliminarVisible(true);
    };

    const eliminarServidor = async () => {
        if (!servidorAEliminar) return;

        try {
            const response = await fetch(`http://localhost:3001/api/servidores/${servidorAEliminar.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Error eliminando servidor: ${response.status} ${response.statusText}`);
            }

            setServidores(prev => prev.filter(s => s.id !== servidorAEliminar.id));
            setModalEliminarVisible(false); // 🔹 Cierra el modal primero

            setTimeout(() => {
                setMensajeEliminacion(`❌ Servidor "${servidorAEliminar.nombre}" eliminado exitosamente!`);
            }, 200); // 🔹 Luego muestra la alerta con un ligero retraso

            setTimeout(() => setMensajeEliminacion(""), 3000); // 🔹 Oculta la alerta después de 3s
        } catch (error) {
            console.error("Error al eliminar el servidor:", error);
        }
    };

    return (
        <div className="tabla-servidores-container">
            {/* 🔹 Alerta roja de eliminación sobre la tabla */}
            {mensajeEliminacion && (
                <div className="toast-error">{mensajeEliminacion}</div>
            )}

            <h2 className="servidores-disponibles-title">Servidores Disponibles</h2>

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
                        servidores.map((servidor) => (
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
                                    <button className="editar-btn" onClick={() => setServidorActual(servidor)}>
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="eliminar-btn" onClick={() => confirmarEliminar(servidor)}>
                                        <i className="fas fa-trash"></i>
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

            {/* 🔹 Modal de confirmación antes de eliminar */}
            {modalEliminarVisible && (
                <div className="modal-overlay" onClick={() => setModalEliminarVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>¿Seguro que deseas eliminar este servidor?</h2>
                        <p><strong>{servidorAEliminar?.nombre}</strong> será eliminado.</p>
                        <div className="modal-delete-buttons">
                            <button className="cerrar-modal-btn" onClick={() => setModalEliminarVisible(false)}>
                                Cancelar
                            </button>
                            <button className="eliminar-confirm-btn" onClick={eliminarServidor}>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TablaServidores;