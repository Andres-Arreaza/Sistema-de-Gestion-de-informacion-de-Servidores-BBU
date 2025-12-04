import React, { useEffect } from 'react';
import ItemsPerPageDropdown from './ItemsPerPageDropdown';
import Icon from './Icon';

const PaginacionControles = ({ servidores = [], itemsPerPage, setItemsPerPage, currentPage, setCurrentPage, isExportMenuOpen, setIsExportMenuOpen, exportMenuRef, exportarCSV, exportarExcel, userRole }) => {
    const totalPages = Math.ceil(servidores.length / itemsPerPage);
    const count = servidores.length;
    const contadorTexto = count === 1 ? 'servidor encontrado' : 'servidores encontrados';

    // Cerrar con Escape cuando el menú esté abierto
    useEffect(() => {
        if (!isExportMenuOpen) return;
        const handler = (e) => {
            if (e.key === 'Escape') {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isExportMenuOpen, setIsExportMenuOpen]);

    return (
        <div className="pagination-controls">
            <div className="pagination__items-per-page">
                {/* Mostrar dropdown de exportación cuando haya datos */}
                {servidores.length > 0 && (
                    <div className="export-dropdown-container" ref={exportMenuRef}>
                        <button
                            className="btn btn--primary"
                            onClick={() => setIsExportMenuOpen(prev => !prev)}
                            aria-haspopup="menu"
                            aria-expanded={isExportMenuOpen}
                            aria-controls="export-menu"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setIsExportMenuOpen(prev => !prev);
                                }
                            }}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            <Icon name="upload" /> Descargar
                        </button>
                        {isExportMenuOpen && (
                            <div id="export-menu" className="export-menu" role="menu" aria-label="Opciones de descarga" style={{ marginTop: 8 }}>
                                <button
                                    className="export-menu-item"
                                    role="menuitem"
                                    onClick={() => { exportarCSV(servidores); setIsExportMenuOpen(false); }}
                                >
                                    <Icon name="csv" size={16} /> Exportar como CSV
                                </button>
                                <button
                                    className="export-menu-item"
                                    role="menuitem"
                                    onClick={() => { exportarExcel(servidores); setIsExportMenuOpen(false); }}
                                >
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
