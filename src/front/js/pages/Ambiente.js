import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

// --- Iconos SVG ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


export const Ambiente = () => {
    const [ambientes, setAmbientes] = useState([]);

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

    // 🔹 Obtener ambientes desde la API
    const fetchAmbientes = () => {
        fetch(process.env.BACKEND_URL + "/api/ambientes")
            .then(response => response.ok ? response.json() : Promise.reject("Error al obtener ambientes."))
            .then(data => setAmbientes(data))
            .catch(error => console.error("Error al obtener ambientes:", error));
    };

    useEffect(() => {
        fetchAmbientes();
    }, []);

    // 🔹 Función para abrir el modal de creación/edición con SweetAlert2
    const abrirModalFormulario = (ambiente = null) => {
        const esEdicion = ambiente !== null;
        const valorInicialNombre = esEdicion ? ambiente.nombre : '';
        const valorInicialDesc = esEdicion ? ambiente.descripcion : '';

        Swal.fire({
            title: esEdicion ? 'Editar Ambiente' : 'Crear Nuevo Ambiente',
            html: `
                <div class="swal-form-container">
                    <div class="swal-form-group">
                        <label for="swal-nombre">Nombre del ambiente <span class="campo-obligatorio">*</span></label>
                        <input id="swal-nombre" class="swal2-input" placeholder="Ej: Producción" value="${valorInicialNombre}">
                    </div>
                    <div class="swal-form-group">
                         <label for="swal-descripcion">Descripción (Opcional)</label>
                        <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Describe brevemente el ambiente...">${valorInicialDesc}</textarea>
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
                const datosAmbiente = { ...result.value, id: esEdicion ? ambiente.id : null };
                guardarAmbiente(datosAmbiente);
            }
        });
    };

    // 🔹 Función para guardar (crear o actualizar) un ambiente
    const guardarAmbiente = (ambiente) => {
        const metodo = ambiente.id ? "PUT" : "POST";
        const url = ambiente.id
            ? `${process.env.BACKEND_URL}/api/ambientes/${ambiente.id}`
            : `${process.env.BACKEND_URL}/api/ambientes`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: ambiente.nombre, descripcion: ambiente.descripcion }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    mostrarAlerta(data.error, "error");
                } else {
                    fetchAmbientes();
                    mostrarAlerta(ambiente.id ? "Ambiente actualizado" : "Ambiente creado", "success");
                }
            })
            .catch(error => {
                console.error("Error al guardar ambiente:", error);
                mostrarAlerta("Error al guardar el ambiente", "error");
            });
    };

    // 🔹 Función para confirmar y eliminar un ambiente
    const confirmarEliminacion = (ambiente) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación del ambiente "${ambiente.nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
            heightAuto: false,
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/ambientes/${ambiente.id}`, { method: "DELETE" })
                    .then(response => response.json())
                    .then(() => {
                        fetchAmbientes();
                        mostrarAlerta("Ambiente eliminado", "success");
                    })
                    .catch(error => {
                        console.error("Error al eliminar ambiente:", error);
                        mostrarAlerta("Error al eliminar el ambiente", "error");
                    });
            }
        });
    };

    return (
        <div className="page-container">
            <div className="hero-section">
                <div className="title-section">
                    <div className="decorative-line-top"></div>
                    <h1 className="main-title">Gestión de Ambientes</h1>
                    <p className="subtitle">"Administra los entornos de tus servidores"</p>
                    <button className="crear-btn" onClick={() => abrirModalFormulario()}>
                        <PlusIcon />
                        Crear Ambiente
                    </button>
                    <div className="decorative-line-bottom"></div>
                </div>
            </div>

            <div className="content-area">
                <div className="content-header">
                    <h2 className="content-title">Listado de Ambientes</h2>
                </div>

                <div className="servicio-grid">
                    {ambientes.length > 0 ? (
                        ambientes.map((ambiente) => (
                            <div key={ambiente.id} className="servicio-card">
                                <div className="servicio-card-header">
                                    <strong className="servicio-nombre">{ambiente.nombre}</strong>
                                    <div className="servicio-acciones">
                                        <button className="accion-btn editar-btn" onClick={() => abrirModalFormulario(ambiente)}>
                                            <EditIcon />
                                        </button>
                                        <button className="accion-btn eliminar-btn" onClick={() => confirmarEliminacion(ambiente)}>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                                <p className="servicio-descripcion">{ambiente.descripcion}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay ambientes disponibles.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Ambiente;
