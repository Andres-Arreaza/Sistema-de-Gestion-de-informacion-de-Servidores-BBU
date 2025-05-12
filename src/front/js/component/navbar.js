import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container">
                {/* Logo */}
                <Link to="/" className="navbar-brand">
                    <img
                        src="https://banesco-prod-2020.s3.amazonaws.com/wp-content/themes/banescocontigo/assets/images/header/logotype.png"
                        className="navbar-img"
                        alt="Banesco"
                    />
                </Link>

                {/* Botón de menú en dispositivos móviles */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Menú de navegación */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {/* Búsqueda */}
                        <li className={`nav-item ${location.pathname === "/search" ? "active" : ""}`}>
                            <Link className="nav-link" to="/search">Búsqueda</Link>
                        </li>

                        {/* Administrar con menú desplegable */}
                        <li
                            className="nav-item dropdown admin-button"
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            <span className="nav-link dropdown-toggle">Administrar</span>
                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    <Link className="dropdown-item" to="/servicio">Servicios</Link> {/* 🔹 Se corrigió la ruta */}
                                    <Link className="dropdown-item" to="/layer">Capa</Link>
                                    <Link className="dropdown-item" to="/environment">Ambiente</Link>
                                    <Link className="dropdown-item" to="/domain">Dominio</Link>
                                    <Link className="dropdown-item" to="/os">Sistema Operativo</Link>
                                    <Link className="dropdown-item" to="/status">Estatus</Link>
                                    <div className="dropdown-divider"></div>
                                    <Link className="dropdown-item create-server-button" to="/create-server">Crear Servidor</Link>
                                </div>
                            )}
                        </li>

                        {/* Icono Home */}
                        <li className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
                            <Link className="nav-link home-icon" to="/">
                                <span className="material-symbols-outlined">home</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};