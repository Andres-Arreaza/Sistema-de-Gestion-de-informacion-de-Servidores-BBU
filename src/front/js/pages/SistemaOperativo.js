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
const SistemaOperativoFormModal = ({ isOpen, onClose, onSave, so, sistemasOperativosExistentes }) => {
    const [formData, setFormData] = useState({ nombre: '', version: '', descripcion: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (so) {
            setFormData({ nombre: so.nombre, version: so.version, descripcion: so.descripcion || '' });
        } else {
            setFormData({ nombre: '', version: '', descripcion: '' });
        }
        setErrors({});
    }, [so, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        let sanitizedValue = value;
        if (name === 'nombre') {
            sanitizedValue = value.replace(/[^a-zA-Z0-9\s-]/g, '').slice(0, 50);
        }
        if (name === 'version') {
            sanitizedValue = value.replace(/[^a-zA-Z0-9.-]/g, '').slice(0, 20);
        }
        if (name === 'descripcion') {
            sanitizedValue = value.slice(0, 200);
        }

        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const nombreNormalizado = formData.nombre.trim().toLowerCase();
        const versionNormalizada = formData.version.trim().toLowerCase();
        let newErrors = {};

        if (!nombreNormalizado) {
            newErrors.nombre = 'El campo "Nombre" es obligatorio.';
        }
        if (!versionNormalizada) {
            newErrors.version = 'El campo "Versión" es obligatorio.';
        }

        // CORRECCIÓN: Validar que la VERSIÓN no esté duplicada.
        const versionDuplicada = sistemasOperativosExistentes.find(
            s => s.version.toLowerCase() === versionNormalizada && s.id !== so?.id
        );

        if (versionDuplicada) {
            newErrors.version = `La versión "${formData.version.trim()}" ya está en uso.`;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-servicio" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{so ? 'Editar Sistema Operativo' : 'Crear Nuevo S.O.'}</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="servicio-form">
                    <div className="form-field">
                        <label htmlFor="nombre">Nombre del S.O. <span className="campo-obligatorio">*</span></label>
                        <input
                            id="nombre" name="nombre" type="text" placeholder="Ej: Windows Server"
                            value={formData.nombre} onChange={handleChange} className={errors.nombre ? 'input-error' : ''}
                            maxLength="50"
                        />
                        {errors.nombre && <p className="error-mensaje">{errors.nombre}</p>}
                    </div>
                    <div className="form-field">
                        <label htmlFor="version">Versión <span className="campo-obligatorio">*</span></label>
                        <input
                            id="version" name="version" type="text" placeholder="Ej: 2019"
                            value={formData.version} onChange={handleChange} className={errors.version ? 'input-error' : ''}
                            maxLength="20"
                        />
                        {errors.version && <p className="error-mensaje">{errors.version}</p>}
                    </div>
                    <div className="form-field">
                        <label htmlFor="descripcion">Descripción (Opcional)</label>
                        <textarea
                            id="descripcion" name="descripcion" placeholder="Describe brevemente el S.O..."
                            value={formData.descripcion} onChange={handleChange}
                            maxLength="200"
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


export const SistemaOperativo = () => {
    const [sistemasOperativos, setSistemasOperativos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [soSeleccionado, setSoSeleccionado] = useState(null);

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

    const fetchSistemasOperativos = () => {
        setCargando(true);
        fetch(process.env.BACKEND_URL + "/api/sistemas_operativos")
            .then(response => response.ok ? response.json() : Promise.reject("Error al obtener S.O."))
            .then(data => setSistemasOperativos(data))
            .catch(error => console.error("Error al obtener S.O.:", error))
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        fetchSistemasOperativos();
    }, []);

    const handleOpenModal = (so = null) => {
        setSoSeleccionado(so);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSoSeleccionado(null);
    };

    const handleSaveSistemaOperativo = (formData) => {
        const esEdicion = !!soSeleccionado;
        const metodo = esEdicion ? "PUT" : "POST";
        const url = esEdicion
            ? `${process.env.BACKEND_URL}/api/sistemas_operativos/${soSeleccionado.id}`
            : `${process.env.BACKEND_URL}/api/sistemas_operativos`;

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
                fetchSistemasOperativos();
                handleCloseModal();
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: `Sistema Operativo ${esEdicion ? 'actualizado' : 'creado'} correctamente.`,
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

    const confirmarEliminacion = (so) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación del S.O. "${so.nombre} ${so.version}".`,
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
                fetch(`${process.env.BACKEND_URL}/api/sistemas_operativos/${so.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.text().then(text => text ? JSON.parse(text) : {});
                    })
                    .then(() => {
                        fetchSistemasOperativos();
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'El Sistema Operativo ha sido eliminado.',
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
                            text: error.msg || 'Error al eliminar el S.O.',
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
                    <h1 className="main-title">Gestión de Sistemas Operativos</h1>
                    <p className="subtitle">"Administra las versiones de los sistemas operativos"</p>
                    <button className="crear-btn" onClick={() => handleOpenModal()}>
                        <PlusIcon />
                        Crear S.O.
                    </button>
                    <div className="decorative-line-bottom"></div>
                </div>
            </div>

            <div className="content-area">
                <div className="content-header">
                    <h2 className="content-title">Listado de Sistemas Operativos</h2>
                </div>

                {cargando ? <Loading /> : (
                    <div className="servicio-grid">
                        {sistemasOperativos.length > 0 ? (
                            sistemasOperativos.map((so) => (
                                <div key={so.id} className="servicio-card">
                                    <div className="servicio-card-header">
                                        <strong className="servicio-nombre">{so.nombre}</strong>
                                        <div className="servicio-acciones">
                                            <button className="accion-btn editar-btn" onClick={() => handleOpenModal(so)}>
                                                <EditIcon />
                                            </button>
                                            <button className="accion-btn eliminar-btn" onClick={() => confirmarEliminacion(so)}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="so-version">Versión: {so.version}</p>
                                    <p className="servicio-descripcion">{so.descripcion || 'Sin descripción'}</p>
                                </div>
                            ))
                        ) : (
                            <p>No hay sistemas operativos disponibles.</p>
                        )}
                    </div>
                )}
            </div>

            <SistemaOperativoFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveSistemaOperativo}
                so={soSeleccionado}
                sistemasOperativosExistentes={sistemasOperativos}
            />
        </div>
    );
};

export default SistemaOperativo;
