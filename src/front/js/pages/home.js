import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import ServidorCargaMasiva from '../component/ServidorCargaMasiva';
import Icon from '../component/Icon';

const Home = (props) => {
    // Este estado controla cuándo se añade la clase para la animación
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();
    const [modalCargaVisible, setModalCargaVisible] = useState(false);

    const ActionButton = ({ icon, text, onClick, minWidth = 200 }) => (
        <button
            onClick={onClick}
            className="action-button"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '12px 20px',
                minWidth: minWidth,
                whiteSpace: 'nowrap', // evitar quiebre de texto dentro del botón
                justifyContent: 'center',
                borderRadius: 10,
                fontWeight: 600,
                cursor: 'pointer'
            }}
        >
            {icon}
            <span>{text}</span>
        </button>
    );

    // Este efecto añade la clase 'loaded' después de que el componente se monte
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Asegurar que Material Symbols Outlined esté cargado para usar el icono "groups"
    useEffect(() => {
        // Usar la URL que incluye icon_names=groups para asegurar disponibilidad del glifo específico
        const href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=groups";
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.href = href;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }, []);

    useEffect(() => {
        document.body.style.overflow = modalCargaVisible ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [modalCargaVisible]);

    const handleNavigate = (ruta) => {
        navigate(ruta);
    };

    const handleUploadSuccess = (mensaje) => {
        Swal.fire({
            icon: "success",
            title: mensaje,
            showConfirmButton: false,
            timer: 2000,
        });
        setModalCargaVisible(false);
    };

    // nuevo: detectar si hay sesión activa (leer rol) y actualizar al recibir authChanged
    const [userRole, setUserRole] = useState(() => localStorage.getItem('auth_role') || null);

    useEffect(() => {
        function onAuthChanged() {
            setUserRole(localStorage.getItem('auth_role') || null);
        }
        window.addEventListener('authChanged', onAuthChanged);
        return () => window.removeEventListener('authChanged', onAuthChanged);
    }, []);

    // Navegar a la página de carga masiva (o abrir modal de carga masiva)
    const handleCargaMasiva = () => {
        // Si dispones de una ruta para carga masiva, navegar a ella:
        navigate('/editor-masivo');
        // Si prefieres abrir un modal, reemplaza lo anterior por la lógica del modal.
    };

    return (
        <>
            {/* Incluir la fuente Audiowide y la clase para usarla */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
                .audiowide-regular {
                    font-family: "Audiowide", sans-serif;
                    font-weight: 400;
                    font-style: normal;
                }
            `}</style>

            {/* La clase 'loaded' se aplica aquí cuando isLoaded es true */}
            <div className={`page-container home-page ${isLoaded ? 'loaded' : ''}`}>
                {/* espacio en blanco intencional arriba del hero */}

                <section className="hero" aria-labelledby="hero-title" role="region">
                    <div className="hero__content" style={{ position: 'relative', zIndex: 1 }}>
                        {/* Líneas animadas: top / bottom (crecen horizontalmente desde el centro hacia los lados) */}
                        <div className="hero__line hero__line--top" aria-hidden="true" />
                        <div className="hero__line hero__line--bottom" aria-hidden="true" />

                        <h1
                            id="hero-title"
                            className="hero__title audiowide-regular hero__title--appear"
                            // fallback inline para asegurar visibilidad si la animación CSS no se ejecuta
                            style={{
                                opacity: isLoaded ? 1 : undefined,
                                // mantener valor inicial en caso de que CSS no se aplique; la animación principal la controla CSS
                                transform: isLoaded ? undefined : 'translateY(10px)'
                            }}
                        >
                            G.I.B.S.
                        </h1>

                        {/* línea en blanco entre título y subtítulo */}

                        <p
                            className="hero__subtitle hero__subtitle--appear"
                            style={{
                                opacity: isLoaded ? 1 : undefined,
                                transform: isLoaded ? undefined : 'translateY(10px)'
                            }}
                        >
                            "Gestión de la Información y Búsqueda de servidores"
                        </p>
                    </div>
                </section>

                {/* espacio en blanco intencional después del hero */}

                <main className="main-content-area">
                    <div className="actions-section">


                        <ActionButton
                            text="Búsqueda"
                            icon={<Icon name="search" size={24} />}
                            onClick={() => handleNavigate('/editor-masivo')}
                        />
                        {userRole && (
                            <>
                                <ActionButton
                                    text="Carga Masiva"
                                    icon={<Icon name="upload-cloud" size={24} />}
                                    onClick={() => setModalCargaVisible(true)}
                                />
                                {userRole === 'GERENTE' && (
                                    <ActionButton
                                        text="Administrar Usuarios"
                                        icon={<span className="material-symbols-outlined" style={{ fontSize: 24 }}>groups</span>}
                                        onClick={() => handleNavigate('/administrar-usuarios')}
                                    />
                                )}
                            </>
                        )}

                    </div>
                </main>
            </div>

            {modalCargaVisible && (
                <ServidorCargaMasiva
                    onClose={() => setModalCargaVisible(false)}
                    actualizarServidores={handleUploadSuccess}
                />
            )}

            {/* Administrar Usuarios se abre vía ruta /administrar-usuarios (no modal) */}
        </>
    );
};

export default Home;

