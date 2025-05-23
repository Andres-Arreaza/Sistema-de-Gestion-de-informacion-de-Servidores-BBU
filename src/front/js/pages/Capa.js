import React, { useEffect, useState } from "react";

const Capa = () => {
    const [capas, setCapas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });
    const [capaActual, setCapaActual] = useState({ id: null, nombre: "", descripcion: "" });
    const [capaAEliminar, setCapaAEliminar] = useState(null);

    // 🔹 Obtener capas desde la API
    const fetchCapas = () => {
        fetch(process.env.BACKEND_URL + "/api/capas")
            .then((response) => {
                if (!response.ok) throw new Error("Error al obtener capas.");
                return response.json();
            })
            .then((data) => {
                console.log("Capas recibidas:", data);
                setCapas(data);
            })
            .catch((error) => console.error("Error al obtener capas:", error));
    };

    useEffect(() => {
        fetchCapas();
    }, []);

    // 🔹 Manejar cambios en el formulario
    const handleChange = (e) => {
        setCapaActual({ ...capaActual, [e.target.name]: e.target.value });
    };

    // 🔹 Crear o actualizar capa
    const handleSubmit = (e) => {
        e.preventDefault();
        const metodo = capaActual.id ? "PUT" : "POST";
        const url = capaActual.id
            ? `${process.env.BACKEND_URL}/api/capas/${capaActual.id}`
            : `${process.env.BACKEND_URL}/api/capas`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(capaActual),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setAlerta({ mensaje: data.error, tipo: "error" });
                } else {
                    fetchCapas();
                    setModalVisible(false);
                    setAlerta({ mensaje: capaActual.id ? "Capa actualizada" : "Capa creada", tipo: "success" });
                }
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al guardar capa:", error);
                setAlerta({ mensaje: "Error al guardar la capa", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    // 🔹 Mostrar modal de confirmación antes de eliminar
    const handleDeleteConfirm = (capa) => {
        setCapaAEliminar(capa);
        setConfirmModalVisible(true);
    };

    // 🔹 Eliminar capa (borrado lógico)
    const handleDelete = () => {
        if (!capaAEliminar) return;

        fetch(`${process.env.BACKEND_URL}/api/capas/${capaAEliminar.id}`, { method: "DELETE" })
            .then((response) => response.json())
            .then(() => {
                fetchCapas();
                setConfirmModalVisible(false);
                setAlerta({ mensaje: "Capa eliminada", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al eliminar capa:", error);
                setAlerta({ mensaje: "Error al eliminar la capa", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    return (
        <div className="capa-container">
            {/* 🔹 Encabezado con gradiente, líneas blancas y botón */}
            <div className="capa-header">
                <div className="linea-blanca"></div>
                <h2 className="capa-title">Gestión de Capas</h2>
                <button className="crear-capa-btn" onClick={() => {
                    setCapaActual({ id: null, nombre: "", descripcion: "" });
                    setModalVisible(true);
                }}>Crear Capa</button>
                <div className="linea-blanca-2"></div>
            </div>

            {/* 🔹 Mensaje de alerta */}
            {alerta.mensaje && (
                <div className={`alerta ${alerta.tipo}`}>
                    {alerta.mensaje === "Capa eliminada" ? (
                        <span className="material-symbols-outlined">cancel</span>
                    ) : (
                        <span className="material-symbols-outlined">check_circle</span>
                    )}
                    {alerta.mensaje}
                </div>
            )}

            {/* 🔹 Modal de creación/edición */}
            {modalVisible && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{capaActual.id ? "Editar Capa" : "Crear Nueva Capa"}</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="nombre" placeholder="Nombre de la capa" value={capaActual.nombre} onChange={handleChange} required />
                            <input type="text" name="descripcion" placeholder="Descripción" value={capaActual.descripcion} onChange={handleChange} required />
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
                        <h2>¿Seguro que deseas eliminar esta capa?</h2>
                        <p>{`La capa "` + capaAEliminar?.nombre + `" será eliminada.`}</p>
                        <div className="modal-delete-buttons">
                            <button className="eliminar-confirm-btn" onClick={handleDelete}>Eliminar</button>
                            <button className="cerrar-modal-btn" onClick={() => setConfirmModalVisible(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔹 Lista de capas con botones de editar y eliminar */}
            <div className="capa-grid">
                {capas.length > 0 ? (
                    capas.map((capa) => (
                        <div key={capa.id} className="capa-item">
                            <div className="capa-header-item">
                                <div className="capa-actions">
                                    <strong className="name">{capa.nombre}</strong>
                                    <button className="editar-btn" onClick={() => {
                                        setCapaActual(capa);
                                        setModalVisible(true);
                                    }}>
                                        <span className="material-icons"><i className="fas fa-edit"></i></span>
                                    </button>
                                    <button className="eliminar-btn" onClick={() => handleDeleteConfirm(capa)}>
                                        <span className="material-icons"><i className="fas fa-trash"></i></span>
                                    </button>
                                </div>
                            </div>
                            <p className="descripcion">{capa.descripcion}</p>
                        </div>
                    ))
                ) : (
                    <p>No hay capas disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default Capa;