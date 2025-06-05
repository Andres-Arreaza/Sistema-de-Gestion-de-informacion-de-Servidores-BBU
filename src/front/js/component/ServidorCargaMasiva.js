import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const ServidorCargaMasiva = () => {
    const [datosCSV, setDatosCSV] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [servidoresPorPagina, setServidoresPorPagina] = useState(10);
    const [datosPaginados, setDatosPaginados] = useState([]);

    useEffect(() => {
        if (datosCSV.length > 0) {
            actualizarTabla(datosCSV);
        }
    }, [paginaActual, servidoresPorPagina, datosCSV]);

    const mostrarModalCarga = () => {
        let fileRows = [];
        let fileName = "";

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

                    fileName = file.name;
                    const reader = new FileReader();

                    reader.onload = (ev) => {
                        const filas = ev.target.result.split("\n").filter(f => f.trim());
                        fileRows = filas.map(fila => fila.split(";").map(col => col.replace(/"/g, "").trim()));
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
    const actualizarTabla = (data) => {
        if (!data.length) return;

        const encabezado = data[0]; // <-- Toma el encabezado dinámicamente
        const cantidadServidores = data.length - 1;
        const totalPaginas = Math.ceil(cantidadServidores / servidoresPorPagina);
        const inicio = (paginaActual - 1) * servidoresPorPagina;
        const fin = inicio + servidoresPorPagina;
        const nuevosDatos = data.slice(1).slice(inicio, fin);

        setDatosPaginados(nuevosDatos);

        const tablaContainer = document.getElementById("tabla-container");
        const contadorServidores = document.getElementById("contador-servidores");
        const paginaIndicador = document.getElementById("pagina-indicador");
        const btnPrev = document.getElementById("btn-prev");
        const btnNext = document.getElementById("btn-next");

        if (tablaContainer && contadorServidores && paginaIndicador && btnPrev && btnNext) {
            tablaContainer.innerHTML = `
                <table class="tabla-servidores">
                    <thead>
                        <tr>
                            ${encabezado.map(col => `<th>${col}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${nuevosDatos.map(row => `
                            <tr>
                                ${row.map((col, idx) =>
                idx === row.length - 1
                    ? `<td style="font-weight:bold; color:${col.includes('listo') ? '#007953' : '#dc3545'}">${col}</td>`
                    : `<td>${col}</td>`
            ).join("")}
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;

            contadorServidores.innerHTML = `<b>Servidores a crear:</b> ${cantidadServidores}`;
            paginaIndicador.innerHTML = `Página ${paginaActual} de ${totalPaginas}`;

            btnPrev.disabled = paginaActual === 1;
            btnNext.disabled = paginaActual >= totalPaginas;
        }
    };

    useEffect(() => {
        actualizarTabla(datosCSV);
    }, [paginaActual, servidoresPorPagina, datosCSV]);

    const validarFilas = async (filas) => {
        try {
            const response = await fetch("http://localhost:3001/api/servidores/validar_masivo", {
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
            return filas; // Devuelve las filas originales para evitar romper el flujo
        }
    };

    const mostrarModalTabla = async (data) => {
        const filasValidadas = await validarFilas(data);

        // Estado local para paginación dentro del modal
        let paginaActual = 1;
        let servidoresPorPagina = 10;

        // Renderiza la tabla y controles
        const renderTablaModal = () => {
            const tablaContainer = document.getElementById("tabla-container");
            if (!tablaContainer) return;
            const encabezado = filasValidadas[0];
            const filas = filasValidadas.slice(1);

            // Paginación
            const totalPaginas = Math.ceil(filas.length / servidoresPorPagina);
            const inicio = (paginaActual - 1) * servidoresPorPagina;
            const fin = inicio + servidoresPorPagina;
            const filasPagina = filas.slice(inicio, fin);

            // Íconos de Google Fonts
            const iconCheck = `<span class="material-symbols-outlined" style="color:#007953;">check_circle</span>`;
            const iconCancel = `<span class="material-symbols-outlined" style="color:#dc3545;">cancel</span>`;

            tablaContainer.innerHTML = `
                <table class="tabla-servidores">
                    <thead>
                        <tr>
                            ${encabezado.map(col => `<th>${col}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${filasPagina.map(row => {
                const observacion = row[row.length - 1];
                const tieneError = observacion !== "Servidor listo para guardar";
                const errores = tieneError ? observacion.split(";").map(e => e.trim()) : [];
                return `
                            <tr>
                                ${row.map((col, idx) => {
                    // Columna Observación: solo icono
                    if (idx === row.length - 1) {
                        return `<td style="text-align:center;">${tieneError ? iconCancel : iconCheck}</td>`;
                    }
                    // Resalta en rojo si hay error en el campo
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

            // Actualiza los indicadores de paginación
            const contadorServidores = document.getElementById("contador-servidores");
            const paginaIndicador = document.getElementById("pagina-indicador");
            const btnPrev = document.getElementById("btn-prev");
            const btnNext = document.getElementById("btn-next");

            if (contadorServidores) {
                contadorServidores.innerHTML = `<b>Servidores a crear:</b> ${filas.length}`;
            }
            if (paginaIndicador) {
                paginaIndicador.innerHTML = `Página ${paginaActual} de ${totalPaginas}`;
            }
            if (btnPrev) btnPrev.disabled = paginaActual === 1;
            if (btnNext) btnNext.disabled = paginaActual === totalPaginas;
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
                    servidoresPorPagina = Number(e.target.value);
                    paginaActual = 1;
                    renderTablaModal();
                });

                document.getElementById("btn-prev").addEventListener("click", () => {
                    if (paginaActual > 1) {
                        paginaActual--;
                        renderTablaModal();
                    }
                });

                document.getElementById("btn-next").addEventListener("click", () => {
                    const totalPaginas = Math.ceil((filasValidadas.length - 1) / servidoresPorPagina);
                    if (paginaActual < totalPaginas) {
                        paginaActual++;
                        renderTablaModal();
                    }
                });
            }
        });
    };

    return (
        <button className="carga-masiva-btn" onClick={mostrarModalCarga}>
            Carga Masiva
        </button>
    );
};

export default ServidorCargaMasiva;