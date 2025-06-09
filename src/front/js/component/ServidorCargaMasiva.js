import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";

/**
 * Modal flotante para mostrar el link, nombre e IP del servidor.
 */
const LinkFloatModal = ({ link, nombre, ip, onClose }) => {
    if (!link) return null;
    return ReactDOM.createPortal(
        <div
            className="link-float-modal-overlay"
            onClick={onClose}
        >
            <div
                className="link-float-modal-content"
                onClick={e => e.stopPropagation()}
            >
                <h3>Enlace del servidor</h3>
                <div className="modal-link-row">
                    <b>Nombre:</b> {nombre || "-"}
                </div>
                <div className="modal-link-row">
                    <b>IP:</b> {ip || "-"}
                </div>
                <div className="modal-link-url">
                    <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                </div>
                <button
                    onClick={onClose}
                    className="cerrar-link-btn"
                >
                    Cerrar
                </button>
            </div>
        </div>,
        document.body
    );
};

/**
 * Modal para editar una fila de la tabla de carga masiva.
 */
const EditarFilaModal = ({ open, encabezado, fila, onSave, onClose }) => {
    const [form, setForm] = useState([...fila]);
    const [errores, setErrores] = useState([]);

    // Detecta errores en la observación
    useEffect(() => {
        setForm([...fila]);
        // Busca errores en la observación (última columna de la fila original)
        let obs = fila[fila.length - 1] || "";
        let nuevosErrores = [];
        if (obs && obs !== "Servidor listo para guardar") {
            nuevosErrores = encabezado.slice(0, -1).map((col, idx) => {
                const nombreCampo = col.toLowerCase();
                return obs.toLowerCase().includes(nombreCampo);
            });
        } else {
            nuevosErrores = encabezado.slice(0, -1).map(() => false);
        }
        setErrores(nuevosErrores);
    }, [fila, open, encabezado]);

    if (!open) return null;

    return ReactDOM.createPortal(
        <div
            className="editar-fila-modal-overlay"
            onClick={onClose}
        >
            <form
                className="editar-fila-modal-content grid-form"
                onClick={e => e.stopPropagation()}
                onSubmit={e => {
                    e.preventDefault();
                    onSave(form);
                }}
            >
                <h3>Editar servidor</h3>
                <div className="grid-form-row">
                    {encabezado.slice(0, -1).map((col, idx) => (
                        <div className="form-field" key={col}>
                            <label>{col}</label>
                            <input
                                type="text"
                                value={form[idx]}
                                className={errores[idx] ? "input-error" : ""}
                                onChange={e => {
                                    const newForm = [...form];
                                    newForm[idx] = e.target.value;
                                    setForm(newForm);
                                    // Quita el error visual al editar
                                    if (errores[idx]) {
                                        const nuevosErrores = [...errores];
                                        nuevosErrores[idx] = false;
                                        setErrores(nuevosErrores);
                                    }
                                }}
                            />
                            {errores[idx] && (
                                <span style={{ color: "#dc3545", fontSize: "13px", marginTop: "2px" }}>
                                    Corrige este campo
                                </span>
                            )}
                        </div>
                    ))}
                </div>
                <div className="modal-buttons">
                    <button type="submit" className="guardar-servidores-btn">
                        Guardar
                    </button>
                    <button type="button" className="cerrar-servidores-btn" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>,
        document.body
    );
};

// --- Utilidad para limpiar columnas duplicadas de "Observación" ---
function limpiarObservacionDuplicada(filas) {
    if (!filas || filas.length === 0) return filas;
    const encabezado = filas[0];
    const obsIndices = [];
    encabezado.forEach((col, idx) => {
        if (col.trim().toLowerCase() === "observación") obsIndices.push(idx);
    });
    if (obsIndices.length > 1) {
        const idxMantener = obsIndices[0];
        // Elimina los demás en todas las filas
        for (let i = 0; i < filas.length; i++) {
            filas[i] = filas[i].filter((_, idx) => idx === idxMantener || !obsIndices.slice(1).includes(idx));
        }
    }
    return filas;
}

// --- Marcar repetidos en nombre o ip (excepto el primero que aparece) ---
function marcarRepetidosEnFilas(filas, nombreIdx, ipIdx, obsIdx) {
    if (!filas || filas.length < 2) return filas;
    const nombreMap = {};
    const ipMap = {};
    // Recorre filas de datos (no encabezado)
    for (let i = 1; i < filas.length; i++) {
        const nombre = filas[i][nombreIdx]?.trim().toLowerCase();
        const ip = filas[i][ipIdx]?.trim().toLowerCase();
        if (nombre) {
            if (!nombreMap[nombre]) nombreMap[nombre] = [];
            nombreMap[nombre].push(i);
        }
        if (ip) {
            if (!ipMap[ip]) ipMap[ip] = [];
            ipMap[ip].push(i);
        }
    }
    // Marca como repetidos todos menos el primero
    for (const indices of Object.values(nombreMap)) {
        if (indices.length > 1) {
            for (let j = 1; j < indices.length; j++) {
                const idx = indices[j];
                let obs = filas[idx][obsIdx] || "";
                if (!obs.toLowerCase().includes("nombre repetido")) {
                    obs += (obs ? "; " : "") + "Nombre repetido";
                }
                filas[idx][obsIdx] = obs;
            }
        }
    }
    for (const indices of Object.values(ipMap)) {
        if (indices.length > 1) {
            for (let j = 1; j < indices.length; j++) {
                const idx = indices[j];
                let obs = filas[idx][obsIdx] || "";
                if (!obs.toLowerCase().includes("ip repetida")) {
                    obs += (obs ? "; " : "") + "IP repetida";
                }
                filas[idx][obsIdx] = obs;
            }
        }
    }
    return filas;
}

const ServidorCargaMasiva = () => {
    const [datosCSV, setDatosCSV] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [servidoresPorPagina, setServidoresPorPagina] = useState(10);
    const [showLink, setShowLink] = useState(null); // { link, nombre, ip }
    const [editModal, setEditModal] = useState({ open: false, filaIdx: null, fila: [], encabezado: [] });
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
        // --- LIMPIA COLUMNAS EXTRAS DE OBSERVACIÓN ANTES DE VALIDAR ---
        const dataLimpia = limpiarObservacionDuplicada([...data.map(f => [...f])]);

        if (!dataLimpia || dataLimpia.length === 0) {
            console.error("Error: 'data' no está definido o está vacío.");
            return;
        }

        const filasValidadas = await validarFilas(dataLimpia);
        if (!filasValidadas || filasValidadas.length === 0) {
            Swal.fire("Error", "No se encontraron datos válidos en el archivo CSV.", "error");
            return;
        }

        // Marcar repetidos en nombre o ip antes de mostrar
        const encabezado = filasValidadas[0];
        const nombreIdx = encabezado.findIndex(col => col.trim().toLowerCase() === "nombre" || col.trim().toLowerCase() === "servidor" || col.trim().toLowerCase() === "nombre servidor");
        const ipIdx = encabezado.findIndex(col => col.trim().toLowerCase() === "ip" || col.trim().toLowerCase() === "ip servidor");
        const obsIdx = encabezado.length - 1;
        const filasConRepetidos = marcarRepetidosEnFilas([...filasValidadas.map(f => [...f])], nombreIdx, ipIdx, obsIdx);

        filasValidadasRef.current = limpiarObservacionDuplicada(filasConRepetidos);

        let pagina = 1;
        let porPagina = 10;

        const renderTablaModal = () => {
            const tablaContainer = document.getElementById("tabla-container");
            if (!tablaContainer) return;
            const encabezado = filasValidadasRef.current[0];
            const filas = filasValidadasRef.current.slice(1);

            // --- Detectar valores repetidos por columna (ignorando la primera fila de datos) ---
            const repetidosPorColumna = {};
            encabezado.slice(0, -1).forEach((col, colIdx) => {
                const valores = {};
                filas.forEach((fila, filaIdx) => {
                    if (filaIdx === 0) return; // Ignora el primer servidor
                    const valor = fila[colIdx];
                    if (valor && valor !== "") {
                        if (!valores[valor]) valores[valor] = [];
                        valores[valor].push(filaIdx);
                    }
                });
                repetidosPorColumna[colIdx] = new Set();
                Object.values(valores).forEach(indices => {
                    if (indices.length > 0) {
                        indices.forEach(idx => repetidosPorColumna[colIdx].add(idx));
                    }
                });
            });

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
            const iconEdit = `<span class="material-symbols-outlined" style="vertical-align:middle;">edit</span>`;

            tablaContainer.innerHTML = `
                <table class="tabla-servidores tabla-modal-carga" style="width: 1800px; font-size: 16px;">
                    <thead>
                        <tr>
                            ${encabezado.map(col => `<th>${col}</th>`).join("")}
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasPagina.map((row, rowIdx) => {
                const filaRealIdx = inicio + rowIdx;
                return `
            <tr>
                ${row.map((col, idx) => {
                    // Si es la columna de observación (última), solo muestra el ícono
                    if (idx === row.length - 1) {
                        const tieneError = col !== "Servidor listo para guardar";
                        return `<td style="text-align:center;">
                            <span style="font-size:22px;">
                                ${tieneError ? iconCancel : iconCheck}
                            </span>
                        </td>`;
                    }
                    // Si es la columna de link
                    if (idx === linkIdx) {
                        if (!col || col.trim() === "") {
                            return `<td></td>`;
                        }
                        const btnId = `btn-link-${filaRealIdx}`;
                        return `<td style="text-align:center;">
                            <button id="${btnId}" class="btn-link-ojo" style="background:none;border:none;cursor:pointer;" title="Ver enlace">
                                ${iconEye}
                            </button>
                        </td>`;
                    }
                    // Resto de columnas normales
                    let esError = false;
                    const observacion = row[row.length - 1];
                    if (observacion !== "Servidor listo para guardar") {
                        const nombreCampo = encabezado[idx].toLowerCase();
                        esError = observacion.split(";").some(err => err.toLowerCase().includes(nombreCampo) || err.toLowerCase().includes("repetido"));
                    }
                    // --- Marcar en rojo si es repetido (excepto el primer servidor) ---
                    let esRepetido = false;
                    if (filaRealIdx > 0 && repetidosPorColumna[idx] && repetidosPorColumna[idx].has(filaRealIdx - 1)) {
                        esRepetido = true;
                    }
                    // También marcar en rojo si la observación contiene "repetido"
                    if (idx === nombreIdx && observacion.toLowerCase().includes("nombre repetido")) esRepetido = true;
                    if (idx === ipIdx && observacion.toLowerCase().includes("ip repetida")) esRepetido = true;

                    const style = (esError || esRepetido) ? ' style="color:#dc3545;font-weight:bold;"' : '';
                    return `<td${style}>${col}</td>`;
                }).join("")}
                <td style="text-align:center;">
                    <button id="btn-edit-${filaRealIdx}" class="btn-edit-ojo" style="background:none;border:none;cursor:pointer;" title="Editar">
                        ${iconEdit}
                    </button>
                </td>
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

            // Botón del ojo (link)
            if (linkIdx !== -1) {
                filasPagina.forEach((row, rowIdx) => {
                    const col = row[linkIdx];
                    const filaRealIdx = inicio + rowIdx;
                    if (col && col.trim() !== "") {
                        const btnId = `btn-link-${filaRealIdx}`;
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
            // Botón de editar
            filasPagina.forEach((row, rowIdx) => {
                const filaRealIdx = inicio + rowIdx;
                const btnId = `btn-edit-${filaRealIdx}`;
                setTimeout(() => {
                    const btn = document.getElementById(btnId);
                    if (btn) {
                        btn.onclick = (e) => {
                            e.preventDefault();
                            setEditModal({
                                open: true,
                                filaIdx: filaRealIdx + 1, // +1 porque la fila 0 es encabezado
                                fila: [...filas[filaRealIdx]].slice(0, -1), // sin observación
                                encabezado
                            });
                        };
                    }
                }, 0);
            });
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

    // Guardar edición de fila
    const handleSaveEdit = async (newFilaSinObs) => {
        const encabezado = editModal.encabezado;
        let filaAValidar = [...newFilaSinObs];

        // Asegura que la fila tenga la longitud correcta (sin observación)
        if (filaAValidar.length > encabezado.length - 1) {
            filaAValidar = filaAValidar.slice(0, encabezado.length - 1);
        }
        if (filaAValidar.length < encabezado.length - 1) {
            while (filaAValidar.length < encabezado.length - 1) {
                filaAValidar.push("");
            }
        }

        // Antes de validar, limpia cualquier columna extra de observación
        const filas = filasValidadasRef.current;
        filas[editModal.filaIdx] = [...filaAValidar, ""]; // temporal, para mantener estructura
        filasValidadasRef.current = limpiarObservacionDuplicada(filas);

        // Valida la fila editada con el backend
        const filasValidas = await validarFilas([encabezado, filaAValidar]);
        const filaActualizada = filasValidas[1];

        // Actualiza la fila editada con la nueva observación
        const filasActuales = filasValidadasRef.current;
        filasActuales[editModal.filaIdx] = filaActualizada;

        // Marcar repetidos en nombre o ip después de editar
        const nombreIdx = encabezado.findIndex(col => col.trim().toLowerCase() === "nombre" || col.trim().toLowerCase() === "servidor" || col.trim().toLowerCase() === "nombre servidor");
        const ipIdx = encabezado.findIndex(col => col.trim().toLowerCase() === "ip" || col.trim().toLowerCase() === "ip servidor");
        const obsIdx = encabezado.length - 1;
        marcarRepetidosEnFilas(filasActuales, nombreIdx, ipIdx, obsIdx);

        filasValidadasRef.current = limpiarObservacionDuplicada(filasActuales);

        // Si la fila editada tiene repetidos, no guardar y mostrar error
        const obs = filasValidadasRef.current[editModal.filaIdx][obsIdx] || "";
        if (obs.toLowerCase().includes("repetido")) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se puede guardar porque el nombre o la IP ya existen en otro servidor de la carga masiva.",
            });
            setTimeout(() => {
                mostrarModalTabla(filasValidadasRef.current);
            }, 300);
            return;
        }

        setEditModal({ open: false, filaIdx: null, fila: [], encabezado: [] });
        Swal.fire({
            icon: "success",
            title: "Servidor editado correctamente",
            showConfirmButton: false,
            timer: 1500
        });
        setTimeout(() => {
            mostrarModalTabla(filasValidadasRef.current);
        }, 300);
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
            <EditarFilaModal
                open={editModal.open}
                encabezado={editModal.encabezado}
                fila={editModal.fila}
                onSave={handleSaveEdit}
                onClose={() => setEditModal({ open: false, filaIdx: null, fila: [], encabezado: [] })}
            />
        </>
    );
};

export default ServidorCargaMasiva;