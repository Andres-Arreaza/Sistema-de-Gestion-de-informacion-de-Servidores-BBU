import React from 'react';
import Swal from 'sweetalert2';
import Loading from './Loading';
import Icon from './Icon';

const EcosistemaLista = ({ ecosistemas, onEdit, fetchEcosistemas, cargando }) => {
    const confirmarEliminacion = (ecosistema) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación del ecosistema "${ecosistema.nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-error)',
            cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/ecosistemas/${ecosistema.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.json();
                    })
                    .then(() => {
                        fetchEcosistemas();
                        Swal.fire('¡Eliminado!', 'El ecosistema ha sido eliminado.', 'success');
                    })
                    .catch(error => {
                        Swal.fire('Error', error.msg || 'No se pudo eliminar el ecosistema.', 'error');
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
                <h2 className="content-title">Listado de Ecosistemas</h2>
            </div>
            <div className="card-grid">
                {ecosistemas.length > 0 ? (
                    ecosistemas.map((ecosistema) => (
                        <article key={ecosistema.id} className="card">
                            <div>
                                <header className="card__header">
                                    <h3 className="card__title">{ecosistema.nombre}</h3>
                                    <div className="card__actions">
                                        <button className="btn-icon" onClick={() => onEdit(ecosistema)} title="Editar">
                                            <Icon name="edit" />
                                        </button>
                                        <button className="btn-icon" onClick={() => confirmarEliminacion(ecosistema)} title="Eliminar">
                                            <Icon name="trash" />
                                        </button>
                                    </div>
                                </header>
                                <p className="card__description">{ecosistema.descripcion || 'Sin descripción'}</p>
                            </div>
                        </article>
                    ))
                ) : (
                    <p>No hay ecosistemas disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default EcosistemaLista;