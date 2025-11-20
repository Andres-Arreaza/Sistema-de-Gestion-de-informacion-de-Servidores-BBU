import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Icon from './Icon';

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
                <div className="modal__header">
                    <h2 className="modal__title">Iniciar sesión</h2>
                    <button className="btn-close" onClick={() => onClose && onClose()} />
                </div>
                <div className="modal__body">
                    <form onSubmit={handleLogin}>
                        <div className="form__group">
                            <label className="form__label">Usuario</label>
                            <input className="form__input" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="form__group">
                            <label className="form__label">Contraseña</label>
                            <input className="form__input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="form__actions" style={{ justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn--secondary" onClick={() => onClose && onClose()} disabled={loading}>Cancelar</button>
                            <button type="submit" className="btn btn--primary" disabled={loading}>
                                {loading ? 'Entrando...' : (<><Icon name="login" /> Entrar</>)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
