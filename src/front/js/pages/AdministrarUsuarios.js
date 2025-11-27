import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdministrarUsuariosTabla from '../component/AdministrarUsuariosTabla';
import Swal from 'sweetalert2';
import Icon from '../component/Icon';
import banescoLogo from '../../img/BanescoServers.png';

export const CrearUsuarioForm = ({ setModalVisible, initialData = null }) => {
    const [username, setUsername] = useState(initialData?.username || '');
    const USERNAME_MIN_LEN = 4;
    const [usernameError, setUsernameError] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [confirmError, setConfirmError] = useState('');
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [confirmTouched, setConfirmTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState(initialData?.email || '');
    const [emailValid, setEmailValid] = useState(true);
    const [usernameExists, setUsernameExists] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [checkingExistence, setCheckingExistence] = useState(false);
    const [role, setRole] = useState(initialData?.role || 'ESPECIALISTA');
    const [loading, setLoading] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const roleSelectRef = React.useRef(null);
    const [roleOpen, setRoleOpen] = React.useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const validatePassword = (pwd, conf) => {
        const errors = [];
        if (!pwd || pwd.length < 6) errors.push('La contraseña debe tener al menos 6 caracteres.');
        if (!/[A-Z]/.test(pwd)) errors.push('Incluir al menos una letra mayúscula.');
        if (!/[a-z]/.test(pwd)) errors.push('Incluir al menos una letra minúscula.');
        if (!/[0-9]/.test(pwd)) errors.push('Incluir al menos un número.');
        if (!/[!@#$%^&*()_\-+=\[\]{};:\\|,.<>/?]/.test(pwd)) errors.push('Incluir al menos un carácter especial (ej. !@#$%).');
        const confErr = (pwd && conf && pwd !== conf) ? 'La contraseña y su confirmación no coinciden.' : '';
        return { errors, confErr, valid: errors.length === 0 && confErr === '' };
    };
    const validateEmail = (em) => {
        if (!em) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    };

    useEffect(() => {
        const { errors, confErr, valid } = validatePassword(password, confirmPassword);
        setPasswordErrors(errors);
        setConfirmError(confErr);
        setIsPasswordValid(valid);
        setEmailValid(validateEmail(email));
    }, [password, confirmPassword, email]);

    useEffect(() => {
        if (!username) { setUsernameError(''); return; }
        if (String(username).trim().length < USERNAME_MIN_LEN) {
            setUsernameError(`El usuario debe tener al menos ${USERNAME_MIN_LEN} caracteres.`);
        } else setUsernameError('');
    }, [username]);

    const checkExists = async (field, value) => {
        if (!value) {
            if (field === 'username') setUsernameExists(false);
            if (field === 'email') setEmailExists(false);
            return;
        }
        if (field === 'email' && !validateEmail(value)) { setEmailExists(false); return; }
        try {
            setCheckingExistence(true);
            const res = await fetch(`${process.env.BACKEND_URL || ''}/api/auth/users`, {
                method: 'GET',
                headers: { ...getAuthHeaders() }
            });
            if (!res.ok) return;
            const users = await res.json();
            if (field === 'username') setUsernameExists(users.some(u => u.username && u.username.toLowerCase() === String(value).toLowerCase()));
            else setEmailExists(users.some(u => u.email && u.email.toLowerCase() === String(value).toLowerCase()));
        } catch (err) {
            console.error('Error comprobando existencia:', err);
        } finally {
            setCheckingExistence(false);
        }
    };

    const handleSubmit = async (e) => {
        e && e.preventDefault();
        if (!username || !password) return Swal.fire('Campos requeridos', 'Usuario y contraseña son obligatorios.', 'warning');
        const { errors, confErr, valid } = validatePassword(password, confirmPassword);
        setPasswordTouched(true);
        setConfirmTouched(true);

        if (confErr && (!errors || errors.length === 0)) {
            Swal.fire({ icon: 'error', title: 'Contraseña inválida', text: confErr });
            setPasswordErrors(errors || []);
            setConfirmError(confErr);
            return;
        }

        if (!username || String(username).trim().length < USERNAME_MIN_LEN) {
            setUsernameTouched && setUsernameTouched(true);
            setUsernameError(`El usuario debe tener al menos ${USERNAME_MIN_LEN} caracteres.`);
            return Swal.fire('Usuario inválido', `El usuario debe tener al menos ${USERNAME_MIN_LEN} caracteres.`, 'warning');
        }

        if (!valid && !(initialData && !password)) {
            const filteredConfErr = confErr ? '' : '';
            const html = `<ul style="text-align:left">${errors.map(e => `<li>${e}</li>`).join('')}${filteredConfErr ? `<li>${filteredConfErr}</li>` : ''}</ul>`;
            Swal.fire({ icon: 'error', title: 'Contraseña inválida', html });
            setPasswordErrors(errors);
            setConfirmError(confErr);
            return;
        }
        setLoading(true);
        try {
            let res, data;
            if (initialData && initialData.id) {
                res = await fetch(`${process.env.BACKEND_URL || ''}/api/auth/users/${initialData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                    body: JSON.stringify({ username, ...(password ? { password } : {}), role, email })
                });
                data = await res.json();
                if (!res.ok) throw new Error(data.error || JSON.stringify(data));
                Swal.fire({ icon: 'success', title: 'Usuario actualizado', showConfirmButton: false, timer: 1500 });
            } else {
                res = await fetch(`${process.env.BACKEND_URL || ''}/api/auth/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                    body: JSON.stringify({ username, password, role, email })
                });
                data = await res.json();
                if (!res.ok) throw new Error(data.error || JSON.stringify(data));
                Swal.fire({ icon: 'success', title: 'Usuario creado', showConfirmButton: false, timer: 1500 });
            }
            setUsername(''); setPassword(''); setEmail(''); setRole('ESPECIALISTA');
            setConfirmPassword('');
            setPasswordErrors([]);
            setConfirmError('');
            setUsernameExists(false);
            setEmailExists(false);
            try {
                const currentUser = localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user')) : null;
                if (initialData && data && currentUser && Number(currentUser.id) === Number(data.id || initialData.id)) {
                    const newUser = { ...currentUser, ...data };
                    localStorage.setItem('auth_user', JSON.stringify(newUser));
                    window.dispatchEvent(new Event('authChanged'));
                }
            } catch (err) {
                console.warn('No se pudo actualizar auth_user en localStorage', err);
            }
            window.dispatchEvent(new Event('usuariosChanged'));
            setModalVisible && setModalVisible(false);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', err.message || 'No se pudo crear el usuario.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const currentRole = localStorage.getItem('auth_role');
    if (!initialData && currentRole !== 'GERENTE') return null;

    useEffect(() => {
        if (initialData) {
            setUsername(initialData.username || '');
            setEmail(initialData.email || '');
            setRole(initialData.role || 'ESPECIALISTA');
        }
    }, [initialData]);

    return (
        <section style={{ background: 'var(--color-superficie)', padding: '1rem', borderRadius: 8, boxShadow: 'var(--sombra-caja)', margin: '1rem auto', width: '100%', maxWidth: 860 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <img
                    src={banescoLogo}
                    alt="Banesco Servers"
                    style={{ height: 56, objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            </div>
            <h3 style={{ marginTop: 0, textAlign: 'center' }}>{initialData ? 'Editar usuario' : 'Crear usuario'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'block', gap: '0.8rem' }}>
                <div className="form__row" style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <div className="form__group" style={{ flex: '1 1 0', minWidth: 200 }}>
                        <label className="form__label" style={{ marginBottom: '0.45rem', display: 'block' }}>Usuario</label>
                        <div className={`input-locked`} style={{ position: 'relative' }}>
                            <input
                                className="form__input"
                                value={username}
                                onChange={e => { setUsername(e.target.value); setUsernameExists(false); setUsernameError(''); }}
                                onBlur={() => { checkExists('username', username); }}
                                disabled={!!initialData}
                            />
                            {initialData && (
                                <span className="locked-icon" title="Campo bloqueado">
                                    <Icon name="lock" size={16} />
                                </span>
                            )}
                        </div>
                        {usernameError && <p className="form__error-text" style={{ margin: '6px 0 0' }}>{usernameError}</p>}
                        {usernameExists && !usernameError && <p className="form__error-text" style={{ margin: '6px 0 0' }}>El usuario ya existe.</p>}
                    </div>

                    <div className="form__group" style={{ flex: '1 1 0', minWidth: 200 }}>
                        <label className="form__label" style={{ marginBottom: '0.45rem', display: 'block' }}>Email (opcional)</label>
                        <div className="input-locked" style={{ position: 'relative' }}>
                            <input
                                className="form__input"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setEmailExists(false); setEmailValid(validateEmail(e.target.value)); }}
                                onBlur={() => checkExists('email', email)}
                                disabled={!!initialData}
                            />
                            {initialData && (
                                <span className="locked-icon" title="Campo bloqueado">
                                    <Icon name="lock" size={16} />
                                </span>
                            )}
                        </div>
                        {!emailValid && <p className="form__error-text" style={{ margin: '6px 0 0' }}>Email inválido.</p>}
                        {email && emailValid && emailExists && <p className="form__error-text" style={{ margin: '6px 0 0' }}>El correo ya está registrado.</p>}
                    </div>

                    <div className="form__group" style={{ flex: '1 1 0', minWidth: 160 }}>
                        <label className="form__label" style={{ marginBottom: '0.45rem', display: 'block' }}>Rol</label>
                        {initialData ? (
                            <div className="input-locked" style={{ position: 'relative', display: 'inline-block' }}>
                                <div style={{ padding: '8px 10px', background: 'transparent', borderRadius: 6, border: '1px solid var(--color-borde)' }}>
                                    <span style={{ fontWeight: 600 }}>{role}</span>
                                </div>
                                <span className="locked-icon" aria-hidden="true" title="Campo no editable">
                                    <Icon name="lock" size={16} />
                                </span>
                            </div>
                        ) : (
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
                        )}
                    </div>
                </div>

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
                        borderTop: 'none',
                        paddingTop: '0.6rem'
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
                            !username ||
                            usernameExists ||
                            !!usernameError ||
                            (email && (emailExists || !emailValid)) ||
                            (!initialData && !isPasswordValid)
                        }
                        style={{ minWidth: 160, width: 160 }}
                    >
                        {loading ? (initialData ? 'Guardando...' : 'Creando...') : (
                            initialData ? 'Guardar' : (<><Icon name="login" /> Crear Usuario</>)
                        )}
                    </button>
                </div>
            </form>
        </section>
    );
};

const AdministrarUsuariosPage = () => {
    const [userRole, setUserRole] = useState(() => localStorage.getItem('auth_role') || null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createInitialData, setCreateInitialData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        function onAuthChanged() { setUserRole(localStorage.getItem('auth_role') || null); }
        window.addEventListener('authChanged', onAuthChanged);
        return () => window.removeEventListener('authChanged', onAuthChanged);
    }, []);

    useEffect(() => {
        const checkTokenAndRedirect = () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                navigate('/', { replace: true });
            }
        };
        checkTokenAndRedirect();
        window.addEventListener('authChanged', checkTokenAndRedirect);
        return () => window.removeEventListener('authChanged', checkTokenAndRedirect);
    }, [navigate]);

    useEffect(() => {
        const handler = (e) => {
            setCreateInitialData(e?.detail || null);
            setShowCreateModal(true);
        };
        window.addEventListener('openCreateUser', handler);
        return () => window.removeEventListener('openCreateUser', handler);
    }, []);

    return (
        <div className="layout-container">
            <main style={{ paddingTop: 80, minHeight: 'calc(100vh - 160px)' }}>
                <AdministrarUsuariosTabla />
                {showCreateModal && (
                    <div className="modal__overlay" onClick={() => setShowCreateModal(false)}>
                        <div className="modal__content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: 900, width: '92%', padding: 12 }}>
                            <button
                                className="btn-close"
                                onClick={() => setShowCreateModal(false)}
                                aria-label="Cerrar"
                                style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
                            />
                            <CrearUsuarioForm setModalVisible={() => setShowCreateModal(false)} initialData={createInitialData} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdministrarUsuariosPage;

const CrearUsuarioFormWrapper = ({ onClose }) => {
    return <CrearUsuarioForm setModalVisible={onClose} />;
};