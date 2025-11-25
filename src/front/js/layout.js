import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import injectContext from "./store/appContext";

// Importación de componentes de layout
import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";

// Importación de las páginas
import Configuracion from "./pages/Configuracion";
import Home from "./pages/home";
import { Busqueda } from "./pages/Busqueda";
import EditorMasivo from './pages/EditorMasivo';
import Servidor from "./pages/Servidor";
import SistemaOperativo from "./pages/SistemaOperativo"; // Asegúrate que la importación sea correcta si es una página
import AdministrarUsuariosPage from "./pages/AdministrarUsuarios"; // <-- importada la nueva página de administración

const Layout = () => {
    const basename = process.env.BASENAME || "";
    // estado que refleja la existencia del token para forzar re-render cuando cambie la sesión
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('auth_token'));
    useEffect(() => {
        const handler = () => setAuthToken(localStorage.getItem('auth_token'));
        window.addEventListener('authChanged', handler);
        // también reaccionar a cambios en localStorage desde otras pestañas (opcional)
        const onStorage = (e) => { if (e.key === 'auth_token') setAuthToken(localStorage.getItem('auth_token')); };
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('authChanged', handler);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "") {
        return <BackendURL />;
    }

    return (
        // El div principal con la clase para el layout de columna (flex)
        <div className="layout-container">
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />

                    {/* El contenido principal que crece para ocupar el espacio disponible */}
                    <main className="main-content-area">
                        <Routes>
                            <Route element={<Home />} path="/" />
                            <Route element={<Busqueda />} path="/busqueda" />
                            <Route element={<Configuracion />} path="/configuracion" />
                            <Route element={<EditorMasivo />} path="/editor-masivo" />
                            <Route
                                path="/administrar-usuarios"
                                element={authToken ? <AdministrarUsuariosPage /> : <Navigate to="/" replace />}
                            />
                            <Route element={<Servidor />} path="/servidor" />
                            <Route element={<SistemaOperativo />} path="/sistema-operativo" />

                            {/* Ruta para "Not Found" */}
                            <Route element={<h1>¡Página no encontrada!</h1>} path="*" />
                        </Routes>
                    </main>

                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
