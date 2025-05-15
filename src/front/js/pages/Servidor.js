import React, { useState } from "react";
import TablaServidores from "../component/TablaServidores";
import FormularioServidor from "../component/FormularioServidor";

const Servidores = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [servidorActual, setServidorActual] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setModalVisible(false);
    };

    return (
        <div className="servidores-container">
            {/* 🔹 Sección con encabezado */}
            <div className="servidores-header">
                <h2 className="servidores-title">Gestión de Servidores</h2>
                <button className="crear-servidores-btn" onClick={() => setModalVisible(true)}>Crear Servidor</button>
            </div>

            {/* 🔹 Tabla de servidores */}
            <TablaServidores setServidorActual={setServidorActual} setModalVisible={setModalEditarVisible} />

            {/* 🔹 Modal de creación/edición */}
            {(modalVisible || modalEditarVisible) && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{modalEditarVisible ? "Editar Servidor" : "Crear Nuevo Servidor"}</h2>
                        <FormularioServidor handleSubmit={handleSubmit} setModalVisible={setModalVisible} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Servidores;