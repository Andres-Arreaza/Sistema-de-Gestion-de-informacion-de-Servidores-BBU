import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const ServidorCargaMasiva = ({ actualizarServidores }) => {
    // Estado para listas de referencia
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

    // Importar CSV y crear servidores
    const importarCSV = async (event) => {
        event.persist();

        if (!event.target || !event.target.files || event.target.files.length === 0) {
            console.error("Error: No se seleccionó un archivo.");
            return;
        }

        // Obtener todos los servidores existentes para validar duplicados localmente
        let servidoresExistentes = [];
        try {
            const res = await fetch(`${process.env.BACKEND_URL}/api/servidores`);
            if (res.ok) {
                servidoresExistentes = await res.json();
            }
        } catch (e) {
            // Si falla, igual seguimos, pero no podremos validar duplicados locales
        }

        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            const contenido = e.target.result;
            const filas = contenido.split("\n").slice(1);

            let resultados = [];

            for (const fila of filas) {
                if (!fila.trim()) continue;
                const columnas = fila.split(";").map(col => col.replace(/"/g, "").trim());

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

                // Validación local de duplicados por nombre y/o IP
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
                        // Añadir a la lista local para evitar duplicados en el mismo archivo
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

            // Mostrar resumen en un modal, cada registro con su icono y color de texto
            Swal.fire({
                title: "Resultado de la carga masiva",
                html: `
                    <div class="carga-masiva-modal">
                        ${resultados.length === 0 ? "<div>No se procesó ningún registro.</div>" : ""}
                        ${resultados.map(s => `
                            <div style="margin-bottom:6px;">
                                <span class="material-symbols-outlined ${s.exito ? "icon-success" : "icon-error"}">
                                    ${s.exito ? "check" : "close"}
                                </span>
                                <span style="color:${s.exito ? 'green' : 'red'}">
                                    ${s.nombre} (${s.ip}) - ${s.mensaje}
                                </span>
                            </div>
                        `).join("")}
                    </div>
                `,
                icon: "info",
                width: "50%",
                confirmButtonText: "Aceptar",
                confirmButtonColor: "#007953",
                background: "#fff"
            });

            if (actualizarServidores) actualizarServidores();

            // Resetear input de archivo
            if (event.target) {
                event.target.value = "";
            }
        };

        // Buscar ID por nombre en una lista
        function obtenerIdPorNombre(lista, nombre) {
            if (!lista || lista.length === 0) {
                console.error(`Lista vacía: No se pudo obtener ID para ${nombre}`);
                return null;
            }
            const elemento = lista.find(item => item.nombre?.toLowerCase() === nombre?.toLowerCase());
            return elemento ? elemento.id : null;
        }

        reader.readAsText(file);
    };

    return (
        <label className="carga-masiva-btn">
            <span>Carga Masiva</span>
            <input type="file" accept=".csv" onChange={importarCSV} hidden />
        </label>
    );
};

export default ServidorCargaMasiva;