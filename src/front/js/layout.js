import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import injectContext from "./store/appContext";
import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";
import Configuracion from "./pages/Configuracion";
import Home from "./pages/home";
import { Busqueda } from "./pages/Busqueda";
import EditorMasivo from './pages/EditorMasivo';
import Servidor from "./pages/Servidor";
import SistemaOperativo from "./pages/SistemaOperativo";
import AdministrarUsuariosPage from "./pages/AdministrarUsuarios";
import Perfil from "./component/perfil";

const Layout = () => {
    const basename = process.env.BASENAME || "";
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('auth_token'));
    useEffect(() => {
        const handler = () => setAuthToken(localStorage.getItem('auth_token'));
        window.addEventListener('authChanged', handler);
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
        <div className="layout-container">
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
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
                            <Route
                                path="/perfil"
                                element={authToken ? <Perfil /> : <Navigate to="/" replace />}
                            />
                            <Route element={<Servidor />} path="/servidor" />
                            <Route element={<SistemaOperativo />} path="/sistema-operativo" />
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
