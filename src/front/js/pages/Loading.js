import React from "react";

const Search = () => {
    return (
        <div className="logo-container">
            <div className="circle green"></div>  {/* 🔹 Superior derecha */}
            <div className="circle blue"></div>   {/* 🔹 Izquierda, más abajo */}
            <div className="circle white"></div>  {/* 🔹 Esfera blanca detrás */}
            <div className="circle red"></div>    {/* 🔹 Sobrepuesta en la azul */}
            <div className="circle white-2"></div>    {/* 🔹 Sobrepuesta en la azul */}
            <div className="circle red-2"></div>    {/* 🔹 Sobrepuesta en la azul */}
        </div>
    );
};

export default Search;