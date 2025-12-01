import React, { useState, useEffect, useRef } from 'react';

const BulkEditDropdown = ({ value, onChange, options = [], catalog, catalogos = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    let displayOptions = [];
    if (Array.isArray(options) && options.length > 0) displayOptions = options.slice();
    else if (catalog && Array.isArray(catalogos[catalog])) displayOptions = catalogos[catalog].slice();
    displayOptions = displayOptions.filter(Boolean);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const selectedOption = displayOptions.find(opt => String(opt.id) === String(value));
    const displayLabel = selectedOption ? ((catalog === 'sistemasOperativos' || catalog === 'aplicaciones') ? `${selectedOption.nombre} - V${selectedOption.version}` : selectedOption.nombre) : "Seleccionar un valor...";

    return (
        <div className="custom-select" ref={dropdownRef} style={{ flexGrow: 1 }}>
            <button type="button" className="form__input custom-select__trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{displayLabel}</span>
                <div className={`chevron ${isOpen ? "open" : ""}`}></div>
            </button>
            <div className={`custom-select__panel ${isOpen ? "open" : ""}`}>
                {displayOptions.map(opt => opt ? (
                    <label key={opt.id} className={`custom-select__option ${String(value) === String(opt.id) ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name={`bulk-edit-${catalog}`}
                            value={opt.id}
                            checked={String(value) === String(opt.id)}
                            onChange={() => handleSelect(String(opt.id))}
                        />
                        <span>{(catalog === 'sistemasOperativos' || catalog === 'aplicaciones') ? `${opt.nombre} - V${opt.version}` : opt.nombre}</span>
                    </label>
                ) : null)}
            </div>
        </div>
    );
};

export default BulkEditDropdown;
