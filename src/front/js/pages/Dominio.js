import React, { useEffect, useState } from "react";

const Dominio = () => {
    const [dominios, setDominios] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });
    const [dominioActual, setDominioActual] = useState({ id: null, nombre: "", descripcion: "" });
    const [dominioAEliminar, setDominioAEliminar] = useState(null);

    // 🔹 Obtener dominios desde la API
    const fetchDominios = () => {
        fetch(process.env.BACKEND_URL + "/api/dominios")
            .then((response) => {
                if (!response.ok) throw new Error("Error al obtener dominios.");
                return response.json();
            })
            .then((data) => {
                console.log("Dominios recibidos:", data);
                setDominios(data);
            })
            .catch((error) => console.error("Error al obtener dominios:", error));
    };

    useEffect(() => {
        fetchDominios();
    }, []);

    // 🔹 Manejar cambios en el formulario
    const handleChange = (e) => {
        setDominioActual({ ...dominioActual, [e.target.name]: e.target.value });
    };

    // 🔹 Crear o actualizar dominio
    const handleSubmit = (e) => {
        e.preventDefault();
        const metodo = dominioActual.id ? "PUT" : "POST";
        const url = dominioActual.id
            ? `${process.env.BACKEND_URL}/api/dominios/${dominioActual.id}`
            : `${process.env.BACKEND_URL}/api/dominios`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dominioActual),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setAlerta({ mensaje: data.error, tipo: "error" });
                } else {
                    fetchDominios();
                    setModalVisible(false);
                    setAlerta({ mensaje: dominioActual.id ? "Dominio actualizado" : "Dominio creado", tipo: "success" });
                }
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al guardar dominio:", error);
                setAlerta({ mensaje: "Error al guardar el dominio", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    // 🔹 Mostrar modal de confirmación antes de eliminar
    const handleDeleteConfirm = (dominio) => {
        setDominioAEliminar(dominio);
        setConfirmModalVisible(true);
    };

    // 🔹 Eliminar dominio (borrado lógico)
    const handleDelete = () => {
        if (!dominioAEliminar) return;

        fetch(`${process.env.BACKEND_URL}/api/dominios/${dominioAEliminar.id}`, { method: "DELETE" })
            .then((response) => response.json())
            .then(() => {
                fetchDominios();
                setConfirmModalVisible(false);
                setAlerta({ mensaje: "Dominio eliminado", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            })
            .catch((error) => {
                console.error("Error al eliminar dominio:", error);
                setAlerta({ mensaje: "Error al eliminar el dominio", tipo: "error" });
                setTimeout(() => setAlerta({ mensaje: "", tipo: "" }), 3000);
            });
    };

    return (
        <div className="dominio-container">
            {/* 🔹 Encabezado con gradiente, líneas blancas y botón */}
            <div className="dominio-header">
                <div className="linea-blanca"></div>
                <h2 className="dominio-title">Gestión de Dominios</h2>
                <button className="crear-dominio-btn" onClick={() => {
                    setDominioActual({ id: null, nombre: "", descripcion: "" });
                    setModalVisible(true);
                }}>Crear Dominio</button>
                <div className="linea-blanca-2"></div>
            </div>

            {/* 🔹 Mensaje de alerta */}
            {alerta.mensaje && (
                <div className={`alerta ${alerta.tipo}`}>
                    {alerta.mensaje === "Dominio eliminado" ? (
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
                        <h2>{dominioActual.id ? "Editar Dominio" : "Crear Nuevo Dominio"}</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="nombre" placeholder="Nombre del dominio" value={dominioActual.nombre} onChange={handleChange} required />
                            <input type="text" name="descripcion" placeholder="Descripción" value={dominioActual.descripcion} onChange={handleChange} required />
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
                        <h2>¿Seguro que deseas eliminar este dominio?</h2>
                        <p>{`El dominio "` + dominioAEliminar?.nombre + `" será eliminado.`}</p>
                        <div className="modal-delete-buttons">
                            <button className="eliminar-confirm-btn" onClick={handleDelete}>Eliminar</button>
                            <button className="cerrar-modal-btn" onClick={() => setConfirmModalVisible(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔹 Lista de dominios con botones de editar y eliminar */}
            <div className="dominio-grid">
                {dominios.length > 0 ? (
                    dominios.map((dominio) => (
                        <div key={dominio.id} className="dominio-item">
                            <div className="dominio-header-item">
                                <div className="dominio-actions">
                                    <strong className="name">{dominio.nombre}</strong>
                                    <button className="editar-btn" onClick={() => {
                                        setDominioActual(dominio);
                                        setModalVisible(true);
                                    }}>
                                        <span className="material-icons"><i className="fas fa-edit"></i></span>
                                    </button>
                                    <button className="eliminar-btn" onClick={() => handleDeleteConfirm(dominio)}>
                                        <span className="material-icons"><i className="fas fa-trash"></i></span>
                                    </button>
                                </div>
                            </div>
                            <p className="descripcion">{dominio.descripcion}</p>
                        </div>
                    ))
                ) : (
                    <p>No hay dominios disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default Dominio;