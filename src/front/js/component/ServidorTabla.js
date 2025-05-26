import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const ServidorTabla = ({ obtenerServidorPorId, eliminarServidor, abrirModalLink, servidores, setServidores }) => {
    const [paginaActual, setPaginaActual] = useState(1);
    const servidoresPorPagina = 10;

    // 🔹 Función para obtener servidores actualizados desde la API
    const actualizarServidores = async () => {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/servidores`);
            const data = await response.json();
            const servidoresFiltrados = data.filter((servidor) => servidor.activo === true);
            setServidores(servidoresFiltrados);  // 🔹 Actualiza la lista de servidores
        } catch (error) {
            console.error("Error al obtener servidores:", error);
        }
    };

    useEffect(() => {
        actualizarServidores();
    }, []);

    // 🔹 Confirmación visual antes de eliminar un servidor
    const handleEliminarConfirmacion = (servidor) => {
        Swal.fire({
            title: `¿Seguro que desea eliminar el servidor ${servidor.nombre}?`,
            text: "Se eliminará el servidor.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                handleEliminarServidor(servidor);
            }
        });
    };

    // 🔹 Eliminar servidor con alerta visual
    const handleEliminarServidor = async (servidor) => {
        try {
            await eliminarServidor(servidor);
            actualizarServidores();  // 🔹 Recarga la tabla tras eliminar

            Swal.fire({
                icon: "success",
                title: "Servidor eliminado exitosamente.",
                showConfirmButton: false,
                timer: 2500,
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error al eliminar",
                text: `Hubo un problema: ${error.message}`,
                showConfirmButton: false,
                timer: 2500,
            });
        }
    };

    // 🔹 Calcula el número total de páginas
    const totalPaginas = Math.ceil(servidores.length / servidoresPorPagina);

    // 🔹 Determina los servidores que se mostrarán en la página actual
    const indiceInicial = (paginaActual - 1) * servidoresPorPagina;
    const indiceFinal = indiceInicial + servidoresPorPagina;
    const servidoresPaginados = servidores.slice(indiceInicial, indiceFinal);

    return (
        <div>
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
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {servidoresPaginados.length > 0 ? (
                        servidoresPaginados.map((servidor) => (
                            <tr key={servidor.id}>
                                <td>{servidor.nombre || "Sin nombre"}</td>
                                <td>{servidor.tipo || "Sin tipo"}</td>
                                <td>{servidor.ip || "Sin IP"}</td>
                                <td>{servidor.servicios?.[0]?.nombre || "Sin servicio"}</td>
                                <td>{servidor.capas?.[0]?.nombre || "Sin capa"}</td>
                                <td>{servidor.ambientes?.[0]?.nombre || "Sin ambiente"}</td>
                                <td>{servidor.balanceador || "Sin balanceador"}</td>
                                <td>{servidor.vlan || "Sin VLAN"}</td>
                                <td>{servidor.dominios?.[0]?.nombre || "Sin dominio"}</td>
                                <td>{servidor.sistemasOperativos?.[0]?.nombre || "Sin S.O."}</td>
                                <td>{servidor.estatus?.[0]?.nombre || "Sin estatus"}</td>
                                <td>{servidor.descripcion || "Sin descripción"}</td>
                                <td>
                                    <button className="ver-link-btn icon-btn" onClick={() => abrirModalLink(servidor)}>
                                        <span className="material-symbols-outlined">visibility</span>
                                    </button>
                                </td>
                                <td>
                                    <button className="editar-btn icon-btn" onClick={() => obtenerServidorPorId(servidor.id)}>
                                        <span className="material-icons"><i className="fas fa-edit"></i></span>
                                    </button>
                                    <button className="eliminar-btn icon-btn" onClick={() => handleEliminarConfirmacion(servidor)}>
                                        <span className="material-icons"><i className="fas fa-trash"></i></span>
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

            {totalPaginas > 1 && (
                <div className="paginacion-servidores">
                    <button
                        onClick={() => setPaginaActual(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className="paginacion-btn"
                    >
                        <span className="material-symbols-outlined">arrow_back_ios</span>
                    </button>
                    <span className="pagina-numero">Página {paginaActual} de {totalPaginas}</span>
                    <button
                        onClick={() => setPaginaActual(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        className="paginacion-btn"
                    >
                        <span className="material-symbols-outlined">arrow_forward_ios</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ServidorTabla;