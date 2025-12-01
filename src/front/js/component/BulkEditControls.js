import React from 'react';
import BulkEditDropdown from './BulkEditDropdown';

const BulkEditControls = ({ columnasEditables = [], opcionesColumnas = [], bulkEditValues = {}, handleBulkEditChange = () => { }, catalogos = {}, handleApplyBulkEdit = () => { } }) => {
    if (!columnasEditables || columnasEditables.length === 0) return null;
    return (
        <div className="bulk-edit-controls" style={{ gap: '0.9rem', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            {columnasEditables.map(colKey => {
                const colDef = opcionesColumnas.find(c => c.value === colKey) || { value: colKey, label: colKey, type: 'input' };
                const val = bulkEditValues[colKey] ?? '';
                return (
                    <div key={colKey} className="bulk-edit-field" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 260, maxWidth: 440, flex: '0 0 auto', padding: '4px 6px', boxSizing: 'border-box', borderRadius: 6, background: 'transparent' }}>
                        <label style={{ minWidth: 120, fontWeight: 600, whiteSpace: 'nowrap' }}>{colDef.label}</label>
                        {colDef.type === 'select' ? (
                            <div style={{ flex: '1 1 auto', minWidth: 220, maxWidth: 360 }}>
                                <BulkEditDropdown
                                    value={val}
                                    onChange={(v) => handleBulkEditChange(colKey, v)}
                                    options={colDef.options}
                                    catalog={colDef.catalog}
                                    catalogos={catalogos}
                                />
                            </div>
                        ) : (
                            <input
                                className="form__input"
                                style={{ minWidth: 160, maxWidth: 360, flex: '1 1 auto' }}
                                value={val}
                                onChange={(e) => handleBulkEditChange(colKey, e.target.value)}
                                placeholder={colDef.label}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BulkEditControls;
