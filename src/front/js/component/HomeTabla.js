import React, { useState } from "react";
import Swal from "sweetalert2";

const abrirModalLink = (servidor) => {
    if (!servidor || !servidor.link) return;

    Swal.fire({
        title: "Información del Enlace",
        html: `
            <div style="text-align: left;">
                <p><strong>Servidor:</strong> ${servidor.nombre || "No disponible"}</p>
                <p><strong>Descripción:</strong> ${servidor.descripcion || "No disponible"}</p>
                <p><strong>Enlace:</strong> <a href="${servidor.link}" target="_blank" rel="noopener noreferrer">${servidor.link}</a></p>
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#dc3545",
        width: "50%",
        customClass: { title: "swal-title-green" }
    });
};

const exportarCSV = (servidores) => {
    if (!servidores.length) return;

    // 🔹 Encabezados bien alineados en la primera fila
    const encabezados = `"Nombre";"Tipo";"IP";"Servicio";"Capa";"Ambiente";"Balanceador";"VLAN";"Dominio";"S.O.";"Estatus";"Descripción";"Link"\n`;

    // 🔹 Cada servidor ocupa su propia fila, con separación por punto y coma
    const filas = servidores.map(srv =>
        `"${srv.nombre || 'N/A'}";"${srv.tipo || 'N/A'}";"${srv.ip || 'N/A'}";"${srv.servicios?.[0]?.nombre || 'N/A'}";` +
        `"${srv.capas?.[0]?.nombre || 'N/A'}";"${srv.ambientes?.[0]?.nombre || 'N/A'}";"${srv.balanceador || 'N/A'}";"${srv.vlan || 'N/A'}";` +
        `"${srv.dominios?.[0]?.nombre || 'N/A'}";"${srv.sistemasOperativos?.[0]?.nombre || 'N/A'}";"${srv.estatus?.[0]?.nombre || 'N/A'}";"${srv.descripcion || 'N/A'}";` +
        `"${srv.link || 'N/A'}"`
    ).join("\n");

    const csvContent = `data:text/csv;charset=utf-8,\uFEFF${encabezados}${filas}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "servidores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
const HomeTabla = ({ servidores }) => {
    const [paginaActual, setPaginaActual] = useState(1);
    const [servidoresPorPagina, setServidoresPorPagina] = useState(20);

    const totalPaginas = Math.max(1, Math.ceil(servidores.length / servidoresPorPagina));
    const indiceInicial = (paginaActual - 1) * servidoresPorPagina;
    const indiceFinal = indiceInicial + servidoresPorPagina;
    const servidoresPaginados = servidores.slice(indiceInicial, indiceFinal);

    return (
        <div className="servicios-container">
            <h2 className="services-title">Resultados de la búsqueda</h2>

            <div className="cantidad-servidores">
                <span className="servidores-contador">Servidores Cargados: {servidores.length}</span>
                <label>Servidores por Página:</label>
                <select onChange={(e) => setServidoresPorPagina(Number(e.target.value))} value={servidoresPorPagina}>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="150">150</option>
                    <option value="200">200</option>
                </select>
                <button className="export-csv-btn" onClick={() => exportarCSV(servidores)}>Descargar Servidores</button>
            </div>

            {servidores.length === 0 ? (
                <div className="no-services">No hay servidores para mostrar.</div>
            ) : (
                <div className="tabla-servidores-container">
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
                            {servidoresPaginados.map((srv) => (
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
                                    <td>
                                        <button className="ver-link-btn icon-btn" onClick={() => abrirModalLink(srv)}>
                                            <span className="material-symbols-outlined">visibility</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 🔹 Paginación */}
            <div className="paginacion-servidores">
                <button
                    onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                    className={`paginacion-btn ${paginaActual === 1 ? "btn-disabled" : ""}`}
                    disabled={paginaActual === 1}
                >
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                </button>
                <span className="pagina-numero">Página {paginaActual} de {totalPaginas}</span>
                <button
                    onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                    className={`paginacion-btn ${paginaActual === totalPaginas ? "btn-disabled" : ""}`}
                    disabled={paginaActual === totalPaginas}
                >
                    <span className="material-symbols-outlined">arrow_forward_ios</span>
                </button>
            </div>
        </div>
    );
};

export default HomeTabla;