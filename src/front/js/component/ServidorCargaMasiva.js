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

    // Cargar listas de referencia al montar
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

            for (const fila of filas) {
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
                    console.error(`Error al procesar servidor ${servidor.nombre}: algunos valores no fueron encontrados.`);
                    continue;
                }

                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/servidores`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(servidor),
                    });

                    if (!response.ok) {
                        console.error(`Error al subir servidor: ${servidor.nombre}`);
                        continue;
                    }
                } catch (error) {
                    console.error("Error al enviar el servidor:", error);
                }
            }

            Swal.fire({
                title: "Carga exitosa",
                text: "Los servidores fueron guardados correctamente.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
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