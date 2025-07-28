import React from 'react';
import Swal from 'sweetalert2';
import Loading from './Loading';
import Icon from './Icon'; // Asegúrate de tener un componente Icon.js

const CapaLista = ({ capas, onEdit, fetchCapas, cargando }) => {

    const confirmarEliminacion = (capa) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación de la capa "${capa.nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-error)',
            cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/capas/${capa.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.json();
                    })
                    .then(() => {
                        fetchCapas();
                        Swal.fire('¡Eliminada!', 'La capa ha sido eliminada.', 'success');
                    })
                    .catch(error => {
                        Swal.fire('Error', error.msg || 'No se pudo eliminar la capa.', 'error');
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
                <h2 className="content-title">Listado de Capas</h2>
            </div>
            <div className="card-grid">
                {capas && capas.length > 0 ? (
                    capas.map((capa) => (
                        <article key={capa.id} className="card">
                            <div>
                                <header className="card__header">
                                    <h3 className="card__title">{capa.nombre}</h3>
                                    <div className="card__actions">
                                        <button className="btn-icon" onClick={() => onEdit(capa)} title="Editar">
                                            <Icon name="edit" />
                                        </button>
                                        <button className="btn-icon" onClick={() => confirmarEliminacion(capa)} title="Eliminar">
                                            <Icon name="trash" />
                                        </button>
                                    </div>
                                </header>
                                <p className="card__description">{capa.descripcion || 'Sin descripción'}</p>
                            </div>
                        </article>
                    ))
                ) : (
                    <p>No hay capas disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default CapaLista;
