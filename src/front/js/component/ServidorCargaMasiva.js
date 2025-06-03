import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const ServidorCargaMasiva = ({ actualizarServidores }) => {
    const [listasReferencia, setListasReferencia] = useState({
        servicios: [],
        capas: [],
        ambientes: [],
        dominios: [],
        sistemasOperativos: [],
        estatus: [],
    });

    useEffect(() => {
        const obtenerListasReferencia = async () => {
            try {
                const urls = [
                    `${process.env.BACKEND_URL}/api/servicios`,
                    `${process.env.BACKEND_URL}/api/capas`,
                    `${process.env.BACKEND_URL}/api/ambientes`,
                    `${process.env.BACKEND_URL}/api/dominios`,
                    `${process.env.BACKEND_URL}/api/sistemas_operativos`,
                    `${process.env.BACKEND_URL}/api/estatus`
                ];
                const respuestas = await Promise.all(urls.map(url => fetch(url)));
                const datos = await Promise.all(respuestas.map(async res => {
                    const contentType = res.headers.get("content-type") || "";
                    if (!res.ok || !contentType.includes("application/json")) {
                        console.error(`Error en API (${res.url}): ${res.status}`);
                        return [];
                    }
                    return res.json();
                }));
                setListasReferencia({
                    servicios: datos[0] || [],
                    capas: datos[1] || [],
                    ambientes: datos[2] || [],
                    dominios: datos[3] || [],
                    sistemasOperativos: datos[4] || [],
                    estatus: datos[5] || [],
                });
            } catch (error) {
                console.error("Error al obtener listas de referencia:", error);
            }
        };
        obtenerListasReferencia();
    }, []);

    const obtenerIdPorNombre = (lista, nombre) => {
        if (!lista || lista.length === 0) return null;
        const elemento = lista.find(item => item.nombre?.toLowerCase() === nombre?.toLowerCase());
        return elemento ? elemento.id : null;
    };

    // Modal solo con input y nombre de archivo bonito y centrado
    const mostrarModalCarga = () => {
        let fileRows = [];
        let fileName = "";

        Swal.fire({
            title: "Carga Masiva de Servidores",
            html: `
                <div class="carga-masiva-modal-simple" style="display:flex;flex-direction:column;align-items:center;gap:16px;">
                    <label for="input-csv" class="custom-file-label" style="margin:auto;">
                        <span class="material-symbols-outlined">upload</span>
                        Seleccionar archivo CSV
                    </label>
                    <input type="file" id="input-csv" accept=".csv" class="swal2-input custom-file-input"/>
                    <div id="nombre-archivo-csv" class="nombre-archivo-csv" style="margin:auto;text-align:center;"></div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#007953",
            cancelButtonColor: "#d9534f",
            background: "#fff",
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
                input.style.display = "none"; // Oculta el input real
                const label = document.querySelector(".custom-file-label");
                label.onclick = () => input.click();

                // Permitir seleccionar el mismo archivo dos veces seguidas
                input.value = "";

                input.addEventListener("change", (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    fileName = file.name;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const filas = ev.target.result.split("\n").filter(f => f.trim());
                        fileRows = filas.map(fila => fila.split(";").map(col => col.replace(/"/g, "").trim()));
                        document.getElementById("nombre-archivo-csv").innerHTML =
                            `<span class="archivo-seleccionado"><b>Archivo seleccionado:</b> ${fileName}</span>`;
                    };
                    reader.readAsText(file);
                    // Permitir volver a seleccionar el mismo archivo si hay error
                    input.value = "";
                });
            }
        }).then(async (result) => {
            if (result.isConfirmed && result.value) {
                await importarCSV(result.value);
            }
        });
    };

    // Aquí va la función importarCSV (sin cambios en la lógica principal)
    const importarCSV = async (filas) => {
        if (!filas || filas.length < 2) return;
        let servidoresExistentes = [];
        try {
            const res = await fetch(`${process.env.BACKEND_URL}/api/servidores`);
            if (res.ok) servidoresExistentes = await res.json();
        } catch (e) { }

        let resultados = [];
        for (let i = 1; i < filas.length; i++) {
            const columnas = filas[i];
            if (!columnas || columnas.length < 3) continue;
            const servidor = {
                nombre: columnas[0],
                tipo: columnas[1],
                ip: columnas[2],
                servicio_id: obtenerIdPorNombre(listasReferencia.servicios, columnas[3]),
                capa_id: obtenerIdPorNombre(listasReferencia.capas, columnas[4]),
                ambiente_id: obtenerIdPorNombre(listasReferencia.ambientes, columnas[5]),
                balanceador: columnas[6] || "",
                vlan: columnas[7] || "",
                dominio_id: obtenerIdPorNombre(listasReferencia.dominios, columnas[8]),
                sistema_operativo_id: obtenerIdPorNombre(listasReferencia.sistemasOperativos, columnas[9]),
                estatus_id: obtenerIdPorNombre(listasReferencia.estatus, columnas[10]),
                descripcion: columnas[11] || "",
                link: columnas[12] || "",
                activo: true
            };

            let mensajesDuplicidad = [];
            if (servidoresExistentes.find(s => s.nombre === servidor.nombre)) {
                mensajesDuplicidad.push("Ya existe un servidor con ese nombre");
            }
            if (servidoresExistentes.find(s => s.ip === servidor.ip)) {
                mensajesDuplicidad.push("Ya existe un servidor con esa IP");
            }

            if (!servidor.servicio_id || !servidor.capa_id || !servidor.ambiente_id || !servidor.dominio_id || !servidor.sistema_operativo_id || !servidor.estatus_id) {
                resultados.push({
                    nombre: servidor.nombre,
                    ip: servidor.ip,
                    exito: false,
                    mensaje: "Valores de referencia no encontrados"
                });
                continue;
            }

            if (mensajesDuplicidad.length > 0) {
                resultados.push({
                    nombre: servidor.nombre,
                    ip: servidor.ip,
                    exito: false,
                    mensaje: mensajesDuplicidad.length === 2
                        ? "Ya existe un servidor con ese nombre y con esa IP"
                        : mensajesDuplicidad[0]
                });
                continue;
            }

            try {
                const response = await fetch(`${process.env.BACKEND_URL}/api/servidores`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(servidor),
                });

                if (response.ok) {
                    resultados.push({
                        nombre: servidor.nombre,
                        ip: servidor.ip,
                        exito: true,
                        mensaje: "Servidor guardado correctamente"
                    });
                    servidoresExistentes.push({ nombre: servidor.nombre, ip: servidor.ip });
                } else {
                    let motivo = "Duplicidad";
                    try {
                        const errorData = await response.json();
                        motivo = errorData?.msg || errorData?.error || motivo;
                    } catch { }
                    resultados.push({
                        nombre: servidor.nombre,
                        ip: servidor.ip,
                        exito: false,
                        mensaje: motivo
                    });
                }
            } catch (error) {
                resultados.push({
                    nombre: servidor.nombre,
                    ip: servidor.ip,
                    exito: false,
                    mensaje: "Error de red o servidor"
                });
            }
        }

        // Mostrar resultados finales
        Swal.fire({
            title: "Resultado de la carga masiva",
            html: `
                <div class="carga-masiva-modal">
                    ${resultados.length === 0 ? "<div>No se procesó ningún registro.</div>" : ""}
                    ${resultados.map(s => `
                        <div class="carga-masiva-item">
                            <span class="material-symbols-outlined ${s.exito ? "icon-success" : "icon-error"}">
                                ${s.exito ? "check" : "close"}
                            </span>
                            <span class="carga-masiva-mensaje ${s.exito ? "texto-exito" : "texto-error"}">
                                <b>${s.nombre}</b> (${s.ip}) - ${s.mensaje}
                            </span>
                        </div>
                    `).join("")}
                </div>
            `,
            icon: "info",
            width: "40%",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#007953",
            background: "#fff"
        });

        if (actualizarServidores) actualizarServidores();
    };

    return (
        <button className="carga-masiva-btn" onClick={mostrarModalCarga}>
            Carga Masiva
        </button>
    );
};

export default ServidorCargaMasiva;