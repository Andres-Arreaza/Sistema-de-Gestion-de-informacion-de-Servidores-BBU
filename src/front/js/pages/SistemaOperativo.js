import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

// --- Iconos SVG ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


export const SistemaOperativo = () => {
    const [sistemasOperativos, setSistemasOperativos] = useState([]);

    // 🔹 Función para mostrar alertas con SweetAlert2
    const mostrarAlerta = (mensaje, tipo) => {
        Swal.fire({
            position: 'center',
            icon: tipo,
            title: mensaje,
            showConfirmButton: false,
            timer: 2000,
            heightAuto: false
        });
    };

    // 🔹 Obtener sistemas operativos desde la API
    const fetchSistemasOperativos = () => {
        fetch(process.env.BACKEND_URL + "/api/sistemas_operativos")
            .then(response => response.ok ? response.json() : Promise.reject("Error al obtener S.O."))
            .then(data => setSistemasOperativos(data))
            .catch(error => console.error("Error al obtener S.O.:", error));
    };

    useEffect(() => {
        fetchSistemasOperativos();
    }, []);

    // 🔹 Función para abrir el modal de creación/edición con SweetAlert2
    const abrirModalFormulario = (so = null) => {
        const esEdicion = so !== null;
        const valorInicialNombre = esEdicion ? so.nombre : '';
        const valorInicialVersion = esEdicion ? so.version : '';
        const valorInicialDesc = esEdicion ? so.descripcion : '';

        Swal.fire({
            title: esEdicion ? 'Editar Sistema Operativo' : 'Crear Nuevo Sistema Operativo',
            html: `
                <div class="swal-form-container">
                    <div class="swal-form-group">
                        <label for="swal-nombre">Nombre <span class="campo-obligatorio">*</span></label>
                        <input id="swal-nombre" class="swal2-input" placeholder="Ej: Windows Server" value="${valorInicialNombre}">
                    </div>
                    <div class="swal-form-group">
                        <label for="swal-version">Versión <span class="campo-obligatorio">*</span></label>
                        <input id="swal-version" class="swal2-input" placeholder="Ej: 2019" value="${valorInicialVersion}">
                    </div>
                    <div class="swal-form-group">
                         <label for="swal-descripcion">Descripción (Opcional)</label>
                        <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Describe brevemente el S.O...">${valorInicialDesc}</textarea>
                    </div>
                </div>
            `,
            confirmButtonText: 'Guardar',
            confirmButtonColor: 'var(--primary-color, #007953)',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            focusConfirm: false,
            heightAuto: false,
            customClass: {
                popup: 'swal-wide'
            },
            preConfirm: () => {
                const nombreInput = Swal.getPopup().querySelector('#swal-nombre');
                const versionInput = Swal.getPopup().querySelector('#swal-version');
                const descripcionInput = Swal.getPopup().querySelector('#swal-descripcion');

                const nombre = nombreInput.value;
                const version = versionInput.value;
                const descripcion = descripcionInput.value;

                if (!nombre.trim() || !version.trim()) {
                    if (!nombre.trim()) nombreInput.classList.add('swal-input-error'); else nombreInput.classList.remove('swal-input-error');
                    if (!version.trim()) versionInput.classList.add('swal-input-error'); else versionInput.classList.remove('swal-input-error');

                    Swal.showValidationMessage(`Los campos "Nombre" y "Versión" son obligatorios.`);
                    return false;
                } else {
                    nombreInput.classList.remove('swal-input-error');
                    versionInput.classList.remove('swal-input-error');
                }

                const nombreNormalizado = nombre.trim().toLowerCase();
                const versionNormalizada = version.trim().toLowerCase();
                const soExistente = sistemasOperativos.find(
                    s => s.nombre.toLowerCase() === nombreNormalizado && s.version.toLowerCase() === versionNormalizada && s.id !== so?.id
                );
                if (soExistente) {
                    nombreInput.classList.add('swal-input-error');
                    versionInput.classList.add('swal-input-error');
                    Swal.showValidationMessage(`El sistema operativo "${nombre} ${version}" ya existe.`);
                    return false;
                }

                if (esEdicion && nombre.trim() === valorInicialNombre.trim() && version.trim() === valorInicialVersion.trim() && descripcion.trim() === valorInicialDesc.trim()) {
                    Swal.showValidationMessage(`No se han realizado cambios.`);
                    return false;
                }

                return { nombre: nombre.trim(), version: version.trim(), descripcion: descripcion.trim() };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const datosSO = { ...result.value, id: esEdicion ? so.id : null };
                guardarSistemaOperativo(datosSO);
            }
        });
    };

    // 🔹 Función para guardar (crear o actualizar) un S.O.
    const guardarSistemaOperativo = (so) => {
        const metodo = so.id ? "PUT" : "POST";
        const url = so.id
            ? `${process.env.BACKEND_URL}/api/sistemas_operativos/${so.id}`
            : `${process.env.BACKEND_URL}/api/sistemas_operativos`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: so.nombre, version: so.version, descripcion: so.descripcion }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    mostrarAlerta(data.error, "error");
                } else {
                    fetchSistemasOperativos();
                    mostrarAlerta(so.id ? "Sistema Operativo actualizado" : "Sistema Operativo creado", "success");
                }
            })
            .catch(error => {
                console.error("Error al guardar S.O.:", error);
                mostrarAlerta("Error al guardar el S.O.", "error");
            });
    };

    // 🔹 Función para confirmar y eliminar un S.O.
    const confirmarEliminacion = (so) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación del S.O. "${so.nombre} ${so.version}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
            heightAuto: false,
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/sistemas_operativos/${so.id}`, { method: "DELETE" })
                    .then(response => {
                        if (response.ok) {
                            return response.text().then(text => text ? JSON.parse(text) : {});
                        }
                        return response.json().then(err => Promise.reject(err));
                    })
                    .then(() => {
                        fetchSistemasOperativos();
                        mostrarAlerta("Sistema Operativo eliminado", "success");
                    })
                    .catch(error => {
                        console.error("Error al eliminar S.O.:", error);
                        const errorMessage = error.error || "Error al eliminar el S.O.";
                        mostrarAlerta(errorMessage, "error");
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
                    <button className="crear-btn" onClick={() => abrirModalFormulario()}>
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

                <div className="servicio-grid">
                    {sistemasOperativos.length > 0 ? (
                        sistemasOperativos.map((so) => (
                            <div key={so.id} className="servicio-card">
                                <div className="servicio-card-header">
                                    <strong className="servicio-nombre">{so.nombre}</strong>
                                    <div className="servicio-acciones">
                                        <button className="accion-btn editar-btn" onClick={() => abrirModalFormulario(so)}>
                                            <EditIcon />
                                        </button>
                                        <button className="accion-btn eliminar-btn" onClick={() => confirmarEliminacion(so)}>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                                <p className="so-version">Versión: {so.version}</p>
                                <p className="servicio-descripcion">{so.descripcion}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay sistemas operativos disponibles.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SistemaOperativo;
