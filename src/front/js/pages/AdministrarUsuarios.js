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
        const USERNAME_MIN_LEN = 4; // ajustar si se requiere otro mínimo
        const [usernameError, setUsernameError] = useState(''); // mensaje de error inline para username
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [passwordErrors, setPasswordErrors] = useState([]); // lista de mensajes de validación
        const [confirmError, setConfirmError] = useState(''); // se mantiene por compatibilidad interna pero NO se mostrará inline para mismatch
        const [passwordTouched, setPasswordTouched] = useState(false);
        const [confirmTouched, setConfirmTouched] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);
        const [email, setEmail] = useState('');
        const [emailValid, setEmailValid] = useState(true);
        const [usernameExists, setUsernameExists] = useState(false);
        const [emailExists, setEmailExists] = useState(false);
        const [checkingExistence, setCheckingExistence] = useState(false);
        const [role, setRole] = useState('ESPECIALISTA');
        const [loading, setLoading] = useState(false);
        const [passwordFocused, setPasswordFocused] = useState(false);
        const roleSelectRef = React.useRef(null);
        const [roleOpen, setRoleOpen] = React.useState(false);
        const [isPasswordValid, setIsPasswordValid] = useState(false);

        const getAuthHeaders = () => {
            const token = localStorage.getItem('auth_token');
            return token ? { 'Authorization': `Bearer ${token}` } : {};
        };

        // Reglas de validación para la contraseña (mínimo 6 caracteres según requerimiento)
        const validatePassword = (pwd, conf) => {
            const errors = [];
            if (!pwd || pwd.length < 6) errors.push('La contraseña debe tener al menos 6 caracteres.');
            if (!/[A-Z]/.test(pwd)) errors.push('Incluir al menos una letra mayúscula.');
            if (!/[a-z]/.test(pwd)) errors.push('Incluir al menos una letra minúscula.');
            if (!/[0-9]/.test(pwd)) errors.push('Incluir al menos un número.');
            if (!/[!@#$%^&*()_\-+=\[\]{};:\\|,.<>/?]/.test(pwd)) errors.push('Incluir al menos un carácter especial (ej. !@#$%).');
            const confErr = (pwd && conf && pwd !== conf) ? 'La contraseña y su confirmación no coinciden.' : '';
            // valid sólo si no hay errores y no hay mismatch
            return { errors, confErr, valid: errors.length === 0 && confErr === '' };
        };

        // Validación simple de email (presencia de @ y estructura básica)
        const validateEmail = (em) => {
            if (!em) return true; // opcional: vacío es válido (campo opcional)
            // regex simple: algo@algo.algo
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
        };

        // Efecto para validar en cada cambio
        useEffect(() => {
            const { errors, confErr, valid } = validatePassword(password, confirmPassword);
            setPasswordErrors(errors);
            setConfirmError(confErr); // mantener confErr actualizado en tiempo real
            setIsPasswordValid(valid);
            // actualizar validez del email en tiempo real
            setEmailValid(validateEmail(email));
        }, [password, confirmPassword]);

        // Validar username en tiempo real (mínimo de caracteres)
        useEffect(() => {
            if (!username) {
                setUsernameError('');
                return;
            }
            if (String(username).trim().length < USERNAME_MIN_LEN) {
                setUsernameError(`El usuario debe tener al menos ${USERNAME_MIN_LEN} caracteres.`);
            } else {
                setUsernameError('');
            }
        }, [username]);

        // Comprueba si username/email existen consultando el endpoint protegido de usuarios
        const checkExists = async (field, value) => {
            if (!value) {
                if (field === 'username') setUsernameExists(false);
                if (field === 'email') setEmailExists(false);
                return;
            }
            if (field === 'email' && !validateEmail(value)) {
                // no hacer petición si el email localmente es inválido
                setEmailExists(false);
                return;
            }
            try {
                setCheckingExistence(true);
                const res = await fetch(`${process.env.BACKEND_URL || ''}/api/auth/users`, {
                    method: 'GET',
                    headers: { ...getAuthHeaders() }
                });
                if (!res.ok) {
                    // si no autorizados o error, no bloquear creación; manejar en submit por si backend responde 409
                    console.warn('No se pudo comprobar existencia (status):', res.status);
                    return;
                }
                const users = await res.json();
                if (field === 'username') {
                    setUsernameExists(users.some(u => u.username && u.username.toLowerCase() === String(value).toLowerCase()));
                } else {
                    setEmailExists(users.some(u => u.email && u.email.toLowerCase() === String(value).toLowerCase()));
                }
            } catch (err) {
                console.error('Error comprobando existencia:', err);
            } finally {
                setCheckingExistence(false);
            }
        };

        const handleSubmit = async (e) => {
            e && e.preventDefault();
            if (!username || !password) return Swal.fire('Campos requeridos', 'Usuario y contraseña son obligatorios.', 'warning');
            // Validación cliente antes de enviar
            const { errors, confErr, valid } = validatePassword(password, confirmPassword);
            // marcar como tocados para que se muestren las validaciones visibles
            setPasswordTouched(true);
            setConfirmTouched(true);

            // Si la única falla es el mismatch de confirmación, mostrar modal y no mostrar ese texto inline
            if (confErr && (!errors || errors.length === 0)) {
                // Mostrar modal específico para mismatch
                Swal.fire({ icon: 'error', title: 'Contraseña inválida', text: confErr });
                // mantener passwordErrors vacío si no hay otros errores
                setPasswordErrors(errors || []);
                // mostrar también el mensaje inline bajo el campo de confirmación
                setConfirmError(confErr);
                return;
            }

            // Validación final de username mínimo antes de enviar
            if (!username || String(username).trim().length < USERNAME_MIN_LEN) {
                setUsernameTouched && setUsernameTouched(true);
                setUsernameError(`El usuario debe tener al menos ${USERNAME_MIN_LEN} caracteres.`);
                return Swal.fire('Usuario inválido', `El usuario debe tener al menos ${USERNAME_MIN_LEN} caracteres.`, 'warning');
            }

            if (!valid) {
                // mostrar resumen general en modal y errores inline (excepto mismatch, ya tratado)
                const filteredConfErr = confErr ? '' : '';
                const html = `<ul style="text-align:left">${errors.map(e => `<li>${e}</li>`).join('')}${filteredConfErr ? `<li>${filteredConfErr}</li>` : ''}</ul>`;
                Swal.fire({ icon: 'error', title: 'Contraseña inválida', html });
                setPasswordErrors(errors);
                setConfirmError(confErr); // se conserva internamente, no se muestra inline para mismatch
                return;
            }
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
                setConfirmPassword('');
                setPasswordErrors([]);
                setConfirmError('');
                // limpiar flags de existencia tras crear con éxito
                setUsernameExists(false);
                setEmailExists(false);
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
            <section style={{ background: 'var(--color-superficie)', padding: '1rem', borderRadius: 8, boxShadow: 'var(--sombra-caja)', margin: '1rem auto', width: '100%', maxWidth: 860 }}>
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
                    {/* FILA: Usuario | Email | Rol (lado a lado) */}
                    <div className="form__row" style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <div className="form__group" style={{ flex: '1 1 0', minWidth: 200 }}>
                            <label className="form__label" style={{ marginBottom: '0.45rem', display: 'block' }}>Usuario</label>
                            <input
                                className="form__input"
                                value={username}
                                onChange={e => { setUsername(e.target.value); setUsernameExists(false); setUsernameError(''); }}
                                onBlur={() => { checkExists('username', username); }}
                            />
                            {usernameError && <p className="form__error-text" style={{ margin: '6px 0 0' }}>{usernameError}</p>}
                            {usernameExists && !usernameError && <p className="form__error-text" style={{ margin: '6px 0 0' }}>El usuario ya existe.</p>}
                        </div>
                        <div className="form__group" style={{ flex: '1 1 0', minWidth: 200 }}>
                            <label className="form__label" style={{ marginBottom: '0.45rem', display: 'block' }}>Email (opcional)</label>
                            <input
                                className="form__input"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setEmailExists(false); setEmailValid(validateEmail(e.target.value)); }}
                                onBlur={() => checkExists('email', email)}
                            />
                            {/* Mostrar error de formato o existencia */}
                            {!emailValid && <p className="form__error-text" style={{ margin: '6px 0 0' }}>Email inválido.</p>}
                            {email && emailValid && emailExists && <p className="form__error-text" style={{ margin: '6px 0 0' }}>El correo ya está registrado.</p>}
                        </div>
                        <div className="form__group" style={{ flex: '1 1 0', minWidth: 160 }}>
                            <label className="form__label" style={{ marginBottom: '0.45rem', display: 'block' }}>Rol</label>
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
                    </div>

                    {/* CONTRASEÑAS: lado a lado en una fila (responsive) */}
                    <div className="form__row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <div className="form__group" style={{ flex: '1 1 0', minWidth: 220 }}>
                            <label className="form__label" style={{ marginBottom: '0.32rem', display: 'block' }}>Contraseña</label>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                    className="form__input"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    aria-label="Contraseña"
                                    style={{ width: '100%', paddingRight: 44, height: 44, boxSizing: 'border-box' }}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => { setPasswordFocused(false); setPasswordTouched(true); }}
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
                                    <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} style={{ color: passwordFocused ? 'var(--color-primario)' : 'var(--color-texto-secundario)' }} />
                                </button>
                            </div>
                            {/* Mensajes de validación de la contraseña justo debajo del input */}
                            {passwordTouched && passwordErrors.length > 0 && (
                                <div style={{ marginTop: 6 }}>
                                    {passwordErrors.map((err, i) => (
                                        <p key={i} className="form__error-text" style={{ margin: '4px 0' }}>{err}</p>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form__group" style={{ flex: '1 1 0', minWidth: 220 }}>
                            <label className="form__label" style={{ marginBottom: '0.32rem', display: 'block' }}>Confirmar contraseña</label>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                    className="form__input"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    aria-label="Confirmar contraseña"
                                    style={{ width: '100%', paddingRight: 44, height: 44, boxSizing: 'border-box' }}
                                    onBlur={() => setConfirmTouched(true)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(prev => !prev)}
                                    aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                                    title={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
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
                                        color: confirmTouched ? 'var(--color-primario)' : 'var(--color-texto-secundario)',
                                        lineHeight: 1
                                    }}
                                >
                                    <Icon name={showConfirmPassword ? 'visibility_off' : 'visibility'} size={20} style={{ color: confirmTouched ? 'var(--color-primario)' : 'var(--color-texto-secundario)' }} />
                                </button>
                            </div>
                            {/* Mostrar inline el mensaje de mismatch si el usuario ya tocó el campo o ingresó confirmPassword */}
                            {(confirmTouched || confirmPassword) && confirmError && (
                                <p className="form__error-text" style={{ margin: '4px 0' }}>{confirmError}</p>
                            )}
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
                                setConfirmPassword('');
                                setPasswordErrors([]);
                                setConfirmError('');
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
                            disabled={
                                loading ||
                                !isPasswordValid ||
                                !username ||
                                usernameExists ||
                                !!usernameError ||
                                (email && (emailExists || !emailValid))
                            }
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
                        <div className="modal__content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: 900, width: '92%', padding: 12 }}>
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
