import React from 'react';
import Swal from 'sweetalert2';
import Loading from './Loading';
import Icon from './Icon'; // Asegúrate de tener un componente Icon.js

const DominioLista = ({ dominios, onEdit, fetchDominios, cargando }) => {

    const confirmarEliminacion = (dominio) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación del dominio "${dominio.nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-error)',
            cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/dominios/${dominio.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.json();
                    })
                    .then(() => {
                        fetchDominios();
                        Swal.fire('¡Eliminado!', 'El dominio ha sido eliminado.', 'success');
                    })
                    .catch(error => {
                        Swal.fire('Error', error.msg || 'No se pudo eliminar el dominio.', 'error');
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
                <h2 className="content-title">Listado de Dominios</h2>
            </div>
            <div className="card-grid">
                {dominios && dominios.length > 0 ? (
                    dominios.map((dominio) => (
                        <article key={dominio.id} className="card">
                            <div>
                                <header className="card__header">
                                    <h3 className="card__title">{dominio.nombre}</h3>
                                    <div className="card__actions">
                                        <button className="btn-icon" onClick={() => onEdit(dominio)} title="Editar">
                                            <Icon name="edit" />
                                        </button>
                                        <button className="btn-icon" onClick={() => confirmarEliminacion(dominio)} title="Eliminar">
                                            <Icon name="trash" />
                                        </button>
                                    </div>
                                </header>
                                <p className="card__description">{dominio.descripcion || 'Sin descripción'}</p>
                            </div>
                        </article>
                    ))
                ) : (
                    <p>No hay dominios disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default DominioLista;
