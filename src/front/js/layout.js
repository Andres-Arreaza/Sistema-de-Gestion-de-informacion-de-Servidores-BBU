import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import injectContext from "./store/appContext";

import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";
import ServidorTabla from "./component/ServidorTabla";
import ServidorFormulario from "./component/ServidorFormulario";
import Loading from "./component/Loading";

import { Home } from "./pages/home";
import Servicio from "./pages/Servicio";
import Capa from "./pages/Capa";
import Ambiente from "./pages/Ambiente";
import Dominio from "./pages/Dominio";
import SistemaOperativo from "./pages/SistemaOperativo";
import Estatus from "./pages/Estatus";
import Servidor from "./pages/Servidor";

const Layout = () => {
    const basename = process.env.BASENAME || "";

    if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "") return <BackendURL />;

    return (
        <div className="layout-container"> {/* 🔹 Contenedor principal */}
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <div className="main-content"> {/* 🔹 Contenedor que ocupa el espacio disponible */}
                        <Routes>
                            <Route element={<Home />} path="/" />
                            <Route element={<Servicio />} path="/servicio" />
                            <Route element={<Capa />} path="/capa" />
                            <Route element={<Ambiente />} path="/ambiente" />
                            <Route element={<Dominio />} path="/dominio" />
                            <Route element={<SistemaOperativo />} path="/sistemaOperativo" />
                            <Route element={<Estatus />} path="/estatus" />
                            <Route element={<Servidor />} path="/servidor" />
                            <Route element={<ServidorTabla />} path="/servidorTabla" />
                            <Route element={<ServidorFormulario />} path="/servidorFormulario" />
                            <Route element={<Loading />} path="/loading" />
                            <Route element={<h1>Not found!</h1>} path="*" />
                        </Routes>
                    </div>
                    <Footer /> {/* 🔹 Siempre estará abajo */}
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);