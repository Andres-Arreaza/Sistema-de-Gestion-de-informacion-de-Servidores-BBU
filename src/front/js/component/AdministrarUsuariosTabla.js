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

    return (
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 1100 }}>
                {/* Filtro por cualquier campo (arriba de la tabla) */}
                {/* filtro + crear: alineados a la misma altura */}
                <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
                    {/* wrapper para input + icon dentro */}
                    <div style={{ position: 'relative', width: 250, maxWidth: '100%' }}>
                        <span className="material-symbols-outlined" aria-hidden="true"
                            style={{
                                position: 'absolute',
                                left: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: 20,
                                color: 'var(--color-texto-secundario)',
                                pointerEvents: 'none',
                                marginTop: -4
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
                                padding: '8px 12px 8px 38px', /* espacio para el icono dentro */
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
                            lineHeight: '40px',
                            margin: 0,
                            marginTop: -10,
                            verticalAlign: 'middle'
                        }}
                    >
                        Crear Usuario
                    </button>
                </div>

                <div style={{ background: 'var(--color-superficie)', padding: '1rem', borderRadius: 8, boxShadow: 'var(--sombra-caja)' }}>
                    {cargando ? <p style={{ textAlign: 'center' }}>Cargando usuarios...</p> : (
                        filteredUsuarios.length === 0 ? <p style={{ textAlign: 'center' }}>No hay usuarios para mostrar.</p> : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', margin: '0 auto', textAlign: 'center' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'center' }}>#</th>
                                            <th style={{ textAlign: 'center' }}>Usuario</th>
                                            <th style={{ textAlign: 'center' }}>Email</th>
                                            <th style={{ textAlign: 'center' }}>Rol</th>
                                            <th style={{ textAlign: 'center' }}>Fecha de Creación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsuarios.map((u, idx) => (
                                            <tr key={u.id ?? u.username}>
                                                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                                <td style={{ textAlign: 'center' }}>{u.username ?? '—'}</td>
                                                <td style={{ textAlign: 'center' }}>{u.email ?? '—'}</td>
                                                <td style={{ textAlign: 'center' }}>{u.role ?? (u.role && u.role.value) ?? '—'}</td>
                                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleString() : '—'}</td>
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
    );
};

export default AdministrarUsuariosTabla;
