import React from "react";

const HomeTabla = ({ servidores }) => {
    return (
        <div className="servicios-container">
            <h2 className="services-title">Resultados de la búsqueda</h2>

            {servidores.length === 0 ? (
                <div className="no-services">No hay servidores para mostrar.</div>
            ) : (
                <table className="tabla-servidores">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>IP</th>
                            <th>Servicio</th>
                            <th>Capa</th>
                            <th>Ambiente</th>
                            <th>Balanceador</th>
                            <th>VLAN</th>
                            <th>Dominio</th>
                            <th>S.O.</th>
                            <th>Estatus</th>
                            <th>Descripción</th>
                            <th>Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servidores.map((srv) => (
                            <tr key={srv.id}>
                                <td>{srv.nombre}</td>
                                <td>{srv.tipo}</td>
                                <td>{srv.ip}</td>
                                <td>{Array.isArray(srv.servicios) ? srv.servicios.map(s => s.nombre).join(", ") : srv.servicios?.nombre || ""}</td>
                                <td>{Array.isArray(srv.capas) ? srv.capas.map(c => c.nombre).join(", ") : srv.capas?.nombre || ""}</td>
                                <td>{Array.isArray(srv.ambientes) ? srv.ambientes.map(a => a.nombre).join(", ") : srv.ambientes?.nombre || ""}</td>
                                <td>{srv.balanceador}</td>
                                <td>{srv.vlan}</td>
                                <td>{Array.isArray(srv.dominios) ? srv.dominios.map(d => d.nombre).join(", ") : srv.dominios?.nombre || ""}</td>
                                <td>{Array.isArray(srv.sistemasOperativos) ? srv.sistemasOperativos.map(so => so.nombre).join(", ") : srv.sistemasOperativos?.nombre || ""}</td>
                                <td>{Array.isArray(srv.estatus) ? srv.estatus.map(es => es.nombre).join(", ") : srv.estatus?.nombre || ""}</td>
                                <td>{srv.descripcion}</td>
                                <td>{srv.link}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default HomeTabla;