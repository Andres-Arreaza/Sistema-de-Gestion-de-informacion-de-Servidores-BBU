import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

// --- Iconos SVG ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


export const Dominio = () => {
    const [dominios, setDominios] = useState([]);

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

    // 🔹 Obtener dominios desde la API
    const fetchDominios = () => {
        fetch(process.env.BACKEND_URL + "/api/dominios")
            .then(response => response.ok ? response.json() : Promise.reject("Error al obtener dominios."))
            .then(data => setDominios(data))
            .catch(error => console.error("Error al obtener dominios:", error));
    };

    useEffect(() => {
        fetchDominios();
    }, []);

    // 🔹 Función para abrir el modal de creación/edición con SweetAlert2
    const abrirModalFormulario = (dominio = null) => {
        const esEdicion = dominio !== null;
        const valorInicialNombre = esEdicion ? dominio.nombre : '';
        const valorInicialDesc = esEdicion ? dominio.descripcion : '';

        Swal.fire({
            title: esEdicion ? 'Editar Dominio' : 'Crear Nuevo Dominio',
            html: `
                <div class="swal-form-container">
                    <div class="swal-form-group">
                        <label for="swal-nombre">Nombre del dominio <span class="campo-obligatorio">*</span></label>
                        <input id="swal-nombre" class="swal2-input" placeholder="Ej: banesco.com" value="${valorInicialNombre}">
                    </div>
                    <div class="swal-form-group">
                         <label for="swal-descripcion">Descripción (Opcional)</label>
                        <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Describe brevemente el dominio...">${valorInicialDesc}</textarea>
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
                const descripcionInput = Swal.getPopup().querySelector('#swal-descripcion');
                const nombre = nombreInput.value;
                const descripcion = descripcionInput.value;

                if (!nombre.trim()) {
                    nombreInput.classList.add('swal-input-error');
                    Swal.showValidationMessage(`El campo "Nombre" es obligatorio.`);
                    return false;
                } else {
                    nombreInput.classList.remove('swal-input-error');
                }

                const nombreNormalizado = nombre.trim().toLowerCase();
                const dominioExistente = dominios.find(
                    d => d.nombre.toLowerCase() === nombreNormalizado && d.id !== dominio?.id
                );
                if (dominioExistente) {
                    nombreInput.classList.add('swal-input-error');
                    Swal.showValidationMessage(`El dominio "${nombre}" ya existe.`);
                    return false;
                }

                if (esEdicion && nombre.trim() === valorInicialNombre.trim() && descripcion.trim() === valorInicialDesc.trim()) {
                    Swal.showValidationMessage(`No se han realizado cambios.`);
                    return false;
                }

                return { nombre: nombre.trim(), descripcion: descripcion.trim() };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const datosDominio = { ...result.value, id: esEdicion ? dominio.id : null };
                guardarDominio(datosDominio);
            }
        });
    };

    // 🔹 Función para guardar (crear o actualizar) un dominio
    const guardarDominio = (dominio) => {
        const metodo = dominio.id ? "PUT" : "POST";
        const url = dominio.id
            ? `${process.env.BACKEND_URL}/api/dominios/${dominio.id}`
            : `${process.env.BACKEND_URL}/api/dominios`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: dominio.nombre, descripcion: dominio.descripcion }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    mostrarAlerta(data.error, "error");
                } else {
                    fetchDominios();
                    mostrarAlerta(dominio.id ? "Dominio actualizado" : "Dominio creado", "success");
                }
            })
            .catch(error => {
                console.error("Error al guardar dominio:", error);
                mostrarAlerta("Error al guardar el dominio", "error");
            });
    };

    // 🔹 Función para confirmar y eliminar un dominio
    const confirmarEliminacion = (dominio) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación del dominio "${dominio.nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
            heightAuto: false,
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/dominios/${dominio.id}`, { method: "DELETE" })
                    .then(response => {
                        if (response.ok) {
                            return response.text().then(text => text ? JSON.parse(text) : {});
                        }
                        return response.json().then(err => Promise.reject(err));
                    })
                    .then(() => {
                        fetchDominios();
                        mostrarAlerta("Dominio eliminado", "success");
                    })
                    .catch(error => {
                        console.error("Error al eliminar dominio:", error);
                        const errorMessage = error.error || "Error al eliminar el dominio.";
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
                    <h1 className="main-title">Gestión de Dominios</h1>
                    <p className="subtitle">"Administra los dominios de la infraestructura"</p>
                    <button className="crear-btn" onClick={() => abrirModalFormulario()}>
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

                <div className="servicio-grid">
                    {dominios.length > 0 ? (
                        dominios.map((dominio) => (
                            <div key={dominio.id} className="servicio-card">
                                <div className="servicio-card-header">
                                    <strong className="servicio-nombre">{dominio.nombre}</strong>
                                    <div className="servicio-acciones">
                                        <button className="accion-btn editar-btn" onClick={() => abrirModalFormulario(dominio)}>
                                            <EditIcon />
                                        </button>
                                        <button className="accion-btn eliminar-btn" onClick={() => confirmarEliminacion(dominio)}>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                                <p className="servicio-descripcion">{dominio.descripcion}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay dominios disponibles.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dominio;
