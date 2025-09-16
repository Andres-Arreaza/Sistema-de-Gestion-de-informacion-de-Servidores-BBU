import React from 'react';
import Swal from 'sweetalert2';
import Loading from './Loading';
import Icon from './Icon';

const AplicacionLista = ({ aplicaciones, onEdit, fetchAplicaciones, cargando }) => {

    const confirmarEliminacion = (aplicacion) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación de la aplicación "${aplicacion.nombre} ${aplicacion.version}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-error)',
            cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/aplicacion/${aplicacion.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.json();
                    })
                    .then(() => {
                        fetchAplicaciones();
                        Swal.fire('¡Eliminada!', 'La aplicación ha sido eliminada.', 'success');
                    })
                    .catch(error => {
                        Swal.fire('Error', error.msg || 'No se pudo eliminar la aplicación.', 'error');
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
                <h2 className="content-title">Listado de Aplicaciones</h2>
            </div>
            <div className="card-grid">
                {aplicaciones && aplicaciones.length > 0 ? (
                    aplicaciones.map((app) => (
                        <article key={app.id} className="card">
                            <div>
                                <header className="card__header">
                                    <h3 className="card__title">{app.nombre}</h3>
                                    <div className="card__actions">
                                        <button className="btn-icon" onClick={() => onEdit(app)} title="Editar"><Icon name="edit" /></button>
                                        <button className="btn-icon" onClick={() => confirmarEliminacion(app)} title="Eliminar"><Icon name="trash" /></button>
                                    </div>
                                </header>
                                <p className="card__subtitle" style={{ color: 'var(--color-texto-secundario)', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>Versión: {app.version}</p>
                                <p className="card__description">{app.descripcion || 'Sin descripción'}</p>
                            </div>
                        </article>
                    ))
                ) : (<p>No hay aplicaciones disponibles.</p>)}
            </div>
        </div>
    );
};

export default AplicacionLista;