import React, { useState } from "react";
import TablaServidores from "../component/TablaServidores";
import FormularioServidor from "../component/FormularioServidor";

const Servidores = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [servidorActual, setServidorActual] = useState(null);
    const [servidores, setServidores] = useState([]);
    const [mensajeExito, setMensajeExito] = useState(""); // Estado para el mensaje de éxito

    // Callback para mostrar mensaje de éxito en la interfaz
    const handleSuccess = (msg) => {
        setMensajeExito(msg);
        setTimeout(() => setMensajeExito(""), 3000); // Oculta el mensaje después de 3 segundos
    };

    // Abrir modal de edición y setear el servidor actual
    const abrirModalEditar = (servidor) => {
        setServidorActual(servidor);
        setModalEditarVisible(true);
    };

    // Cerrar ambos modales y limpiar servidor actual
    const cerrarModal = () => {
        setModalVisible(false);
        setModalEditarVisible(false);
        setServidorActual(null);
    };

    return (
        <div className="servidores-container">
            {mensajeExito && (
                <div className="toast-success">
                    {mensajeExito}
                </div>
            )}

            {/* Sección con encabezado */}
            <div className="servidores-header">
                <div className="linea-blanca"></div>
                <h2 className="servidores-title">Gestión de Servidores</h2>
                <button className="crear-servidores-btn" onClick={() => setModalVisible(true)}>Crear Servidor</button>
                <div className="linea-blanca-2"></div>
            </div>

            {/* Tabla de servidores con actualización automática */}
            <TablaServidores
                servidores={servidores}
                setServidores={setServidores}
                setServidorActual={setServidorActual}
                abrirModalEditar={abrirModalEditar} // Usar la función correcta para abrir edición
            />

            {/* Modal de creación */}
            {modalVisible && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Crear Nuevo Servidor</h2>
                        <FormularioServidor
                            setServidores={setServidores}
                            setModalVisible={cerrarModal}
                            onSuccess={handleSuccess}
                            esEdicion={false}
                        />
                    </div>
                </div>
            )}

            {/* Modal de edición */}
            {modalEditarVisible && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Editar Servidor</h2>
                        <FormularioServidor
                            servidorInicial={servidorActual}
                            setServidores={setServidores}
                            setModalVisible={cerrarModal}
                            onSuccess={handleSuccess}
                            esEdicion={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Servidores;