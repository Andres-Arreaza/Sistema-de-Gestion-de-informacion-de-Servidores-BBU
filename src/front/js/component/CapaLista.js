import React from 'react';
import Swal from 'sweetalert2';
import Loading from './Loading';

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

// CAMBIO: Se añade 'cargando' a las props
const CapaLista = ({ capas, onEdit, fetchCapas, cargando }) => {

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
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/capas/${capa.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.text().then(text => text ? JSON.parse(text) : {});
                    })
                    .then(() => {
                        fetchCapas();
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminada',
                            text: 'La capa ha sido eliminada.',
                            timer: 2500,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error de Eliminación',
                            text: error.msg || 'Error al eliminar la capa.',
                            timer: 2500,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                    });
            }
        });
    };

    // CAMBIO: Se añade un indicador de carga
    if (cargando) {
        return <Loading />;
    }

    return (
        <div className="list-container">
            <div className="content-header">
                <h2 className="content-title">Listado de Capas</h2>
            </div>
            <div className="servicio-grid">
                {capas && capas.length > 0 ? (
                    capas.map((capa) => (
                        <div key={capa.id} className="servicio-card">
                            <div className="servicio-card-header">
                                <strong className="servicio-nombre">{capa.nombre}</strong>
                                <div className="servicio-acciones">
                                    <button className="accion-btn editar-btn" onClick={() => onEdit(capa)}>
                                        <EditIcon />
                                    </button>
                                    <button className="accion-btn eliminar-btn" onClick={() => confirmarEliminacion(capa)}>
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                            <p className="servicio-descripcion">{capa.descripcion || 'Sin descripción'}</p>
                        </div>
                    ))
                ) : (
                    <p>No hay capas disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default CapaLista;
