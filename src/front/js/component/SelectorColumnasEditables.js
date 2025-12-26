import React, { useMemo } from 'react';

const SelectorColumnasEditables = ({ opciones = [], seleccionadas = [], onChange = () => { } }) => {
    // Calcular número de columnas simples según cantidad (responsive básico)
    const cols = useMemo(() => {
        const n = opciones.length || 1;
        if (n >= 12) return 4;
        if (n >= 8) return 3;
        if (n >= 4) return 2;
        return 1;
    }, [opciones.length]);

    const toggle = (val) => {
        const asString = String(val);
        const curr = Array.isArray(seleccionadas) ? seleccionadas.map(String) : [];
        const idx = curr.indexOf(asString);
        if (idx === -1) curr.push(asString);
        else curr.splice(idx, 1);
        onChange(curr);
    };

    const containerStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '0.5rem 0.75rem',
        alignItems: 'start',
        width: '100%',
        boxSizing: 'border-box'
    };
    const optionStyle = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '6px 8px',
        borderRadius: 8,
        background: 'transparent',
        cursor: 'pointer',
        userSelect: 'none'
    };
    const labelStyle = { fontSize: '0.9rem', lineHeight: 1.1 };

    return (
        <div className="selector-columnas-container" style={containerStyle}>
            {opciones.map(opt => {
                const val = String(opt.value);
                const checked = (seleccionadas || []).map(String).includes(val);
                const disabled = !!opt.disabled;
                return (
                    <label
                        key={val}
                        className={`selector-col-option ${disabled ? 'disabled-option' : ''}`}
                        style={{ ...optionStyle, ...(disabled ? { color: '#9ca3af', cursor: 'not-allowed' } : {}) }}
                    >
                        <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => !disabled && toggle(val)}
                            style={{ width: 16, height: 16 }}
                        />
                        <span style={labelStyle}>{opt.label || val}</span>
                    </label>
                );
            })}
        </div>
    );
};

export default SelectorColumnasEditables;
