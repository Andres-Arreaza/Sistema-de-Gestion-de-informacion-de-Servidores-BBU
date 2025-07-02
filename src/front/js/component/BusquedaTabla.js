import React, { useState } from "react";
import Swal from "sweetalert2";

// --- Iconos para botones ---
const CsvIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const VisibilityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;


const abrirModalLink = (servidor) => {
    if (!servidor || !servidor.link) return;

    Swal.fire({
        title: "Información del Enlace",
        html: `
            <div style="text-align: left; padding: 0 1rem;">
                <p><strong>Servidor:</strong> ${servidor.nombre || "No disponible"}</p>
                <p><strong>Descripción:</strong> ${servidor.descripcion || "No disponible"}</p>
                <p><strong>Enlace:</strong> <a href="${servidor.link}" target="_blank" rel="noopener noreferrer">${servidor.link}</a></p>
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "var(--primary-color, #007953)",
        width: "50%",
        customClass: { title: "swal-title-green" }
    });
};

const exportarCSV = (servidores) => {
    if (!servidores.length) return;

    const encabezados = `"Nombre";"Tipo";"IP";"Servicio";"Capa";"Ambiente";"Balanceador";"VLAN";"Dominio";"S.O.";"Estatus";"Descripción";"Link"\n`;

    const filas = servidores.map(srv =>
        `"${srv.nombre || 'N/A'}";"${srv.tipo || 'N/A'}";"${srv.ip || 'N/A'}";"${srv.servicios?.[0]?.nombre || 'N/A'}";` +
        `"${srv.capas?.[0]?.nombre || 'N/A'}";"${srv.ambientes?.[0]?.nombre || 'N/A'}";"${srv.balanceador || 'N/A'}";"${srv.vlan || 'N/A'}";` +
        `"${srv.dominios?.[0]?.nombre || 'N/A'}";"${srv.sistemasOperativos?.[0] ? `${srv.sistemasOperativos[0].nombre} - V${srv.sistemasOperativos[0].version}` : 'N/A'}";"${srv.estatus?.[0]?.nombre || 'N/A'}";"${srv.descripcion || 'N/A'}";` +
        `"${srv.link || 'N/A'}"`
    ).join("\n");

    const csvContent = `data:text/csv;charset=utf-8,\uFEFF${encodeURI(encabezados + filas)}`;
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "servidores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const BusquedaTabla = ({ servidores }) => {
    const [paginaActual, setPaginaActual] = useState(1);
    const [servidoresPorPagina, setServidoresPorPagina] = useState(20);

    const totalPaginas = Math.max(1, Math.ceil(servidores.length / servidoresPorPagina));
    const indiceInicial = (paginaActual - 1) * servidoresPorPagina;
    const indiceFinal = indiceInicial + servidoresPorPagina;
    const servidoresPaginados = servidores.slice(indiceInicial, indiceFinal);

    return (
        <div className="resultados-container">
            <div className="resultados-header">
                <h2 className="resultados-titulo">Resultados de la Búsqueda</h2>
                <div className="table-controls">
                    <span className="servidores-contador">{servidores.length} {servidores.length === 1 ? 'servidor encontrado' : 'servidores encontrados'}</span>
                    <button className="export-csv-btn" onClick={() => exportarCSV(servidores)}>
                        <CsvIcon />
                        Descargar
                    </button>
                </div>
            </div>

            {servidores.length === 0 ? (
                <div className="no-resultados-mensaje">No se encontraron servidores.</div>
            ) : (
                <>
                    <div className="paginacion-controles">
                        <div className="items-por-pagina-selector">
                            <label htmlFor="servidores-por-pagina">Mostrar:</label>
                            <select id="servidores-por-pagina" onChange={(e) => setServidoresPorPagina(Number(e.target.value))} value={servidoresPorPagina}>
                                <option value="20">20</option>
                                <option value="30">30</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="150">150</option>
                                <option value="200">200</option>
                            </select>
                        </div>
                        <div className="navegacion-paginas">
                            <button
                                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                                className="paginacion-btn"
                                disabled={paginaActual === 1}
                                title="Página Anterior"
                            >
                                <ChevronLeftIcon />
                            </button>
                            <span className="pagina-numero">Página {paginaActual} de {totalPaginas}</span>
                            <button
                                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                                className="paginacion-btn"
                                disabled={paginaActual === totalPaginas}
                                title="Página Siguiente"
                            >
                                <ChevronRightIcon />
                            </button>
                        </div>
                    </div>
                    <div className="tabla-servidores-container">
                        <table className="tabla-servidores">
                            <thead>
                                <tr>
                                    <th className="columna-numero">#</th>
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
                                {servidoresPaginados.map((srv, index) => (
                                    <tr key={srv.id}>
                                        <td className="columna-numero">{indiceInicial + index + 1}</td>
                                        <td>{srv.nombre}</td>
                                        <td>{srv.tipo}</td>
                                        <td>{srv.ip}</td>
                                        <td>{Array.isArray(srv.servicios) ? srv.servicios.map(s => s.nombre).join(", ") : srv.servicios?.nombre || ""}</td>
                                        <td>{Array.isArray(srv.capas) ? srv.capas.map(c => c.nombre).join(", ") : srv.capas?.nombre || ""}</td>
                                        <td>{Array.isArray(srv.ambientes) ? srv.ambientes.map(a => a.nombre).join(", ") : srv.ambientes?.nombre || ""}</td>
                                        <td>{srv.balanceador}</td>
                                        <td>{srv.vlan}</td>
                                        <td>{Array.isArray(srv.dominios) ? srv.dominios.map(d => d.nombre).join(", ") : srv.dominios?.nombre || ""}</td>
                                        <td>{Array.isArray(srv.sistemasOperativos) ? srv.sistemasOperativos.map(so => `${so.nombre} - V${so.version}`).join(", ") : ''}</td>
                                        <td>{Array.isArray(srv.estatus) ? srv.estatus.map(es => es.nombre).join(", ") : srv.estatus?.nombre || ""}</td>
                                        <td className="col-descripcion">{srv.descripcion}</td>
                                        <td>
                                            <button className="ver-link-btn icon-btn" onClick={() => abrirModalLink(srv)} title="Ver detalles y enlace">
                                                <VisibilityIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default BusquedaTabla;
