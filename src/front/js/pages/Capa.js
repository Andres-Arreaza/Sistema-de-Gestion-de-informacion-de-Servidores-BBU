import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Loading from "../component/Loading"; // Asegúrate de tener este componente

// --- Iconos SVG ---
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

// --- Componente del Modal del Formulario ---
const CapaFormModal = ({ isOpen, onClose, onSave, capa, capasExistentes }) => {
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (capa) {
            setFormData({ nombre: capa.nombre, descripcion: capa.descripcion || '' });
        } else {
            setFormData({ nombre: '', descripcion: '' });
        }
        setError('');
    }, [capa, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const nombreNormalizado = formData.nombre.trim().toLowerCase();

        if (!nombreNormalizado) {
            setError('El campo "Nombre" es obligatorio.');
            return;
        }

        const capaDuplicada = capasExistentes.find(
            c => c.nombre.toLowerCase() === nombreNormalizado && c.id !== capa?.id
        );

        if (capaDuplicada) {
            setError(`La capa "${formData.nombre.trim()}" ya existe.`);
            return;
        }

        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-servicio" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{capa ? 'Editar Capa' : 'Crear Nueva Capa'}</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="servicio-form">
                    <div className="form-field">
                        <label htmlFor="nombre">Nombre de la capa <span className="campo-obligatorio">*</span></label>
                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            placeholder="Ej: Frontend"
                            value={formData.nombre}
                            onChange={handleChange}
                            className={error ? 'input-error' : ''}
                        />
                        {error && <p className="error-mensaje">{error}</p>}
                    </div>
                    <div className="form-field">
                        <label htmlFor="descripcion">Descripción (Opcional)</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            placeholder="Describe brevemente la capa..."
                            value={formData.descripcion}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const Capa = () => {
    const [capas, setCapas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [capaSeleccionada, setCapaSeleccionada] = useState(null);

    const lockScroll = () => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = 'hidden';
    };

    const unlockScroll = () => {
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '';
    };

    useEffect(() => {
        if (isModalOpen) {
            lockScroll();
        } else {
            unlockScroll();
        }
        return () => unlockScroll();
    }, [isModalOpen]);

    const fetchCapas = () => {
        setCargando(true);
        fetch(process.env.BACKEND_URL + "/api/capas")
            .then(response => response.ok ? response.json() : Promise.reject("Error al obtener capas."))
            .then(data => setCapas(data))
            .catch(error => console.error("Error al obtener capas:", error))
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        fetchCapas();
    }, []);

    const handleOpenModal = (capa = null) => {
        setCapaSeleccionada(capa);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCapaSeleccionada(null);
    };

    const handleSaveCapa = (formData) => {
        const esEdicion = !!capaSeleccionada;
        const metodo = esEdicion ? "PUT" : "POST";
        const url = esEdicion
            ? `${process.env.BACKEND_URL}/api/capas/${capaSeleccionada.id}`
            : `${process.env.BACKEND_URL}/api/capas`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
            .then(response => {
                if (!response.ok) return response.json().then(err => Promise.reject(err));
                return response.json();
            })
            .then(() => {
                fetchCapas();
                handleCloseModal();
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: `Capa ${esEdicion ? 'actualizada' : 'creada'} correctamente.`,
                    timer: 3000,
                    showConfirmButton: false,
                    heightAuto: false,
                    customClass: {
                        popup: 'custom-swal-popup',
                        title: 'custom-swal-title',
                        htmlContainer: 'custom-swal-html-container',
                    },
                    didOpen: lockScroll,
                    willClose: unlockScroll
                });
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al Guardar',
                    text: error.msg || 'No se pudo completar la operación.',
                    customClass: {
                        popup: 'custom-swal-popup',
                        title: 'custom-swal-title',
                        htmlContainer: 'custom-swal-html-container',
                    },
                    didOpen: lockScroll,
                    willClose: unlockScroll
                });
            });
    };

    const confirmarEliminacion = (capa) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación de la capa "${capa.nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'custom-swal-popup',
                title: 'custom-swal-title',
                htmlContainer: 'custom-swal-html-container',
            },
            didOpen: lockScroll,
            willClose: unlockScroll
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/capas/${capa.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.text().then(text => text ? JSON.parse(text) : {});
                    })
                    .then(() => {
                        fetchCapas();
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'La capa ha sido eliminada.',
                            timer: 3000,
                            showConfirmButton: false,
                            heightAuto: false,
                            customClass: {
                                popup: 'custom-swal-popup',
                                title: 'custom-swal-title',
                                htmlContainer: 'custom-swal-html-container',
                            },
                            didOpen: lockScroll,
                            willClose: unlockScroll
                        });
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error de Eliminación',
                            text: error.msg || 'Error al eliminar la capa.',
                            didOpen: lockScroll,
                            willClose: unlockScroll
                        });
                    });
            }
        });
    };

    return (
        <div className="page-container">
            <div className="hero-section">
                <div className="title-section">
                    <div className="decorative-line-top"></div>
                    <h1 className="main-title">Configuración  de Servidores</h1>
                    <p className="subtitle">"Administra la Información de los Servidores"</p>
                    <div className="decorative-line-bottom"></div>
                </div>
            </div>

            <div className="content-area">
                <div className="content-header">
                    <h2 className="content-title">Listado de Capas</h2>
                </div>

                {cargando ? <Loading /> : (
                    <div className="servicio-grid">
                        {capas.length > 0 ? (
                            capas.map((capa) => (
                                <div key={capa.id} className="servicio-card">
                                    <div className="servicio-card-header">
                                        <strong className="servicio-nombre">{capa.nombre}</strong>
                                        <div className="servicio-acciones">
                                            <button className="accion-btn editar-btn" onClick={() => handleOpenModal(capa)}>
                                                <EditIcon />
                                            </button>
                                            <button className="accion-btn eliminar-btn" onClick={() => confirmarEliminacion(capa)}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="servicio-descripcion">{capa.descripcion || 'Sin descripción'}</p>
                                </div>
                            ))
                        ) : (
                            <p>No hay capas disponibles.</p>
                        )}
                    </div>
                )}
            </div>

            <CapaFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveCapa}
                capa={capaSeleccionada}
                capasExistentes={capas}
            />
        </div>
    );
};

export default Capa;
