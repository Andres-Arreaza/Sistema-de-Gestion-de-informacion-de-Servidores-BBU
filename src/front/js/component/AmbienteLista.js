import React from 'react';
import Swal from 'sweetalert2';
import Loading from './Loading';
import Icon from './Icon'; // Suponiendo que has creado un componente Icon.js

const AmbienteLista = ({ ambientes, onEdit, fetchAmbientes, cargando }) => {

    const confirmarEliminacion = (ambiente) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación del ambiente "${ambiente.nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-error)',
            cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/ambientes/${ambiente.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.json();
                    })
                    .then(() => {
                        fetchAmbientes();
                        Swal.fire('¡Eliminado!', 'El ambiente ha sido eliminado.', 'success');
                    })
                    .catch(error => {
                        Swal.fire('Error', error.msg || 'No se pudo eliminar el ambiente.', 'error');
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
                <h2 className="content-title">Listado de Ambientes</h2>
            </div>
            <div className="card-grid">
                {ambientes && ambientes.length > 0 ? (
                    ambientes.map((ambiente) => (
                        <article key={ambiente.id} className="card">
                            <div>
                                <header className="card__header">
                                    <h3 className="card__title">{ambiente.nombre}</h3>
                                    <div className="card__actions">
                                        <button className="btn-icon" onClick={() => onEdit(ambiente)} title="Editar">
                                            <Icon name="edit" />
                                        </button>
                                        <button className="btn-icon" onClick={() => confirmarEliminacion(ambiente)} title="Eliminar">
                                            <Icon name="trash" />
                                        </button>
                                    </div>
                                </header>
                                <p className="card__description">{ambiente.descripcion || 'Sin descripción'}</p>
                            </div>
                        </article>
                    ))
                ) : (
                    <p>No hay ambientes disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default AmbienteLista;