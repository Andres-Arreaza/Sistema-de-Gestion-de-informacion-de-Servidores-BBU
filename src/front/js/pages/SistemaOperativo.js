import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Loading from "../component/Loading";
import SistemaOperativoFormulario from "../component/SistemaOperativoFormulario";
import Icon from "../component/Icon";

const SistemaOperativo = () => {
    const [sistemasOperativos, setSistemasOperativos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [soSeleccionado, setSoSeleccionado] = useState(null);

    useEffect(() => {
        document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
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
                    timer: 2000,
                    showConfirmButton: false,
                });
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al Guardar',
                    text: error.msg || 'No se pudo completar la operación.',
                });
            });
    };

    const confirmarEliminacion = (so) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación del S.O. "${so.nombre} ${so.version}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-error)',
            cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/sistemas_operativos/${so.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.json();
                    })
                    .then(() => {
                        fetchSistemasOperativos();
                        Swal.fire('¡Eliminado!', 'El Sistema Operativo ha sido eliminado.', 'success');
                    })
                    .catch(error => {
                        Swal.fire('Error', error.msg || 'Error al eliminar el S.O.', 'error');
                    });
            }
        });
    };

    return (
        <div className="page-container">
            <section className="hero">
                <div className="hero__content">
                    <h1 className="hero__title">Gestión de Sistemas Operativos</h1>
                    <p className="hero__subtitle">Administra las versiones de los sistemas operativos</p>
                    <button className="btn btn--primary" onClick={() => handleOpenModal()} style={{ marginTop: '1rem' }}>
                        <Icon name="plus-circle" />
                        Crear S.O.
                    </button>
                </div>
            </section>

            <main className="main-content-area">
                <div className="catalog-list">
                    <div className="content-header">
                        <h2 className="content-title">Listado de Sistemas Operativos</h2>
                    </div>
                    {cargando ? <Loading /> : (
                        <div className="card-grid">
                            {sistemasOperativos.length > 0 ? (
                                sistemasOperativos.map((so) => (
                                    <article key={so.id} className="card">
                                        <div>
                                            <header className="card__header">
                                                <h3 className="card__title">{so.nombre}</h3>
                                                <div className="card__actions">
                                                    <button className="btn-icon" onClick={() => handleOpenModal(so)} title="Editar">
                                                        <Icon name="edit" />
                                                    </button>
                                                    <button className="btn-icon" onClick={() => confirmarEliminacion(so)} title="Eliminar">
                                                        <Icon name="trash" />
                                                    </button>
                                                </div>
                                            </header>
                                            <p className="card__subtitle" style={{ color: 'var(--color-texto-secundario)', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                                                Versión: {so.version}
                                            </p>
                                            <p className="card__description">{so.descripcion || 'Sin descripción'}</p>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <p>No hay sistemas operativos disponibles.</p>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <div className="modal__overlay" onClick={handleCloseModal}>
                    <SistemaOperativoFormulario
                        onSave={handleSaveSistemaOperativo}
                        onCancel={handleCloseModal}
                        sistemaOperativo={soSeleccionado}
                        sistemasOperativosExistentes={sistemasOperativos}
                    />
                </div>
            )}
        </div>
    );
};

export default SistemaOperativo;
