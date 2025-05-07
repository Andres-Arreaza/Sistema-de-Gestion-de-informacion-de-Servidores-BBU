import React from "react";
import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    <img src="https://banesco-prod-2020.s3.amazonaws.com/wp-content/themes/banescocontigo/assets/images/header/logotype.png" className="navbar-img" alt="Banesco" />
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className={`nav-item ${location.pathname === "/service" ? "active" : ""}`}>
                            <Link className="nav-link" to="/service">Servicio</Link>
                        </li>
                        <li className={`nav-item ${location.pathname === "/layer" ? "active" : ""}`}>
                            <Link className="nav-link" to="/layer">Capa</Link>
                        </li>
                        <li className={`nav-item ${location.pathname === "/environment" ? "active" : ""}`}>
                            <Link className="nav-link" to="/environment">Ambiente</Link>
                        </li>
                        <li className={`nav-item ${location.pathname === "/domain" ? "active" : ""}`}>
                            <Link className="nav-link" to="/domain">Dominio</Link>
                        </li>
                        <li className={`nav-item ${location.pathname === "/os" ? "active" : ""}`}>
                            <Link className="nav-link" to="/os">Sistema Operativo</Link>
                        </li>
                        <li className={`nav-item ${location.pathname === "/status" ? "active" : ""}`}>
                            <Link className="nav-link" to="/status">Estatus</Link>
                        </li>
                        <li className={`nav-item servers-button ${location.pathname === "/servers" ? "active" : ""}`}>
                            <Link className="nav-link" to="/servers">Servidores</Link> {/* Ruta corregida */}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};