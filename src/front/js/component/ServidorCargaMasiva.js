import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";

// --- Se importa el formulario de servidor para la edición ---
import ServidorFormulario from "../component/ServidorFormulario";

// ========================================================
// Componentes de Modales e Iconos (Sin cambios)
// ========================================================

const LinkFloatModal = ({ link, nombre, ip, onClose }) => {
    if (!link) return null;
    return ReactDOM.createPortal(
        <div className="link-float-modal-overlay" onClick={onClose}>
            <div className="link-float-modal-content" onClick={e => e.stopPropagation()}>
                <h3>Enlace del servidor</h3>
                <div className="modal-link-row"><b>Nombre:</b> {nombre || "-"}</div>
                <div className="modal-link-row"><b>IP:</b> {ip || "-"}</div>
                <div className="modal-link-url"><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></div>
                <button onClick={onClose} className="cerrar-link-btn">Cerrar</button>
            </div>
        </div>,
        document.body
    );
};

const EditarFilaModal = ({ open, onClose, initialData, onSave }) => {
    if (!open) return null;

    const handleSuccess = (mensaje) => {
        Swal.fire("Fila Actualizada", "Los cambios se reflejarán en la vista previa.", "success");
        onClose();
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" style={{ zIndex: 1003 }}>
            <div className="modal-content-servidor" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Editar Servidor de Carga Masiva</h2>
                <ServidorFormulario
                    esEdicion={true}
                    servidorInicial={initialData}
                    setModalVisible={onClose}
                    onSuccess={handleSuccess}
                    onSaveRow={onSave}
                />
            </div>
        </div>, document.body);
};


const DeleteModal = ({ open, onConfirm, onCancel }) => {
    if (!open) return null;
    return ReactDOM.createPortal(
        <div className="custom-delete-modal-overlay" onClick={onCancel}>
            <div className="custom-delete-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Confirmar Eliminación</h3>
                <p>¿Estás seguro de que deseas eliminar este registro?</p>
                <button onClick={onConfirm}>Eliminar</button>
                <button onClick={onCancel}>Cancelar</button>
            </div>
        </div>, document.body);
};

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const CheckIcon = () => (
    <span className="material-symbols-outlined icono-check">check_circle</span>
);

const XIcon = () => (
    <span className="material-symbols-outlined icono-error">cancel</span>
);

const FileUploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <polyline points="9 15 12 12 15 15"></polyline>
    </svg>
);

const getHeaderKey = (header) => {
    if (!header || typeof header !== 'string') return '';
    return header.toLowerCase().trim().replace(/ /g, '_').replace(/\./g, '');
};

const TablaPrevisualizacion = ({ datos, encabezado, onEdit, onDelete, startIndex = 0 }) => {
    if (!datos || datos.length === 0) {
        return <p style={{ marginTop: "20px", textAlign: "center" }}>No hay datos para previsualizar.</p>;
    }
    const obsIndex = encabezado.findIndex(h => h && typeof h === 'string' && h.toLowerCase() === 'observación');

    return (
        <div className="table-container" style={{ marginTop: "10px" }}>
            <table className="tabla-carga-masiva">
                <thead>
                    <tr>
                        {encabezado.map((col, index) => <th key={index}>{col}</th>)}
                        <th className="columna-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {datos.map(({ fila, errores }, rowIndex) => {
                        const tieneError = Object.keys(errores).length > 0;
                        const observacion = tieneError ? fila[obsIndex] : "Fila correcta";
                        return (
                            <tr key={rowIndex} className={tieneError ? 'fila-con-error' : 'fila-correcta'}>
                                {fila.map((celda, cellIndex) => {
                                    const headerKey = getHeaderKey(encabezado[cellIndex]);
                                    const esCeldaConError = Object.values(errores).some(errKey => getHeaderKey(errKey) === headerKey);
                                    if (cellIndex === obsIndex) {
                                        return (
                                            <td key={cellIndex} title={observacion} className="celda-observacion">
                                                {tieneError ? <XIcon /> : <CheckIcon />}
                                            </td>
                                        );
                                    }
                                    return (
                                        <td key={cellIndex} title={celda} className={esCeldaConError ? 'celda-con-error-texto' : ''}>
                                            {celda}
                                        </td>
                                    );
                                })}
                                <td className="acciones-tabla">
                                    <button onClick={() => onEdit(startIndex + rowIndex)} className="btn-accion-tabla btn-editar" title="Editar Fila">
                                        <EditIcon />
                                    </button>
                                    <button onClick={() => onDelete(startIndex + rowIndex)} className="btn-accion-tabla btn-eliminar" title="Eliminar Fila">
                                        <DeleteIcon />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const PreviewModal = ({ datos, encabezado, onClose, onSave, onEdit, onDelete }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = datos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(datos.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    const PaginationControls = () => (
        <div className="pagination-controls">
            <div className="items-per-page-selector">
                <label htmlFor="itemsPerPage">Registros por página:</label>
                <select id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
            </div>
            <div className="page-navigation">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Anterior
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Siguiente
                </button>
            </div>
        </div>
    );

    return ReactDOM.createPortal(
        <div className="modal-overlay" style={{ zIndex: 1002 }}>
            <div className="modal-content-carga-masiva" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95%', width: '95%' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Vista Previa de Carga</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    <PaginationControls />
                    <TablaPrevisualizacion
                        datos={currentItems}
                        encabezado={encabezado}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        startIndex={indexOfFirstItem}
                    />
                </div>
                <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <button onClick={onClose} className="btn-secondary">Volver</button>
                        <button onClick={onSave} className="btn-primary" disabled={datos.length === 0}>Guardar Válidos</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};


const ServidorCargaMasiva = ({ onClose, actualizarServidores }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [datosCSV, setDatosCSV] = useState([]);
    const [encabezadoCSV, setEncabezadoCSV] = useState([]);
    const [nombreArchivo, setNombreArchivo] = useState("");
    const [isPreviewVisible, setPreviewVisible] = useState(false);
    const fileInputRef = useRef(null);
    const [showLink, setShowLink] = useState(null);
    const [editModal, setEditModal] = useState({ open: false, data: null, rowIndex: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, filaIdx: null, renderTablaModal: null });
    const [catalogos, setCatalogos] = useState({});
    const [servidoresExistentes, setServidoresExistentes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const backendUrl = process.env.BACKEND_URL;
                if (!backendUrl) {
                    Swal.fire("Error de Configuración", "La URL del servidor no está configurada.", "error");
                    return;
                }

                const urls = [
                    { name: "servidores", url: `${backendUrl}/api/servidores` },
                    { name: "servicios", url: `${backendUrl}/api/servicios` },
                    { name: "capas", url: `${backendUrl}/api/capas` },
                    { name: "ambientes", url: `${backendUrl}/api/ambientes` },
                    { name: "dominios", url: `${backendUrl}/api/dominios` },
                    { name: "sistemasOperativos", url: `${backendUrl}/api/sistemas_operativos` },
                    { name: "estatus", url: `${backendUrl}/api/estatus` }
                ];

                const responses = await Promise.all(urls.map(item => fetch(item.url).then(res => res.json())));

                const [servidoresData, ...catalogosData] = responses;

                setServidoresExistentes(servidoresData || []);
                setCatalogos({
                    servicios: catalogosData[0] || [],
                    capas: catalogosData[1] || [],
                    ambientes: catalogosData[2] || [],
                    dominios: catalogosData[3] || [],
                    sistemasOperativos: catalogosData[4] || [],
                    estatus: catalogosData[5] || [],
                });

            } catch (e) {
                console.error("Error cargando datos iniciales:", e);
                Swal.fire("Error de Conexión", `No se pudieron cargar los datos del servidor para validar: ${e.message}`, "error");
            }
        };
        fetchData();
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.csv')) {
            Swal.fire("Archivo no válido", "Por favor, selecciona un archivo con formato .csv.", "warning");
            setSelectedFile(null);
            setNombreArchivo("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        setSelectedFile(file);
        setNombreArchivo(file.name);
    };

    const revalidarFila = (fila, encabezado) => {
        let observaciones = [];
        let errores = {};

        const findIndex = (keyword) => encabezado.findIndex(h => h && typeof h === 'string' && h.toLowerCase().trim() === keyword.toLowerCase());
        const getValue = (index) => (index !== -1 ? String(fila[index] || '').trim() : '');

        const checkCatalog = (catalogName, header, value, formKey) => {
            const catalog = catalogos[catalogName];
            if (!catalog || catalog.length === 0) return;

            if (!catalog.some(item => item.nombre.toLowerCase() === value.toLowerCase())) {
                observaciones.push(`'${value}' no es un ${header} válido.`);
                errores[formKey] = true;
            }
        };

        const columnas = [
            { key: 'nombre', header: 'Nombre', required: true, formKey: 'nombre' },
            { key: 'tipo', header: 'Tipo', required: true, values: ['FISICO', 'VIRTUAL'], formKey: 'tipo' },
            { key: 'ip', header: 'IP', required: true, formKey: 'ip' },
            { key: 'balanceador', header: 'Balanceador', required: true, formKey: 'balanceador' },
            { key: 'vlan', header: 'VLAN', required: true, formKey: 'vlan' },
            { key: 'servicio', header: 'Servicio', required: true, catalog: 'servicios', formKey: 'servicio_id' },
            { key: 'capa', header: 'Capa', required: true, catalog: 'capas', formKey: 'capa_id' },
            { key: 'ambiente', header: 'Ambiente', required: true, catalog: 'ambientes', formKey: 'ambiente_id' },
            { key: 'link', header: 'Link', required: false, formKey: 'link' },
            { key: 'descripcion', header: 'Descripcion', required: false, formKey: 'descripcion' },
            { key: 'dominio', header: 'Dominio', required: true, catalog: 'dominios', formKey: 'dominio_id' },
            { key: 's.o.', header: 'S.O.', required: true, catalog: 'sistemasOperativos', formKey: 'sistema_operativo_id' },
            { key: 'estatus', header: 'Estatus', required: true, catalog: 'estatus', formKey: 'estatus_id' },
        ];

        columnas.forEach(col => {
            const index = findIndex(col.header);
            const value = getValue(index);

            if (col.required && value === '') {
                observaciones.push(`El campo ${col.header} es requerido.`);
                errores[col.formKey] = true;
            } else if (value !== '') {
                if (col.values && !col.values.some(v => v.toLowerCase() === value.toLowerCase())) {
                    observaciones.push(`Valor para ${col.header} no es válido.`);
                    errores[col.formKey] = true;
                }
                if (col.catalog) {
                    checkCatalog(col.catalog, col.header, value, col.formKey);
                }
                if (col.key === 'nombre' && servidoresExistentes.some(s => s.nombre.toLowerCase() === value.toLowerCase())) {
                    observaciones.push("Nombre ya existe en la BD.");
                    errores.nombre = true;
                }
                if (col.key === 'ip' && servidoresExistentes.some(s => s.ip === value)) {
                    observaciones.push("IP ya existe en la BD.");
                    errores.ip = true;
                }
            }
        });

        const observacionFinal = observaciones.length > 0 ? observaciones.join('; ') : "Servidor listo para guardar";
        return { observacion: observacionFinal, errores };
    };


    const procesarYValidarDatos = (datos) => {
        if (!datos || datos.length < 1 || !Array.isArray(datos[0])) {
            Swal.fire("Archivo inválido", "El archivo CSV no tiene un formato correcto o está vacío.", "info");
            return;
        }
        const encabezado = datos[0];
        const filas = datos.slice(1);
        const encabezadoConObs = [...encabezado, "Observación"];
        setEncabezadoCSV(encabezadoConObs);

        const filasProcesadas = filas.map(fila => {
            const { observacion, errores } = revalidarFila(fila, encabezado);
            return { fila: [...fila, observacion], errores };
        });

        setDatosCSV(filasProcesadas);
        setPreviewVisible(true);
    };

    const handleAcceptAndPreview = () => {
        if (!selectedFile) {
            Swal.fire("Sin archivo", "Por favor, selecciona un archivo primero.", "info");
            return;
        }
        if (!window.Papa) {
            Swal.fire("Error de Librería", "La librería para leer archivos (PapaParse) no está cargada.", "error");
            return;
        }
        window.Papa.parse(selectedFile, {
            header: false,
            skipEmptyLines: true,
            complete: (results) => {
                procesarYValidarDatos(results.data);
            },
            error: (error) => {
                Swal.fire("Error de lectura", `No se pudo leer el archivo CSV. Error: ${error.message}`, "error");
            }
        });
    };

    const handleGuardar = async () => { /* Tu lógica de guardado */ };

    const handleEditRow = (rowIndex) => {
        const { fila } = datosCSV[rowIndex];
        const initialData = {};
        const findIdByName = (catalogName, name) => {
            const catalog = catalogos[catalogName];
            if (!catalog || !name) return '';
            const item = catalog.find(i => i.nombre && i.nombre.toLowerCase() === name.trim().toLowerCase());
            return item ? item.id : '';
        };

        const encabezadosOriginales = encabezadoCSV.slice(0, -1);

        encabezadosOriginales.forEach((header, index) => {
            if (header && typeof header === 'string' && header !== 'Observación') {
                const key = getHeaderKey(header);
                const value = fila[index] || '';

                const catalogMap = {
                    servicio: 'servicios', capa: 'capas', ambiente: 'ambientes',
                    dominio: 'dominios', 's.o.': 'sistemasOperativos', estatus: 'estatus'
                };
                const formKeyMap = {
                    servicio: 'servicio_id', capa: 'capa_id', ambiente: 'ambiente_id',
                    dominio: 'dominio_id', 's.o.': 'sistema_operativo_id', estatus: 'estatus_id',
                    nombre: 'nombre', tipo: 'tipo', ip: 'ip', balanceador: 'balanceador',
                    vlan: 'vlan', link: 'link', descripcion: 'descripcion'
                };

                const formKey = formKeyMap[key];
                const catalogName = catalogMap[key];

                if (formKey) {
                    if (catalogName) {
                        initialData[formKey] = findIdByName(catalogName, value);
                    } else {
                        initialData[formKey] = value;
                    }
                }
            }
        });

        const { errores } = revalidarFila(fila, encabezadosOriginales);
        initialData.errors = errores;

        setEditModal({ open: true, data: initialData, rowIndex: rowIndex });
    };

    // --- CORRECCIÓN: Se añade la validación de campos opcionales al guardar una fila editada ---
    const handleUpdateRow = (updatedData, rowIndex) => {
        const camposOpcionalesVacios = [];
        if (!updatedData.link || !updatedData.link.trim()) {
            camposOpcionalesVacios.push("Link");
        }
        if (!updatedData.descripcion || !updatedData.descripcion.trim()) {
            camposOpcionalesVacios.push("Descripción");
        }

        const performUpdate = () => {
            const findNameById = (catalogName, id) => {
                const catalog = catalogos[catalogName];
                if (!catalog || !id) return '';
                const item = catalog.find(i => String(i.id) === String(id));
                return item ? item.nombre : '';
            };

            const encabezadosOriginales = encabezadoCSV.slice(0, -1);

            const filaActualizadaArray = encabezadosOriginales.map(header => {
                const headerLower = header.toLowerCase().trim();
                switch (headerLower) {
                    case 'nombre': return updatedData.nombre;
                    case 'tipo': return updatedData.tipo;
                    case 'ip': return updatedData.ip;
                    case 'balanceador': return updatedData.balanceador;
                    case 'vlan': return updatedData.vlan;
                    case 'link': return updatedData.link;
                    case 'descripcion': return updatedData.descripcion;
                    case 'servicio': return findNameById('servicios', updatedData.servicio_id);
                    case 'capa': return findNameById('capas', updatedData.capa_id);
                    case 'ambiente': return findNameById('ambientes', updatedData.ambiente_id);
                    case 'dominio': return findNameById('dominios', updatedData.dominio_id);
                    case 's.o.': return findNameById('sistemasOperativos', updatedData.sistema_operativo_id);
                    case 'estatus': return findNameById('estatus', updatedData.estatus_id);
                    default: return '';
                }
            });

            const { observacion, errores } = revalidarFila(filaActualizadaArray, encabezadosOriginales);
            const filaConNuevaObservacion = {
                fila: [...filaActualizadaArray, observacion],
                errores: errores
            };
            const nuevosDatos = [...datosCSV];
            nuevosDatos[rowIndex] = filaConNuevaObservacion;
            setDatosCSV(nuevosDatos);
            setEditModal({ open: false, data: null, rowIndex: null });
        };

        if (camposOpcionalesVacios.length > 0) {
            const camposTexto = camposOpcionalesVacios.join(' y ');
            Swal.fire({
                title: "Campos opcionales vacíos",
                text: `El campo ${camposTexto} está vacío. ¿Deseas guardar de todas formas?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#007953",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Guardar",
                cancelButtonText: "Volver",
                heightAuto: false
            }).then((result) => {
                if (result.isConfirmed) {
                    performUpdate();
                }
            });
        } else {
            performUpdate();
        }
    };

    const handleDeleteRow = (rowIndex) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "La fila se eliminará de esta carga.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const nuevosDatos = [...datosCSV];
                nuevosDatos.splice(rowIndex, 1);
                setDatosCSV(nuevosDatos);
                Swal.fire('Eliminado', 'La fila ha sido eliminada.', 'success')
            }
        })
    };

    return (
        <>
            {ReactDOM.createPortal(
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal-content-carga-masiva" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Carga Masiva de Servidores</h2>
                            <button onClick={onClose} className="close-button">&times;</button>
                        </div>
                        <div className="modal-body" style={{ textAlign: "center", padding: "40px 0" }}>
                            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                            <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="action-card-button">
                                <FileUploadIcon />
                                Seleccionar archivo
                            </button>
                            <div style={{
                                border: '2px solid #ffc107',
                                backgroundColor: '#fffbeb',
                                padding: '20px',
                                margin: '25px auto',
                                borderRadius: '8px',
                                maxWidth: '80%',
                                textAlign: 'left',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                            }}>
                                <p style={{ color: '#b45309', fontSize: '16px', margin: '0', fontWeight: 'bold' }}>
                                    <span style={{ fontSize: '24px', marginRight: '10px' }}>⚠️</span>
                                    Instrucción Importante
                                </p>
                                <p style={{ color: '#78350f', fontSize: '14px', margin: '10px 0 0 0' }}>
                                    El archivo debe estar en formato <strong>CSV (delimitado por comas)</strong>.
                                    Si usas Excel, asegúrate de ir a "Guardar como" y seleccionar explícitamente la opción <strong>"CSV (delimitado por comas) (*.csv)"</strong>.
                                </p>
                            </div>
                            {nombreArchivo && <p style={{ fontWeight: 'bold', marginTop: '10px' }}>Archivo seleccionado: {nombreArchivo}</p>}
                        </div>
                        <div className="modal-footer">
                            <button onClick={onClose} className="btn-secondary">Cancelar</button>
                            <button onClick={handleAcceptAndPreview} className="btn-primary" disabled={!selectedFile}>
                                Aceptar y Previsualizar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {isPreviewVisible && (
                <PreviewModal
                    datos={datosCSV}
                    encabezado={encabezadoCSV}
                    onClose={() => setPreviewVisible(false)}
                    onSave={handleGuardar}
                    onEdit={handleEditRow}
                    onDelete={handleDeleteRow}
                />
            )}

            <EditarFilaModal
                open={editModal.open}
                onClose={() => setEditModal({ open: false, data: null, rowIndex: null })}
                initialData={editModal.data}
                onSave={(updatedData) => handleUpdateRow(updatedData, editModal.rowIndex)}
            />

            <LinkFloatModal link={showLink?.link} nombre={showLink?.nombre} ip={showLink?.ip} onClose={() => setShowLink(null)} />
            <DeleteModal open={deleteModal.open} onCancel={() => setDeleteModal({ ...deleteModal, open: false })} />
        </>
    );
};

export default ServidorCargaMasiva;
