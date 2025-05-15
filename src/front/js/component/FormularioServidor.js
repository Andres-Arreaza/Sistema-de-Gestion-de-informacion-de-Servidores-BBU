import React, { useState, useEffect } from "react";

const FormularioServidor = ({ handleSubmit, setModalVisible }) => {
    // 🔹 Estados para almacenar datos específicos
    const [servicios, setServicios] = useState([]);
    const [capas, setCapas] = useState([]);
    const [ambientes, setAmbientes] = useState([]);
    const [dominios, setDominios] = useState([]);
    const [sistemasOperativos, setSistemasOperativos] = useState([]);
    const [estatus, setEstatus] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [serviciosRes, capasRes, ambientesRes, dominiosRes, sistemasRes, estatusRes] = await Promise.all([
                    fetch("http://localhost:3001/api/servicios"),
                    fetch("http://localhost:3001/api/capas"),
                    fetch("http://localhost:3001/api/ambientes"),
                    fetch("http://localhost:3001/api/dominios"),
                    fetch("http://localhost:3001/api/sistemas_operativos"),
                    fetch("http://localhost:3001/api/estatus")
                ]);

                if (!serviciosRes.ok || !capasRes.ok || !ambientesRes.ok || !dominiosRes.ok || !sistemasRes.ok || !estatusRes.ok) {
                    throw new Error("Error al obtener los datos.");
                }

                const serviciosData = await serviciosRes.json();
                const capasData = await capasRes.json();
                const ambientesData = await ambientesRes.json();
                const dominiosData = await dominiosRes.json();
                const sistemasData = await sistemasRes.json();
                const estatusData = await estatusRes.json();

                console.log("Servicios:", serviciosData);
                console.log("Capas:", capasData);
                console.log("Ambientes:", ambientesData);
                console.log("Dominios:", dominiosData);
                console.log("Sistemas Operativos:", sistemasData);
                console.log("Estatus:", estatusData);

                setServicios(serviciosData);
                setCapas(capasData);
                setAmbientes(ambientesData);
                setDominios(dominiosData);
                setSistemasOperativos(sistemasData);
                setEstatus(estatusData);
            } catch (error) {
                console.error("Error al cargar opciones:", error);
            }
        };

        fetchData();
    }, []);

    return (
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
                        {servicios.map(servicio => (
                            <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Capa</label>
                    <select name="capa_id">
                        <option value="">Seleccione una Capa</option>
                        {capas.map(capa => (
                            <option key={capa.id} value={capa.id}>{capa.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Ambiente</label>
                    <select name="ambiente_id">
                        <option value="">Seleccione un Ambiente</option>
                        {ambientes.map(ambiente => (
                            <option key={ambiente.id} value={ambiente.id}>{ambiente.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 🔹 Fila 3 */}
            <div className="grid-form-row">
                <div className="form-field">
                    <label>Dominio</label>
                    <select name="dominio_id">
                        <option value="">Seleccione un Dominio</option>
                        {dominios.map(dominio => (
                            <option key={dominio.id} value={dominio.id}>{dominio.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Sistema Operativo</label>
                    <select name="sistema_operativo_id">
                        <option value="">Seleccione un S.O.</option>
                        {sistemasOperativos.map(so => (
                            <option key={so.id} value={so.id}>{so.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Estatus</label>
                    <select name="estatus_id">
                        <option value="">Seleccione un Estatus</option>
                        {estatus.map(est => (
                            <option key={est.id} value={est.id}>{est.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 🔹 Acciones */}
            <div className="modal-buttons">
                <button type="submit" className="guardar-servidores-btn">Guardar</button>
                <button type="button" className="cerrar-servidores-btn" onClick={() => setModalVisible(false)}>Cerrar</button>
            </div>
        </form>
    );
};

export default FormularioServidor;