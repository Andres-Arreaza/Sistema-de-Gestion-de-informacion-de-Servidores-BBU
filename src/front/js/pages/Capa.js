import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";


// --- Iconos SVG ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


export const Capa = () => {
    const [capas, setCapas] = useState([]);

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

    // 🔹 Obtener capas desde la API
    const fetchCapas = () => {
        fetch(process.env.BACKEND_URL + "/api/capas")
            .then(response => response.ok ? response.json() : Promise.reject("Error al obtener capas."))
            .then(data => setCapas(data))
            .catch(error => console.error("Error al obtener capas:", error));
    };

    useEffect(() => {
        fetchCapas();
    }, []);

    // 🔹 Función para abrir el modal de creación/edición con SweetAlert2
    const abrirModalFormulario = (capa = null) => {
        const esEdicion = capa !== null;
        const valorInicialNombre = esEdicion ? capa.nombre : '';
        const valorInicialDesc = esEdicion ? capa.descripcion : '';

        Swal.fire({
            title: esEdicion ? 'Editar Capa' : 'Crear Nueva Capa',
            html: `
                <div class="swal-form-container">
                    <div class="swal-form-group">
                        <label for="swal-nombre">Nombre de la capa <span class="campo-obligatorio">*</span></label>
                        <input id="swal-nombre" class="swal2-input" placeholder="Ej: Frontend" value="${valorInicialNombre}">
                    </div>
                    <div class="swal-form-group">
                         <label for="swal-descripcion">Descripción (Opcional)</label>
                        <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Describe brevemente la capa...">${valorInicialDesc}</textarea>
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

                if (esEdicion && nombre.trim() === valorInicialNombre.trim() && descripcion.trim() === valorInicialDesc.trim()) {
                    Swal.showValidationMessage(`No se han realizado cambios.`);
                    return false;
                }

                return { nombre: nombre.trim(), descripcion: descripcion.trim() };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const datosCapa = { ...result.value, id: esEdicion ? capa.id : null };
                guardarCapa(datosCapa);
            }
        });
    };

    // 🔹 Función para guardar (crear o actualizar) una capa
    const guardarCapa = (capa) => {
        const metodo = capa.id ? "PUT" : "POST";
        const url = capa.id
            ? `${process.env.BACKEND_URL}/api/capas/${capa.id}`
            : `${process.env.BACKEND_URL}/api/capas`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: capa.nombre, descripcion: capa.descripcion }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    mostrarAlerta(data.error, "error");
                } else {
                    fetchCapas();
                    mostrarAlerta(capa.id ? "Capa actualizada" : "Capa creada", "success");
                }
            })
            .catch(error => {
                console.error("Error al guardar capa:", error);
                mostrarAlerta("Error al guardar la capa", "error");
            });
    };

    // 🔹 Función para confirmar y eliminar una capa
    const confirmarEliminacion = (capa) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación de la capa "${capa.nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
            heightAuto: false,
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/capas/${capa.id}`, { method: "DELETE" })
                    .then(response => response.json())
                    .then(() => {
                        fetchCapas();
                        mostrarAlerta("Capa eliminada", "success");
                    })
                    .catch(error => {
                        console.error("Error al eliminar capa:", error);
                        mostrarAlerta("Error al eliminar la capa", "error");
                    });
            }
        });
    };

    return (
        <div className="page-container">
            <div className="hero-section">
                <div className="title-section">
                    <div className="decorative-line-top"></div>
                    <h1 className="main-title">Gestión de Capas</h1>
                    <p className="subtitle">"Define las capas de tu infraestructura"</p>
                    <button className="crear-btn" onClick={() => abrirModalFormulario()}>
                        <PlusIcon />
                        Crear Capa
                    </button>
                    <div className="decorative-line-bottom"></div>
                </div>
            </div>

            <div className="content-area">
                <div className="content-header">
                    <h2 className="content-title">Listado de Capas</h2>
                </div>

                <div className="servicio-grid">
                    {capas.length > 0 ? (
                        capas.map((capa) => (
                            <div key={capa.id} className="servicio-card">
                                <div className="servicio-card-header">
                                    <strong className="servicio-nombre">{capa.nombre}</strong>
                                    <div className="servicio-acciones">
                                        <button className="accion-btn editar-btn" onClick={() => abrirModalFormulario(capa)}>
                                            <EditIcon />
                                        </button>
                                        <button className="accion-btn eliminar-btn" onClick={() => confirmarEliminacion(capa)}>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                                <p className="servicio-descripcion">{capa.descripcion}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay capas disponibles.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Capa;
