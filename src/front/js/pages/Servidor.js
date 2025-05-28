import React, { useState, useEffect } from "react";
import ServidorFormulario from "../component/ServidorFormulario";
import ServidorTabla from "../component/ServidorTabla";
import Loading from "../component/Loading";

const Servidores = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [modalLinkVisible, setModalLinkVisible] = useState(false);
    const [servidorActual, setServidorActual] = useState(null);
    const [servidorLink, setServidorLink] = useState(null);
    const [servidores, setServidores] = useState([]);
    const [mensajeExito, setMensajeExito] = useState("");
    const [cargando, setCargando] = useState(true);
    const [desvanecerLoading, setDesvanecerLoading] = useState(false);

    // 🔹 Variables para la paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const servidoresPorPagina = 10;

    // 🔹 Obtener servidores asegurando que solo se muestren los activos
    const fetchServidores = () => {
        setCargando(true);
        fetch(`${process.env.BACKEND_URL}/api/servidores`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Datos obtenidos de la API:", data);

                // 🔹 Filtrar para excluir los servidores eliminados (`activo = false`)
                const servidoresFiltrados = data.filter((servidor) => servidor.activo === true);

                setServidores(servidoresFiltrados);

                setTimeout(() => setDesvanecerLoading(true), 500);
                setTimeout(() => setCargando(false), 1000);
            })
            .catch((error) => {
                console.error("Error al obtener servidores:", error);
                setCargando(false);
            });
    };

    useEffect(() => {
        fetchServidores();
    }, []);

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
                Swal.fire({
                    title: "Desactivado",
                    text: "El servidor ha sido marcado como inactivo.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                    width: "50%",
                    customClass: { title: "swal-title-green" }
                }).then(() => {
                    fetchServidores(); // 🔹 Ahora recarga la tabla después de la alerta
                });
            })
            .catch((error) => console.error("❌ Error al eliminar el servidor:", error));
    };

    // 🔹 Obtener datos completos de un servidor para edición
    const obtenerServidorPorId = (id) => {
        fetch(`${process.env.BACKEND_URL}/api/servidores/${id}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Servidor cargado para edición:", data);
                setServidorActual(data);
                setModalEditarVisible(true);
            })
            .catch((error) => console.error("Error al obtener servidor:", error));
    };

    // 🔹 Mostrar el modal con la información del link
    const abrirModalLink = (servidor) => {
        setServidorLink(servidor);
        setModalLinkVisible(true);
    };

    // 🔹 Calcular número de páginas
    const totalPaginas = Math.ceil(servidores.length / servidoresPorPagina);

    return (
        <div className="servidores-container">
            {mensajeExito && <div className="toast-success">{mensajeExito}</div>}

            <div className="servidores-header">
                <div className="linea-blanca"></div>
                <h2 className="servidores-title">Gestión de Servidores</h2>
                <button className="crear-servidores-btn" onClick={() => setModalVisible(true)}>Crear Servidor</button>
                <div className="linea-blanca-2"></div>
            </div>

            {cargando ? (
                <Loading desvanecerLoading={desvanecerLoading} />
            ) : (
                <>
                    <ServidorTabla
                        servidores={servidores}
                        setServidores={setServidores} // 🔹 Se pasa correctamente para ser usado en ServidorTabla.js
                        obtenerServidorPorId={obtenerServidorPorId}
                        eliminarServidor={eliminarServidor}
                        abrirModalLink={abrirModalLink}
                    />

                </>
            )}

            {modalVisible && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content-servidor" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Crear Nuevo Servidor</h2>
                        <ServidorFormulario
                            setServidores={setServidores}
                            setModalVisible={setModalVisible}
                            onSuccess={setMensajeExito}
                            esEdicion={false}
                        />
                    </div>
                </div>
            )}

            {modalEditarVisible && servidorActual && (
                <div className="modal-overlay" onClick={() => setModalEditarVisible(false)}>
                    <div className="modal-content-servidor" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Editar Servidor</h2>
                        <ServidorFormulario
                            servidorInicial={servidorActual}
                            setServidores={setServidores}
                            setModalVisible={setModalEditarVisible}
                            onSuccess={setMensajeExito}
                            esEdicion={true}
                        />
                    </div>
                </div>
            )}

            {modalLinkVisible && servidorLink && (
                <div className="modal-overlay" onClick={() => setModalLinkVisible(false)}>
                    <div className="modal-content-link" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Información del Enlace</h2>
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