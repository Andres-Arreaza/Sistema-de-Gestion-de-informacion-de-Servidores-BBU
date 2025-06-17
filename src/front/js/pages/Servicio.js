import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

// --- Iconos SVG ---
const PlusIcon = () => {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
};
const EditIcon = () => {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
};
const TrashIcon = () => {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
};


export const Servicio = () => {
    const [servicios, setServicios] = useState([]);

    // 🔹 Función para mostrar alertas con SweetAlert2
    const mostrarAlerta = (mensaje, tipo) => {
        Swal.fire({
            position: 'center',
            icon: tipo,
            title: mensaje,
            showConfirmButton: false,
            timer: 2000,
            heightAuto: false // Evita que SweetAlert deshabilite el scroll
        });
    };

    // 🔹 Obtener servicios desde la API
    const fetchServicios = () => {
        fetch(process.env.BACKEND_URL + "/api/servicios")
            .then(response => response.ok ? response.json() : Promise.reject("Error al obtener servicios."))
            .then(data => setServicios(data))
            .catch(error => console.error("Error al obtener servicios:", error));
    };

    useEffect(() => {
        fetchServicios();
    }, []);

    // 🔹 Función para abrir el modal de creación/edición con SweetAlert2
    const abrirModalFormulario = (servicio = null) => {
        const esEdicion = servicio !== null;
        const valorInicialNombre = esEdicion ? servicio.nombre : '';
        const valorInicialDesc = esEdicion ? servicio.descripcion : '';

        Swal.fire({
            title: esEdicion ? 'Editar Servicio' : 'Crear Nuevo Servicio',
            html: `
                <div class="swal-form-container">
                    <div class="swal-form-group">
                        <label for="swal-nombre">Nombre del servicio <span class="campo-obligatorio">*</span></label>
                        <input id="swal-nombre" class="swal2-input" placeholder="Ej: API Gateway" value="${valorInicialNombre}">
                    </div>
                    <div class="swal-form-group">
                         <label for="swal-descripcion">Descripción (Opcional)</label>
                        <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Describe brevemente el servicio...">${valorInicialDesc}</textarea>
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

                // 1. Validación de campo obligatorio y que no contenga solo espacios
                if (!nombre.trim()) {
                    nombreInput.classList.add('swal-input-error');
                    Swal.showValidationMessage(`El campo "Nombre" es obligatorio.`);
                    return false;
                } else {
                    nombreInput.classList.remove('swal-input-error');
                }

                // 2. Validación para nombre duplicado
                const nombreNormalizado = nombre.trim().toLowerCase();
                const servicioExistente = servicios.find(
                    s => s.nombre.toLowerCase() === nombreNormalizado && s.id !== servicio?.id
                );
                if (servicioExistente) {
                    nombreInput.classList.add('swal-input-error');
                    Swal.showValidationMessage(`El servicio "${nombre}" ya existe.`);
                    return false;
                }

                // 3. Validación de cambios en modo edición
                if (esEdicion && nombre.trim() === valorInicialNombre.trim() && descripcion.trim() === valorInicialDesc.trim()) {
                    Swal.showValidationMessage(`No se han realizado cambios.`);
                    return false;
                }

                return { nombre: nombre.trim(), descripcion: descripcion.trim() };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const datosServicio = { ...result.value, id: esEdicion ? servicio.id : null };
                guardarServicio(datosServicio);
            }
        });
    };

    // 🔹 Función para guardar (crear o actualizar) un servicio
    const guardarServicio = (servicio) => {
        const metodo = servicio.id ? "PUT" : "POST";
        const url = servicio.id
            ? `${process.env.BACKEND_URL}/api/servicios/${servicio.id}`
            : `${process.env.BACKEND_URL}/api/servicios`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: servicio.nombre, descripcion: servicio.descripcion }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    mostrarAlerta(data.error, "error");
                } else {
                    fetchServicios();
                    mostrarAlerta(servicio.id ? "Servicio actualizado" : "Servicio creado", "success");
                }
            })
            .catch(error => {
                console.error("Error al guardar servicio:", error);
                mostrarAlerta("Error al guardar el servicio", "error");
            });
    };

    // 🔹 Función para confirmar y eliminar un servicio (SIN VALIDACIÓN DE USO)
    const confirmarEliminacion = (servicio) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación del servicio "${servicio.nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
            heightAuto: false,
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/servicios/${servicio.id}`, { method: "DELETE" })
                    .then(response => {
                        // Se verifica si la respuesta es OK, ya que un DELETE exitoso puede no tener cuerpo
                        if (response.ok) {
                            return response.text().then(text => text ? JSON.parse(text) : {});
                        }
                        return response.json().then(err => Promise.reject(err));
                    })
                    .then(() => {
                        fetchServicios();
                        mostrarAlerta("Servicio eliminado", "success");
                    })
                    .catch(error => {
                        console.error("Error al eliminar servicio:", error);
                        const errorMessage = error.error || "Error al eliminar el servicio.";
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
                    <h1 className="main-title">Gestión de Servicios</h1>
                    <p className="subtitle">"Administra los servicios"</p>
                    <button className="crear-btn" onClick={() => abrirModalFormulario()}>
                        <PlusIcon />
                        Crear Servicio
                    </button>
                    <div className="decorative-line-bottom"></div>
                </div>
            </div>

            <div className="content-area">
                <div className="content-header">
                    <h2 className="content-title">Listado de Servicios</h2>
                </div>

                <div className="servicio-grid">
                    {servicios.length > 0 ? (
                        servicios.map((servicio) => (
                            <div key={servicio.id} className="servicio-card">
                                <div className="servicio-card-header">
                                    <strong className="servicio-nombre">{servicio.nombre}</strong>
                                    <div className="servicio-acciones">
                                        <button className="accion-btn editar-btn" onClick={() => abrirModalFormulario(servicio)}>
                                            <EditIcon />
                                        </button>
                                        <button className="accion-btn eliminar-btn" onClick={() => confirmarEliminacion(servicio)}>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                                <p className="servicio-descripcion">{servicio.descripcion}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay servicios disponibles.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Servicio;
