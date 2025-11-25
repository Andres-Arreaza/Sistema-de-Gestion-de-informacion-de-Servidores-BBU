import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdministrarUsuariosTabla from '../component/AdministrarUsuariosTabla';
import Swal from 'sweetalert2';
import Icon from '../component/Icon'; // <-- importar Icon para usar en el formulario CrearUsuarioForm
import banescoLogo from '../../img/BanescoServers.png';

const AdministrarUsuariosPage = () => {
    // useEffect(() => { document.title = 'Administrar Usuarios — G.I.B.S.'; }, []);

    const [userRole, setUserRole] = useState(() => localStorage.getItem('auth_role') || null);
    const [showCreateModal, setShowCreateModal] = useState(false); // controla el modal de creación
    const navigate = useNavigate();

    useEffect(() => {
        function onAuthChanged() { setUserRole(localStorage.getItem('auth_role') || null); }
        window.addEventListener('authChanged', onAuthChanged);
        return () => window.removeEventListener('authChanged', onAuthChanged);
    }, []);

    // Si no hay token, redirigir al home (protege cuando se cierra sesión en tiempo de ejecución)
    useEffect(() => {
        const checkTokenAndRedirect = () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                navigate('/', { replace: true });
            }
        };
        // Comprobar ahora
        checkTokenAndRedirect();
        // Escuchar cambios globales (ej. logout desde el navbar)
        window.addEventListener('authChanged', checkTokenAndRedirect);
        return () => window.removeEventListener('authChanged', checkTokenAndRedirect);
    }, [navigate]);

    // Escuchar evento global disparado desde el componente de tabla para abrir el modal de creación
    useEffect(() => {
        const handler = () => setShowCreateModal(true);
        window.addEventListener('openCreateUser', handler);
        return () => window.removeEventListener('openCreateUser', handler);
    }, []);

    // Componente interno: formulario de creación de usuarios
    const CrearUsuarioForm = ({ setModalVisible }) => {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [email, setEmail] = useState('');
        const [role, setRole] = useState('ESPECIALISTA');
        const [loading, setLoading] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
        const [passwordFocused, setPasswordFocused] = useState(false);
        const roleSelectRef = React.useRef(null);
        const [roleOpen, setRoleOpen] = React.useState(false);

        const getAuthHeaders = () => {
            const token = localStorage.getItem('auth_token');
            return token ? { 'Authorization': `Bearer ${token}` } : {};
        };

        const handleSubmit = async (e) => {
            e && e.preventDefault();
            if (!username || !password) return Swal.fire('Campos requeridos', 'Usuario y contraseña son obligatorios.', 'warning');
            setLoading(true);
            try {
                const res = await fetch(`${process.env.BACKEND_URL || ''}/api/auth/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                    body: JSON.stringify({ username, password, role, email })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || JSON.stringify(data));
                Swal.fire({ icon: 'success', title: 'Usuario creado', showConfirmButton: false, timer: 1500 });
                setUsername(''); setPassword(''); setEmail(''); setRole('ESPECIALISTA');
                // Notificar a la tabla que debe refrescar
                window.dispatchEvent(new Event('usuariosChanged'));
                setModalVisible && setModalVisible(false); // Cerrar modal si se proporciona la función
            } catch (err) {
                console.error(err);
                Swal.fire('Error', err.message || 'No se pudo crear el usuario.', 'error');
            } finally {
                setLoading(false);
            }
        };

        // Mostrar formulario solo a GERENTE (según requerimiento)
        if (userRole !== 'GERENTE') {
            return null;
        }

        // Cerrar el panel del custom-select si se hace clic fuera de él
        useEffect(() => {
            const handleClickOutside = (e) => {
                if (roleSelectRef.current && !roleSelectRef.current.contains(e.target)) {
                    setRoleOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [roleSelectRef]);

        React.useEffect(() => {
            const onDocClick = (e) => {
                if (roleSelectRef.current && !roleSelectRef.current.contains(e.target)) setRoleOpen(false);
            };
            document.addEventListener('mousedown', onDocClick);
            return () => document.removeEventListener('mousedown', onDocClick);
        }, []);

        // Asegurar que Material Symbols Outlined esté cargado para los iconos visibility/visibility_off
        useEffect(() => {
            const href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0';
            if (!document.querySelector(`link[href^="${href}"]`)) {
                const link = document.createElement('link');
                link.href = href;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
        }, []);

        return (
            <section style={{ background: 'var(--color-superficie)', padding: '1rem', borderRadius: 8, boxShadow: 'var(--sombra-caja)', margin: '1rem' }}>
                {/* Logo centrado encima del formulario (igual que en login) */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <img
                        src={banescoLogo}
                        alt="Banesco Servers"
                        style={{ height: 56, objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
                <h3 style={{ marginTop: 0, textAlign: 'center' }}>Crear usuario</h3>
                <form onSubmit={handleSubmit} style={{ display: 'block', gap: '0.8rem' }}>
                    <div className="form__group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form__label" style={{ marginBottom: '0.45rem', display: 'block' }}>Usuario</label>
                        <input className="form__input" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>

                    <div className="form__group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form__label" style={{ marginBottom: '0.45rem', display: 'block' }}>Email (opcional)</label>
                        <input className="form__input" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    {/* ROLE: custom-select igual al usado en BusquedaFiltro */}
                    <div className="form__group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form__label" style={{ marginBottom: '0.45rem', display: 'block' }}>Rol</label>
                        {/* wrapper con ref para detectar clicks fuera */}
                        <div className="custom-select" ref={roleSelectRef} style={{ position: 'relative' }}>
                            <button
                                type="button"
                                className="form__input custom-select__trigger"
                                onClick={() => setRoleOpen(prev => !prev)}
                                aria-haspopup="listbox"
                                aria-expanded={roleOpen}
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <span>{role}</span>
                                <div className={`chevron ${roleOpen ? "open" : ""}`}></div>
                            </button>

                            <div className={`custom-select__panel ${roleOpen ? "open" : ""}`} style={{ minWidth: 200, zIndex: 1400 }}>
                                <label className={`custom-select__option ${role === 'ESPECIALISTA' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="ESPECIALISTA"
                                        checked={role === 'ESPECIALISTA'}
                                        onChange={() => { setRole('ESPECIALISTA'); setRoleOpen(false); }}
                                    />
                                    <span>ESPECIALISTA</span>
                                </label>
                                <label className={`custom-select__option ${role === 'GERENTE' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="GERENTE"
                                        checked={role === 'GERENTE'}
                                        onChange={() => { setRole('GERENTE'); setRoleOpen(false); }}
                                    />
                                    <span>GERENTE</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form__group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form__label" style={{ marginBottom: '0.45rem', display: 'block' }}>Contraseña</label>
                        {/* Contenedor relativo: input ocupa 100% ancho, icono posicionado absolutamente */}
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input
                                className="form__input"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                aria-label="Contraseña"
                                style={{ width: '100%', paddingRight: 44, height: 48, boxSizing: 'border-box' }} /* aumentado a 48px */
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                style={{
                                    position: 'absolute',
                                    right: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    padding: 6,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: passwordFocused ? 'var(--color-primario)' : 'var(--color-texto-secundario)',
                                    lineHeight: 1
                                }}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    aria-hidden="true"
                                    style={{
                                        fontSize: 20,
                                        lineHeight: 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div
                        className="form__actions"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            marginTop: '1rem',
                            borderTop: 'none',      /* quitar la línea superior */
                            paddingTop: '0.6rem'    /* mantener separación visual */
                        }}
                    >
                        <button
                            type="button"
                            className="btn btn--secondary"
                            onClick={() => {
                                setUsername(''); setPassword(''); setEmail(''); setRole('ESPECIALISTA');
                                setModalVisible && setModalVisible(false);
                            }}
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
                            {loading ? 'Creando...' : (<><Icon name="login" /> Crear Usuario</>)}
                        </button>
                    </div>
                </form>
            </section>
        );
    };

    return (
        <div className="layout-container">
            <main style={{ paddingTop: 80, minHeight: 'calc(100vh - 160px)' }}>
                {/* Componente que muestra solo la tabla */}
                <AdministrarUsuariosTabla />

                {/* Modal con formulario de creación */}
                {showCreateModal && (
                    <div className="modal__overlay" onClick={() => setShowCreateModal(false)}>
                        <div className="modal__content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: 640, width: '95%' }}>
                            {/* X posicionada a la derecha dentro del modal */}
                            <button
                                className="btn-close"
                                onClick={() => setShowCreateModal(false)}
                                aria-label="Cerrar"
                                style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
                            />
                            {/* Pasamos setModalVisible para que el formulario pueda cerrarlo */}
                            <CrearUsuarioForm setModalVisible={() => setShowCreateModal(false)} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdministrarUsuariosPage;

// Wrapper que reutiliza el formulario CrearUsuarioForm (mantener scope)
const CrearUsuarioFormWrapper = ({ onClose }) => {
    // El formulario original estaba definido en este archivo como CrearUsuarioForm.
    // Llamar al formulario y pasarle onClose si necesita cerrar el modal después de crear.
    return <CrearUsuarioForm setModalVisible={onClose} />;
};
