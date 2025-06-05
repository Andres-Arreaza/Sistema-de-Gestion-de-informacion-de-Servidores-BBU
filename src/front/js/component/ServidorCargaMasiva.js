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
                        ${nuevosDatos.map(row => `
                            <tr>
                                ${row.map(col => `<td>${col}</td>`).join("")}
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

    const mostrarModalTabla = (data) => {
        Swal.fire({
            title: "Vista Previa de la Carga Masiva",
            html: `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span id="contador-servidores" style="font-size: 14px; color: #333;">
                        <b>Servidores a crear:</b> ${data.length - 1}
                    </span>
                    <div>
                        <label for="select-servidores" style="font-size: 14px;">Servidores por página:</label>
                        <select id="select-servidores" style="font-size: 14px; padding: 4px; margin-left: 6px;">
                            <option value="5">5</option>
                            <option value="10" ${servidoresPorPagina === 10 ? "selected" : ""}>10</option>
                            <option value="20" ${servidoresPorPagina === 20 ? "selected" : ""}>20</option>
                            <option value="50" ${servidoresPorPagina === 50 ? "selected" : ""}>50</option>
                        </select>
                    </div>
                </div>
                <div id="tabla-container" class="tabla-modal"></div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <button id="btn-prev" class="paginacion-btn">Anterior</button>
                    <span id="pagina-indicador" style="font-size: 14px;">Página ${paginaActual} de ${Math.ceil((data.length - 1) / servidoresPorPagina)}</span>
                    <button id="btn-next" class="paginacion-btn">Siguiente</button>
                </div>
            `,
            confirmButtonText: "Cerrar",
            confirmButtonColor: "#dc3545",
            width: "80%",
            didClose: () => {
                setPaginaActual(1);
            },
            didOpen: () => {
                actualizarTabla(data);

                document.getElementById("select-servidores").addEventListener("change", (e) => {
                    setServidoresPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                });

                document.getElementById("btn-prev").addEventListener("click", () => {
                    if (paginaActual >= 1) {
                        setPaginaActual(prev => prev - 1);
                    }
                });

                document.getElementById("btn-next").addEventListener("click", () => {
                    const totalPaginas = Math.ceil((data.length - 1) / servidoresPorPagina);
                    if (paginaActual < totalPaginas) {
                        setPaginaActual(prev => prev + 1);
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