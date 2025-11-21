import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Icon from './Icon';
import '../../styles/pages.css';

const AdministrarUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', role: 'ESPECIALISTA', email: '' });
    const [loadingCreate, setLoadingCreate] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchUsuarios = async () => {
        setCargando(true);
        try {
            const backend = process.env.BACKEND_URL || '';
            const candidates = ['/api/users', '/api/auth/users', '/api/usuarios'];
            let data = null;
            for (const path of candidates) {
                try {
                    const res = await fetch(`${backend}${path}`, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } });
                    if (!res.ok) continue;
                    data = await res.json();
                    break;
                } catch (err) {
                    // seguir al siguiente endpoint candidato
                }
            }
            if (!data) {
                setUsuarios([]);
                console.warn('No se pudo obtener lista de usuarios; revisa los endpoints disponibles en el backend.');
                return;
            }
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudieron cargar los usuarios.', 'error');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) {
            return Swal.fire('Campos requeridos', 'Usuario y contraseña son obligatorios.', 'warning');
        }
        setLoadingCreate(true);
        try {
            const backend = process.env.BACKEND_URL || '';
            const res = await fetch(`${backend}/api/auth/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ username: form.username, password: form.password, role: form.role, email: form.email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
            Swal.fire({ icon: 'success', title: 'Usuario creado', timer: 1500, showConfirmButton: false });
            setForm({ username: '', password: '', role: 'ESPECIALISTA', email: '' });
            fetchUsuarios();
        } catch (err) {
            console.error(err);
            Swal.fire('Error', err.message || 'No se pudo crear el usuario.', 'error');
        } finally {
            setLoadingCreate(false);
        }
    };

    return (
        <div style={{ padding: '1rem', maxWidth: 1100, margin: '0 auto' }}>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2>Administrar Usuarios</h2>
                {/* Botón de refrescar eliminado intencionadamente */}
            </header>

            <section style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1rem' }}>
                <div style={{ background: 'var(--color-superficie)', padding: '1rem', borderRadius: 8, boxShadow: 'var(--sombra-caja)' }}>
                    <h3 style={{ marginTop: 0 }}>Usuarios existentes</h3>
                    {cargando ? <p>Cargando...</p> : (
                        usuarios.length === 0 ? <p>No hay usuarios para mostrar.</p> : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Usuario</th>
                                            <th>Email</th>
                                            <th>Rol</th>
                                            <th>Activo</th>
                                            <th>Creado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.id}</td>
                                                <td>{u.username}</td>
                                                <td>{u.email || '—'}</td>
                                                <td>{u.role || (u.role && u.role.value) || '—'}</td>
                                                <td>{u.activo ? 'Sí' : 'No'}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>{u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleString() : ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>

                <aside style={{ background: 'var(--color-superficie)', padding: '1rem', borderRadius: 8, boxShadow: 'var(--sombra-caja)' }}>
                    <h3 style={{ marginTop: 0 }}>Crear usuario</h3>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <label className="form__label">Usuario</label>
                        <input name="username" value={form.username} onChange={handleInput} className="form__input" />

                        <label className="form__label">Contraseña</label>
                        <input type="password" name="password" value={form.password} onChange={handleInput} className="form__input" />

                        <label className="form__label">Email (opcional)</label>
                        <input name="email" value={form.email} onChange={handleInput} className="form__input" />

                        <label className="form__label">Rol</label>
                        <select name="role" value={form.role} onChange={handleInput} className="form__input">
                            <option value="ESPECIALISTA">ESPECIALISTA</option>
                            <option value="GERENTE">GERENTE</option>
                        </select>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'center' }}>
                            <button type="button" className="btn btn--secondary" onClick={() => setForm({ username: '', password: '', role: 'ESPECIALISTA', email: '' })} disabled={loadingCreate}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn--primary" disabled={loadingCreate}>
                                {loadingCreate ? 'Creando...' : 'Crear Usuario'}
                            </button>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--color-texto-secundario)' }}>
                            Nota: la creación requiere que tu sesión tenga permisos (GERENTE). Si no tienes permisos, el backend rechazará la petición.
                        </p>
                    </form>
                </aside>
            </section>
        </div>
    );
};

export default AdministrarUsuarios;
