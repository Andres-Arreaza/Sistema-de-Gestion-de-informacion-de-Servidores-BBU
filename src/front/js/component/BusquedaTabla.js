import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import Icon from './Icon';


// --- Funciones auxiliares del componente ---
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
        confirmButtonText: "Cerrar",
        confirmButtonColor: "var(--color-primario)",
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

const exportarExcel = (servidores) => {
    if (!servidores.length) return;

    const estilos = `
        <style>
            body { font-family: Arial, sans-serif; }
            .excel-table { border-collapse: collapse; width: 100%; font-size: 12px; }
            .excel-table th, .excel-table td { border: 1px solid #cccccc; padding: 8px; text-align: center; vertical-align: middle; }
            .excel-table th { background-color: #005A9C; color: #FFFFFF; font-weight: bold; }
            .excel-table tr:nth-child(even) { background-color: #f2f2f2; }
            
            .header-table { border-collapse: collapse; width: 100%; margin-bottom: 25px; }
            .header-table td { border: none; vertical-align: middle; text-align: left; }

            .logo { width: 180px; height: auto; }
            .main-title { color: #006845; font-size: 28px; font-weight: bold; margin: 0; padding: 0; }
            .sub-title { color: #005A9C; font-size: 14px; font-style: italic; margin: 0; padding: 0; }
        </style>
    `;

    const encabezados = `
        <tr>
            <th>Nombre</th><th>Tipo</th><th>IP</th><th>Servicio</th><th>Capa</th><th>Ambiente</th>
            <th>Balanceador</th><th>VLAN</th><th>Dominio</th><th>S.O.</th><th>Estatus</th>
            <th>Descripción</th><th>Link</th>
        </tr>
    `;

    const filas = servidores.map(srv => `
        <tr>
            <td>${srv.nombre || ''}</td>
            <td>${srv.tipo || ''}</td>
            <td>${srv.ip || ''}</td>
            <td>${srv.servicios?.[0]?.nombre || ''}</td>
            <td>${srv.capas?.[0]?.nombre || ''}</td>
            <td>${srv.ambientes?.[0]?.nombre || ''}</td>
            <td>${srv.balanceador || ''}</td>
            <td>${srv.vlan || ''}</td>
            <td>${srv.dominios?.[0]?.nombre || ''}</td>
            <td>${srv.sistemasOperativos?.[0] ? `${srv.sistemasOperativos[0].nombre} - V${srv.sistemasOperativos[0].version}` : ''}</td>
            <td>${srv.estatus?.[0]?.nombre || ''}</td>
            <td>${srv.descripcion || ''}</td>
            <td>${srv.link || ''}</td>
        </tr>
    `).join("");

    const plantillaHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="UTF-8">
            ${estilos}
        </head>
        <body>
            <table class="header-table">
                <tr>
                    <td colspan="13">
                        <img src="https://banesco-prod-2020.s3.amazonaws.com/wp-content/themes/banescocontigo/assets/images/header/logotype.png" alt="Banesco Logo" class="logo">
                    </td>
                </tr>
                <tr><td colspan="13" style="height: 20px;"></td></tr>
                <tr>
                    <td colspan="13"><h1 class="main-title">Reporte de Servidores</h1></td>
                </tr>
                 <tr>
                    <td colspan="13"><p class="sub-title">(Gerencia de Operaciones de Canales Virtuales y Medios de Pagos)</p></td>
                </tr>
            </table>
            
            <table class="excel-table">
                ${encabezados}
                ${filas}
            </table>
        </body>
        </html>
    `;

    const excelContent = `data:application/vnd.ms-excel;charset=utf-8,${encodeURIComponent(plantillaHtml)}`;
    const link = document.createElement("a");
    link.setAttribute("href", excelContent);
    link.setAttribute("download", "Reporte_Servidores.xls");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
// =====> FIN DE LA MODIFICACIÓN <=====

// Sub-componente para el dropdown personalizado
const ItemsPerPageDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const options = [50, 100, 150, 200];
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="custom-select pagination-select" ref={dropdownRef}>
            <button type="button" className="form__input custom-select__trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{value}</span>
                <div className={`chevron ${isOpen ? "open" : ""}`}></div>
            </button>
            <div className={`custom-select__panel ${isOpen ? "open" : ""}`}>
                {options.map(opt => (
                    <div
                        key={opt}
                        className={`custom-select__option ${value === opt ? 'selected' : ''}`}
                        onClick={() => handleSelect(opt)}
                    >
                        {opt}
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Componente Principal ---
export const BusquedaTabla = ({ servidores, onClose }) => {
    const [paginaActual, setPaginaActual] = useState(1);
    const [servidoresPorPagina, setServidoresPorPagina] = useState(50);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const totalPaginas = Math.max(1, Math.ceil(servidores.length / servidoresPorPagina));
    const indiceInicial = (paginaActual - 1) * servidoresPorPagina;
    const servidoresPaginados = servidores.slice(indiceInicial, indiceInicial + servidoresPorPagina);

    return (
        <div className="table-view-container">
            <header className="resultados-header">
                <h2 className="resultados-titulo">Resultados de la Búsqueda</h2>
                <button onClick={onClose} className="btn-close" />
            </header>

            {servidores.length === 0 ? (
                <div className="no-results-message">No se encontraron servidores.</div>
            ) : (
                <>
                    <div className="pagination-controls">
                        <div className="pagination__items-per-page">
                            <label>Mostrar:</label>
                            <ItemsPerPageDropdown value={servidoresPorPagina} onChange={setServidoresPorPagina} />
                        </div>

                        <div className="pagination__navigation">
                            <button className="btn-icon" onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))} disabled={paginaActual === 1} title="Página Anterior">
                                <Icon name="chevron-left" />
                            </button>
                            <span>Página <strong className="page-number">{paginaActual}</strong> de <strong className="page-number">{totalPaginas}</strong></span>
                            <button className="btn-icon" onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))} disabled={paginaActual === totalPaginas} title="Página Siguiente">
                                <Icon name="chevron-right" />
                            </button>
                        </div>

                        <div className="table-controls">
                            <span className="badge">{servidores.length} servidores encontrados</span>
                            <div className="export-dropdown-container" ref={exportMenuRef}>
                                <button className="btn btn--primary" onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}>
                                    <Icon name="upload" /> Descargar
                                </button>
                                {isExportMenuOpen && (
                                    <div className="export-menu">
                                        <button className="export-menu-item" onClick={() => { exportarCSV(servidores); setIsExportMenuOpen(false); }}>
                                            <Icon name="csv" size={16} /> Exportar como CSV
                                        </button>
                                        <button className="export-menu-item" onClick={() => { exportarExcel(servidores); setIsExportMenuOpen(false); }}>
                                            <Icon name="file-excel" size={16} /> Exportar como Excel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
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
                                        <td>{indiceInicial + index + 1}</td>
                                        <td>{srv.nombre}</td>
                                        <td>{srv.tipo}</td>
                                        <td>{srv.ip}</td>
                                        <td>{srv.servicios?.[0]?.nombre || ''}</td>
                                        <td>{srv.capas?.[0]?.nombre || ''}</td>
                                        <td>{srv.ambientes?.[0]?.nombre || ''}</td>
                                        <td>{srv.balanceador}</td>
                                        <td>{srv.vlan}</td>
                                        <td>{srv.dominios?.[0]?.nombre || ''}</td>
                                        <td>{srv.sistemasOperativos?.[0] ? `${srv.sistemasOperativos[0].nombre} - V${srv.sistemasOperativos[0].version}` : ''}</td>
                                        <td>{srv.estatus?.[0]?.nombre || ''}</td>
                                        <td style={{ whiteSpace: 'normal' }}>{srv.descripcion}</td>
                                        <td>
                                            <button className="btn-icon" onClick={() => abrirModalLink(srv)} title="Ver detalles y enlace">
                                                <Icon name="visibility" />
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
