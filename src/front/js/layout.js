import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import injectContext from "./store/appContext";

import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";

import { Home } from "./pages/home";
import { ServerList } from "./pages/ServerList";
import Servicio from "./pages/Servicio";
import Capa from "./pages/Capa";
import Ambiente from "./pages/Ambiente";

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
                        <Route element={<ServerList />} path="/servers" />
                        <Route element={<Servicio />} path="/servicio" />
                        <Route element={<Capa />} path="/capa" />
                        <Route element={<Ambiente />} path="/ambiente" />
                        <Route element={<h1>Not found!</h1>} path="*" />
                    </Routes>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);