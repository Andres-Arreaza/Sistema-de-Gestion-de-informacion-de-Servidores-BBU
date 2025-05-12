import React, { useEffect, useState } from "react";

const Servicio = () => {
    const [servicios, setServicios] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });
    const [servicioActual, setServicioActual] = useState({ id: null, nombre: "", descripcion: "" });
    const [servicioAEliminar, setServicioAEliminar] = useState(null);

    // 🔹 Obtener servicios desde la API
    const fetchServicios = () => {
        fetch(process.env.BACKEND_URL + "/api/servicios")
            .then((response) => {
                if (!response.ok) throw new Error("Error al obtener servicios.");
                return response.json();
            })
            .then((data) => {
                console.log("Servicios recibidos:", data);
                setServicios(data);
            })
            .catch((error) => console.error("Error al obtener servicios:", error));
    };

    useEffect(() => {
        fetchServicios();
    }, []);

    // 🔹 Manejar cambios en el formulario
    const handleChange = (e) => {
        setServicioActual({ ...servicioActual, [e.target.name]: e.target.value });
    };

    // 🔹 Crear o actualizar servicio
    const handleSubmit = (e) => {
        e.preventDefault();
        const metodo = servicioActual.id ? "PUT" : "POST";
        const url = servicioActual.id
            ? `${process.env.BACKEND_URL}/api/servicios/${servicioActual.id}`
            : `${process.env.BACKEND_URL}/api/servicios`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(servicioActual),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setAlerta({ mensaje: `❌ ${data.error}`, tipo: "error" });
                } else {
                    fetchServicios();
                    setModalVisible(false);
                    setAlerta({ mensaje: servicioActual.id ? "✅ Servicio actualizado" : "✅ Servicio creado", tipo: "success" });
                }
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al guardar servicio:", error);
                setAlerta({ mensaje: "❌ Error al guardar el servicio", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    // 🔹 Mostrar modal de confirmación antes de eliminar
    const handleDeleteConfirm = (servicio) => {
        setServicioAEliminar(servicio);
        setConfirmModalVisible(true);
    };

    // 🔹 Eliminar servicio (borrado lógico)
    const handleDelete = () => {
        if (!servicioAEliminar) return;

        fetch(`${process.env.BACKEND_URL}/api/servicios/${servicioAEliminar.id}`, { method: "DELETE" })
            .then((response) => response.json())
            .then(() => {
                fetchServicios();
                setConfirmModalVisible(false);
                setAlerta({ mensaje: "✅ Servicio eliminado", tipo: "success" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al eliminar servicio:", error);
                setAlerta({ mensaje: "❌ Error al eliminar el servicio", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    return (
        <div className="servicio-container">
            <h1 className="servicio-title">SERVICIOS</h1>

            {/* 🔹 Mensaje de alerta */}
            {alerta.mensaje && (
                <div className={`alerta ${alerta.tipo}`}>
                    <span className="icono">❌</span> {alerta.mensaje}
                </div>
            )}

            {/* 🔹 Botón para abrir el modal de creación */}
            <button className="crear-servicio-btn" onClick={() => {
                setServicioActual({ id: null, nombre: "", descripcion: "" });
                setModalVisible(true);
            }}>
                Crear Servicio
            </button>

            {/* 🔹 Modal de creación/edición */}
            {modalVisible && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{servicioActual.id ? "Editar Servicio" : "Crear Nuevo Servicio"}</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="nombre" placeholder="Nombre del servicio" value={servicioActual.nombre} onChange={handleChange} required />
                            <input type="text" name="descripcion" placeholder="Descripción" value={servicioActual.descripcion} onChange={handleChange} required />
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
                        <h2>¿Seguro que deseas eliminar este servicio?</h2>
                        <p>{servicioAEliminar?.nombre}</p>
                        <div className="modal-delete-buttons">
                            <button className="eliminar-confirm-btn" onClick={handleDelete}>Eliminar</button>
                            <button className="cerrar-modal-btn" onClick={() => setConfirmModalVisible(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔹 Lista de servicios con botones de editar y eliminar al lado del nombre */}
            <div className="servicio-grid">
                {servicios.length > 0 ? (
                    servicios.map((servicio) => (
                        <div key={servicio.id} className="servicio-item">
                            <div className="servicio-header">
                                <strong className="name">{servicio.nombre}</strong>
                                <div className="servicio-actions">
                                    <button className="editar-btn" onClick={() => {
                                        setServicioActual(servicio);
                                        setModalVisible(true);
                                    }}>✏️</button>
                                    <button className="eliminar-btn" onClick={() => handleDeleteConfirm(servicio)}>🗑️</button>
                                </div>
                            </div>
                            <p className="descripcion">{servicio.descripcion}</p>
                        </div>
                    ))
                ) : (
                    <p>No hay servicios disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default Servicio;