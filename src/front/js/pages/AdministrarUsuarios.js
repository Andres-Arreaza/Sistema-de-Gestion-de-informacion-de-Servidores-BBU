import React, { useEffect } from 'react';
import Navbar from '../component/navbar';
import AdministrarUsuarios from '../component/AdministrarUsuariosTabla';
import { Footer } from '../component/footer';

const AdministrarUsuariosPage = () => {
    // opcional: título de la pestaña
    useEffect(() => { document.title = 'Administrar Usuarios — G.I.B.S.'; }, []);

    return (
        <div className="layout-container">
            <Navbar />
            <main style={{ paddingTop: 80, minHeight: 'calc(100vh - 160px)' }}>
                {/* Componente que muestra la tabla y el formulario (desde /component) */}
                <AdministrarUsuariosTabla />
            </main>
            <Footer />
        </div>
    );
};

export default AdministrarUsuariosPage;
