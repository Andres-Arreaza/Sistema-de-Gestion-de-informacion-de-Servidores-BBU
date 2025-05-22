import React, { useEffect, useState } from "react";

const SistemaOperativo = () => {
    const [sistemas, setSistemas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });
    const [sistemaActual, setSistemaActual] = useState({ id: null, nombre: "", version: "", descripcion: "" });
    const [sistemaAEliminar, setSistemaAEliminar] = useState(null);

    // 🔹 Obtener sistemas operativos desde la API con manejo de errores
    const fetchSistemas = () => {
        fetch(`${process.env.BACKEND_URL}/api/sistemas_operativos`)
            .then((response) => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(`Error al obtener sistemas operativos: ${text}`) });
                }
                return response.json();
            })
            .then((data) => setSistemas(data))
            .catch((error) => console.error("Error al obtener sistemas operativos:", error));
    };

    useEffect(() => {
        fetchSistemas();
    }, []);

    const handleChange = (e) => {
        setSistemaActual({ ...sistemaActual, [e.target.name]: e.target.value });
    };

    // 🔹 Validación antes de enviar la solicitud
    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Valores antes de enviar:", sistemaActual);

        if (!sistemaActual.nombre || !sistemaActual.version.trim()) {
            setAlerta({ mensaje: "❌ El nombre y la versión son obligatorios", tipo: "error" });
            setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            return;
        }

        const metodo = sistemaActual.id ? "PUT" : "POST";
        const url = sistemaActual.id
            ? `${process.env.BACKEND_URL}/api/sistemas_operativos/${sistemaActual.id}`
            : `${process.env.BACKEND_URL}/api/sistemas_operativos`;

        const payload = {
            nombre: sistemaActual.nombre,
            version: sistemaActual.version.trim() || "Desconocido", // 🔹 Asegura que no sea null
            descripcion: sistemaActual.descripcion || "",
        };

        console.log("Datos enviados al backend:", payload); // 🔍 Verifica que la versión está bien

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(`Error al guardar sistema operativo: ${text}`) });
                }
                return response.json();
            })
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

    const handleDeleteConfirm = (sistema) => {
        setSistemaAEliminar(sistema);
        setConfirmModalVisible(true);
    };

    // 🔹 Eliminar sistema operativo con manejo de errores
    const handleDelete = () => {
        if (!sistemaAEliminar) return;

        fetch(`${process.env.BACKEND_URL}/api/sistemas_operativos/${sistemaAEliminar.id}`, { method: "DELETE" })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(`Error al eliminar sistema operativo: ${text}`) });
                }
                return response.json();
            })
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

            {alerta.mensaje && (
                <div className={`alerta ${alerta.tipo}`}>
                    <span className="icono">{alerta.tipo === "error" ? "❌" : "✅"}</span> {alerta.mensaje}
                </div>
            )}

            <button className="crear-sistema-btn" onClick={() => {
                setSistemaActual({ id: null, nombre: "", version: "", descripcion: "" });
                setModalVisible(true);
            }}>
                Crear Sistema Operativo
            </button>

            {modalVisible && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{sistemaActual.id ? "Editar Sistema Operativo" : "Crear Nuevo Sistema Operativo"}</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="nombre" placeholder="Nombre del sistema operativo" value={sistemaActual.nombre} onChange={handleChange} required />
                            <input type="text" name="version" placeholder="Versión" value={sistemaActual.version} onChange={handleChange} required />
                            <input type="text" name="descripcion" placeholder="Descripción" value={sistemaActual.descripcion} onChange={handleChange} />
                            <div className="modal-buttons">
                                <button type="submit" className="guardar-btn">Guardar</button>
                                <button type="button" className="cerrar-btn" onClick={() => setModalVisible(false)}>Cerrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

            <div className="sistema-grid">
                {sistemas.length > 0 ? (
                    sistemas.map((sistema) => (
                        <div key={sistema.id} className="sistema-item">
                            <h3 className="sistema-nombre">{sistema.nombre}</h3>
                            <p><strong>Versión:</strong> {sistema.version}</p>
                            <p>{sistema.descripcion}</p>
                            <div className="sistema-actions">
                                <button className="editar-btn" onClick={() => {
                                    setSistemaActual(sistema);
                                    setModalVisible(true);
                                }}>✏️</button>
                                <button className="eliminar-btn" onClick={() => handleDeleteConfirm(sistema)}>🗑️</button>
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