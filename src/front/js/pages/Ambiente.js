import React, { useEffect, useState } from "react";

const Ambiente = () => {
    const [ambientes, setAmbientes] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });
    const [ambienteActual, setAmbienteActual] = useState({ id: null, nombre: "", descripcion: "" });
    const [ambienteAEliminar, setAmbienteAEliminar] = useState(null);

    // 🔹 Obtener ambientes desde la API
    const fetchAmbientes = () => {
        fetch(process.env.BACKEND_URL + "/api/ambientes")
            .then((response) => {
                if (!response.ok) throw new Error("Error al obtener ambientes.");
                return response.json();
            })
            .then((data) => {
                console.log("Ambientes recibidos:", data);
                setAmbientes(data);
            })
            .catch((error) => console.error("Error al obtener ambientes:", error));
    };

    useEffect(() => {
        fetchAmbientes();
    }, []);

    // 🔹 Manejar cambios en el formulario
    const handleChange = (e) => {
        setAmbienteActual({ ...ambienteActual, [e.target.name]: e.target.value });
    };

    // 🔹 Crear o actualizar ambiente
    const handleSubmit = (e) => {
        e.preventDefault();
        const metodo = ambienteActual.id ? "PUT" : "POST";
        const url = ambienteActual.id
            ? `${process.env.BACKEND_URL}/api/ambientes/${ambienteActual.id}`
            : `${process.env.BACKEND_URL}/api/ambientes`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ambienteActual),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setAlerta({ mensaje: `${data.error}`, tipo: "error" });
                } else {
                    fetchAmbientes();
                    setModalVisible(false);
                    setAlerta({ mensaje: ambienteActual.id ? "✅ Ambiente actualizado" : "✅ Ambiente creado", tipo: "success" });
                }
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al guardar ambiente:", error);
                setAlerta({ mensaje: "❌ Error al guardar el ambiente", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    // 🔹 Mostrar modal de confirmación antes de eliminar
    const handleDeleteConfirm = (ambiente) => {
        setAmbienteAEliminar(ambiente);
        setConfirmModalVisible(true);
    };

    // 🔹 Eliminar ambiente (borrado lógico)
    const handleDelete = () => {
        if (!ambienteAEliminar) return;

        fetch(`${process.env.BACKEND_URL}/api/ambientes/${ambienteAEliminar.id}`, { method: "DELETE" })
            .then((response) => response.json())
            .then(() => {
                fetchAmbientes();
                setConfirmModalVisible(false);
                setAlerta({ mensaje: "✅ Ambiente eliminado", tipo: "success" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al eliminar ambiente:", error);
                setAlerta({ mensaje: "❌ Error al eliminar el ambiente", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    return (
        <div className="ambiente-container">
            <h1 className="ambiente-title">AMBIENTES</h1>

            {/* 🔹 Mensaje de alerta */}
            {alerta.mensaje && (
                <div className={`alerta ${alerta.tipo}`}>
                    <span className="icono">❌</span> {alerta.mensaje}
                </div>
            )}

            {/* 🔹 Botón para abrir el modal de creación */}
            <button className="crear-ambiente-btn" onClick={() => {
                setAmbienteActual({ id: null, nombre: "", descripcion: "" });
                setModalVisible(true);
            }}>
                Crear Ambiente
            </button>

            {/* 🔹 Modal de creación/edición */}
            {modalVisible && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{ambienteActual.id ? "Editar Ambiente" : "Crear Nuevo Ambiente"}</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="nombre" placeholder="Nombre del ambiente" value={ambienteActual.nombre} onChange={handleChange} required />
                            <input type="text" name="descripcion" placeholder="Descripción" value={ambienteActual.descripcion} onChange={handleChange} required />
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
                        <h2>¿Seguro que deseas eliminar este ambiente?</h2>
                        <p>{ambienteAEliminar?.nombre}</p>
                        <div className="modal-delete-buttons">
                            <button className="eliminar-confirm-btn" onClick={handleDelete}>Eliminar</button>
                            <button className="cerrar-modal-btn" onClick={() => setConfirmModalVisible(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔹 Lista de ambientes con botones de editar y eliminar al lado del nombre */}
            <div className="ambiente-grid">
                {ambientes.length > 0 ? (
                    ambientes.map((ambiente) => (
                        <div key={ambiente.id} className="ambiente-item">
                            <div className="ambiente-header">
                                <strong className="name">{ambiente.nombre}</strong>
                                <div className="ambiente-actions">
                                    <button className="editar-btn" onClick={() => {
                                        setAmbienteActual(ambiente);
                                        setModalVisible(true);
                                    }}>✏️</button>
                                    <button className="eliminar-btn" onClick={() => handleDeleteConfirm(ambiente)}>🗑️</button>
                                </div>
                            </div>
                            <p className="descripcion">{ambiente.descripcion}</p>
                        </div>
                    ))
                ) : (
                    <p>No hay ambientes disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default Ambiente;