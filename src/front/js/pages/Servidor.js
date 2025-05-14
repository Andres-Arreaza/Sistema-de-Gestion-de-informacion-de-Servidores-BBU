import React, { useEffect, useState } from "react";
import "../../styles/Servidor.css";
import TablaServidores from "../component/TablaServidores";

const Servidor = () => {
    const [servidores, setServidores] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });
    const [servidorActual, setServidorActual] = useState({
        id: null, nombre: "", tipo: "FÍSICO", ip: "", balanceador: "", vlan: "", descripcion: "", link: "",
        servicio_id: "", capa_id: "", ambiente_id: "", dominio_id: "", sistema_operativo_id: "", estatus_id: "", activo: true
    });

    const fetchServidores = () => {
        fetch(process.env.BACKEND_URL + "/api/servidores")
            .then((response) => response.json())
            .then((data) => setServidores(data))
            .catch((error) => console.error("Error al obtener servidores:", error));
    };

    useEffect(() => {
        fetchServidores();
    }, []);

    const handleDelete = (id) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este servidor?")) return;

        fetch(`${process.env.BACKEND_URL}/api/servidores/${id}`, { method: "DELETE" })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setAlerta({ mensaje: `❌ ${data.error}`, tipo: "error" });
                } else {
                    setServidores(prevServidores => prevServidores.filter(s => s.id !== id));
                    setAlerta({ mensaje: "✅ Servidor eliminado", tipo: "success" });
                }
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch(() => {
                setAlerta({ mensaje: "❌ Error al eliminar el servidor", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    return (
        <div className="servidor-container">
            <h1 className="servidor-title">Gestión de Servidores</h1>

            {/* 🔹 Botón para abrir el modal */}
            <button className="crear-servidor-btn" onClick={() => setModalVisible(true)}>➕ Crear Servidor</button>

            {/* 🔹 Tabla de servidores */}
            <TablaServidores
                servidores={servidores}
                setServidorActual={setServidorActual}
                setModalVisible={setModalVisible}
                handleDelete={handleDelete}
            />

            {/* 🔹 Mensaje de alerta */}
            {alerta.mensaje && (
                <div className={`alerta ${alerta.tipo}`}>
                    <span className="icono">{alerta.tipo === "success" ? "✅" : "❌"}</span>
                    {alerta.mensaje}
                </div>
            )}
        </div>
    );
};

export default Servidor;