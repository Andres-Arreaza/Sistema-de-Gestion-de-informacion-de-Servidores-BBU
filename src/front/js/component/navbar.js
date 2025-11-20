import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import banescoLogo from '../../img/BanescoServers.png';
import Icon from './Icon';
import Login from './login'; // <-- nuevo componente importado

export const Navbar = () => {
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [auth, setAuth] = useState({
        token: localStorage.getItem('auth_token') || null,
        role: localStorage.getItem('auth_role') || null,
        user: localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user')) : null
    });

    // Nuevo: menú del usuario (toggle al click)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState(null); // <-- nuevo estado
    const userMenuRef = useRef(null);

    useEffect(() => {
        // cerrar dropdowns generales y menú de usuario al cambiar de ruta
        setIsDropdownOpen(false);
        setIsUserMenuOpen(false);
        // Si estamos en Home, limpiar la selección de "Administrar"
        if (location.pathname === "/") {
            setSelectedMenuItem(null);
        }
    }, [location]);

    useEffect(() => {
        function onAuthChanged() {
            setAuth({
                token: localStorage.getItem('auth_token') || null,
                role: localStorage.getItem('auth_role') || null,
                user: localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user')) : null
            });
        }
        window.addEventListener('authChanged', onAuthChanged);
        return () => window.removeEventListener('authChanged', onAuthChanged);
    }, []);

    useEffect(() => {
        function handleClickOutside(e) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_role');
        localStorage.removeItem('auth_user');
        window.dispatchEvent(new Event('authChanged'));
        Swal.fire('Sesión cerrada', 'Has cerrado sesión correctamente', 'success');
    };

    // Antes: incluía un entry { type: 'divider' } — lo eliminamos para no renderizar líneas entre botones.
    const adminLinks = [
        { to: "/configuracion", label: "Configuración" },
        { to: "/servidor", label: "Crear Servidor", isHighlight: true },
    ];

    const isGerente = auth.token && auth.role === 'GERENTE';

    return (
        <header className="navbar-header">
            <nav className="navbar-container">
                <Link to="/" className="navbar-logo-link" aria-label="Inicio">
                    <img
                        className="navbar-logo-img"
                        src={banescoLogo}
                        alt="Banesco Servers"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </Link>

                {/* RIGHT SIDE */}
                <div className="navbar-right">
                    {/* Usuario (trigger ahora solo "Administrar") */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {auth.token ? (
                            <div ref={userMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <button
                                    className="btn btn--link btn--admin"
                                    onClick={() => setIsUserMenuOpen(prev => !prev)}
                                    aria-haspopup="true"
                                    aria-expanded={isUserMenuOpen}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {/* Mostrar solo "Administrar" */}
                                    <span>Administrar</span>
                                    <span className={`chevron ${isUserMenuOpen ? 'open' : ''}`} style={{ marginLeft: 8 }}></span>
                                </button>

                                {isUserMenuOpen && (
                                    <div className="navbar-user-menu" style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 'calc(100% + 8px)',
                                        background: 'var(--color-superficie)',
                                        border: '1px solid var(--color-borde)',
                                        borderRadius: 8,
                                        boxShadow: 'var(--sombra-caja)',
                                        zIndex: 1200,
                                        overflow: 'hidden'
                                    }}>
                                        {/* Admin links (si es GERENTE) — al hacer click se marca como seleccionado */}
                                        {isGerente && (
                                            <>
                                                {adminLinks.map((link, idx) => (
                                                    link.isHighlight ? (
                                                        <Link
                                                            key={`adm-${idx}`}
                                                            to={link.to}
                                                            className={`navbar-link navbar-link-highlight ${selectedMenuItem === link.to ? 'selected' : ''}`}
                                                            onClick={() => { setSelectedMenuItem(link.to); setIsUserMenuOpen(false); }}
                                                        >
                                                            {link.label}
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            key={`adm-${idx}`}
                                                            to={link.to}
                                                            className={`navbar-link ${location.pathname === link.to ? "active" : ""} ${selectedMenuItem === link.to ? 'selected' : ''}`}
                                                            onClick={() => { setSelectedMenuItem(link.to); setIsUserMenuOpen(false); }}
                                                        >
                                                            {link.label}
                                                        </Link>
                                                    )
                                                ))}
                                            </>
                                        )}

                                        {/* Opciones del usuario: usar la misma clase y marcar selected al click */}
                                        <button
                                            className={`navbar-link ${selectedMenuItem === 'perfil' ? 'selected' : ''}`}
                                            onClick={() => { setIsUserMenuOpen(false); setSelectedMenuItem('perfil'); /* navegar a perfil si corresponde */ }}
                                        >
                                            Perfil
                                        </button>

                                        <div className="navbar-divider" />

                                        <button
                                            className="navbar-link logout-link"
                                            onClick={() => { setIsUserMenuOpen(false); handleLogout(); }}
                                        >
                                            Cerrar sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className="btn btn--primary" onClick={() => setOpen(true)}><Icon name="login" /> Iniciar sesión</button>
                        )}
                    </div>

                    {/* Home (derecha) */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Link
                            className={`btn-icon ${location.pathname === "/" ? "active" : ""}`}
                            to="/"
                            aria-label="Página de inicio"
                            onClick={() => {
                                // al pulsar Home cerrar menú de usuario y limpiar selección
                                setIsUserMenuOpen(false);
                                setSelectedMenuItem(null);
                            }}
                        >
                            <Icon name="home" size={24} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Mostrar el componente Login cuando open === true */}
            {open && <Login open={open} onClose={() => setOpen(false)} />}
        </header>
    );
};

export default Navbar;
