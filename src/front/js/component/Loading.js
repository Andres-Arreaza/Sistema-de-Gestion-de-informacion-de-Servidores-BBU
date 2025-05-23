import React from "react";

const Loading = () => {
    return (
        <div className="loading-container">
            <div className="logo-container">
                <div className="circle green"></div>
                <div className="circle blue"></div>
                <div className="circle white"></div>
                <div className="circle red"></div>
                <div className="circle white-2"></div>
                <div className="circle red-2"></div>
            </div>
            <h2 className="loading-text">Cargando Datos ...</h2>
        </div>
    );
};

export default Loading;