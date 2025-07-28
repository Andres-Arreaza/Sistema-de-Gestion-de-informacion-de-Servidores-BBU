import React from "react";

const Loading = () => {
    return (
        <div className="loading-overlay">
            <div className="loading-logo">
                <div className="loading-logo__circle loading-logo__circle--green"></div>
                <div className="loading-logo__circle loading-logo__circle--blue"></div>
                <div className="loading-logo__circle loading-logo__circle--white"></div>
                <div className="loading-logo__circle loading-logo__circle--red"></div>
                <div className="loading-logo__circle loading-logo__circle--white-2"></div>
                <div className="loading-logo__circle loading-logo__circle--red-2"></div>
            </div>
            <h2 className="loading-text">Cargando Datos...</h2>
        </div>
    );
};

export default Loading;
