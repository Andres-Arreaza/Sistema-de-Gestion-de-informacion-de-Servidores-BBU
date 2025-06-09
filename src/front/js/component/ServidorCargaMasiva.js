import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";

/**
 * Modal flotante para mostrar el link, nombre e IP del servidor.
 */
const LinkFloatModal = ({ link, nombre, ip, onClose }) => {
    if (!link) return null;
    return ReactDOM.createPortal(
        <div className="link-float-modal-overlay" onClick={onClose}>
            <div className="link-float-modal-content" onClick={e => e.stopPropagation()}>
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
                <button onClick={onClose} className="cerrar-link-btn">
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
const EditarFilaModal = ({ open, encabezado, fila, onSave, onClose, catalogos }) => {
    const [form, setForm] = useState(fila.map(col => col ?? ""));
    const [errores, setErrores] = useState([]);

    useEffect(() => {
        setForm(fila.map(col => col ?? ""));
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

    // Mapeo de campos seleccionables
    const camposSelect = {
        "tipo": (
            <select value={form[encabezado.findIndex(c => c.toLowerCase().includes("tipo"))] || ""} onChange={e => {
                const idx = encabezado.findIndex(c => c.toLowerCase().includes("tipo"));
                const newForm = [...form];
                newForm[idx] = e.target.value;
                setForm(newForm);
            }}>
                <option value="">Seleccione el Tipo</option>
                <option value="FISICO">FISICO</option>
                <option value="VIRTUAL">VIRTUAL</option>
            </select>
        ),
        "servicio": (
            <select value={form[encabezado.findIndex(c => c.toLowerCase().includes("servicio"))] || ""} onChange={e => {
                const idx = encabezado.findIndex(c => c.toLowerCase().includes("servicio"));
                const newForm = [...form];
                newForm[idx] = e.target.value;
                setForm(newForm);
            }}>
                <option value="">Seleccione un Servicio</option>
                {catalogos.servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
        ),
        "capa": (
            <select value={form[encabezado.findIndex(c => c.toLowerCase().includes("capa"))] || ""} onChange={e => {
                const idx = encabezado.findIndex(c => c.toLowerCase().includes("capa"));
                const newForm = [...form];
                newForm[idx] = e.target.value;
                setForm(newForm);
            }}>
                <option value="">Seleccione una Capa</option>
                {catalogos.capas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
        ),
        "ambiente": (
            <select value={form[encabezado.findIndex(c => c.toLowerCase().includes("ambiente"))] || ""} onChange={e => {
                const idx = encabezado.findIndex(c => c.toLowerCase().includes("ambiente"));
                const newForm = [...form];
                newForm[idx] = e.target.value;
                setForm(newForm);
            }}>
                <option value="">Seleccione un Ambiente</option>
                {catalogos.ambientes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
        ),
        "dominio": (
            <select value={form[encabezado.findIndex(c => c.toLowerCase().includes("dominio"))] || ""} onChange={e => {
                const idx = encabezado.findIndex(c => c.toLowerCase().includes("dominio"));
                const newForm = [...form];
                newForm[idx] = e.target.value;
                setForm(newForm);
            }}>
                <option value="">Seleccione un Dominio</option>
                {catalogos.dominios.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
        ),
        "s.o.": (
            <select value={form[encabezado.findIndex(c => c.toLowerCase().includes("s.o."))] || ""} onChange={e => {
                const idx = encabezado.findIndex(c => c.toLowerCase().includes("s.o."));
                const newForm = [...form];
                newForm[idx] = e.target.value;
                setForm(newForm);
            }}>
                <option value="">Seleccione un S.O.</option>
                {catalogos.sistemasOperativos.map(so => <option key={so.id} value={so.id}>{so.nombre}</option>)}
            </select>
        ),
        "estatus": (
            <select value={form[encabezado.findIndex(c => c.toLowerCase().includes("estatus"))] || ""} onChange={e => {
                const idx = encabezado.findIndex(c => c.toLowerCase().includes("estatus"));
                const newForm = [...form];
                newForm[idx] = e.target.value;
                setForm(newForm);
            }}>
                <option value="">Seleccione un Estatus</option>
                {catalogos.estatus.map(est => <option key={est.id} value={est.id}>{est.nombre}</option>)}
            </select>
        ),
    };

    // Render dinámico de campos
    return ReactDOM.createPortal(
        <div className="editar-fila-modal-overlay" onClick={onClose}>
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
                    {encabezado.slice(0, -1).map((col, idx) => {
                        const key = col.trim().toLowerCase();
                        let campoSelect = null;
                        if (key === "tipo") campoSelect = camposSelect["tipo"];
                        else if (key.includes("servicio")) campoSelect = camposSelect["servicio"];
                        else if (key.includes("capa")) campoSelect = camposSelect["capa"];
                        else if (key.includes("ambiente")) campoSelect = camposSelect["ambiente"];
                        else if (key.includes("dominio")) campoSelect = camposSelect["dominio"];
                        else if (key.includes("s.o.")) campoSelect = camposSelect["s.o."];
                        else if (key.includes("estatus")) campoSelect = camposSelect["estatus"];

                        return (
                            <div className="form-field" key={col}>
                                <label>{col}</label>
                                {campoSelect ? React.cloneElement(campoSelect, { key: col }) : (
                                    <input
                                        type="text"
                                        value={form[idx] ?? ""}
                                        className={errores[idx] ? "input-error" : ""}
                                        onChange={e => {
                                            const newForm = [...form];
                                            newForm[idx] = e.target.value;
                                            setForm(newForm);
                                            if (errores[idx]) {
                                                const nuevosErrores = [...errores];
                                                nuevosErrores[idx] = false;
                                                setErrores(nuevosErrores);
                                            }
                                        }}
                                    />
                                )}
                                {errores[idx] && (
                                    <span style={{ color: "#dc3545", fontSize: "13px", marginTop: "2px" }}>
                                        Corrige este campo
                                    </span>
                                )}
                            </div>
                        );
                    })}
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

// --- Modal personalizado para eliminar, sobrepone sin cerrar el modal principal ---
const DeleteModal = ({ open, onConfirm, onCancel }) => {
    if (!open) return null;
    return ReactDOM.createPortal(
        <div className="custom-delete-modal-overlay" style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 20000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div className="custom-delete-modal-content" style={{
                background: "#fff",
                borderRadius: "8px",
                padding: "32px 24px",
                minWidth: "340px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                textAlign: "center"
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#dc3545" }}>warning</span>
                <h2 style={{ margin: "16px 0 8px 0" }}>¿Eliminar servidor?</h2>
                <div style={{ marginBottom: 24 }}>¿Estás seguro de eliminar este servidor de la carga masiva?</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                    <button
                        style={{
                            background: "#dc3545",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "8px 18px",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}
                        onClick={onConfirm}
                    >
                        Eliminar
                    </button>
                    <button
                        style={{
                            background: "#007953",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "8px 18px",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
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

// Utilidad para mapear ids a nombres en la fila editada
function mapearIdsANombresFila(fila, encabezado, catalogos) {
    return fila.map((valor, idx) => {
        const col = encabezado[idx].toLowerCase();
        if (col === "tipo") {
            if (valor === "FISICO" || valor === "VIRTUAL") return valor;
        }
        if (col.includes("servicio")) {
            const obj = catalogos.servicios.find(s => String(s.id) === String(valor));
            return obj ? obj.nombre : valor;
        }
        if (col.includes("capa")) {
            const obj = catalogos.capas.find(c => String(c.id) === String(valor));
            return obj ? obj.nombre : valor;
        }
        if (col.includes("ambiente")) {
            const obj = catalogos.ambientes.find(a => String(a.id) === String(valor));
            return obj ? obj.nombre : valor;
        }
        if (col.includes("dominio")) {
            const obj = catalogos.dominios.find(d => String(d.id) === String(valor));
            return obj ? obj.nombre : valor;
        }
        if (col.includes("s.o.")) {
            const obj = catalogos.sistemasOperativos.find(so => String(so.id) === String(valor));
            return obj ? obj.nombre : valor;
        }
        if (col.includes("estatus")) {
            const obj = catalogos.estatus.find(e => String(e.id) === String(valor));
            return obj ? obj.nombre : valor;
        }
        return valor;
    });
}

const ServidorCargaMasiva = () => {
    const [datosCSV, setDatosCSV] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [servidoresPorPagina, setServidoresPorPagina] = useState(10);
    const [showLink, setShowLink] = useState(null);
    const [editModal, setEditModal] = useState({ open: false, filaIdx: null, fila: [], encabezado: [] });
    const [deleteModal, setDeleteModal] = useState({ open: false, filaIdx: null, renderTablaModal: null });
    const filasValidadasRef = useRef([]);

    // --- Catálogos globales para edición y mapeo ---
    const [servicios, setServicios] = useState([]);
    const [capas, setCapas] = useState([]);
    const [ambientes, setAmbientes] = useState([]);
    const [dominios, setDominios] = useState([]);
    const [sistemasOperativos, setSistemasOperativos] = useState([]);
    const [estatus, setEstatus] = useState([]);

    useEffect(() => {
        // Cargar catálogos al montar el componente
        const fetchCatalogos = async () => {
            try {
                const urls = [
                    { name: "servicios", url: "http://localhost:3001/api/servicios" },
                    { name: "capas", url: "http://localhost:3001/api/capas" },
                    { name: "ambientes", url: "http://localhost:3001/api/ambientes" },
                    { name: "dominios", url: "http://localhost:3001/api/dominios" },
                    { name: "sistemasOperativos", url: "http://localhost:3001/api/sistemas_operativos" },
                    { name: "estatus", url: "http://localhost:3001/api/estatus" }
                ];
                const responses = await Promise.all(urls.map(({ url }) =>
                    fetch(url).then(res => res.ok ? res.json() : [])
                ));
                setServicios(responses[0]);
                setCapas(responses[1]);
                setAmbientes(responses[2]);
                setDominios(responses[3]);
                setSistemasOperativos(responses[4]);
                setEstatus(responses[5]);
            } catch (e) { }
        };
        fetchCatalogos();
    }, []);

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
            if (!response.ok) throw new Error("Error en la validación masiva");
            return await response.json();
        } catch (error) {
            Swal.fire("Error", "No se pudo validar el archivo. Verifica la conexión con el servidor.", "error");
            return filas;
        }
    };

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
                        fileRows = filas.map(fila => fila.split(";").map(col => (col ?? "").replace(/"/g, "").trim()));
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

    // MODIFICADO: Ahora solo abre un modal sobrepuesto, no cierra el modal principal
    const eliminarServidor = (filaIdx, renderTablaModal) => {
        setDeleteModal({
            open: true,
            filaIdx,
            renderTablaModal
        });
    };

    // Confirmación de eliminación
    const handleConfirmDelete = () => {
        const { filaIdx, renderTablaModal } = deleteModal;
        const filas = filasValidadasRef.current;
        filas.splice(filaIdx, 1);
        filasValidadasRef.current = limpiarObservacionDuplicada(filas);
        const encabezado = filas[0];
        const nombreIdx = encabezado.findIndex(col => col.trim().toLowerCase() === "nombre" || col.trim().toLowerCase() === "servidor" || col.trim().toLowerCase() === "nombre servidor");
        const ipIdx = encabezado.findIndex(col => col.trim().toLowerCase() === "ip" || col.trim().toLowerCase() === "ip servidor");
        const obsIdx = encabezado.length - 1;
        marcarRepetidosEnFilas(filas, nombreIdx, ipIdx, obsIdx);
        setDeleteModal({ open: false, filaIdx: null, renderTablaModal: null });

        // Mostrar alerta sobrepuesta y actualizar la tabla al cerrar la alerta
        Swal.fire({
            icon: "success",
            title: "Servidor eliminado",
            text: "El servidor fue eliminado de la carga masiva.",
            timer: 1200,
            showConfirmButton: false,
            backdrop: true,
            didClose: () => {
                // Recargar la tabla con los datos actualizados
                mostrarModalTabla(filasValidadasRef.current);
            }
        });
    };

    const handleCancelDelete = () => {
        setDeleteModal({ open: false, filaIdx: null, renderTablaModal: null });
    };

    const mostrarModalTabla = async (data) => {
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
            const iconDelete = `<span class="material-symbols-outlined" style="color:#dc3545;">delete</span>`;

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
                const observacion = row[row.length - 1] || "";
                return `
            <tr>
                ${row.map((col, idx) => {
                    // Observación (última columna)
                    if (idx === row.length - 1) {
                        const tieneError = col !== "Servidor listo para guardar";
                        return `<td style="text-align:center;">
                            <span style="font-size:22px;">
                                ${tieneError ? iconCancel : iconCheck}
                            </span>
                        </td>`;
                    }
                    // Link
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
                    // Solo marcar en rojo si el campo tiene error específico
                    let esError = false;
                    if (observacion && observacion !== "Servidor listo para guardar") {
                        // Solo marcar en rojo si la observación menciona este campo o repetido de este campo
                        const nombreCampo = encabezado[idx].toLowerCase();
                        esError = observacion.split(";").some(err =>
                            err.toLowerCase().includes(nombreCampo) ||
                            (idx === nombreIdx && err.toLowerCase().includes("nombre repetido")) ||
                            (idx === ipIdx && err.toLowerCase().includes("ip repetida"))
                        );
                    }
                    const style = esError ? ' style="color:#dc3545;font-weight:bold;"' : '';
                    return `<td${style}>${col}</td>`;
                }).join("")}
                <td style="text-align:center;">
                    <button id="btn-edit-${filaRealIdx}" class="btn-edit-ojo" style="background:none;border:none;cursor:pointer;" title="Editar">
                        ${iconEdit}
                    </button>
                    <button id="btn-delete-${filaRealIdx}" class="btn-delete-ojo" style="background:none;border:none;cursor:pointer;" title="Eliminar">
                        ${iconDelete}
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
                                filaIdx: filaRealIdx + 1,
                                fila: [...filas[filaRealIdx]].slice(0, -1),
                                encabezado
                            });
                        };
                    }
                }, 0);
            });
            filasPagina.forEach((row, rowIdx) => {
                const filaRealIdx = inicio + rowIdx;
                const btnId = `btn-delete-${filaRealIdx}`;
                setTimeout(() => {
                    const btn = document.getElementById(btnId);
                    if (btn) {
                        btn.onclick = (e) => {
                            e.preventDefault();
                            eliminarServidor(filaRealIdx + 1, renderTablaModal);
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
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cerrar",
            confirmButtonColor: "#007953",
            cancelButtonColor: "#dc3545",
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
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Solo permite guardar si TODOS los servidores son válidos
                const filas = filasValidadasRef.current;
                const todasValidas = filas.slice(1).every(fila => fila[fila.length - 1] === "Servidor listo para guardar");
                if (!todasValidas) {
                    // Mostrar alerta sobrepuesta, NO cerrar el modal principal
                    Swal.fire({
                        icon: "error",
                        title: "Error en la carga masiva",
                        text: "Se encontraron datos incorrectos en la vista previa. Verifica los registros antes de guardar.",
                        confirmButtonText: "Aceptar",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        backdrop: false,
                        didClose: () => {
                            mostrarModalTabla(filas);
                        }
                    });
                    return;
                }
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/servidores/carga_masiva`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ filas }),
                    });
                    if (!response.ok) throw new Error();
                    Swal.fire({
                        icon: "success",
                        title: "Carga masiva exitosa",
                        text: "Los servidores fueron guardados correctamente.",
                        timer: 2000,
                        showConfirmButton: false
                    });
                } catch (e) {
                    Swal.fire("Error en la carga masiva", "Ocurrió un error al guardar los servidores.", "error");
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // Mostrar modal de confirmación sobrepuesto
                Swal.fire({
                    icon: "warning",
                    title: "¿Seguro que deseas cerrar la carga masiva?",
                    text: "No se guardarán los datos cargados.",
                    showCancelButton: true,
                    confirmButtonText: "Sí, cerrar",
                    cancelButtonText: "No, volver",
                    confirmButtonColor: "#dc3545",
                    cancelButtonColor: "#007953",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    backdrop: false // Esto hace que se sobreponga sin cerrar el modal principal
                }).then((confirmResult) => {
                    if (confirmResult.isConfirmed) {
                        // Cierra ambos modales (el usuario ya confirmó)
                        // No es necesario hacer nada, simplemente no se vuelve a mostrar la vista previa
                    } else {
                        // Si el usuario cancela, vuelve a mostrar la vista previa
                        mostrarModalTabla(filasValidadasRef.current);
                    }
                });
            }
        });
    };

    const handleSaveEdit = async (newFilaSinObs) => {
        const encabezado = editModal.encabezado;
        let filaAValidar = [...newFilaSinObs];
        if (filaAValidar.length > encabezado.length - 1) {
            filaAValidar = filaAValidar.slice(0, encabezado.length - 1);
        }
        if (filaAValidar.length < encabezado.length - 1) {
            while (filaAValidar.length < encabezado.length - 1) {
                filaAValidar.push("");
            }
        }
        const filas = filasValidadasRef.current;
        // Validar la fila editada
        const filasValidas = await validarFilas([encabezado, filaAValidar]);
        let filaActualizada = filasValidas[1];

        // Mapear ids a nombres para la vista previa
        const catalogos = { servicios, capas, ambientes, dominios, sistemasOperativos, estatus };
        filaActualizada = mapearIdsANombresFila(filaActualizada, encabezado, catalogos);

        // --- LIMPIAR ERRORES DE CAMPOS SELECCIONABLES SI YA SON VÁLIDOS ---
        const camposSeleccionables = [
            "tipo", "servicio", "capa", "ambiente", "dominio", "s.o.", "estatus"
        ];
        let obsIdxFila = encabezado.length - 1;
        let observacion = filaActualizada[obsIdxFila] || "";
        if (observacion && observacion !== "Servidor listo para guardar") {
            camposSeleccionables.forEach(campo => {
                const idxCampo = encabezado.findIndex(col => col.toLowerCase().includes(campo));
                if (idxCampo !== -1) {
                    const valorCampo = filaActualizada[idxCampo];
                    // Si el campo tiene valor válido, elimina el error de la observación
                    if (valorCampo && valorCampo !== "") {
                        // Elimina cualquier mención del campo en la observación
                        observacion = observacion
                            .split(";")
                            .map(e => e.trim())
                            .filter(e => !e.toLowerCase().includes(campo))
                            .join("; ");
                    }
                }
            });
            // Si ya no hay errores, deja la observación limpia
            if (!observacion.trim()) observacion = "Servidor listo para guardar";
            filaActualizada[obsIdxFila] = observacion;
        }

        // Actualizar la fila editada en el arreglo principal
        filas[editModal.filaIdx] = filaActualizada;

        // Recalcular repetidos y limpiar observaciones para todas las filas
        const nombreIdx = encabezado.findIndex(col => col.trim().toLowerCase() === "nombre" || col.trim().toLowerCase() === "servidor" || col.trim().toLowerCase() === "nombre servidor");
        const ipIdx = encabezado.findIndex(col => col.trim().toLowerCase() === "ip" || col.trim().toLowerCase() === "ip servidor");
        const obsIdx = encabezado.length - 1;
        marcarRepetidosEnFilas(filas, nombreIdx, ipIdx, obsIdx);
        filasValidadasRef.current = limpiarObservacionDuplicada(filas);

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
                catalogos={{ servicios, capas, ambientes, dominios, sistemasOperativos, estatus }}
            />
            <DeleteModal
                open={deleteModal.open}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </>
    );
};

export default ServidorCargaMasiva;