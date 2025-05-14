import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import injectContext from "./store/appContext";

import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";
import TablaServidores from "./component/TablaServidores";

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
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <Routes>
                        <Route element={<Home />} path="/" />
                        <Route element={<Servicio />} path="/servicio" />
                        <Route element={<Capa />} path="/capa" />
                        <Route element={<Ambiente />} path="/ambiente" />
                        <Route element={<Dominio />} path="/dominio" />
                        <Route element={<SistemaOperativo />} path="/sistemaOperativo" />
                        <Route element={<Estatus />} path="/estatus" />
                        <Route element={<Servidor />} path="/servidor" />
                        <Route element={<TablaServidores />} path="/tablaServidores" />
                        <Route element={<h1>Not found!</h1>} path="*" />
                    </Routes>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);