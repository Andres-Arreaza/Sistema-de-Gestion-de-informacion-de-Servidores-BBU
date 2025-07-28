import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import banescoLogo from '../../img/BanescoServers.png';
import Icon from './Icon'; // Importa el componente de íconos centralizado

export const Navbar = () => {
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Datos para los enlaces del dropdown
    const adminLinks = [
        { to: "/configuracion", label: "Configuración" },
        { type: 'divider' },
        { to: "/servidor", label: "Crear Servidor", isHighlight: true },
    ];

    // Cierra el dropdown cuando cambia la ruta para evitar que se quede abierto
    useEffect(() => {
        setIsDropdownOpen(false);
    }, [location]);

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
                    <div
                        className="navbar-dropdown"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <button
                            className="btn btn--primary"
                            aria-haspopup="true"
                            aria-expanded={isDropdownOpen}
                        >
                            Administrar
                            <div className={`chevron ${isDropdownOpen ? "open" : ""}`} style={{ marginLeft: '8px' }}></div>
                        </button>
                        <div className={`navbar-dropdown-content ${isDropdownOpen ? "show" : ""}`}>
                            {adminLinks.map((link, index) => (
                                link.type === 'divider' ? (
                                    <div key={index} className="navbar-divider"></div>
                                ) : (
                                    <Link
                                        key={index}
                                        className={`navbar-link ${link.isHighlight ? "navbar-link-highlight" : ""} ${location.pathname === link.to ? "active" : ""}`}
                                        to={link.to}
                                    >
                                        {link.label}
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                    <Link className={`btn-icon ${location.pathname === "/" ? "active" : ""}`} to="/" aria-label="Página de inicio">
                        <Icon name="home" size={24} />
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
