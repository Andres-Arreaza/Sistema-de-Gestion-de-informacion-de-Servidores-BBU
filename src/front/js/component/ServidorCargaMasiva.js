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

    // Buscar ID por nombre en una lista
    const obtenerIdPorNombre = (lista, nombre) => {
        if (!lista || lista.length === 0) {
            console.error(`Lista vacía: No se pudo obtener ID para ${nombre}`);
            return null;
        }
        const elemento = lista.find(item => item.nombre?.toLowerCase() === nombre?.toLowerCase());
        return elemento ? elemento.id : null;
    };

    // Importar CSV y crear servidores
    const importarCSV = async (event) => {
        event.persist();

        if (!event.target || !event.target.files || event.target.files.length === 0) {
            console.error("Error: No se seleccionó un archivo.");
            return;
        }

        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            const contenido = e.target.result;
            const filas = contenido.split("\n").slice(1);

            let cargados = [];
            let duplicados = [];

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

                if (!servidor.servicio_id || !servidor.capa_id || !servidor.ambiente_id || !servidor.dominio_id || !servidor.sistema_operativo_id || !servidor.estatus_id) {
                    duplicados.push({
                        nombre: servidor.nombre,
                        ip: servidor.ip,
                        motivo: "Valores de referencia no encontrados"
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
                        cargados.push({ nombre: servidor.nombre, ip: servidor.ip });
                    } else {
                        // Intentar obtener el mensaje de error del backend
                        let motivo = "Duplicidad";
                        try {
                            const errorData = await response.json();
                            motivo = errorData?.msg || errorData?.error || motivo;
                        } catch { }
                        duplicados.push({
                            nombre: servidor.nombre,
                            ip: servidor.ip,
                            motivo
                        });
                    }
                } catch (error) {
                    duplicados.push({
                        nombre: servidor.nombre,
                        ip: servidor.ip,
                        motivo: "Error de red o servidor"
                    });
                }
            }

            // Mostrar resumen en un modal
            Swal.fire({
                title: "Resultado de la carga masiva",
                html: `
                    <div class="carga-masiva-modal">
                        <b>Servidores cargados correctamente (${cargados.length}):</b>
                        <ul class="carga-masiva-lista-exito">
                            ${cargados.map(s => `<li>${s.nombre} (${s.ip})</li>`).join("") || "<li>Ninguno</li>"}
                        </ul>
                        <b>Servidores NO cargados (${duplicados.length}):</b>
                        <ul class="carga-masiva-lista-error">
                            ${duplicados.map(s => `<li>${s.nombre} (${s.ip}) - ${s.motivo}</li>`).join("") || "<li>Ninguno</li>"}
                        </ul>
                    </div>
                `,
                icon: "info",
                width: "50%",
                confirmButtonText: "Aceptar"
            });

            if (actualizarServidores) actualizarServidores();

            // Resetear input de archivo
            if (event.target) {
                event.target.value = "";
            }
        };

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