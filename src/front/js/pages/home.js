import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const Home = () => {
    const [servicios, setServicios] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3001/api/servicios")
            .then((response) => response.json())
            .then((data) => setServicios(data))
            .catch((error) => console.error("Error al obtener servicios:", error));
    }, []);

    return (
        <div>
            {/* 🔹 Sección con gradiente */}
            <div className="home-container">
                <h1 className="title">Gerencia de Operaciones de Canales Virtuales y Medios de Pagos</h1>
                <p className="subtitle">"Gestiona y visualiza los servidores"</p>
            </div>

            {/* 🔹 Sección de servicios debajo del gradiente */}
            <div className="servicios-container">
                <h2 className="services-title">Servicios Disponibles</h2>
                {servicios.length > 0 ? (
                    <ul className="servicios-list">
                        {servicios.map((servicio) => (
                            <li key={servicio.id} className="servicio-item">
                                {servicio.nombre}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-services">No hay servicios disponibles.</p>
                )}

                {/* <div className="home-actions">
                    <Link to="/servidor">
                        <button className="home-btn">Ir a Gestión de Servidores</button>
                    </Link>
                </div> */}
            </div>
        </div>
    );
};