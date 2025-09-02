import React from "react";
import banescoLogo from '../../img/BanescoServers.png';

const Loading = () => {
    return (
        <div className="loading-overlay" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <img
                src={banescoLogo}
                alt="Banesco Servers Logo"
                className="loading-logo-img"
                style={{ width: '220px', height: 'auto', animation: 'loading-bounce 1.2s infinite' }}
            />
            <h2 className="loading-text">Cargando Datos...</h2>
        </div>
    );
};

export default Loading;
