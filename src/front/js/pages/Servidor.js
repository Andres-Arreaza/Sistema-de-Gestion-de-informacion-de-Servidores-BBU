import React, { useEffect, useState } from "react";
import TablaServidores from "../component/TablaServidores";

const Servidores = () => {
    const [servidores, setServidores] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });

    const handleSubmit = (e) => {
        e.preventDefault();
        setModalVisible(false);
    };

    return (
        <div className="servidores-container">
            {/* 🔹 Sección con encabezado */}
            <div className="servidores-header">
                <div className="linea-blanca"></div> {/* 🔹 Línea blanca debajo del botón */}
                <h2 className="servidores-title">Gestión de Servidores</h2>
                <button className="crear-servidores-btn" onClick={() => setModalVisible(true)}>Crear Servidor</button>
                <div className="linea-blanca-2"></div> {/* 🔹 Línea blanca debajo del botón */}
            </div>

            {/* 🔹 Tabla de servidores */}
            <TablaServidores servidores={servidores} setModalEditarVisible={setModalEditarVisible} />

            {/* 🔹 Modal de creación/edición */}
            {(modalVisible || modalEditarVisible) && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{modalEditarVisible ? "Editar Servidor" : "Crear Nuevo Servidor"}</h2>
                        <form onSubmit={handleSubmit}>
                            <label>Nombre</label>
                            <input type="text" name="nombre" required />

                            <label>Tipo</label>
                            <select name="tipo" required>
                                <option value="FÍSICO">FÍSICO</option>
                                <option value="VIRTUAL">VIRTUAL</option>
                            </select>

                            <label>IP</label>
                            <input type="text" name="ip" required />

                            {/* 🔹 Acciones */}
                            <div className="modal-buttons">
                                <button type="submit" className="guardar-servidores-btn">Guardar</button>
                                <button type="button" className="cerrar-servidores-btn" onClick={() => setModalVisible(false)}>Cerrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Servidores;