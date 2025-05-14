import React, { useEffect, useState } from "react";
import "../../styles/Servidor.css";
import TablaServidores from "../component/TablaServidores";

const Servidor = () => {
    const [servidores, setServidores] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });

    const [servidorActual, setServidorActual] = useState({
        id: null, nombre: "", tipo: "FÍSICO", ip: "", balanceador: "", vlan: "", descripcion: "", link: "",
        servicio_id: "", capa_id: "", ambiente_id: "", dominio_id: "", sistema_operativo_id: "", estatus_id: "", activo: true
    });

    // 🔹 Estados para los datos seleccionables
    const [servicios, setServicios] = useState([]);
    const [capas, setCapas] = useState([]);
    const [ambientes, setAmbientes] = useState([]);
    const [dominios, setDominios] = useState([]);
    const [sistemasOperativos, setSistemasOperativos] = useState([]);
    const [estatuses, setEstatuses] = useState([]);

    useEffect(() => {
        fetchServidores();
        fetchSelectData();
    }, []);

    const fetchServidores = () => {
        fetch(process.env.BACKEND_URL + "/api/servidores")
            .then((response) => response.json())
            .then((data) => setServidores(data))
            .catch((error) => console.error("Error al obtener servidores:", error));
    };

    const fetchSelectData = () => {
        fetch(process.env.BACKEND_URL + "/api/servicios").then(res => res.json()).then(setServicios);
        fetch(process.env.BACKEND_URL + "/api/capas").then(res => res.json()).then(setCapas);
        fetch(process.env.BACKEND_URL + "/api/ambientes").then(res => res.json()).then(setAmbientes);
        fetch(process.env.BACKEND_URL + "/api/dominios").then(res => res.json()).then(setDominios);
        fetch(process.env.BACKEND_URL + "/api/sistemas-operativos").then(res => res.json()).then(setSistemasOperativos);
        fetch(process.env.BACKEND_URL + "/api/estatus").then(res => res.json()).then(setEstatuses);
    };

    const handleChange = (e) => {
        setServidorActual({ ...servidorActual, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const metodo = servidorActual.id ? "PUT" : "POST";
        const url = servidorActual.id
            ? `${process.env.BACKEND_URL}/api/servidores/${servidorActual.id}`
            : `${process.env.BACKEND_URL}/api/servidores`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(servidorActual),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setAlerta({ mensaje: `❌ ${data.error}`, tipo: "error" });
                } else {
                    setServidores(prevServidores => {
                        if (servidorActual.id) {
                            return prevServidores.map(s => s.id === servidorActual.id ? data : s);
                        } else {
                            return [...prevServidores, data];
                        }
                    });

                    setModalVisible(false);
                    setModalEditarVisible(false);
                    setAlerta({ mensaje: servidorActual.id ? "✅ Servidor actualizado" : "✅ Servidor creado", tipo: "success" });
                }
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch(() => {
                setAlerta({ mensaje: "❌ Error al guardar el servidor", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };
    return (
        <div className="servidor-container">
            <h1 className="servidor-title">Gestión de Servidores</h1>

            {/* 🔹 Botón para abrir el modal de creación */}
            <button className="crear-servidor-btn" onClick={() => setModalVisible(true)}>➕ Crear Servidor</button>

            {/* 🔹 Tabla de servidores */}
            <TablaServidores
                servidores={servidores}
                setServidorActual={setServidorActual}
                setModalEditarVisible={setModalEditarVisible}
            />

            {/* 🔹 Modal de creación/edición */}
            {(modalVisible || modalEditarVisible) && (
                <div className="modal-overlay" onClick={() => {
                    setModalVisible(false);
                    setModalEditarVisible(false);
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{servidorActual.id ? "Editar Servidor" : "Crear Nuevo Servidor"}</h2>
                        <form onSubmit={handleSubmit}>
                            <label>Nombre</label>
                            <input type="text" name="nombre" value={servidorActual.nombre} onChange={handleChange} required />

                            <label>Tipo</label>
                            <select name="tipo" value={servidorActual.tipo} onChange={handleChange} required>
                                <option value="FÍSICO">FÍSICO</option>
                                <option value="VIRTUAL">VIRTUAL</option>
                            </select>

                            <label>IP</label>
                            <input type="text" name="ip" value={servidorActual.ip} onChange={handleChange} required />

                            <label>Balanceador</label>
                            <input type="text" name="balanceador" value={servidorActual.balanceador} onChange={handleChange} />

                            <label>VLAN</label>
                            <input type="text" name="vlan" value={servidorActual.vlan} onChange={handleChange} />

                            <label>Descripción</label>
                            <input type="text" name="descripcion" value={servidorActual.descripcion} onChange={handleChange} />

                            <label>Link</label>
                            <input type="text" name="link" value={servidorActual.link} onChange={handleChange} />

                            {/* 🔹 Inputs seleccionables */}
                            <label>Servicio</label>
                            <select name="servicio_id" value={servidorActual.servicio_id} onChange={handleChange} required>
                                <option value="">Seleccione un Servicio</option>
                                {servicios.map(servicio => <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>)}
                            </select>

                            <label>Capa</label>
                            <select name="capa_id" value={servidorActual.capa_id} onChange={handleChange} required>
                                <option value="">Seleccione una Capa</option>
                                {capas.map(capa => <option key={capa.id} value={capa.id}>{capa.nombre}</option>)}
                            </select>

                            <label>Ambiente</label>
                            <select name="ambiente_id" value={servidorActual.ambiente_id} onChange={handleChange} required>
                                <option value="">Seleccione un Ambiente</option>
                                {ambientes.map(ambiente => <option key={ambiente.id} value={ambiente.id}>{ambiente.nombre}</option>)}
                            </select>

                            <label>Dominio</label>
                            <select name="dominio_id" value={servidorActual.dominio_id} onChange={handleChange} required>
                                <option value="">Seleccione un Dominio</option>
                                {dominios.map(dominio => <option key={dominio.id} value={dominio.id}>{dominio.nombre}</option>)}
                            </select>

                            <label>Sistema Operativo</label>
                            <select name="sistema_operativo_id" value={servidorActual.sistema_operativo_id} onChange={handleChange} required>
                                <option value="">Seleccione un Sistema Operativo</option>
                                {sistemasOperativos.map(so => <option key={so.id} value={so.id}>{so.nombre}</option>)}
                            </select>

                            <label>Estatus</label>
                            <select name="estatus_id" value={servidorActual.estatus_id} onChange={handleChange} required>
                                <option value="">Seleccione un Estatus</option>
                                {estatuses.map(est => <option key={est.id} value={est.id}>{est.nombre}</option>)}
                            </select>

                            {/* 🔹 Acciones */}
                            <div className="modal-buttons">
                                <button type="submit" className="guardar-btn">Guardar</button>
                                <button type="button" className="cerrar-btn" onClick={() => setModalVisible(false)}>Cerrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Servidor;