import React, { useEffect } from "react";

const TablaServidores = ({ servidores, setServidores, setServidorActual, setModalVisible }) => {
    // 🔹 Obtener servidores desde la API solo al montar el componente
    useEffect(() => {
        const fetchServidores = async () => {
            try {
                console.log("Obteniendo servidores...");
                const response = await fetch("http://localhost:3001/api/servidores");

                if (!response.ok) {
                    throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Datos obtenidos:", data);
                setServidores(data); // 🔹 Actualizar estado con los datos recibidos
            } catch (error) {
                console.error("Error al cargar servidores:", error);
            }
        };

        fetchServidores();
    }, []); // 🔹 Se ejecuta SOLO al montar el componente

    return (
        <div>
            <h2 className="servidores-disponibles-title">Servidores Disponibles</h2>

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
                    {servidores.length > 0 ? (
                        servidores.map((servidor) => (
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
                                    <button className="editar-btn" onClick={() => setServidorActual(servidor)}>
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="eliminar-btn" onClick={() => setModalVisible(true)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="14">No hay servidores disponibles.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TablaServidores;