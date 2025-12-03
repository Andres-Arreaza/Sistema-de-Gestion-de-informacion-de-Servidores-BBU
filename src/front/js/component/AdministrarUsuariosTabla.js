import React, { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import Icon from './Icon';

const AdministrarUsuariosTabla = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [query, setQuery] = useState('');

    // Asegurar que Material Symbols Outlined esté cargado para usar el icono "search"
    useEffect(() => {
        const href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.href = href;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchUsuarios = async () => {
        setCargando(true);
        try {
            const backend = process.env.BACKEND_URL || '';
            const candidates = ['/api/users', '/api/auth/users', '/api/usuarios', '/auth/users'];
            let data = null;
            let lastError = null;
            for (const path of candidates) {
                try {
                    const res = await fetch(`${backend}${path}`, {
                        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
                    });
                    if (res.status === 401 || res.status === 403) {
                        Swal.fire('No autorizado', 'Tu sesión expiró o no tienes permiso para ver usuarios. Inicia sesión.', 'warning');
                        setUsuarios([]);
                        setCargando(false);
                        return;
                    }
                    if (!res.ok) {
                        lastError = `HTTP ${res.status} en ${path}`;
                        continue;
                    }
                    const contentType = res.headers.get('content-type') || '';
                    if (contentType.includes('application/json')) {
                        const json = await res.json();
                        if (Array.isArray(json)) data = json;
                        else if (Array.isArray(json.users)) data = json.users;
                        else if (Array.isArray(json.data)) data = json.data;
                        else if (Array.isArray(json.result)) data = json.result;
                        else {
                            const arr = Object.values(json).find(v => Array.isArray(v));
                            if (arr) data = arr;
                            else {
                                lastError = `Respuesta JSON sin lista en ${path}`;
                                continue;
                            }
                        }
                        break;
                    } else {
                        lastError = `Tipo de contenido inesperado (${contentType}) en ${path}`;
                        continue;
                    }
                } catch (err) {
                    lastError = err.message;
                }
            }
            if (!data) {
                setUsuarios([]);
                console.warn('No se encontró endpoint de usuarios en el backend. Último error:', lastError);
                Swal.fire('Sin datos', 'No se pudo obtener la lista de usuarios desde el backend. Revisa la consola y los endpoints.', 'info');
                return;
            }
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudieron cargar los usuarios.', 'error');
            setUsuarios([]);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
        function handleUsuariosChanged() { fetchUsuarios(); }
        window.addEventListener('usuariosChanged', handleUsuariosChanged);
        return () => window.removeEventListener('usuariosChanged', handleUsuariosChanged);
    }, []);

    // Filtrado por nombre de usuario únicamente (case-insensitive)
    const filteredUsuarios = useMemo(() => {
        if (!query || !query.trim()) return usuarios;
        const q = query.trim().toLowerCase();
        return usuarios.filter(u => (u.username || '').toLowerCase().includes(q));
    }, [usuarios, query]);

    // nueva función: eliminar usuario (borrado lógico o permanente según query param)
    const handleDeleteUser = async (userId, username) => {
        if (!userId) return Swal.fire('Error', 'Usuario inválido', 'error');
        const confirm = await Swal.fire({
            title: `Eliminar usuario ${username || ''}?`,
            text: "Esta acción eliminará el usuario PERMANENTEMENTE de la base de datos.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "var(--color-error)"
        });
        if (!confirm.isConfirmed) return;

        try {
            const backend = process.env.BACKEND_URL || '';
            // solicitar borrado permanente usando query param hard=true
            const res = await fetch(`${backend}/api/auth/users/${userId}?hard=true`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
            });
            const contentType = res.headers.get('content-type') || '';
            const data = contentType.includes('application/json') ? await res.json() : null;
            if (!res.ok) {
                const msg = data?.error || data?.msg || `Error ${res.status}`;
                throw new Error(msg);
            }
            Swal.fire('Eliminado', `Usuario ${username || userId} eliminado.`, 'success');
            window.dispatchEvent(new Event('usuariosChanged'));
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
            Swal.fire('Error', err.message || 'No se pudo eliminar el usuario.', 'error');
        }
    };

    return (
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 1100 }}>
                {/* Filtro por cualquier campo (arriba de la tabla) */}
                {/* filtro + crear: alineados a la misma altura */}
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 360, maxWidth: '100%' }}>
                        <span className="material-symbols-outlined" aria-hidden="true"
                            style={{
                                position: 'absolute',
                                left: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                marginTop: -3, /* desplazar el icono ligeramente hacia arriba */
                                fontSize: 20,
                                color: 'var(--color-texto-secundario)',
                                pointerEvents: 'none'
                            }}>
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por usuario..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="form__input"
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 38px',
                                height: 40,
                                boxSizing: 'border-box',
                                display: 'inline-flex',
                                alignItems: 'center',
                                verticalAlign: 'middle'
                            }}
                            aria-label="Buscar usuarios por nombre"
                        />
                    </div>

                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => window.dispatchEvent(new Event('openCreateUser'))}
                        title="Crear usuario"
                        style={{
                            height: 40,
                            padding: '8px 12px',
                            fontSize: '0.88rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 140,
                            whiteSpace: 'nowrap',
                            boxSizing: 'border-box',
                            lineHeight: '1',
                            margin: 0,
                            marginTop: -8, /* desplaza el botón -5px hacia arriba */
                            verticalAlign: 'middle'
                        }}
                    >
                        Crear Usuario
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: 1100, background: 'var(--color-superficie)', padding: '1rem', borderRadius: 8, boxShadow: 'var(--sombra-caja)' }}>
                        {cargando ? <p style={{ textAlign: 'center' }}>Cargando usuarios...</p> : (
                            filteredUsuarios.length === 0 ? <p style={{ textAlign: 'center' }}>No hay usuarios para mostrar.</p> : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse', margin: '0 auto' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'center' }}>#</th>
                                                <th style={{ textAlign: 'center' }}>Usuario</th>
                                                <th style={{ textAlign: 'center' }}>Email</th>
                                                <th style={{ textAlign: 'center' }}>Rol</th>
                                                <th style={{ textAlign: 'center' }}>Creado</th>
                                                <th className="col-eliminar" style={{ textAlign: 'center', width: 110 }}>Eliminar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsuarios.map((u, idx) => (
                                                <tr key={u.id ?? u.username}>
                                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{idx + 1}</td>
                                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{u.username ?? '—'}</td>
                                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{u.email ?? '—'}</td>
                                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{u.role ?? (u.role && u.role.value) ?? '—'}</td>
                                                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleString() : '—'}</td>
                                                    {/* Celda alineada como table-cell para mantener altura consistente con otras celdas */}
                                                    <td className="col-eliminar" style={{ textAlign: 'center', verticalAlign: 'middle', padding: '6px 0' }}>
                                                        <button
                                                            type="button"
                                                            className="btn-icon"
                                                            title={`Eliminar ${u.username || ''}`}
                                                            onClick={() => handleDeleteUser(u.id, u.username)}
                                                            aria-label={`Eliminar ${u.username || ''}`}
                                                            style={{
                                                                width: 28,
                                                                height: 28,
                                                                padding: 0,
                                                                borderRadius: 6,
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                margin: '0 auto',
                                                                lineHeight: 1,
                                                                background: '#007953',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                color: '#fff'
                                                            }}
                                                        >
                                                            <Icon name="trash" size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdministrarUsuariosTabla;
