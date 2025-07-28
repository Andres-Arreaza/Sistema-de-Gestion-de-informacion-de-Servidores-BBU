import React from 'react';
import Swal from 'sweetalert2';
import Loading from './Loading';
import Icon from './Icon'; // Asegúrate de tener un componente Icon.js

const SistemaOperativoLista = ({ sistemasOperativos, onEdit, fetchSistemasOperativos, cargando }) => {

    const confirmarEliminacion = (sistemaOperativo) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `No podrás revertir la eliminación del S.O. "${sistemaOperativo.nombre} ${sistemaOperativo.version}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-error)',
            cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.BACKEND_URL}/api/sistemas_operativos/${sistemaOperativo.id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) return response.json().then(err => Promise.reject(err));
                        return response.json();
                    })
                    .then(() => {
                        fetchSistemasOperativos();
                        Swal.fire('¡Eliminado!', 'El sistema operativo ha sido eliminado.', 'success');
                    })
                    .catch(error => {
                        Swal.fire('Error', error.msg || 'No se pudo eliminar el sistema operativo.', 'error');
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
                <h2 className="content-title">Listado de Sistemas Operativos</h2>
            </div>
            <div className="card-grid">
                {sistemasOperativos && sistemasOperativos.length > 0 ? (
                    sistemasOperativos.map((so) => (
                        <article key={so.id} className="card">
                            <div>
                                <header className="card__header">
                                    <h3 className="card__title">{so.nombre}</h3>
                                    <div className="card__actions">
                                        <button className="btn-icon" onClick={() => onEdit(so)} title="Editar">
                                            <Icon name="edit" />
                                        </button>
                                        <button className="btn-icon" onClick={() => confirmarEliminacion(so)} title="Eliminar">
                                            <Icon name="trash" />
                                        </button>
                                    </div>
                                </header>
                                <p className="card__subtitle" style={{ color: 'var(--color-texto-secundario)', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                                    Versión: {so.version}
                                </p>
                                <p className="card__description">{so.descripcion || 'Sin descripción'}</p>
                            </div>
                        </article>
                    ))
                ) : (
                    <p>No hay sistemas operativos disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default SistemaOperativoLista;
