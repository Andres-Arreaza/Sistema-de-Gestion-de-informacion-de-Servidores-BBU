import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";

/**
 * Modal flotante para mostrar el link, nombre e IP del servidor.
 * Incluye fondo oscuro y cierra al hacer clic fuera o en el botón.
 */
const LinkFloatModal = ({ link, nombre, ip, onClose }) => {
    if (!link) return null;
    return ReactDOM.createPortal(
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.45)",
                zIndex: 2147483647,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "#fff",
                    border: "2px solid #007953",
                    borderRadius: "10px",
                    padding: "24px 32px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                    minWidth: "320px",
                    textAlign: "center",
                    position: "relative"
                }}
                onClick={e => e.stopPropagation()}
            >
                <h3 style={{ marginBottom: 16 }}>Enlace del servidor</h3>
                <div style={{ marginBottom: 8 }}>
                    <b>Nombre:</b> {nombre || "-"}
                </div>
                <div style={{ marginBottom: 8 }}>
                    <b>IP:</b> {ip || "-"}
                </div>
                <div style={{ wordBreak: "break-all", marginBottom: 16 }}>
                    <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: "#007953",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "8px 24px",
                        cursor: "pointer"
                    }}
                >
                    Cerrar
                </button>
            </div>
        </div>,
        document.body
    );
};

const ServidorCargaMasiva = () => {
    const [datosCSV, setDatosCSV] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [servidoresPorPagina, setServidoresPorPagina] = useState(10);
    const [showLink, setShowLink] = useState(null); // { link, nombre, ip }
    const filasValidadasRef = useRef([]); // Para mantener los datos validados entre renders

    // Función para validar las filas en el backend
    const validarFilas = async (filas) => {
        if (!filas || filas.length === 0) {
            console.error("Error: 'filas' no está definido o está vacío.");
            return [];
        }

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/servidores/validar_masivo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filas }),
            });

            if (!response.ok) {
                throw new Error("Error en la validación masiva");
            }

            return await response.json();
        } catch (error) {
            Swal.fire("Error", "No se pudo validar el archivo. Verifica la conexión con el servidor.", "error");
            return filas;
        }
    };

    // Modal para cargar el archivo CSV
    const mostrarModalCarga = () => {
        let fileRows = [];

        Swal.fire({
            title: "Carga Masiva de Servidores",
            html: `
                <div class="carga-masiva-modal-simple">
                    <label for="input-csv" class="custom-file-label">
                        <span class="material-symbols-outlined">upload</span>
                        Seleccionar archivo CSV
                    </label>
                    <input type="file" id="input-csv" accept=".csv" class="custom-file-input" style="display:none;"/>
                    <div id="nombre-archivo-csv" class="nombre-archivo-csv">Ningún archivo seleccionado</div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#007953",
            cancelButtonColor: "#dc3545",
            width: "40%",
            preConfirm: () => {
                if (!fileRows.length) {
                    Swal.showValidationMessage("Debes seleccionar un archivo CSV válido.");
                    return false;
                }
                return fileRows;
            },
            didOpen: () => {
                const input = document.getElementById("input-csv");
                const nombreArchivo = document.getElementById("nombre-archivo-csv");

                input.addEventListener("change", (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const filas = ev.target.result.split("\n").filter(f => f.trim());
                        fileRows = filas.map(fila => fila.split(";").map(col => col.replace(/"/g, "").trim()));

                        if (fileRows.length === 0) {
                            Swal.fire("Error", "El archivo CSV está vacío o no es válido.", "error");
                            return;
                        }

                        nombreArchivo.innerHTML = `<b>Archivo seleccionado:</b> ${file.name}`;
                    };

                    reader.readAsText(file);
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                setDatosCSV(fileRows);
                setPaginaActual(1);
                mostrarModalTabla(fileRows);
            }
        });
    };

    // Modal de vista previa de la tabla
    const mostrarModalTabla = async (data) => {
        if (!data || data.length === 0) {
            console.error("Error: 'data' no está definido o está vacío.");
            return;
        }

        const filasValidadas = await validarFilas(data);
        if (!filasValidadas || filasValidadas.length === 0) {
            Swal.fire("Error", "No se encontraron datos válidos en el archivo CSV.", "error");
            return;
        }

        filasValidadasRef.current = filasValidadas;

        let pagina = 1;
        let porPagina = 10;

        const renderTablaModal = () => {
            const tablaContainer = document.getElementById("tabla-container");
            if (!tablaContainer) return;
            const encabezado = filasValidadasRef.current[0];
            const filas = filasValidadasRef.current.slice(1);

            const linkIdx = encabezado.findIndex(col => col.trim().toLowerCase() === "link");
            const nombreIdx = encabezado.findIndex(col => col.trim().toLowerCase() === "nombre" || col.trim().toLowerCase() === "servidor" || col.trim().toLowerCase() === "nombre servidor");
            const ipIdx = encabezado.findIndex(col => col.trim().toLowerCase() === "ip" || col.trim().toLowerCase() === "ip servidor");

            const totalPaginas = Math.max(1, Math.ceil(filas.length / porPagina));
            pagina = Math.min(pagina, totalPaginas);
            const inicio = (pagina - 1) * porPagina;
            const fin = Math.min(inicio + porPagina, filas.length);
            const filasPagina = filas.slice(inicio, fin);

            const iconCheck = `<span class="material-symbols-outlined" style="color:#007953;">check_circle</span>`;
            const iconCancel = `<span class="material-symbols-outlined" style="color:#dc3545;">cancel</span>`;
            const iconEye = `<span class="material-symbols-outlined" style="vertical-align:middle;">visibility</span>`;

            tablaContainer.innerHTML = `
                <table class="tabla-servidores tabla-modal-carga" style="width: 1800px; font-size: 16px;">
                    <thead>
                        <tr>
                            ${encabezado.map(col => `<th>${col}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${filasPagina.map((row, rowIdx) => {
                const observacion = row[row.length - 1];
                const tieneError = observacion !== "Servidor listo para guardar";
                const errores = tieneError ? observacion.split(";").map(e => e.trim()) : [];

                return `
                                <tr>
                                    ${row.map((col, idx) => {
                    if (idx === row.length - 1) {
                        return `<td style="text-align:center;">${tieneError ? iconCancel : iconCheck}</td>`;
                    }
                    if (idx === linkIdx) {
                        if (!col || col.trim() === "") {
                            return `<td></td>`;
                        }
                        const btnId = `btn-link-${inicio + rowIdx}`;
                        return `<td style="text-align:center;">
                            <button id="${btnId}" class="btn-link-ojo" style="background:none;border:none;cursor:pointer;" title="Ver enlace">
                                ${iconEye}
                            </button>
                        </td>`;
                    }
                    let esError = false;
                    if (tieneError) {
                        const nombreCampo = encabezado[idx].toLowerCase();
                        esError = errores.some(err => err.toLowerCase().includes(nombreCampo));
                    }
                    return `<td${esError ? ' style="color:#dc3545;font-weight:bold;"' : ''}>${col}</td>`;
                }).join("")}
                                </tr>
                            `;
            }).join("")}
                    </tbody>
                </table>
            `;

            document.getElementById("contador-servidores").innerHTML = `<b>Servidores a crear:</b> ${filas.length}`;
            document.getElementById("pagina-indicador").innerHTML = `Página ${pagina} de ${totalPaginas}`;
            document.getElementById("btn-prev").disabled = pagina === 1;
            document.getElementById("btn-next").disabled = pagina >= totalPaginas;

            // Agrega el event listener para el botón del ojo
            if (linkIdx !== -1) {
                filasPagina.forEach((row, rowIdx) => {
                    const col = row[linkIdx];
                    if (col && col.trim() !== "") {
                        const btnId = `btn-link-${inicio + rowIdx}`;
                        setTimeout(() => {
                            const btn = document.getElementById(btnId);
                            if (btn) {
                                btn.onclick = (e) => {
                                    e.preventDefault();
                                    setShowLink({
                                        link: col,
                                        nombre: nombreIdx !== -1 ? row[nombreIdx] : "",
                                        ip: ipIdx !== -1 ? row[ipIdx] : ""
                                    });
                                };
                            }
                        }, 0);
                    }
                });
            }
        };

        Swal.fire({
            title: "Vista Previa de la Carga Masiva",
            html: `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span id="contador-servidores" style="font-size: 14px; color: #333;">
                    <b>Servidores a crear:</b> ${filasValidadas.length - 1}
                </span>
                <div>
                    <label for="select-servidores" style="font-size: 14px;">Servidores por página:</label>
                    <select id="select-servidores" style="font-size: 14px; padding: 4px; margin-left: 6px;">
                        <option value="5">5</option>
                        <option value="10" selected>10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>
            <div id="tabla-container" class="tabla-modal"></div>
            <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <button id="btn-prev" class="paginacion-btn">Anterior</button>
                <span id="pagina-indicador" style="font-size: 14px;"></span>
                <button id="btn-next" class="paginacion-btn">Siguiente</button>
            </div>
        `,
            confirmButtonText: "Cerrar",
            confirmButtonColor: "#dc3545",
            width: "100%",
            didOpen: () => {
                renderTablaModal();

                document.getElementById("select-servidores").addEventListener("change", (e) => {
                    porPagina = Number(e.target.value);
                    pagina = 1;
                    renderTablaModal();
                });

                document.getElementById("btn-prev").addEventListener("click", () => {
                    if (pagina > 1) {
                        pagina--;
                        renderTablaModal();
                    }
                });

                document.getElementById("btn-next").addEventListener("click", () => {
                    const totalPaginas = Math.max(1, Math.ceil((filasValidadas.length - 1) / porPagina));
                    if (pagina < totalPaginas) {
                        pagina++;
                        renderTablaModal();
                    }
                });
            }
        });
    };

    return (
        <>
            <button className="carga-masiva-btn" onClick={mostrarModalCarga}>
                Carga Masiva
            </button>
            <LinkFloatModal
                link={showLink?.link}
                nombre={showLink?.nombre}
                ip={showLink?.ip}
                onClose={() => setShowLink(null)}
            />
        </>
    );
};

export default ServidorCargaMasiva;