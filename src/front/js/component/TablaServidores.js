import React from "react";

const TablaServidores = ({ servidores, setServidorActual, setModalVisible, handleDelete }) => {
    return (
        <table className="servidor-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>IP</th>
                    <th>Balanceador</th>
                    <th>VLAN</th>
                    <th>Descripción</th>
                    <th>Link</th>
                    <th>Servicio</th>
                    <th>Capa</th>
                    <th>Ambiente</th>
                    <th>Dominio</th>
                    <th>Sistema Operativo</th>
                    <th>Estatus</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {servidores && servidores.length > 0 ? (
                    servidores.map((servidor) => (
                        servidor && servidor.nombre ? (
                            <tr key={servidor.id}>
                                <td>{servidor.nombre}</td>
                                <td>{servidor.tipo}</td>
                                <td>{servidor.ip}</td>
                                <td>{servidor.balanceador}</td>
                                <td>{servidor.vlan}</td>
                                <td>{servidor.descripcion}</td>
                                <td>
                                    {servidor.link ? (
                                        <a href={servidor.link} target="_blank" rel="noopener noreferrer">
                                            {servidor.link}
                                        </a>
                                    ) : "N/A"}
                                </td>
                                <td>{servidor.servicio?.nombre || "N/A"}</td>
                                <td>{servidor.capa?.nombre || "N/A"}</td>
                                <td>{servidor.ambiente?.nombre || "N/A"}</td>
                                <td>{servidor.dominio?.nombre || "N/A"}</td>
                                <td>{servidor.sistema_operativo?.nombre || "N/A"}</td>
                                <td>{servidor.estatus?.nombre || "N/A"}</td>
                                <td>
                                    <button className="editar-btn" onClick={() => {
                                        setServidorActual(servidor);
                                        setModalVisible(true);
                                    }}>✏️ Editar</button>
                                    <button className="eliminar-btn" onClick={() => handleDelete(servidor.id)}>🗑️ Eliminar</button>
                                </td>
                            </tr>
                        ) : null
                    ))
                ) : (
                    <tr>
                        <td colSpan="14">No hay servidores disponibles.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default TablaServidores;