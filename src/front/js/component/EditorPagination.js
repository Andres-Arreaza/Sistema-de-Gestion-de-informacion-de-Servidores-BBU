import React from 'react';
import ItemsPerPageDropdown from './ItemsPerPageDropdown';
import Icon from './Icon';

const EditorPagination = ({
    servidores,
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    isExportMenuOpen,
    setIsExportMenuOpen,
    isExportMenuOpenRef,
    exportarCSV,
    exportarExcel,
    userRole
}) => {
    const totalPages = Math.max(1, Math.ceil((servidores?.length || 0) / itemsPerPage));
    const count = servidores?.length || 0;
    const contadorTexto = count === 1 ? 'servidor encontrado' : 'servidores encontrados';

    return (
        <div className="pagination-controls" style={{ marginTop: '0.75rem' }}>
            <div className="pagination__items-per-page">
                <div className="export-dropdown-container" ref={isExportMenuOpenRef}>
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

                <label style={{ marginLeft: 8, marginRight: 6 }}>Mostrar:</label>
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

export default EditorPagination;
