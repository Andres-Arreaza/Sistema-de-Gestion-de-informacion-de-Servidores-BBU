import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ServidorFormulario from "../component/ServidorFormulario";
import ServidorCargaMasiva from "../component/ServidorCargaMasiva";
import Icon from "../component/Icon"; // Asegúrate de tener el componente Icon.js

const Servidor = () => {
    const [modalCrearVisible, setModalCrearVisible] = useState(false);
    const [modalCargaVisible, setModalCargaVisible] = useState(false);

    // Efecto para controlar el scroll del body cuando un modal está abierto
    useEffect(() => {
        const isModalOpen = modalCrearVisible || modalCargaVisible;
        document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';

        return () => {
            document.body.style.overflow = 'auto'; // Limpieza al desmontar
        };
    }, [modalCrearVisible, modalCargaVisible]);

    const handleSuccess = () => {
        // La notificación de éxito se maneja dentro de ServidorFormulario.
        // Esta función ahora solo sirve para refrescar el estado si fuera necesario en el futuro.
    };

    const handleUploadSuccess = (mensaje) => {
        handleSuccess(mensaje);
        setModalCargaVisible(false); // Cierra el modal de carga al finalizar
    };

    return (
        <div className="page-container">
            <section className="hero">
                <div className="hero__content">
                    <h1 className="hero__title">Gestión de Servidores</h1>
                    <p className="hero__subtitle">Crea servidores de forma individual o mediante carga masiva.</p>
                </div>
            </section>

            <main className="main-content-actions">
                <div className="actions-section">
                    {/* Tarjeta de Acción: Crear Servidor */}
                    <article className="action-card" onClick={() => setModalCrearVisible(true)}>
                        <div>
                            <div className="card__icon">
                                <Icon name="plus-circle" size={48} />
                            </div>
                            <h3 className="card__title">Crear Servidor</h3>
                            <p className="card__description">Añade un nuevo servidor a la infraestructura completando el formulario de manera individual.</p>
                        </div>
                        <footer className="card__footer">
                            <span className="btn btn--primary">Crear Individualmente</span>
                        </footer>
                    </article>

                    {/* Tarjeta de Acción: Carga Masiva */}
                    <article className="action-card" onClick={() => setModalCargaVisible(true)}>
                        <div>
                            <div className="card__icon">
                                <Icon name="upload-cloud" size={48} />
                            </div>
                            <h3 className="card__title">Carga Masiva</h3>
                            <p className="card__description">Sube un archivo CSV para registrar múltiples servidores de forma simultánea y eficiente.</p>
                        </div>
                        <footer className="card__footer">
                            <span className="btn btn--primary">Realizar Carga Masiva</span>
                        </footer>
                    </article>
                </div>
            </main>

            {/* Modal para el formulario de creación de servidor */}
            {modalCrearVisible && (
                <div className="modal__overlay" onClick={() => setModalCrearVisible(false)}>
                    <div className="modal__content modal-content-servidor" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">Crear Nuevo Servidor</h2>
                            {/* =====> AQUÍ ESTÁ LA MODIFICACIÓN <===== */}
                            <button onClick={() => setModalCrearVisible(false)} className="btn-close" />
                        </div>
                        <div className="modal__body">
                            <ServidorFormulario
                                setModalVisible={setModalCrearVisible}
                                onSuccess={handleSuccess}
                                esEdicion={false}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para la carga masiva */}
            {modalCargaVisible && (
                <ServidorCargaMasiva
                    onClose={() => setModalCargaVisible(false)}
                    actualizarServidores={handleUploadSuccess}
                />
            )}
        </div>
    );
};

export default Servidor;
