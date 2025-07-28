import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import injectContext from "./store/appContext";

// Importación de componentes de layout
import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";

// Importación de las páginas
import Configuracion from "./pages/Configuracion";
import Home from "./pages/Home";
import { Busqueda } from "./pages/Busqueda";
import EditorMasivo from './pages/EditorMasivo';
import Servidor from "./pages/Servidor";
import SistemaOperativo from "./pages/SistemaOperativo"; // Asegúrate que la importación sea correcta si es una página

const Layout = () => {
    const basename = process.env.BASENAME || "";

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
