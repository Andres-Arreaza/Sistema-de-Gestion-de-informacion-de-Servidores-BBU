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
        <div className="custom-delete-modal-overlay">
            <div className="custom-delete-modal-content">
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#dc3545" }}>warning</span>
                <h2 style={{ margin: "16px 0 8px 0" }}>¿Eliminar servidor?</h2>
                <div style={{ marginBottom: 24 }}>¿Estás seguro de eliminar este servidor de la carga masiva?</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                    <button className="eliminar-confirm-btn" onClick={onConfirm}>
                        Eliminar
                    </button>
                    <button className="cerrar-modal-btn" onClick={onCancel}>
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

const ServidorCargaMasiva = ({ actualizarServidores }) => {
    const [datosCSV, setDatosCSV] = useState([]);
    const [showLink, setShowLink] = useState(null);
    const [editModal, setEditModal] = useState({ open: false, filaIdx: null, fila: [], encabezado: [] });
    const [deleteModal, setDeleteModal] = useState({ open: false, filaIdx: null, renderTablaModal: null });
    const filasValidadasRef = useRef([]);

    // --- Catálogos globales para edición y mapeo ---
    const [catalogos, setCatalogos] = useState({
        servicios: [], capas: [], ambientes: [], dominios: [], sistemasOperativos: [], estatus: []
    });

    useEffect(() => {
        // Cargar catálogos al montar el componente
        const fetchCatalogos = async () => {
            try {
                const urls = [
                    { name: "servicios", url: `${process.env.BACKEND_URL}/api/servicios` },
                    { name: "capas", url: `${process.env.BACKEND_URL}/api/capas` },
                    { name: "ambientes", url: `${process.env.BACKEND_URL}/api/ambientes` },
                    { name: "dominios", url: `${process.env.BACKEND_URL}/api/dominios` },
                    { name: "sistemasOperativos", url: `${process.env.BACKEND_URL}/api/sistemas_operativos` },
                    { name: "estatus", url: `${process.env.BACKEND_URL}/api/estatus` }
                ];
                const responses = await Promise.all(urls.map(({ url }) =>
                    fetch(url).then(res => res.ok ? res.json() : [])
                ));
                setCatalogos({
                    servicios: responses[0], capas: responses[1], ambientes: responses[2],
                    dominios: responses[3], sistemasOperativos: responses[4], estatus: responses[5]
                });
            } catch (e) {
                console.error("Error fetching catalogs:", e);
            }
        };
        fetchCatalogos();
    }, []);

    // ... (El resto de la lógica como validarFilas, mostrarModalCarga, etc. iría aquí)

    return (
        <>
            <button className="carga-masiva-btn" onClick={() => { /* Lógica para mostrarModalCarga */ }}>
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
                onSave={() => { /* Lógica handleSaveEdit */ }}
                onClose={() => setEditModal({ open: false, filaIdx: null, fila: [], encabezado: [] })}
                catalogos={catalogos}
            />
            <DeleteModal
                open={deleteModal.open}
                onConfirm={() => { /* Lógica handleConfirmDelete */ }}
                onCancel={() => setDeleteModal({ open: false, filaIdx: null, renderTablaModal: null })}
            />
        </>
    );
};

export default ServidorCargaMasiva;
