import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { CrearUsuarioForm } from '../pages/AdministrarUsuarios';

const Perfil = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('auth_user');
            const parsed = raw ? JSON.parse(raw) : null;
            if (parsed) setUser(parsed);
            else navigate('/', { replace: true });
        } catch (err) {
            console.error('No se pudo cargar usuario desde localStorage', err);
            navigate('/', { replace: true });
        }
    }, [navigate]);

    if (!user) return null;

    return (
        <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', padding: 16, boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: 920, display: 'flex', justifyContent: 'center' }}>
                <div style={{
                    width: '100%',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 12px 30px rgba(2,6,23,0.12)',
                    background: 'var(--color-fondo)',
                    position: 'relative'
                }}>
                    <button
                        aria-label="Editar perfil"
                        title="Editar perfil"
                        onClick={() => setShowEditModal(true)}
                        style={{
                            position: 'absolute',
                            right: 12,
                            top: 12,
                            background: 'rgba(255,255,255,0.08)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 8,
                            borderRadius: 8,
                            zIndex: 30,
                            color: '#fff'
                        }}
                    >
                        <Icon name="edit" size={18} />
                    </button>

                    <header style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '18px 20px',
                        background: 'linear-gradient(135deg, #021027 0%, #004477 0%, #007953 90%)',
                        color: '#fff'
                    }}>
                        <div style={{
                            width: 72,
                            height: 72,
                            borderRadius: 36,
                            background: 'rgba(255,255,255,0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 30,
                            fontWeight: 700,
                            boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.08)'
                        }}>
                            {user.username ? String(user.username).charAt(0).toUpperCase() : <Icon name="person" />}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>{user.username || 'Usuario'}</h2>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>{user.email || ''}</p>
                        </div>
                    </header>

                    <div style={{
                        padding: 18,
                        background: 'linear-gradient(180deg, rgba(0,121,83,0.03) 0%, rgba(255,255,255,1) 60%)'
                    }}>
                        <h3 style={{ marginTop: 0, color: 'var(--color-primario)' }}>Información</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', rowGap: 10, columnGap: 14 }}>
                            <div style={{ color: 'rgba(2,6,23,0.6)' }}>Nombre de usuario</div>
                            <div style={{ color: 'var(--color-texto-principal)' }}>{user.username}</div>

                            <div style={{ color: 'rgba(2,6,23,0.6)' }}>Email</div>
                            <div style={{ color: 'var(--color-texto-principal)' }}>{user.email || '—'}</div>

                            <div style={{ color: 'rgba(2,6,23,0.6)' }}>Rol</div>
                            <div style={{ color: 'var(--color-texto-principal)' }}>{user.role || localStorage.getItem('auth_role') || '—'}</div>

                            <div style={{ color: 'rgba(2,6,23,0.6)' }}>Activo desde</div>
                            <div style={{ color: 'var(--color-texto-principal)' }}>{user.fecha_creacion ? new Date(user.fecha_creacion).toLocaleString() : '—'}</div>
                        </div>

                        <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
                            <button className="btn btn--secondary" onClick={() => navigate(-1)}>Volver</button>
                        </div>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <div className="modal__overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal__content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: 900, width: '92%', padding: 12 }}>
                        <button className="btn-close" onClick={() => setShowEditModal(false)} aria-label="Cerrar" style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }} />
                        <CrearUsuarioForm setModalVisible={() => setShowEditModal(false)} initialData={user} />
                    </div>
                </div>
            )}
        </section>
    );
};

export default Perfil;
