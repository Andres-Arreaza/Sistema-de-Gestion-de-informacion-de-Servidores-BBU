import React, { useState, useEffect } from "react";
import FormularioServidor from "./FormularioServidor"; // Importamos el formulario

const TablaServidores = ({ servidores, setServidores }) => {
    const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [servidorAEditar, setServidorAEditar] = useState(null);
    const [servidorAEliminar, setServidorAEliminar] = useState(null);
    const [mensajeConfirmacion, setMensajeConfirmacion] = useState(""); // Estado para alerta

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

    const confirmarEditar = (servidor) => {
        setServidorAEditar({ ...servidor }); // 🔹 Clonar objeto para evitar referencia directa
        setModalEditarVisible(true);
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
            setModalEliminarVisible(false);

            setTimeout(() => {
                setMensajeConfirmacion(`❌ Servidor "${servidorAEliminar.nombre}" eliminado exitosamente!`);
            }, 200);

            setTimeout(() => setMensajeConfirmacion(""), 3000);
        } catch (error) {
            console.error("Error al eliminar el servidor:", error);
        }
    };

    return (
        <div className="tabla-servidores-container">
            {/* 🔹 Alerta de confirmación sobre la tabla */}
            {mensajeConfirmacion && (
                <div className={`toast-${mensajeConfirmacion.includes("✅") ? "success" : "error"}`}>
                    {mensajeConfirmacion}
                </div>
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
                                    <button className="editar-btn" onClick={() => confirmarEditar(servidor)}>
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

            {/* 🔹 Modal de edición con `FormularioServidor` */}
            {modalEditarVisible && servidorAEditar && (
                <div className="modal-overlay" onClick={() => setModalEditarVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Editar Servidor</h2>
                        <FormularioServidor
                            servidorInicial={servidorAEditar} // 🔹 Pasamos el servidor actual para prellenar los datos
                            setServidores={setServidores}
                            setModalVisible={setModalEditarVisible}
                            onSuccess={(msg) => setMensajeConfirmacion(msg)}
                            esEdicion={true} // 🔹 Indicamos que estamos editando
                        />
                    </div>
                </div>
            )}

            {/* 🔹 Modal de confirmación antes de eliminar */}
            {modalEliminarVisible && (
                <div className="modal-overlay" onClick={() => setModalEliminarVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>¿Seguro que deseas eliminar este servidor?</h2>
                        <p><strong>{servidorAEliminar?.nombre}</strong> será eliminado permanentemente.</p>
                        <div className="modal-delete-buttons">
                            <button className="eliminar-confirm-btn" onClick={eliminarServidor}>
                                Eliminar
                            </button>
                            <button className="cerrar-modal-btn" onClick={() => setModalEliminarVisible(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TablaServidores;