import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import ServidorCargaMasiva from '../component/ServidorCargaMasiva';
import Icon from '../component/Icon';

const Home = () => {
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

    return (
        <>
            {/* La clase 'loaded' se aplica aquí cuando isLoaded es true */}
            <div className={`page-container home-page ${isLoaded ? 'loaded' : ''}`}>
                <section className="hero">
                    <div className="hero__content">
                        <h1 className="hero__title">
                            Gerencia de Operaciones de Canales Virtuales y Medios de Pagos
                        </h1>
                        <p className="hero__subtitle">
                            "Gestiona y visualiza servidores"
                        </p>
                    </div>
                </section>

                <main className="main-content-area">
                    <div className="actions-section">
                        {
                            /*
                            <ActionButton
                            text="Búsqueda"
                            icon={<Icon name="search" size={24} />}
                            onClick={() => handleNavigate('/busqueda')}
                        />
                            */
                        }

                        <ActionButton
                            text="Carga Masiva"
                            icon={<Icon name="upload-cloud" size={24} />}
                            onClick={() => setModalCargaVisible(true)}
                        />
                        <ActionButton
                            text="Búsqueda"
                            icon={<Icon name="search" size={24} />}
                            /*
                            text="Editor Masivo"
                            icon={<Icon name="edit" size={24} />}
                            */

                            onClick={() => handleNavigate('/editor-masivo')}
                        />
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
