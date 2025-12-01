import React, { useRef } from 'react';
import Icon from './Icon';
import Swal from 'sweetalert2';

const ResultadosTabla = ({
    servidores = [], columnas = [], catalogos = {},
    currentPage = 1, itemsPerPage = 50, sortConfig = {}, handleSort = () => { },
    userRole, seleccionados = new Set(), toggleSeleccionado = () => { }, toggleSeleccionarTodosPagina = () => { },
    editingCell, setEditingCell, startEditCell = () => { }, applyInlineEdit = () => { }, cancelEditing = () => { },
    validationErrors = {}, abrirModalLink = () => { }
}) => {
    const confirmingRef = useRef(false); // <-- evita que onBlur aplique mientras se confirma

    // Helper para detectar si una columna es editable inline
    const isEditableColumn = (colKey) => {
        const notEditable = ['link']; // columna no editable inline
        if (notEditable.includes(colKey)) return false;
        if (!userRole) return false;
        return ['GERENTE', 'ESPECIALISTA'].includes(userRole);
    };

    const sorted = (() => {
        if (!sortConfig || !sortConfig.key) return servidores;
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        return [...servidores].sort((a, b) => {
            const ka = a[sortConfig.key] ?? '';
            const kb = b[sortConfig.key] ?? '';
            const sa = String(ka).toLowerCase();
            const sb = String(kb).toLowerCase();
            const cmp = collator.compare(sa, sb);
            return sortConfig.direction === 'asc' ? cmp : -cmp;
        });
    })();

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentServidores = sorted.slice(indexOfFirstItem, indexOfLastItem);

    const onCellDoubleClick = (servidor, colKey) => {
        if (!isEditableColumn(colKey)) return;
        startEditCell(servidor, colKey);
    };

    const onEditingChange = (value) => {
        if (!editingCell) return;
        setEditingCell({ ...editingCell, value });
    };

    // Maneja el Enter/Escape: muestra modal y aplica solo si confirma.
    // Marca confirmingRef antes de abrir el modal para que el onBlur no aplique prematuramente.
    const onEditingKeyDown = (e, servidorId, key) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            confirmingRef.current = true;
            Swal.fire({
                title: 'Confirmar cambio',
                html: `¿Deseas guardar el cambio <strong>${String(editingCell?.value ?? '')}</strong> en el campo <strong>${key}</strong>?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: 'var(--color-primario)',
                cancelButtonColor: 'var(--color-texto-secundario)'
            }).then(result => {
                confirmingRef.current = false;
                if (result.isConfirmed) {
                    applyInlineEdit(servidorId, key, editingCell?.value);
                } else {
                    // si cancela, restaurar editor abierto o cancelar según UX (aquí cerramos)
                    cancelEditing();
                }
            }).catch(() => {
                confirmingRef.current = false;
                cancelEditing();
            });
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    // onBlur handler para inputs/selects: ignora el blur si una confirmación está pendiente
    const handleBlur = (servidorId, key) => {
        // Si hay una confirmación pendiente (Enter fue presionado y modal aún abierto), no aplicar
        if (confirmingRef.current) {
            return;
        }
        // En el caso normal de blur, aplicar directamente
        applyInlineEdit(servidorId, key, editingCell?.value);
    };

    return (
        <table className="table">
            <thead>
                <tr>
                    <th style={{ textAlign: 'center' }}>#</th>
                    {columnas.map(c => (
                        <th
                            key={c.key}
                            style={{ textAlign: 'center', cursor: c.sortable ? 'pointer' : 'default', userSelect: 'none' }}
                            onClick={() => c.sortable && handleSort(c.key)}
                            title={c.sortable ? (sortConfig?.key === c.key ? (sortConfig.direction === 'asc' ? 'Orden ascendente' : 'Orden descendente') : 'Ordenar') : undefined}
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                {c.header}
                                {c.sortable && (
                                    <span style={{ marginLeft: 4, display: 'inline-flex', alignItems: 'center' }}>
                                        {sortConfig?.key === c.key ? (
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
                    {userRole && <th style={{ textAlign: 'center', width: '140px' }}>Eliminar</th>}
                </tr>
            </thead>

            <tbody>
                {currentServidores.map((servidor, idx) => {
                    const rowIndex = indexOfFirstItem + idx + 1;
                    const rowErrors = validationErrors[servidor.id] || {};

                    return (
                        <tr key={servidor.id} className={rowErrors && Object.keys(rowErrors).length ? 'fila-con-error' : ''}>
                            <td style={{ textAlign: 'center' }}>{rowIndex}</td>

                            {columnas.map(col => {
                                // Link column: keep button behavior
                                if (col.key === 'link') {
                                    return (
                                        <td key={`${servidor.id}-${col.key}`} style={{ textAlign: 'center' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={() => abrirModalLink(servidor)}
                                                title="Ver detalles y enlace"
                                                disabled={!servidor.link}
                                                style={{ width: 34, height: 34 }}
                                            >
                                                <Icon name="visibility" />
                                            </button>
                                        </td>
                                    );
                                }

                                const cellHasError = !!rowErrors[col.key];
                                const isEditing = editingCell && editingCell.id === servidor.id && editingCell.key === col.key;

                                // If in editing mode for this cell, render editor
                                if (isEditing) {
                                    // If column has catalog -> select
                                    if (col.catalog && Array.isArray(catalogos[col.catalog])) {
                                        const options = catalogos[col.catalog] || [];
                                        return (
                                            <td key={`${servidor.id}-${col.key}`} className={cellHasError ? 'celda-con-error' : ''}>
                                                <select
                                                    className="form__input"
                                                    value={editingCell.value ?? ''}
                                                    onChange={(e) => onEditingChange(e.target.value)}
                                                    onBlur={() => handleBlur(servidor.id, col.key)}                // <-- usa handleBlur
                                                    onKeyDown={(e) => onEditingKeyDown(e, servidor.id, col.key)}   // <-- usa onEditingKeyDown
                                                    autoFocus
                                                >
                                                    <option value="">(sin asignar)</option>
                                                    {options.map(opt => <option key={opt.id} value={opt.id}>{opt.nombre ?? opt.label ?? String(opt.id)}</option>)}
                                                </select>
                                            </td>
                                        );
                                    }

                                    // Default: text input
                                    return (
                                        <td key={`${servidor.id}-${col.key}`} className={cellHasError ? 'celda-con-error' : ''}>
                                            <input
                                                className="form__input"
                                                type="text"
                                                value={editingCell.value ?? ''}
                                                onChange={(e) => onEditingChange(e.target.value)}
                                                onBlur={() => handleBlur(servidor.id, col.key)}                // <-- usa handleBlur
                                                onKeyDown={(e) => onEditingKeyDown(e, servidor.id, col.key)}   // <-- usa onEditingKeyDown
                                                autoFocus
                                            />
                                        </td>
                                    );
                                }

                                // Not editing: display text, with double click to start edit when permitted
                                let displayValue = servidor[col.key];
                                if (col.catalog) {
                                    const found = catalogos[col.catalog]?.find(c => String(c.id) === String(displayValue));
                                    displayValue = found ? (col.catalog === 'sistemasOperativos' ? `${found.nombre} - V${found.version}` : found.nombre) : (displayValue ?? 'N/A');
                                } else if (col.key === 'aplicaciones') {
                                    const apps = servidor.aplicaciones || [];
                                    displayValue = apps.length > 0 ? apps.map(a => `${a.nombre} - V${a.version}`).join(', ') : (servidor.aplicacion_id ? String(servidor.aplicacion_id) : 'N/A');
                                } else {
                                    displayValue = displayValue ?? 'N/A';
                                }

                                return (
                                    <td
                                        key={`${servidor.id}-${col.key}`}
                                        title={typeof displayValue === 'string' ? displayValue : JSON.stringify(displayValue)}
                                        onDoubleClick={() => onCellDoubleClick(servidor, col.key)}
                                        className={cellHasError ? 'celda-con-error' : ''}
                                        style={{ cursor: isEditableColumn(col.key) ? 'pointer' : 'default', whiteSpace: 'normal' }}
                                        tabIndex={isEditableColumn(col.key) ? 0 : -1}
                                        onKeyDown={(e) => {
                                            if ((e.key === 'Enter' || e.key === 'F2') && isEditableColumn(col.key)) {
                                                startEditCell(servidor, col.key);
                                            }
                                        }}
                                    >
                                        {displayValue}
                                    </td>
                                );
                            })}

                            {userRole && (
                                <td style={{ textAlign: 'center' }}>
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
