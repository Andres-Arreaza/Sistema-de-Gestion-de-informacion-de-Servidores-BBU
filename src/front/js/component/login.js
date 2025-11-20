import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Icon from './Icon';
import banescoLogo from '../../img/BanescoServers.png';


const Login = ({ open, onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setUsername('');
            setPassword('');
            setLoading(false);
        }
    }, [open]);

    // Asegurar que Material Icons esté cargado (Google Fonts) para usar el icono "close"
    useEffect(() => {
        const href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.href = href;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }, []);

    const handleLogin = async (e) => {
        e && e.preventDefault();
        if (!username || !password) return Swal.fire('Datos incompletos', 'Usuario y contraseña son requeridos', 'warning');
        setLoading(true);
        try {
            const res = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Credenciales inválidas');
            // almacenar token y role
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_role', data.role);
            localStorage.setItem('auth_user', JSON.stringify(data.user || { username }));
            window.dispatchEvent(new Event('authChanged'));
            setUsername('');
            setPassword('');
            setLoading(false);
            onClose && onClose();
            Swal.fire('Bienvenido', `Sesión iniciada como ${data.role}`, 'success');
        } catch (err) {
            setLoading(false);
            Swal.fire('Error', err.message || 'Error en login', 'error');
        }
    };

    if (!open) return null;

    return (
        <div className="modal__overlay" onClick={() => onClose && onClose()}>
            <div className="modal__content" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header" style={{ borderBottom: 'none', position: 'relative', height: 0, padding: 0, margin: 0, overflow: 'visible' }}>
                    <button
                        aria-label="Cerrar"
                        onClick={() => onClose && onClose()}
                        style={{
                            position: 'absolute',
                            right: 12,
                            top: 8,
                            background: 'transparent',
                            border: 'none',
                            lineHeight: '1',
                            cursor: 'pointer',
                            color: 'var(--color-texto-secundario)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 6,
                        }}
                        title="Cerrar"
                    >
                        <span className="material-icons" aria-hidden="true" style={{ fontSize: 28, lineHeight: 1 }}>close</span>
                    </button>
                </div>
                <div className="modal__body">
                    {/* Logo centrado encima del formulario */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Link to="/" className="navbar-logo-link" aria-label="Inicio">
                            <img
                                className="navbar-logo-img"
                                src={banescoLogo}
                                alt="Banesco Servers"
                                style={{ height: 56, objectFit: 'contain' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </Link>
                    </div>
                    <form onSubmit={handleLogin}>
                        <div className="form__group">
                            <label className="form__label">Usuario</label>
                            <input className="form__input" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="form__group">
                            <label className="form__label">Contraseña</label>
                            <input className="form__input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        {/* Separación superior entre campos y botones; botones centrados */}
                        <div className="form__actions" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', borderTop: 'none', marginTop: '1rem', paddingTop: '0.5rem' }}>
                            <button
                                type="button"
                                className="btn btn--secondary"
                                onClick={() => onClose && onClose()}
                                disabled={loading}
                                style={{ minWidth: 160, width: 160 }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn--primary"
                                disabled={loading}
                                style={{ minWidth: 160, width: 160 }}
                            >
                                {loading ? 'Entrando...' : (<><Icon name="login" /> Iniciar sesión</>)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
