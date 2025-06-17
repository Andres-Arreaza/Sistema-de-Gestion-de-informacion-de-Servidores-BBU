import React, { useState, useEffect } from 'react';
// Asegúrate de que esta importación apunte al archivo CSS correcto
// En tu proyecto, esta importación es la correcta
import { useNavigate } from 'react-router-dom';

// --- Componente Home ---
const Home = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    // Se utiliza el hook real de react-router-dom
    const navigate = useNavigate();

    // --- Iconos SVG como componentes internos ---
    const SearchIcon = (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    );

    const UploadIcon = (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
    );

    const EditIcon = (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
    );

    // --- Componente Botón de Acción ---
    const ActionButton = ({ icon, text, onClick }) => {
        return (
            <button onClick={onClick} className="action-button">
                {icon}
                <span>{text}</span>
            </button>
        );
    };

    useEffect(() => {
        // Activa la animación de entrada después de que el componente se monte.
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleNavigate = (ruta) => {
        navigate(ruta);
    };

    return (
        // Estructura dividida en dos secciones principales
        <div className={`home-wrapper ${isLoaded ? 'loaded' : ''}`}>
            {/* Sección superior con el gradiente */}
            <div className="home-hero-section">
                <div className="title-section">
                    <div className="decorative-line-top"></div>
                    <h1 className="main-title">
                        Gerencia de Operaciones de Canales Virtuales y Medios de Pagos
                    </h1>
                    <p className="subtitle">
                        "Gestiona y visualiza servidores"
                    </p>
                    <div className="decorative-line-bottom"></div>
                </div>
            </div>

            {/* Sección inferior con los botones y fondo blanco */}
            <div className="home-actions-area">
                <div className="actions-section">
                    <ActionButton
                        text="Búsqueda"
                        icon={<SearchIcon />}
                        onClick={() => handleNavigate('/busqueda')}
                    />
                    <ActionButton
                        text="Carga Masiva"
                        icon={<UploadIcon />}
                        onClick={() => handleNavigate('/carga-masiva')}
                    />
                    <ActionButton
                        text="Editor Masivo"
                        icon={<EditIcon />}
                        onClick={() => handleNavigate('/editor-masivo')}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
