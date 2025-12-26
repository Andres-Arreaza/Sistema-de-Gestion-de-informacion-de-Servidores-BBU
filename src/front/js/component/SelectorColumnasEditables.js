import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from './Icon';

const SelectorColumnasEditables = ({ opciones = [], seleccionadas = [], onChange = () => { } }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        const nuevasColumnas = checked
            ? [...seleccionadas, value]
            : seleccionadas.filter(col => col !== value);
        onChange(nuevasColumnas);
    };

    const safeOpciones = Array.isArray(opciones) ? opciones.filter(Boolean) : [];

    // Calcular columnas: recomendaciones simples según cantidad
    const columns = useMemo(() => {
        const n = opciones.length || 1;
        if (n >= 12) return 4;
        if (n >= 8) return 3;
        if (n >= 4) return 2;
        return 1;
    }, [opciones.length]);

    const toggle = (val) => {
        const v = String(val);
        const curr = Array.isArray(seleccionadas) ? [...seleccionadas.map(String)] : [];
        const idx = curr.indexOf(v);
        if (idx === -1) curr.push(v);
        else curr.splice(idx, 1);
        onChange(curr);
    };

    // Estilos en línea para evitar tocar CSS global (puedes mover a .css si prefieres)
    const containerStyle = {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '0.5rem 0.75rem',
        alignItems: 'start',
        padding: '6px 8px',
        boxSizing: 'border-box'
    };
    const optionStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '6px 8px',
        borderRadius: 8,
        background: 'transparent',
        cursor: 'pointer',
        userSelect: 'none'
    };
    const labelStyle = { fontSize: '0.9rem', lineHeight: 1.1 };
    const disabledStyle = { color: '#9ca3af', cursor: 'not-allowed', background: '#f8fafc' };

    return (
        <div className="selector-columnas-container" ref={dropdownRef}>
            <label className="form__label">
                <Icon name="columns" />
                Columnas a editar:
            </label>
            <div className="custom-select">
                <button type="button" className="form__input custom-select__trigger trigger_editor" onClick={() => setIsOpen(!isOpen)}>
                    <span>{seleccionadas.length > 0 ? `${seleccionadas.length} seleccionada(s)` : "Ninguna"}</span>
                    <div className={`chevron ${isOpen ? "open" : ""}`}></div>
                </button>
                <div className={`custom-select__panel ${isOpen ? "open" : ""}`}>
                    <div style={containerStyle}>
                        {safeOpciones.map(opt => {
                            const val = String(opt.value);
                            const checked = (seleccionadas || []).map(String).includes(val);
                            const isDisabled = !!opt.disabled;
                            return (
                                <label
                                    key={val}
                                    className={`selector-col-option ${isDisabled ? 'disabled-option' : ''}`}
                                    style={{ ...optionStyle, ...(isDisabled ? disabledStyle : {}) }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        disabled={isDisabled}
                                        onChange={() => !isDisabled && toggle(val)}
                                        style={{ width: 16, height: 16 }}
                                    />
                                    <span style={labelStyle}>{opt.label || val}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectorColumnasEditables;
