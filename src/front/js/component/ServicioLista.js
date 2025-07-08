import React from 'react';
import Swal from 'sweetalert2';
import Loading from './Loading'; // Asegúrate que la ruta es correcta

// --- Iconos para los botones de acción ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

/**
 * Componente para mostrar la lista de servicios.
 * Es un componente "tonto" que recibe todos sus datos y funciones a través de props.
 * @param {object} props - Propiedades del componente.
 * @param {array} props.servicios - La lista de servicios a mostrar.
 * @param {function} props.onEdit - Función a llamar cuando se hace clic en el botón de editar.
 * @param {function} props.fetchServicios - Función para recargar la lista de servicios después de eliminar.
 * @param {boolean} props.cargando - Indica si los datos se están cargando.
 */
const ServicioLista = ({ servicios, onEdit, fetchServicios, cargando }) => {

    // Función para confirmar y manejar la eliminación de un servicio
    const confirmarEliminacion = (servicio) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación del servicio "${servicio.nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/servicios/${servicio.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.text().then(text => text ? JSON.parse(text) : {});
                    })
                    .then(() => {
                        fetchServicios(); // Llama a la función del padre para recargar la lista
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'El servicio ha sido eliminado.',
                            timer: 2500,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error de Eliminación',
                            text: error.msg || 'Error al eliminar el servicio.',
                            timer: 2500,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                    });
            }
        });
    };

    // Muestra el componente de carga si el padre lo indica
    if (cargando) return <Loading />;

    return (
        <div className="list-container">
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
                                    {/* CORRECCIÓN CLAVE: Llama a la función onEdit pasada por props */}
                                    <button className="accion-btn editar-btn" onClick={() => onEdit(servicio)}>
                                        <EditIcon />
                                    </button>
                                    <button className="accion-btn eliminar-btn" onClick={() => confirmarEliminacion(servicio)}>
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                            <p className="servicio-descripcion">{servicio.descripcion || 'Sin descripción'}</p>
                        </div>
                    ))
                ) : (
                    <p>No hay servicios disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default ServicioLista;
