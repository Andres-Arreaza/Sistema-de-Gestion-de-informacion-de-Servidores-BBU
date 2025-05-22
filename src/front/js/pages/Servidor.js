import React, { useState, useEffect } from "react";
import FormularioServidor from "../component/FormularioServidor";

const Servidores = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [modalLinkVisible, setModalLinkVisible] = useState(false);
    const [servidorActual, setServidorActual] = useState(null);
    const [servidorLink, setServidorLink] = useState(null);
    const [servidores, setServidores] = useState([]);
    const [mensajeExito, setMensajeExito] = useState("");

    // 🔹 Obtener servidores asegurando que los nombres sean correctos
    const fetchServidores = () => {
        fetch(`${process.env.BACKEND_URL}/api/servidores`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Datos obtenidos de la API:", data);

                const servidoresTransformados = data.map((servidor) => ({
                    ...servidor,
                    servicio: servidor.servicio ?? "",
                    capa: servidor.capa ?? "",
                    ambiente: servidor.ambiente ?? "",
                    balanceador: servidor.balanceador ?? "",
                    vlan: servidor.vlan ?? "",
                    dominio: servidor.dominio ?? "",
                    sistema_operativo: servidor.sistema_operativo ?? "",
                    estatus: servidor.estatus ?? "",
                    descripcion: servidor.descripcion ?? "",
                    link: servidor.link ?? ""
                }));

                console.log("Servidores transformados:", servidoresTransformados);
                setServidores(servidoresTransformados);
            })
            .catch((error) => console.error("Error al obtener servidores:", error));
    };

    useEffect(() => {
        fetchServidores();
    }, []);

    // 🔹 Eliminar un servidor
    const eliminarServidor = (servidor) => {
        fetch(`${process.env.BACKEND_URL}/api/servidores/${servidor.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error eliminando servidor: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(() => {
                fetchServidores(); // 🔹 Recargar la tabla después de eliminar
            })
            .catch((error) => console.error("Error al eliminar el servidor:", error));
    };

    // 🔹 Obtener datos completos de un servidor para edición y mostrar el formulario con datos precargados
    const obtenerServidorPorId = (id) => {
        fetch(`${process.env.BACKEND_URL}/api/servidores/${id}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Servidor cargado para edición:", data);

                const servidorTransformado = {
                    ...data,
                    servicio: data.servicio ?? "",
                    capa: data.capa ?? "",
                    ambiente: data.ambiente ?? "",
                    balanceador: data.balanceador ?? "",
                    vlan: data.vlan ?? "",
                    dominio: data.dominio ?? "",
                    sistema_operativo: data.sistema_operativo ?? "",
                    estatus: data.estatus ?? "",
                    descripcion: data.descripcion ?? "",
                    link: data.link ?? ""
                };

                setServidorActual(servidorTransformado);
                setModalEditarVisible(true); // 🔹 Abre el formulario con los datos precargados
            })
            .catch((error) => console.error("Error al obtener servidor:", error));
    };

    // 🔹 Mostrar el modal con la información del link
    const abrirModalLink = (servidor) => {
        setServidorLink(servidor);
        setModalLinkVisible(true);
    };
    return (
        <div className="servidores-container">
            {mensajeExito && <div className="toast-success">{mensajeExito}</div>}

            {/* Sección con encabezado */}
            <div className="servidores-header">
                <div className="linea-blanca"></div>
                <h2 className="servidores-title">Gestión de Servidores</h2>
                <button className="crear-servidores-btn" onClick={() => setModalVisible(true)}>Crear Servidor</button>
                <div className="linea-blanca-2"></div>
            </div>

            {/* Tabla de servidores */}
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
                    {servidores.length > 0 ? (
                        servidores.map((servidor) => (
                            <tr key={servidor.id}>
                                <td>{servidor.nombre}</td>
                                <td>{servidor.tipo}</td>
                                <td>{servidor.ip}</td>
                                <td>{servidor.servicio}</td>
                                <td>{servidor.capa}</td>
                                <td>{servidor.ambiente}</td>
                                <td>{servidor.balanceador}</td>
                                <td>{servidor.vlan}</td>
                                <td>{servidor.dominio}</td>
                                <td>{servidor.sistema_operativo}</td>
                                <td>{servidor.estatus}</td>
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
                                    <button className="eliminar-btn icon-btn" onClick={() => eliminarServidor(servidor)}>
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
            {/* Modal de creación */}
            {modalVisible && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Crear Nuevo Servidor</h2>
                        <FormularioServidor
                            setServidores={setServidores}
                            setModalVisible={setModalVisible}
                            onSuccess={setMensajeExito}
                            esEdicion={false}
                        />
                    </div>
                </div>
            )}

            {/* Modal de edición con datos precargados */}
            {modalEditarVisible && servidorActual && (
                <div className="modal-overlay" onClick={() => setModalEditarVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Editar Servidor</h2>
                        <FormularioServidor
                            servidorInicial={servidorActual} // 🔹 Se cargan los datos del servidor seleccionado
                            setServidores={setServidores}
                            setModalVisible={setModalEditarVisible}
                            onSuccess={setMensajeExito}
                            esEdicion={true}
                        />
                    </div>
                </div>
            )}

            {/* Modal de enlace con información detallada */}
            {modalLinkVisible && servidorLink && (
                <div className="modal-overlay" onClick={() => setModalLinkVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Información del Enlace</h2>
                        <p><strong>Servidor:</strong> {servidorLink.nombre}</p>
                        <p><strong>Descripción:</strong> {servidorLink.descripcion}</p>
                        <p><strong>Enlace:</strong> <a href={servidorLink.link} target="_blank" rel="noopener noreferrer">{servidorLink.link}</a></p>
                        <button className="cerrar-servidores-btn" onClick={() => setModalLinkVisible(false)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Servidores;