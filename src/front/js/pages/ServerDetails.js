import React, { useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { Context } from "../store/appContext";

export const ServerDetails = () => {
    const { store } = useContext(Context);
    const { id } = useParams();
    
    // Buscar el servidor en el estado global (sin funcionalidad activa aún)
    const server = store.servers.find(server => server.id === parseInt(id)) || {};

    return (
        <div className="container">
            <h1 className="text-center">Detalles del Servidor</h1>
            <div className="server-info">
                <h2>{server.name || "Servidor Desconocido"}</h2>
                <p><strong>Estado:</strong> {server.status || "No disponible"}</p>
                <p><strong>Ubicación:</strong> {server.location || "No especificada"}</p>
            </div>

            <Link to="/servers">
                <button className="btn btn-secondary">Volver a la lista</button>
            </Link>
        </div>
    );
};