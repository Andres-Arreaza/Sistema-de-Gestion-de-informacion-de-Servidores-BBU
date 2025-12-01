import React from 'react';
import Icon from './Icon';

const ResultadosTabla = ({
    servidores = [], columnas = [], catalogos = {},
    currentPage = 1, itemsPerPage = 50, sortConfig = {}, handleSort = () => { },
    userRole, seleccionados = new Set(), toggleSeleccionado = () => { }, toggleSeleccionarTodosPagina = () => { },
    editingCell, setEditingCell, startEditCell = () => { }, applyInlineEdit = () => { }, cancelEditing = () => { },
    validationErrors = {}, abrirModalLink = () => { }
}) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentServidores = servidores.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <table className="table">
            <thead>
                <tr>
                    <th style={{ textAlign: 'center' }}>#</th>
                    {columnas.map(c => (
                        <th key={c.key} style={{ textAlign: 'center', cursor: c.sortable ? 'pointer' : 'default', userSelect: 'none' }} onClick={() => c.sortable && handleSort(c.key)} title={c.sortable ? (sortConfig.key === c.key ? (sortConfig.direction === 'asc' ? 'Orden ascendente' : 'Orden descendente') : 'Ordenar') : undefined}>
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                {c.header}
                                {c.sortable && (
                                    <span style={{ marginLeft: 4, display: 'inline-flex', alignItems: 'center' }}>
                                        {sortConfig.key === c.key ? (
                                            sortConfig.direction === 'asc' ? <Icon name="arrow-upward" size={16} style={{ color: '#005A9C' }} />
                                                : <Icon name="arrow-downward" size={16} style={{ color: '#005A9C' }} />
                                        ) : (
                                            <Icon name="unfold-more" size={16} style={{ color: '#888' }} />
                                        )}
                                    </span>
                                )}
                            </span>
                        </th>
                    ))}
                    {userRole && (
                        <th style={{ textAlign: 'center', width: '140px', minWidth: '120px', maxWidth: '180px' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <span style={{ userSelect: 'none' }}>Eliminar</span>
                                <input
                                    type="checkbox"
                                    className="filter-checkbox"
                                    checked={currentServidores.length > 0 && currentServidores.every(s => seleccionados.has(s.id))}
                                    onChange={() => toggleSeleccionarTodosPagina(currentServidores)}
                                    title="Seleccionar/Deseleccionar todos en esta página"
                                    style={{ transform: 'scale(0.95)' }}
                                />
                            </label>
                        </th>
                    )}
                </tr>
            </thead>
            <tbody>
                {currentServidores.map((servidor, idx) => {
                    const rowIndex = indexOfFirstItem + idx + 1;
                    const isModified = !!(servidor && servidor.id && servidor.id in ({})); // visual only — keep same class from parent if needed
                    const errorsInRow = validationErrors[servidor.id] || {};

                    return (
                        <tr key={servidor.id} className={isModified ? 'fila-modificada' : ''}>
                            <td style={{ textAlign: 'center' }}>{rowIndex}</td>

                            {columnas.map(col => {
                                if (col.key === 'link') {
                                    return (
                                        <td key={`${servidor.id}-link`} style={{ textAlign: 'center', width: '90px', minWidth: '70px', maxWidth: '110px' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={() => abrirModalLink(servidor)}
                                                title="Ver detalles y enlace"
                                                disabled={!servidor.link}
                                                style={{ width: 34, height: 34, padding: 4, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <Icon name="visibility" />
                                            </button>
                                        </td>
                                    );
                                }

                                let displayValue = servidor[col.key];

                                if (col.catalog) {
                                    const safeCatalog = Array.isArray(catalogos[col.catalog]) ? catalogos[col.catalog].filter(Boolean) : [];
                                    const found = safeCatalog.find(c => String(c.id) === String(displayValue));
                                    displayValue = found ? (col.catalog === 'sistemasOperativos' ? `${found.nombre} - V${found.version}` : found.nombre) : 'N/A';
                                }

                                if (col.key === 'aplicaciones') {
                                    const apps = Array.isArray(servidor.aplicaciones) ? servidor.aplicaciones.filter(Boolean) : [];
                                    if (servidor.aplicacion_id && apps.length === 0) {
                                        const safeAppsCatalog = Array.isArray(catalogos.aplicaciones) ? catalogos.aplicaciones.filter(Boolean) : [];
                                        const appFromCatalog = safeAppsCatalog.find(a => String(a.id) === String(servidor.aplicacion_id));
                                        if (appFromCatalog) apps.push(appFromCatalog);
                                    }
                                    displayValue = apps.length > 0 ? apps.map(a => `${a.nombre} - V${a.version}`).join(', ') : 'N/A';
                                }

                                if (["ip_mgmt", "ip_real", "ip_mask25"].includes(col.key)) {
                                    displayValue = displayValue || 'N/A';
                                }

                                const hasError = !!errorsInRow[col.key];

                                if (col.key === 'vlan_mgmt' || col.key === 'vlan_real') {
                                    const text = String(displayValue || '');
                                    const parts = text.split(/\s+/).filter(Boolean);
                                    return (
                                        <td key={`${servidor.id}-${col.key}`} title={text} className={hasError ? 'celda-con-error-validacion' : ''} style={{ whiteSpace: 'normal' }}>
                                            {parts.length > 1 ? parts.map((p, i) => <span key={i}>{p}{i < parts.length - 1 && <br />}</span>) : text}
                                        </td>
                                    );
                                }

                                return (
                                    <td key={`${servidor.id}-${col.key}`} title={displayValue} className={hasError ? 'celda-con-error-validacion' : ''} onDoubleClick={() => startEditCell(servidor, col.key)} style={{ cursor: userRole ? 'pointer' : 'default' }}>
                                        {displayValue}
                                    </td>
                                );
                            })}
                            {userRole && (
                                <td style={{ textAlign: 'center', width: '140px', minWidth: '120px', maxWidth: '180px' }}>
                                    <input
                                        type="checkbox"
                                        className="filter-checkbox"
                                        checked={seleccionados.has(servidor.id)}
                                        onChange={() => toggleSeleccionado(servidor.id)}
                                        title={`Seleccionar servidor ${servidor.nombre}`}
                                        style={{ transform: 'scale(0.95)' }}
                                    />
                                </td>
                            )}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default ResultadosTabla;
