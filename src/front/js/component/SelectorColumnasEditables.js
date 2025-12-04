import React, { useState, useEffect, useRef } from 'react';
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
                    {safeOpciones.map((opcion) => (
                        <label key={String(opcion?.value)} className="custom-select__option">
                            <input
                                type="checkbox"
                                value={opcion.value}
                                checked={seleccionadas.includes(opcion.value)}
                                onChange={handleCheckboxChange}
                                disabled={opcion.disabled}
                            />
                            <span className={opcion.disabled ? 'disabled-option' : ''}>{opcion.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SelectorColumnasEditables;
