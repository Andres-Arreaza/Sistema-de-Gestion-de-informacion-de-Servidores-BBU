import React, { useEffect, useState } from "react";

const SistemaOperativo = () => {
    const [sistemas, setSistemas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });
    const [sistemaActual, setSistemaActual] = useState({ id: null, nombre: "", version: "", descripcion: "" });
    const [sistemaAEliminar, setSistemaAEliminar] = useState(null);

    // Obtener sistemas operativos desde la API
    const fetchSistemas = () => {
        fetch(process.env.BACKEND_URL + "/api/sistemas-operativos")
            .then((response) => {
                if (!response.ok) throw new Error("Error al obtener sistemas operativos.");
                return response.json();
            })
            .then((data) => {
                setSistemas(data);
            })
            .catch((error) => console.error("Error al obtener sistemas operativos:", error));
    };

    useEffect(() => {
        fetchSistemas();
    }, []);

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        setSistemaActual({ ...sistemaActual, [e.target.name]: e.target.value });
    };

    // Crear o actualizar sistema operativo
    const handleSubmit = (e) => {
        e.preventDefault();
        const metodo = sistemaActual.id ? "PUT" : "POST";
        const url = sistemaActual.id
            ? `${process.env.BACKEND_URL}/api/sistemas-operativos/${sistemaActual.id}`
            : `${process.env.BACKEND_URL}/api/sistemas-operativos`;

        const payload = { ...sistemaActual };

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setAlerta({ mensaje: `❌ ${data.error}`, tipo: "error" });
                } else {
                    fetchSistemas();
                    setModalVisible(false);
                    setAlerta({ mensaje: sistemaActual.id ? "✅ Sistema operativo actualizado" : "✅ Sistema operativo creado", tipo: "success" });
                }
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al guardar sistema operativo:", error);
                setAlerta({ mensaje: "❌ Error al guardar el sistema operativo", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    // Mostrar modal de confirmación antes de eliminar
    const handleDeleteConfirm = (sistema) => {
        setSistemaAEliminar(sistema);
        setConfirmModalVisible(true);
    };

    // Eliminar sistema operativo (borrado lógico)
    const handleDelete = () => {
        if (!sistemaAEliminar) return;

        fetch(`${process.env.BACKEND_URL}/api/sistemas-operativos/${sistemaAEliminar.id}`, { method: "DELETE" })
            .then((response) => response.json())
            .then(() => {
                fetchSistemas();
                setConfirmModalVisible(false);
                setAlerta({ mensaje: "✅ Sistema operativo eliminado", tipo: "success" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al eliminar sistema operativo:", error);
                setAlerta({ mensaje: "❌ Error al eliminar el sistema operativo", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    return (
        <div className="sistema-container">
            <h2 className="sistema-title">Sistemas Operativos</h2>

            {/* Mensaje de alerta */}
            {alerta.mensaje && (
                <div className={`alerta ${alerta.tipo}`}>
                    <span className="icono">{alerta.tipo === "error" ? "❌" : "✅"}</span> {alerta.mensaje}
                </div>
            )}

            {/* Botón para abrir el modal de creación */}
            <button className="crear-sistema-btn" onClick={() => {
                setSistemaActual({ id: null, nombre: "", version: "", descripcion: "" });
                setModalVisible(true);
            }}>
                Crear Sistema Operativo
            </button>

            {/* Modal de creación/edición */}
            {modalVisible && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{sistemaActual.id ? "Editar Sistema Operativo" : "Crear Nuevo Sistema Operativo"}</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="nombre" placeholder="Nombre del sistema operativo" value={sistemaActual.nombre} onChange={handleChange} required />
                            <input type="text" name="version" placeholder="Versión" value={sistemaActual.version} onChange={handleChange} required />
                            <input type="text" name="descripcion" placeholder="Descripción" value={sistemaActual.descripcion} onChange={handleChange} required />
                            <div className="modal-buttons">
                                <button type="submit" className="guardar-btn">Guardar</button>
                                <button type="button" className="cerrar-btn" onClick={() => setModalVisible(false)}>Cerrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {confirmModalVisible && (
                <div className="modal-overlay" onClick={() => setConfirmModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>¿Seguro que deseas eliminar este sistema operativo?</h3>
                        <div className="modal-buttons">
                            <button className="guardar-btn" onClick={handleDelete}>Sí, eliminar</button>
                            <button className="cerrar-btn" onClick={() => setConfirmModalVisible(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de sistemas operativos */}
            <div className="sistema-grid">
                {sistemas.length > 0 ? (
                    sistemas.map((sistema) => (
                        <div key={sistema.id} className="sistema-item">
                            <div className="sistema-header">
                                <div className="sistema-nombre-container">
                                    <h3 className="sistema-nombre">{sistema.nombre}</h3>
                                    <div className="sistema-actions">
                                        <button className="editar-btn" onClick={() => {
                                            setSistemaActual(sistema);
                                            setModalVisible(true);
                                        }}>✏️</button>
                                        <button className="eliminar-btn" onClick={() => handleDeleteConfirm(sistema)}>🗑️</button>
                                    </div>
                                </div>
                                <p className="sistema-label"><strong>Versión:</strong> {sistema.version}</p>
                                <p className="sistema-descripcion">{sistema.descripcion}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No hay sistemas operativos disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default SistemaOperativo;