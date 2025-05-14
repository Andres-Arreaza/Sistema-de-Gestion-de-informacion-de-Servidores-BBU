import React, { useEffect, useState } from "react";

const Estatus = () => {
    const [estatusList, setEstatusList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });
    const [estatusActual, setEstatusActual] = useState({ id: null, nombre: "", descripcion: "" });
    const [estatusAEliminar, setEstatusAEliminar] = useState(null);

    // 🔹 Obtener estatus desde la API
    const fetchEstatus = () => {
        fetch(process.env.BACKEND_URL + "/api/estatus")
            .then((response) => {
                if (!response.ok) throw new Error("Error al obtener estatus.");
                return response.json();
            })
            .then((data) => {
                console.log("Estatus recibidos:", data);
                setEstatusList(data);
            })
            .catch((error) => console.error("Error al obtener estatus:", error));
    };

    useEffect(() => {
        fetchEstatus();
    }, []);

    // 🔹 Manejar cambios en el formulario
    const handleChange = (e) => {
        setEstatusActual({ ...estatusActual, [e.target.name]: e.target.value });
    };

    // 🔹 Crear o actualizar estatus
    const handleSubmit = (e) => {
        e.preventDefault();
        const metodo = estatusActual.id ? "PUT" : "POST";
        const url = estatusActual.id
            ? `${process.env.BACKEND_URL}/api/estatus/${estatusActual.id}`
            : `${process.env.BACKEND_URL}/api/estatus`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(estatusActual),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setAlerta({ mensaje: `❌ ${data.error}`, tipo: "error" });
                } else {
                    fetchEstatus();
                    setModalVisible(false);
                    setAlerta({ mensaje: estatusActual.id ? "✅ Estatus actualizado" : "✅ Estatus creado", tipo: "success" });
                }
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al guardar estatus:", error);
                setAlerta({ mensaje: "❌ Error al guardar el estatus", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    // 🔹 Mostrar modal de confirmación antes de eliminar
    const handleDeleteConfirm = (estatus) => {
        setEstatusAEliminar(estatus);
        setConfirmModalVisible(true);
    };

    // 🔹 Eliminar estatus (borrado lógico)
    const handleDelete = () => {
        if (!estatusAEliminar) return;

        fetch(`${process.env.BACKEND_URL}/api/estatus/${estatusAEliminar.id}`, { method: "DELETE" })
            .then((response) => response.json())
            .then(() => {
                fetchEstatus();
                setConfirmModalVisible(false);
                setAlerta({ mensaje: "✅ Estatus eliminado", tipo: "success" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al eliminar estatus:", error);
                setAlerta({ mensaje: "❌ Error al eliminar el estatus", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    return (
        <div className="estatus-container">
            <h1 className="estatus-title">ESTATUS</h1>

            {/* 🔹 Mensaje de alerta */}
            {alerta.mensaje && (
                <div className={`alerta ${alerta.tipo}`}>
                    <span className="icono">❌</span> {alerta.mensaje}
                </div>
            )}

            {/* 🔹 Botón para abrir el modal de creación */}
            <button className="crear-estatus-btn" onClick={() => {
                setEstatusActual({ id: null, nombre: "", descripcion: "" });
                setModalVisible(true);
            }}>
                Crear Estatus
            </button>

            {/* 🔹 Modal de creación/edición */}
            {modalVisible && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{estatusActual.id ? "Editar Estatus" : "Crear Nuevo Estatus"}</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="nombre" placeholder="Nombre del estatus" value={estatusActual.nombre} onChange={handleChange} required />
                            <input type="text" name="descripcion" placeholder="Descripción" value={estatusActual.descripcion} onChange={handleChange} required />
                            <div className="modal-buttons">
                                <button type="submit" className="guardar-btn">Guardar</button>
                                <button type="button" className="cerrar-btn" onClick={() => setModalVisible(false)}>Cerrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🔹 Modal de confirmación de eliminación */}
            {confirmModalVisible && (
                <div className="modal-overlay" onClick={() => setConfirmModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>¿Seguro que deseas eliminar este estatus?</h2>
                        <p>{estatusAEliminar?.nombre}</p>
                        <div className="modal-delete-buttons">
                            <button className="eliminar-confirm-btn" onClick={handleDelete}>Eliminar</button>
                            <button className="cerrar-modal-btn" onClick={() => setConfirmModalVisible(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔹 Lista de estatus con botones de editar y eliminar al lado del nombre */}
            <div className="estatus-grid">
                {estatusList.length > 0 ? (
                    estatusList.map((estatus) => (
                        <div key={estatus.id} className="estatus-item">
                            <div className="estatus-header">
                                <strong className="name">{estatus.nombre}</strong>
                                <div className="estatus-actions">
                                    <button className="editar-btn" onClick={() => {
                                        setEstatusActual(estatus);
                                        setModalVisible(true);
                                    }}>✏️</button>
                                    <button className="eliminar-btn" onClick={() => handleDeleteConfirm(estatus)}>🗑️</button>
                                </div>
                            </div>
                            <p className="descripcion">{estatus.descripcion}</p>
                        </div>
                    ))
                ) : (
                    <p>No hay estatus disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default Estatus;