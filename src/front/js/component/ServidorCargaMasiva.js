import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";
import ServidorFormulario from "./ServidorFormulario";
import Icon from './Icon';

const getHeaderKey = (header) => {
    if (!header || typeof header !== 'string') return '';
    return header.toLowerCase().normalize("NFD").replace(/[\u00c0-\u024f]/g, "").trim().replace(/ /g, '_').replace(/\./g, '');
};

const TablaPrevisualizacion = ({ datos, encabezado, onEdit, onDelete, startIndex = 0 }) => {
    if (!datos || datos.length === 0) {
        return <p className="no-data-preview">No hay datos para previsualizar.</p>;
    }

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        {encabezado.map((col, index) => <th key={index}>{col}</th>)}
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {datos.map(({ fila, errores }, rowIndex) => {
                        const tieneErrorFila = Object.keys(errores).length > 0;
                        return (
                            <tr key={rowIndex} className={tieneErrorFila ? 'fila-con-error' : 'fila-correcta'}>
                                <td>{startIndex + rowIndex + 1}</td>
                                {fila.map((celda, cellIndex) => {
                                    const headerKey = getHeaderKey(encabezado[cellIndex]);
                                    const tieneErrorCelda = !!errores[headerKey];
                                    return (
                                        <td
                                            key={cellIndex}
                                            title={celda}
                                            className={tieneErrorCelda ? 'celda-con-error' : ''}
                                        >
                                            {celda}
                                        </td>
                                    );
                                })}
                                <td style={{ textAlign: 'center' }}>
                                    <button onClick={() => onEdit(startIndex + rowIndex)} className="btn-icon" title="Editar Fila">
                                        <Icon name="edit" />
                                    </button>
                                    <button onClick={() => onDelete(startIndex + rowIndex)} className="btn-icon" title="Eliminar Fila">
                                        <Icon name="trash" />
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

// Sub-componente para el dropdown de paginación
const ItemsPerPageDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const options = [50, 100, 150, 200];
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="custom-select pagination-select" ref={dropdownRef}>
            <button type="button" className="form__input custom-select__trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{value}</span>
                <div className={`chevron ${isOpen ? "open" : ""}`}></div>
            </button>
            <div className={`custom-select__panel ${isOpen ? "open" : ""}`}>
                {options.map(opt => (
                    <div
                        key={opt}
                        className={`custom-select__option ${value === opt ? 'selected' : ''}`}
                        onClick={() => handleSelect(opt)}
                    >
                        {opt}
                    </div>
                ))}
            </div>
        </div>
    );
};

const PreviewModal = ({ datos, encabezado, onClose, onSave, onEdit, onDelete }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = datos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(datos.length / itemsPerPage);

    return ReactDOM.createPortal(
        <div className="modal__overlay">
            <div className="modal__content modal-content-preview">
                <div className="modal__header">
                    <h2 className="modal__title">Vista Previa de Carga</h2>
                    <button onClick={onClose} className="btn-close" />
                </div>

                {/* =====> AQUÍ ESTÁ LA MODIFICACIÓN <===== */}
                <div className="pagination-controls" style={{ padding: '0 var(--espaciado-lg)', borderBottom: '1px solid var(--color-borde)' }}>
                    <div className="pagination__items-per-page">
                        <label>Mostrar:</label>
                        <ItemsPerPageDropdown value={itemsPerPage} onChange={setItemsPerPage} />
                    </div>
                    <div className="pagination__navigation">
                        <button className="btn-icon" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                            <Icon name="chevron-left" />
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button className="btn-icon" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                            <Icon name="chevron-right" />
                        </button>
                    </div>
                </div>

                <div className="modal__body">
                    <TablaPrevisualizacion
                        datos={currentItems}
                        encabezado={encabezado}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        startIndex={indexOfFirstItem}
                    />
                </div>
                <div className="modal__footer">
                    <button onClick={onClose} className="btn btn--secondary">Volver</button>
                    <button onClick={onSave} className="btn btn--primary" disabled={datos.length === 0}>Guardar</button>
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
    const [editModal, setEditModal] = useState({ open: false, data: null, rowIndex: null });
    const [catalogos, setCatalogos] = useState({});
    const [servidoresExistentes, setServidoresExistentes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const backendUrl = process.env.BACKEND_URL;
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
                    servicios: catalogosData[0] || [], capas: catalogosData[1] || [], ambientes: catalogosData[2] || [],
                    dominios: catalogosData[3] || [], sistemasOperativos: catalogosData[4] || [], estatus: catalogosData[5] || []
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
        if (!file) {
            setSelectedFile(null);
            setNombreArchivo("");
            return;
        }
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

    const revalidarFila = (fila, encabezado, todasLasFilas, rowIndex) => {
        let errores = {};
        const findIndex = (keyword) => encabezado.findIndex(h => getHeaderKey(h) === getHeaderKey(keyword));
        const getValue = (index) => (index !== -1 ? String(fila[index] || '').trim() : '');

        const checkCatalog = (catalogName, header, value, formKey) => {
            const catalog = catalogos[catalogName];
            if (!catalog || catalog.length === 0) return;
            let matchFound = catalog.some(item => item.nombre.toLowerCase() === value.toLowerCase());
            if (catalogName === 'sistemasOperativos') {
                matchFound = catalog.some(item => `${item.nombre} - V${item.version}`.toLowerCase() === value.toLowerCase());
            }
            if (!matchFound) errores[formKey] = true;
        };

        const columnas = [
            { key: 'nombre', header: 'Nombre', required: true, formKey: 'nombre' },
            { key: 'tipo', header: 'Tipo', required: true, values: ['FISICO', 'VIRTUAL'], formKey: 'tipo' },
            { key: 'ip', header: 'IP', required: true, formKey: 'ip' },
            { key: 'servicio', header: 'Servicio', required: true, catalog: 'servicios', formKey: 'servicio_id' },
            { key: 'capa', header: 'Capa', required: true, catalog: 'capas', formKey: 'capa_id' },
            { key: 'ambiente', header: 'Ambiente', required: true, catalog: 'ambientes', formKey: 'ambiente_id' },
            { key: 'dominio', header: 'Dominio', required: true, catalog: 'dominios', formKey: 'dominio_id' },
            { key: 's.o.', header: 'S.O.', required: true, catalog: 'sistemasOperativos', formKey: 'sistema_operativo_id' },
            { key: 'estatus', header: 'Estatus', required: true, catalog: 'estatus', formKey: 'estatus_id' },
        ];

        columnas.forEach(col => {
            const index = findIndex(col.header);
            const value = getValue(index);
            const formKey = col.formKey;
            if (col.required && !value) errores[formKey] = true;
            else if (value) {
                if (col.values && !col.values.some(v => v.toUpperCase() === value.toUpperCase())) errores[formKey] = true;
                if (col.catalog) checkCatalog(col.catalog, col.header, value, formKey);
                if (['nombre', 'ip', 'link'].includes(col.key)) {
                    if (servidoresExistentes.some(s => s[col.key] && s[col.key].toLowerCase() === value.toLowerCase())) errores[formKey] = true;
                    const firstIndex = todasLasFilas.findIndex(otraFila => (otraFila[index] || '').toLowerCase() === value.toLowerCase());
                    if (firstIndex !== rowIndex) errores[formKey] = true;
                }
            }
        });
        return { errores };
    };

    const procesarYValidarDatos = (datos) => {
        if (!datos || datos.length < 1 || !Array.isArray(datos[0])) {
            Swal.fire("Archivo inválido", "El archivo CSV no tiene un formato correcto o está vacío.", "info"); return;
        }
        const encabezado = datos[0];
        const filasData = datos.slice(1);
        setEncabezadoCSV(encabezado);

        const filasProcesadas = filasData.map((fila, index) => {
            const { errores } = revalidarFila(fila, encabezado, filasData, index);
            return { fila, errores };
        });

        setDatosCSV(filasProcesadas);
        setPreviewVisible(true);
    };

    const handleAcceptAndPreview = () => {
        if (!selectedFile) { Swal.fire("Sin archivo", "Por favor, selecciona un archivo primero.", "info"); return; }
        if (!window.Papa) { Swal.fire("Error de Librería", "La librería para leer archivos (PapaParse) no está cargada.", "error"); return; }
        window.Papa.parse(selectedFile, {
            header: false, skipEmptyLines: true,
            complete: (results) => { procesarYValidarDatos(results.data); },
            error: (error) => { Swal.fire("Error de lectura", `No se pudo leer el archivo CSV. Error: ${error.message}`, "error"); }
        });
    };

    const handleGuardar = async () => {
        const filasConErrores = datosCSV.filter(dato => Object.keys(dato.errores).length > 0);
        if (filasConErrores.length > 0) {
            Swal.fire('Registros con errores', 'No se puede guardar. Por favor, corrija todas las filas marcadas en rojo.', 'error');
            return;
        }
        const filasValidas = datosCSV.filter(dato => Object.keys(dato.errores).length === 0);
        if (filasValidas.length === 0) {
            Swal.fire('No hay registros válidos', 'No hay servidores para guardar.', 'info');
            return;
        }

        const findIdByName = (catalogName, name) => {
            const catalog = catalogos[catalogName];
            if (!catalog || !name) return null;
            if (catalogName === 'sistemasOperativos') {
                const soMatch = catalog.find(item => `${item.nombre} - V${item.version}`.toLowerCase() === name.trim().toLowerCase());
                return soMatch ? soMatch.id : null;
            }
            const item = catalog.find(i => i.nombre.toLowerCase() === name.trim().toLowerCase());
            return item ? item.id : null;
        };

        const servidoresParaGuardar = filasValidas.map(({ fila }) => {
            const servidor = {};
            encabezadoCSV.forEach((header, index) => {
                const key = getHeaderKey(header);
                const value = fila[index] || '';
                switch (key) {
                    case 'nombre': servidor.nombre = value; break;
                    case 'tipo': servidor.tipo = value; break;
                    case 'ip': servidor.ip = value; break;
                    case 'balanceador': servidor.balanceador = value; break;
                    case 'vlan': servidor.vlan = value; break;
                    case 'link': servidor.link = value; break;
                    case 'descripcion': servidor.descripcion = value; break;
                    case 'servicio': servidor.servicio_id = findIdByName('servicios', value); break;
                    case 'capa': servidor.capa_id = findIdByName('capas', value); break;
                    case 'ambiente': servidor.ambiente_id = findIdByName('ambientes', value); break;
                    case 'dominio': servidor.dominio_id = findIdByName('dominios', value); break;
                    case 'so': servidor.sistema_operativo_id = findIdByName('sistemasOperativos', value); break;
                    case 'estatus': servidor.estatus_id = findIdByName('estatus', value); break;
                    default: break;
                }
            });
            return { ...servidor, activo: true };
        });

        Swal.fire({
            title: `Guardando ${servidoresParaGuardar.length} servidores...`,
            text: 'Por favor, espere.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const requests = servidoresParaGuardar.map(servidor =>
                fetch(`${process.env.BACKEND_URL}/api/servidores`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(servidor),
                }).then(res => {
                    if (!res.ok) return res.json().then(err => Promise.reject(err));
                    return res.json();
                })
            );
            await Promise.all(requests);
            Swal.fire('¡Éxito!', `${servidoresParaGuardar.length} servidores han sido guardados.`, 'success');
            onClose();
            actualizarServidores('Carga masiva completada');
        } catch (error) {
            Swal.fire('Error al guardar', `Ocurrió un error: ${error.msg || error.message}`, 'error');
        }
    };

    const handleEditRow = (rowIndex) => {
        const { fila, errores } = datosCSV[rowIndex];
        const initialData = {};
        const findIdByName = (catalogName, name) => {
            const catalog = catalogos[catalogName];
            if (!catalog || !name) return '';
            if (catalogName === 'sistemasOperativos') {
                const soMatch = catalog.find(item => `${item.nombre} - V${item.version}`.toLowerCase() === name.trim().toLowerCase());
                return soMatch ? String(soMatch.id) : '';
            }
            const item = catalog.find(i => i.nombre && i.nombre.toLowerCase() === name.trim().toLowerCase());
            return item ? String(item.id) : '';
        };

        encabezadoCSV.forEach((header, index) => {
            if (header && typeof header === 'string') {
                const key = getHeaderKey(header);
                const value = fila[index] || '';
                const formKeyMap = { servicio: 'servicio_id', capa: 'capa_id', ambiente: 'ambiente_id', dominio: 'dominio_id', so: 'sistema_operativo_id', estatus: 'estatus_id', nombre: 'nombre', tipo: 'tipo', ip: 'ip', balanceador: 'balanceador', vlan: 'vlan', link: 'link', descripcion: 'descripcion' };
                const catalogMap = { servicio: 'servicios', capa: 'capas', ambiente: 'ambientes', dominio: 'dominios', so: 'sistemasOperativos', estatus: 'estatus' };
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
        initialData.errors = errores;
        setEditModal({ open: true, data: initialData, rowIndex });
    };

    const handleUpdateRow = (updatedData, rowIndex) => {
        const findNameById = (catalogName, id) => {
            const catalog = catalogos[catalogName];
            if (!catalog || !id) return '';
            const item = catalog.find(i => String(i.id) === String(id));
            if (catalogName === 'sistemasOperativos' && item) {
                return `${item.nombre} - V${item.version}`;
            }
            return item ? item.nombre : '';
        };

        const filaActualizadaArray = encabezadoCSV.map(header => {
            const headerNormalized = getHeaderKey(header);
            switch (headerNormalized) {
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
                case 'so': return findNameById('sistemasOperativos', updatedData.sistema_operativo_id);
                case 'estatus': return findNameById('estatus', updatedData.estatus_id);
                default: return '';
            }
        });

        const filasActuales = datosCSV.map(d => d.fila);
        filasActuales[rowIndex] = filaActualizadaArray;

        const nuevosDatosCSV = filasActuales.map((fila, index) => {
            const { errores } = revalidarFila(fila, encabezadoCSV, filasActuales, index);
            return { fila, errores };
        });

        setDatosCSV(nuevosDatosCSV);
        setEditModal({ open: false, data: null, rowIndex: null });
    };

    const handleDeleteRow = (rowIndex) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "La fila se eliminará de esta carga.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-error)',
            cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const nuevosDatos = [...datosCSV];
                nuevosDatos.splice(rowIndex, 1);
                setDatosCSV(nuevosDatos);
                Swal.fire('¡Eliminado!', 'La fila ha sido eliminada.', 'success')
            }
        });
    };

    const EditarFilaModal = ({ open, onClose, initialData, onSave }) => {
        if (!open) return null;
        return ReactDOM.createPortal(
            <div className="modal__overlay">
                <div className="modal__content modal-content-servidor" onClick={(e) => e.stopPropagation()}>
                    <div className="modal__header">
                        <h2 className="modal__title">Editar Servidor de Carga Masiva</h2>
                        <button onClick={onClose} className="btn-close" />
                    </div>
                    <div className="modal__body">
                        <ServidorFormulario
                            esEdicion={true}
                            servidorInicial={initialData}
                            setModalVisible={onClose}
                            onSuccess={() => { }}
                            onSaveRow={onSave}
                        />
                    </div>
                </div>
            </div>, document.body);
    };

    return (
        <>
            {ReactDOM.createPortal(
                <div className="modal__overlay" onClick={onClose}>
                    <div className="modal__content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">Carga Masiva de Servidores</h2>
                            <button onClick={onClose} className="btn-close" />
                        </div>
                        <div className="modal__body" style={{ textAlign: 'center' }}>
                            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                            <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="btn btn--primary">
                                <Icon name="upload" />
                                Seleccionar archivo
                            </button>
                            <div className="important-instructions">
                                <p className="instructions-title">
                                    <Icon name="warning" /> Instrucción Importante
                                </p>
                                <p className="instructions-text">
                                    El archivo debe estar en formato <strong>CSV (delimitado por comas)</strong>.
                                </p>
                            </div>
                            {nombreArchivo && <p className="selected-file-name">Archivo: {nombreArchivo}</p>}
                        </div>
                        <div className="modal__footer">
                            <button onClick={onClose} className="btn btn--secondary">Cancelar</button>
                            <button onClick={handleAcceptAndPreview} className="btn btn--primary" disabled={!selectedFile}>
                                Previsualizar
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
        </>
    );
};

export default ServidorCargaMasiva;
