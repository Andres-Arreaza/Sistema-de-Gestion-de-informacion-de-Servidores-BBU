import React, { useState } from "react";
import TablaServidores from "../component/TablaServidores";

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
                        <form onSubmit={handleSubmit} className="grid-form">

                            {/* 🔹 Fila 1 */}
                            <div className="grid-form-row">
                                <div className="form-field">
                                    <label>Nombre</label>
                                    <input type="text" name="nombre" required />
                                </div>
                                <div className="form-field">
                                    <label>Tipo</label>
                                    <select name="tipo" required>
                                        <option value="FÍSICO">FÍSICO</option>
                                        <option value="VIRTUAL">VIRTUAL</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>IP</label>
                                    <input type="text" name="ip" required />
                                </div>
                                <div className="form-field">
                                    <label>Balanceador</label>
                                    <input type="text" name="balanceador" />
                                </div>
                                <div className="form-field">
                                    <label>VLAN</label>
                                    <input type="text" name="vlan" />
                                </div>
                            </div>

                            {/* 🔹 Fila 2 */}
                            <div className="grid-form-row">
                                <div className="form-field">
                                    <label>Descripción</label>
                                    <textarea name="descripcion"></textarea>
                                </div>
                                <div className="form-field">
                                    <label>Link</label>
                                    <input type="text" name="link" />
                                </div>
                                <div className="form-field">
                                    <label>Servicio</label>
                                    <select name="servicio_id">
                                        <option value="">Seleccione un Servicio</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Capa</label>
                                    <select name="capa_id">
                                        <option value="">Seleccione una Capa</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Ambiente</label>
                                    <select name="ambiente_id">
                                        <option value="">Seleccione un Ambiente</option>
                                    </select>
                                </div>
                            </div>

                            {/* 🔹 Fila 3 */}
                            <div className="grid-form-row">
                                <div className="form-field">
                                    <label>Dominio</label>
                                    <select name="dominio_id">
                                        <option value="">Seleccione un Dominio</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Sistema Operativo</label>
                                    <select name="sistema_operativo_id">
                                        <option value="">Seleccione un S.O.</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Estatus</label>
                                    <select name="estatus_id">
                                        <option value="">Seleccione un Estatus</option>
                                    </select>
                                </div>
                            </div>

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