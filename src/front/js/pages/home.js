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

    const ActionButton = ({ icon, text, onClick }) => (
        <button onClick={onClick} className="action-button">
            {icon}
            <span>{text}</span>
        </button>
    );

    // Este efecto añade la clase 'loaded' después de que el componente se monte
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
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
                <section className="hero">
                    <div className="hero__content">
                        <h1 className="hero__title audiowide-regular">
                            G.I.B.S.
                        </h1>
                        <p className="hero__subtitle">
                            "Gestión de la Información y Búsqueda de servidores"
                        </p>
                    </div>
                </section>

                <main className="main-content-area">
                    <div className="actions-section">


                        <ActionButton
                            text="Búsqueda"
                            icon={<Icon name="search" size={24} />}
                            onClick={() => handleNavigate('/editor-masivo')}
                        />
                        {userRole && (
                            <ActionButton
                                text="Carga Masiva"
                                icon={<Icon name="upload-cloud" size={24} />}
                                onClick={() => setModalCargaVisible(true)}
                            />
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
        </>
    );
};

export default Home;
