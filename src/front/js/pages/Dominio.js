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
const DominioFormModal = ({ isOpen, onClose, onSave, dominio, dominiosExistentes }) => {
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (dominio) {
            setFormData({ nombre: dominio.nombre, descripcion: dominio.descripcion || '' });
        } else {
            setFormData({ nombre: '', descripcion: '' });
        }
        setError('');
    }, [dominio, isOpen]);

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

        const dominioDuplicado = dominiosExistentes.find(
            d => d.nombre.toLowerCase() === nombreNormalizado && d.id !== dominio?.id
        );

        if (dominioDuplicado) {
            setError(`El dominio "${formData.nombre.trim()}" ya existe.`);
            return;
        }

        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-servicio" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{dominio ? 'Editar Dominio' : 'Crear Nuevo Dominio'}</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="servicio-form">
                    <div className="form-field">
                        <label htmlFor="nombre">Nombre del dominio <span className="campo-obligatorio">*</span></label>
                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            placeholder="Ej: banesco.com"
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
                            placeholder="Describe brevemente el dominio..."
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


export const Dominio = () => {
    const [dominios, setDominios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dominioSeleccionado, setDominioSeleccionado] = useState(null);

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

    const fetchDominios = () => {
        setCargando(true);
        fetch(process.env.BACKEND_URL + "/api/dominios")
            .then(response => response.ok ? response.json() : Promise.reject("Error al obtener dominios."))
            .then(data => setDominios(data))
            .catch(error => console.error("Error al obtener dominios:", error))
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        fetchDominios();
    }, []);

    const handleOpenModal = (dominio = null) => {
        setDominioSeleccionado(dominio);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setDominioSeleccionado(null);
    };

    const handleSaveDominio = (formData) => {
        const esEdicion = !!dominioSeleccionado;
        const metodo = esEdicion ? "PUT" : "POST";
        const url = esEdicion
            ? `${process.env.BACKEND_URL}/api/dominios/${dominioSeleccionado.id}`
            : `${process.env.BACKEND_URL}/api/dominios`;

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
                fetchDominios();
                handleCloseModal();
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: `Dominio ${esEdicion ? 'actualizado' : 'creado'} correctamente.`,
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

    const confirmarEliminacion = (dominio) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación del dominio "${dominio.nombre}".`,
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
                fetch(`${process.env.BACKEND_URL}/api/dominios/${dominio.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.text().then(text => text ? JSON.parse(text) : {});
                    })
                    .then(() => {
                        fetchDominios();
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'El dominio ha sido eliminado.',
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
                            text: error.msg || 'Error al eliminar el dominio.',
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
                    <h1 className="main-title">Gestión de Dominios</h1>
                    <p className="subtitle">"Administra los dominios de la infraestructura"</p>
                    <button className="crear-btn" onClick={() => handleOpenModal()}>
                        <PlusIcon />
                        Crear Dominio
                    </button>
                    <div className="decorative-line-bottom"></div>
                </div>
            </div>

            <div className="content-area">
                <div className="content-header">
                    <h2 className="content-title">Listado de Dominios</h2>
                </div>

                {cargando ? <Loading /> : (
                    <div className="servicio-grid">
                        {dominios.length > 0 ? (
                            dominios.map((dominio) => (
                                <div key={dominio.id} className="servicio-card">
                                    <div className="servicio-card-header">
                                        <strong className="servicio-nombre">{dominio.nombre}</strong>
                                        <div className="servicio-acciones">
                                            <button className="accion-btn editar-btn" onClick={() => handleOpenModal(dominio)}>
                                                <EditIcon />
                                            </button>
                                            <button className="accion-btn eliminar-btn" onClick={() => confirmarEliminacion(dominio)}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="servicio-descripcion">{dominio.descripcion || 'Sin descripción'}</p>
                                </div>
                            ))
                        ) : (
                            <p>No hay dominios disponibles.</p>
                        )}
                    </div>
                )}
            </div>

            <DominioFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveDominio}
                dominio={dominioSeleccionado}
                dominiosExistentes={dominios}
            />
        </div>
    );
};

export default Dominio;
