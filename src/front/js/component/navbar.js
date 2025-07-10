import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import banescoLogo from '../../img/BanescoServers.png';

// --- Icono de Home ---
const HomeIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

// --- Componente Navbar ---
export const Navbar = () => {
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // --- Datos para los enlaces del dropdown ---
    const adminLinks = [
        { to: "/configuracion", label: "Configuración" },
        { type: 'divider' },
        { to: "/servidor", label: "Crear Servidor", isHighlight: true },
    ];

    // Cierra el dropdown cuando cambia la ruta
    useEffect(() => {
        setIsDropdownOpen(false);
    }, [location]);

    // Cierra el dropdown si se hace clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header className="navbar-header">
            <nav className="navbar-container">
                <Link to="/" className="navbar-logo-link">
                    <img
                        className="navbar-logo-img"
                        src={banescoLogo}
                        alt="Logo Banesco"
                    />
                </Link>

                <div className="navbar-links-desktop">
                    <div className="navbar-dropdown" ref={dropdownRef}>
                        <button
                            className="navbar-dropdown-label"
                            onClick={toggleDropdown}
                            aria-haspopup="true"
                            aria-expanded={isDropdownOpen}
                        >
                            Administrar
                            <svg className={`navbar-dropdown-arrow ${isDropdownOpen ? "open" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div className={`navbar-dropdown-content ${isDropdownOpen ? "show" : ""}`}>
                            {adminLinks.map((link, index) => (
                                link.type === 'divider' ? (
                                    <div key={index} className="navbar-divider"></div>
                                ) : (
                                    <Link
                                        key={index}
                                        className={`navbar-link ${link.isHighlight ? "navbar-link-highlight" : ""}`}
                                        to={link.to}
                                    >
                                        {link.label}
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                    <Link className={`navbar-home ${location.pathname === "/" ? "active" : ""}`} to="/" aria-label="Página de inicio">
                        <HomeIcon />
                    </Link>
                </div>
            </nav>
        </header>
    );
};
