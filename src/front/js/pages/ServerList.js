import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";

export const ServerList = () => {
    const { store } = useContext(Context);

    return (
        <div className="container">
            <h2 className="text-center">Lista de Servidores</h2>
            <ul className="list-group">
                {store.servers.map((server, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between">
                        <span>{server.name}</span>
                        <Link to={"/servers/" + server.id}>
                            <button className="btn btn-primary">Ver detalles</button>
                        </Link>
                    </li>
                ))}
            </ul>
            <br />
            <Link to="/">
                <button className="btn btn-secondary">Volver al inicio</button>
            </Link>
        </div>
    );
};