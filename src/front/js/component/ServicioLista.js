import React from 'react';
import Swal from 'sweetalert2';
import Loading from './Loading'; // Asegúrate que la ruta es correcta
import { useNavigate } from 'react-router-dom';

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

const ServicioLista = ({ servicios, onEdit, fetchServicios, cargando }) => {
    const navigate = useNavigate();

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
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/servicios/${servicio.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.text().then(text => text ? JSON.parse(text) : {});
                    })
                    .then(() => {
                        fetchServicios(); // Llama a la función del padre para recargar la lista
                        Swal.fire('Eliminado', 'El servicio ha sido eliminado.', 'success');
                    })
                    .catch(error => {
                        Swal.fire('Error de Eliminación', error.msg || 'Error al eliminar el servicio.', 'error');
                    });
            }
        });
    };

    if (cargando) return <Loading />;

    return (
        <div className="list-container">
            <div className="content-header">
                <h2 className="content-title">Listado de Servicios</h2>
            </div>
            <div className="servicio-grid">
                {servicios && servicios.length > 0 ? (
                    servicios.map((servicio) => (
                        <div key={servicio.id} className="servicio-card">
                            <div className="servicio-card-header">
                                <strong className="servicio-nombre">{servicio.nombre}</strong>
                                <div className="servicio-acciones">
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
