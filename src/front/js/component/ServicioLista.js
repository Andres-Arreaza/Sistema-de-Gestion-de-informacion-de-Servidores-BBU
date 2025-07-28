import React from 'react';
import Swal from 'sweetalert2';
import Loading from './Loading';
import Icon from './Icon'; // Asegúrate de tener un componente Icon.js

const ServicioLista = ({ servicios, onEdit, fetchServicios, cargando }) => {

    const confirmarEliminacion = (servicio) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación del servicio "${servicio.nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-error)',
            cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/servicios/${servicio.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.json();
                    })
                    .then(() => {
                        fetchServicios();
                        Swal.fire('¡Eliminado!', 'El servicio ha sido eliminado.', 'success');
                    })
                    .catch(error => {
                        Swal.fire('Error', error.msg || 'No se pudo eliminar el servicio.', 'error');
                    });
            }
        });
    };

    if (cargando) {
        return <Loading />;
    }

    return (
        <div className="catalog-list">
            <div className="content-header">
                <h2 className="content-title">Listado de Servicios</h2>
            </div>
            <div className="card-grid">
                {servicios.length > 0 ? (
                    servicios.map((servicio) => (
                        <article key={servicio.id} className="card">
                            <div>
                                <header className="card__header">
                                    <h3 className="card__title">{servicio.nombre}</h3>
                                    <div className="card__actions">
                                        <button className="btn-icon" onClick={() => onEdit(servicio)} title="Editar">
                                            <Icon name="edit" />
                                        </button>
                                        <button className="btn-icon" onClick={() => confirmarEliminacion(servicio)} title="Eliminar">
                                            <Icon name="trash" />
                                        </button>
                                    </div>
                                </header>
                                <p className="card__description">{servicio.descripcion || 'Sin descripción'}</p>
                            </div>
                        </article>
                    ))
                ) : (
                    <p>No hay servicios disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default ServicioLista;
