import React, { useEffect, useState } from "react";

const SistemaOperativo = () => {
    const [sistemasOperativos, setSistemasOperativos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });
    const [sistemaActual, setSistemaActual] = useState({ id: null, nombre: "", version: "", descripcion: "" });
    const [sistemaAEliminar, setSistemaAEliminar] = useState(null);

    // 🔹 Obtener sistemas operativos desde la API con manejo de errores
    const fetchSistemasOperativos = () => {
        fetch(`${process.env.BACKEND_URL}/api/sistemas_operativos`)
            .then((response) => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(`Error al obtener sistemas operativos: ${text}`) });
                }
                return response.json();
            })
            .then((data) => setSistemasOperativos(data))
            .catch((error) => console.error("Error al obtener sistemas operativos:", error));
    };

    useEffect(() => {
        fetchSistemasOperativos();
    }, []);

    // 🔹 Manejar cambios en el formulario
    const handleChange = (e) => {
        setSistemaActual({ ...sistemaActual, [e.target.name]: e.target.value });
    };
    // 🔹 Crear o actualizar sistema operativo
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!sistemaActual.nombre || !sistemaActual.version.trim()) {
            setAlerta({ mensaje: "El nombre y la versión son obligatorios", tipo: "error" });
            setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            return;
        }

        const metodo = sistemaActual.id ? "PUT" : "POST";
        const url = sistemaActual.id
            ? `${process.env.BACKEND_URL}/api/sistemas_operativos/${sistemaActual.id}`
            : `${process.env.BACKEND_URL}/api/sistemas_operativos`;

        const payload = {
            nombre: sistemaActual.nombre,
            version: sistemaActual.version.trim() || "Desconocido",
            descripcion: sistemaActual.descripcion || "",
        };

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
                    setAlerta({ mensaje: `${data.error}`, tipo: "error" });
                } else {
                    fetchSistemasOperativos();
                    setModalVisible(false);
                    setAlerta({ mensaje: sistemaActual.id ? "Sistema operativo actualizado" : "Sistema operativo creado", tipo: "success" });
                }
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al guardar sistema operativo:", error);
                setAlerta({ mensaje: "Error al guardar el sistema operativo", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    // 🔹 Mostrar modal de confirmación antes de eliminar
    const handleDeleteConfirm = (sistema) => {
        setSistemaAEliminar(sistema);
        setConfirmModalVisible(true);
    };

    // 🔹 Eliminar sistema operativo con manejo de errores
    const handleDelete = () => {
        if (!sistemaAEliminar) return;

        fetch(`${process.env.BACKEND_URL}/api/sistemas_operativos/${sistemaAEliminar.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(`Error al eliminar sistema operativo: ${text}`) });
                }
                return response.json();
            })
            .then(() => {
                fetchSistemasOperativos();
                setConfirmModalVisible(false);
                setAlerta({ mensaje: "Sistema operativo eliminado", tipo: "success" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al eliminar sistema operativo:", error);
                setAlerta({ mensaje: "Error al eliminar el sistema operativo", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };
    return (
        <div className="sistema-operativo-container">
            <div className="sistema-operativo-header">
                <div className="linea-blanca"></div>
                <h2 className="sistema-operativo-title">Gestión de Sistemas Operativos</h2>
                <button className="crear-sistema-operativo-btn" onClick={() => {
                    setSistemaActual({ id: null, nombre: "", version: "", descripcion: "" });
                    setModalVisible(true);
                }}>
                    <span className="material-symbols-outlined"></span> Crear Sistema Operativo
                </button>
                <div className="linea-blanca-2"></div>
            </div>

            {alerta.mensaje && (
                <div className={`alerta ${alerta.tipo}`}>
                    <span className="material-symbols-outlined">
                        {alerta.tipo === "success" ? "check_circle" : "error"}
                    </span>
                    {alerta.mensaje}
                </div>
            )}

            <div className="sistema-operativo-grid">
                {sistemasOperativos.length > 0 ? (
                    sistemasOperativos.map((sistema) => (
                        <div key={sistema.id} className="sistema-operativo-item">
                            <div className="sistema-operativo-header-item">
                                <div className="sistema-operativo-actions">
                                    <strong className="name">{sistema.nombre}</strong>
                                    <button className="editar-btn" onClick={() => {
                                        setSistemaActual(sistema);
                                        setModalVisible(true);
                                    }}>
                                        <span className="material-icons"><i className="fas fa-edit"></i></span>
                                    </button>
                                    <button className="eliminar-btn" onClick={() => handleDeleteConfirm(sistema)}>
                                        <span className="material-icons"><i className="fas fa-trash"></i></span>
                                    </button>
                                </div>
                            </div>
                            <p className="version"><strong>Versión:</strong> {sistema.version}</p>
                            <p className="descripcion"><strong>Descripción:</strong> {sistema.descripcion}</p>
                        </div>
                    ))
                ) : (
                    <p>No hay sistemas operativos disponibles.</p>
                )}
            </div>

            {/* 🔹 Modal de creación/edición */}
            {modalVisible && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{sistemaActual.id ? "Editar Sistema Operativo" : "Crear Nuevo Sistema Operativo"}</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="nombre" placeholder="Nombre" value={sistemaActual.nombre} onChange={handleChange} required />
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

            {/* 🔹 Modal de confirmación de eliminación */}
            {confirmModalVisible && (
                <div className="modal-overlay" onClick={() => setConfirmModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>¿Seguro que deseas eliminar este sistema operativo?</h3>
                        <p>{`El sistema operativo "` + sistemaAEliminar?.nombre + `" será eliminado.`}</p>
                        <div className="modal-delete-buttons">
                            <button className="eliminar-confirm-btn" onClick={handleDelete}>Eliminar</button>
                            <button className="cerrar-modal-btn" onClick={() => setConfirmModalVisible(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SistemaOperativo;