import React from 'react';
import ItemsPerPageDropdown from './ItemsPerPageDropdown';
import Icon from './Icon';

const PaginacionControles = ({ servidores = [], itemsPerPage, setItemsPerPage, currentPage, setCurrentPage, isExportMenuOpen, setIsExportMenuOpen, exportMenuRef, exportarCSV, exportarExcel, userRole }) => {
    const totalPages = Math.ceil(servidores.length / itemsPerPage);
    const count = servidores.length;
    const contadorTexto = count === 1 ? 'servidor encontrado' : 'servidores encontrados';

    return (
        <div className="pagination-controls">
            <div className="pagination__items-per-page">
                {!userRole && (
                    <div className="export-dropdown-container" ref={exportMenuRef}>
                        <button className="btn btn--primary" onClick={() => setIsExportMenuOpen(prev => !prev)} style={{ whiteSpace: 'nowrap' }}>
                            <Icon name="upload" /> Descargar
                        </button>
                        {isExportMenuOpen && (
                            <div className="export-menu">
                                <button className="export-menu-item" onClick={() => { exportarCSV(servidores); setIsExportMenuOpen(false); }}>
                                    <Icon name="csv" size={16} /> Exportar como CSV
                                </button>
                                <button className="export-menu-item" onClick={() => { exportarExcel(servidores); setIsExportMenuOpen(false); }}>
                                    <Icon name="file-excel" size={16} /> Exportar como Excel
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <label>Mostrar:</label>
                <ItemsPerPageDropdown value={itemsPerPage} onChange={setItemsPerPage} />
            </div>

            <div className="servers-found--center" aria-live="polite">
                {count} {contadorTexto}
            </div>

            <div className="pagination__navigation">
                <button className="btn-icon" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                    <Icon name="chevron-left" />
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button className="btn-icon" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                    <Icon name="chevron-right" />
                </button>
            </div>
        </div>
    );
};

export default PaginacionControles;
