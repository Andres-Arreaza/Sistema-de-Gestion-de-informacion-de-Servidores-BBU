import React, { useEffect, useState } from 'react';
import AdministrarUsuariosTabla from '../component/AdministrarUsuariosTabla';
import Swal from 'sweetalert2';

const AdministrarUsuariosPage = () => {
    // useEffect(() => { document.title = 'Administrar Usuarios — G.I.B.S.'; }, []);

    const [userRole, setUserRole] = useState(() => localStorage.getItem('auth_role') || null);
    const [showCreateModal, setShowCreateModal] = useState(false); // controla el modal de creación

    useEffect(() => {
        function onAuthChanged() { setUserRole(localStorage.getItem('auth_role') || null); }
        window.addEventListener('authChanged', onAuthChanged);
        return () => window.removeEventListener('authChanged', onAuthChanged);
    }, []);

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

        return (
            <section style={{ background: 'var(--color-superficie)', padding: '1rem', borderRadius: 8, boxShadow: 'var(--sombra-caja)', margin: '1rem' }}>
                <h3 style={{ marginTop: 0 }}>Crear usuario</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                        <label className="form__label">Usuario</label>
                        <input className="form__input" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div>
                        <label className="form__label">Email (opcional)</label>
                        <input className="form__input" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="form__label">Contraseña</label>
                        <input className="form__input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div>
                        <label className="form__label">Rol</label>
                        <select className="form__input" value={role} onChange={e => setRole(e.target.value)}>
                            <option value="ESPECIALISTA">ESPECIALISTA</option>
                            <option value="GERENTE">GERENTE</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                        <button type="button" className="btn btn--secondary" onClick={() => { setUsername(''); setPassword(''); setEmail(''); setRole('ESPECIALISTA'); }} disabled={loading}>Cancelar</button>
                        <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? 'Creando...' : 'Crear Usuario'}</button>
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
                        <div className="modal__content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, width: '95%' }}>
                            <button className="btn-close" onClick={() => setShowCreateModal(false)} />
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
