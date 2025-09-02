import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";
import ServidorFormulario from "./ServidorFormulario";
import Icon from './Icon';

const getHeaderKey = function(header) {
    if (!header || typeof header !== 'string') return '';
    return header.toLowerCase().normalize("NFD").replace(/[\u00c0-\u024f]/g, "").trim().replace(/ /g, '_').replace(/\./g, '');
};

const TablaPrevisualizacion = function({ datos, encabezado, onEdit, onDelete, startIndex = 0 }) {
    if (!datos || datos.length === 0) {
        return <p className="no-data-preview">No hay datos para previsualizar.</p>;
    }
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        {encabezado.map(function(col, index) { return <th key={index}>{col}</th>; })}
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {datos.map(function({ fila, errores }, rowIndex) {
                        var tieneErrorFila = Object.keys(errores).length > 0;
                        return (
                            <tr key={rowIndex} className={tieneErrorFila ? 'fila-con-error' : 'fila-correcta'}>
                                <td>{startIndex + rowIndex + 1}</td>
                                {fila.map(function(celda, cellIndex) {
                                    var headerKey = getHeaderKey(encabezado[cellIndex]);
                                    var tieneErrorCelda = !!errores[headerKey];
                                    return (
                                        <td
                                            key={cellIndex}
                                            title={celda}
                                            className={tieneErrorCelda ? 'celda-con-error' : ''}
                                        >
                                            <span className={tieneErrorCelda ? 'texto-error' : ''}>{celda}</span>
                                        </td>
                                    );
                                })}
                                <td style={{ textAlign: 'center' }}>
                                    <button onClick={function() { onEdit(startIndex + rowIndex); }} className="btn-icon" title="Editar Fila">
                                        <Icon name="edit" />
                                    </button>
                                    <button onClick={function() { onDelete(startIndex + rowIndex); }} className="btn-icon" title="Eliminar Fila">
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

const ItemsPerPageDropdown = function({ value, onChange }) {
    var [isOpen, setIsOpen] = useState(false);
    var options = [50, 100, 150, 200];
    var dropdownRef = useRef(null);

    useEffect(function() {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return function() { document.removeEventListener("mousedown", handleClickOutside); };
    }, []);

    function handleSelect(option) {
        onChange(option);
        setIsOpen(false);
    }

    return (
        <div className="custom-select pagination-select" ref={dropdownRef}>
            <button type="button" className="form__input custom-select__trigger" onClick={function() { setIsOpen(!isOpen); }}>
                <span>{value}</span>
                <div className={"chevron" + (isOpen ? " open" : "")}></div>
            </button>
            <div className={"custom-select__panel" + (isOpen ? " open" : "")}>
                {options.map(function(opt) {
                    return (
                        <div
                            key={opt}
                            className={"custom-select__option" + (value === opt ? ' selected' : '')}
                            onClick={function() { handleSelect(opt); }}
                        >
                            {opt}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const PreviewModal = function({ datos, encabezado, onClose, onSave, onEdit, onDelete }) {
    var [currentPage, setCurrentPage] = useState(1);
    var [itemsPerPage, setItemsPerPage] = useState(50);

    var indexOfLastItem = currentPage * itemsPerPage;
    var indexOfFirstItem = indexOfLastItem - itemsPerPage;
    var currentItems = datos.slice(indexOfFirstItem, indexOfLastItem);
    var totalPages = Math.ceil(datos.length / itemsPerPage);

    return ReactDOM.createPortal(
        <div className="modal__overlay">
            <div className="modal__content modal-content-preview">
                <div className="modal__header">
                    <h2 className="modal__title">Vista Previa de Carga</h2>
                    <button onClick={onClose} className="btn-close" />
                </div>
                <div className="pagination-controls" style={{ padding: '0 var(--espaciado-lg)', borderBottom: '1px solid var(--color-borde)' }}>
                    <div className="pagination__items-per-page">
                        <label>Mostrar:</label>
                        <ItemsPerPageDropdown value={itemsPerPage} onChange={setItemsPerPage} />
                    </div>
                    <div className="pagination__navigation">
                        <button className="btn-icon" onClick={function() { setCurrentPage(currentPage - 1); }} disabled={currentPage === 1}>
                            <Icon name="chevron-left" />
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button className="btn-icon" onClick={function() { setCurrentPage(currentPage + 1); }} disabled={currentPage === totalPages}>
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

const ServidorCargaMasiva = function({ onClose, actualizarServidores }) {
    var [selectedFile, setSelectedFile] = useState(null);
    var [datosCSV, setDatosCSV] = useState([]);
    var [encabezadoCSV, setEncabezadoCSV] = useState([]);
    var [nombreArchivo, setNombreArchivo] = useState("");
    var [isPreviewVisible, setPreviewVisible] = useState(false);
    var fileInputRef = useRef(null);
    var [editModal, setEditModal] = useState({ open: false, data: null, rowIndex: null });
    var [catalogos, setCatalogos] = useState({});
    var [servidoresExistentes, setServidoresExistentes] = useState([]);

    useEffect(function() {
        async function fetchData() {
            try {
                var backendUrl = process.env.BACKEND_URL;
                var urls = [
                    { name: "servidores", url: backendUrl + "/api/servidores" },
                    { name: "servicios", url: backendUrl + "/api/servicios" },
                    { name: "capas", url: backendUrl + "/api/capas" },
                    { name: "ambientes", url: backendUrl + "/api/ambientes" },
                    { name: "dominios", url: backendUrl + "/api/dominios" },
                    { name: "sistemasOperativos", url: backendUrl + "/api/sistemas_operativos" },
                    { name: "estatus", url: backendUrl + "/api/estatus" },
                    { name: "ecosistemas", url: backendUrl + "/api/ecosistemas" }
                ];
                var responses = await Promise.all(urls.map(function(item) { return fetch(item.url).then(function(res) { return res.json(); }); }));
                var servidoresData = responses[0];
                var catalogosData = responses.slice(1);
                setServidoresExistentes(servidoresData || []);
                setCatalogos({
                    servicios: catalogosData[0] || [],
                    capas: catalogosData[1] || [],
                    ambientes: catalogosData[2] || [],
                    dominios: catalogosData[3] || [],
                    sistemasOperativos: catalogosData[4] || [],
                    estatus: catalogosData[5] || [],
                    ecosistemas: catalogosData[6] || []
                });
            } catch (e) {
                console.error("Error cargando datos iniciales:", e);
                Swal.fire("Error de Conexión", "No se pudieron cargar los datos del servidor para validar: " + e.message, "error");
            }
        }
        fetchData();
    }, []);

    function handleFileChange(event) {
        var file = event.target.files[0];
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
    }

    function revalidarFila(fila, encabezado, todasLasFilas, rowIndex) {
        var errores = {};
        function findIndex(keyword) { return encabezado.findIndex(function(h) { return getHeaderKey(h) === getHeaderKey(keyword); }); }
        function getValue(index) { return (index !== -1 ? String(fila[index] || '').trim() : ''); }

        function checkCatalog(catalogName, header, value, formKey) {
            var catalog = catalogos[catalogName];
            if (!catalog || catalog.length === 0) return;
            var matchFound = false;
            for (var i = 0; i < catalog.length; i++) {
                if (catalog[i].nombre && catalog[i].nombre.toLowerCase() === value.toLowerCase()) {
                    matchFound = true;
                    break;
                }
            }
            if (catalogName === 'sistemasOperativos') {
                for (var j = 0; j < catalog.length; j++) {
                    if ((catalog[j].nombre + ' - V' + catalog[j].version).toLowerCase() === value.toLowerCase()) {
                        matchFound = true;
                        break;
                    }
                }
            }
            if (!matchFound) errores[formKey] = true;
        }

        var columnas = [
            { key: 'nombre', header: 'Nombre', required: true, formKey: 'nombre' },
            { key: 'tipo', header: 'Tipo', required: true, values: ['FISICO', 'VIRTUAL'], formKey: 'tipo' },
            { key: 'ip', header: 'IP', required: true, formKey: 'ip' },
            { key: 'servicio', header: 'Servicio', required: true, catalog: 'servicios', formKey: 'servicio_id' },
            { key: 'capa', header: 'Capa', required: true, catalog: 'capas', formKey: 'capa_id' },
            { key: 'ambiente', header: 'Ambiente', required: true, catalog: 'ambientes', formKey: 'ambiente_id' },
            { key: 'dominio', header: 'Dominio', required: true, catalog: 'dominios', formKey: 'dominio_id' },
            { key: 'ecosistema', header: 'Ecosistema', required: true, catalog: 'ecosistemas', formKey: 'ecosistema_id' },
            { key: 's.o.', header: 'S.O.', required: true, catalog: 'sistemasOperativos', formKey: 'sistema_operativo_id' },
            { key: 'estatus', header: 'Estatus', required: true, catalog: 'estatus', formKey: 'estatus_id' },
            { key: 'link', header: 'Link', required: false, formKey: 'link' }
        ];

        columnas.forEach(function(col) {
            var index = findIndex(col.header);
            var value = getValue(index);
            var formKey = col.formKey;
            if (col.required && !value) errores[formKey] = true;
            else if (value) {
                if (col.values && !col.values.some(function(v) { return v.toUpperCase() === value.toUpperCase(); })) errores[formKey] = true;
                if (col.catalog) checkCatalog(col.catalog, col.header, value, formKey);
                // Validación de repetidos y existentes para nombre, ip y link
                if (['nombre', 'ip', 'link'].indexOf(col.key) !== -1) {
                    // Verifica si ya existe en la base
                    if (servidoresExistentes.some(function(s) {
                        return s[col.key] && s[col.key].toLowerCase() === value.toLowerCase();
                    })) errores[formKey] = true;
                    // Verifica si se repite en la carga masiva
                    var repiteEnCarga = todasLasFilas.filter(function(otraFila, idx) {
                        return (otraFila[index] || '').toLowerCase() === value.toLowerCase();
                    });
                    if (repiteEnCarga.length > 1) errores[formKey] = true;
                }
            }
        });
        return { errores: errores };
    }

    function procesarYValidarDatos(datos) {
        if (!datos || datos.length < 1 || !Array.isArray(datos[0])) {
            Swal.fire("Archivo inválido", "El archivo CSV no tiene un formato correcto o está vacío.", "info"); return;
        }
        var encabezado = datos[0];
        var filasData = datos.slice(1);
        setEncabezadoCSV(encabezado);

        var filasProcesadas = filasData.map(function(fila, index) {
            var resultado = revalidarFila(fila, encabezado, filasData, index);
            return { fila: fila, errores: resultado.errores };
        });

        setDatosCSV(filasProcesadas);
        setPreviewVisible(true);
    }

    function handleAcceptAndPreview() {
        if (!selectedFile) { Swal.fire("Sin archivo", "Por favor, selecciona un archivo primero.", "info"); return; }
        if (!window.Papa) { Swal.fire("Error de Librería", "La librería para leer archivos (PapaParse) no está cargada.", "error"); return; }
        window.Papa.parse(selectedFile, {
            header: false, skipEmptyLines: true,
            complete: function(results) { procesarYValidarDatos(results.data); },
            error: function(error) { Swal.fire('Error de lectura', 'No se pudo leer el archivo CSV. Error: ' + error.message, 'error'); }
        });
    }

    function findIdByName(catalogName, name) {
        var catalog = catalogos[catalogName];
        if (!catalog || !name) return null;
        if (catalogName === 'sistemasOperativos') {
            for (var i = 0; i < catalog.length; i++) {
                if ((catalog[i].nombre + ' - V' + catalog[i].version).toLowerCase() === name.trim().toLowerCase()) {
                    return catalog[i].id;
                }
            }
            return null;
        }
        for (var j = 0; j < catalog.length; j++) {
            if (catalog[j].nombre && catalog[j].nombre.toLowerCase() === name.trim().toLowerCase()) {
                return catalog[j].id;
            }
        }
        return null;
    }

    function handleGuardar() {
        var filasConErrores = datosCSV.filter(function(dato) { return Object.keys(dato.errores).length > 0; });
        if (filasConErrores.length > 0) {
            Swal.fire('Registros con errores', 'No se puede guardar. Por favor, corrija todas las filas marcadas en rojo.', 'error');
            return;
        }
        var filasValidas = datosCSV.filter(function(dato) { return Object.keys(dato.errores).length === 0; });
        if (filasValidas.length === 0) {
            Swal.fire('No hay registros válidos', 'No hay servidores para guardar.', 'info');
            return;
        }

        var servidoresParaGuardar = filasValidas.map(function(obj) {
            var fila = obj.fila;
            var servidor = {};
            for (var i = 0; i < encabezadoCSV.length; i++) {
                var header = encabezadoCSV[i];
                var key = getHeaderKey(header);
                var value = fila[i] || '';
                switch (key) {
                    case 'nombre': servidor.nombre = value; break;
                    case 'tipo': servidor.tipo = value; break;
                    case 'ip': servidor.ip = value; break;
                    case 'balanceador': servidor.balanceador = value; break;
                    case 'vlan': servidor.vlan = value; break;
                    case 'link': servidor.link = value; break;
                    case 'descripcion':
                        // Guardar el valor original del CSV
                        servidor.descripcion = (value === 'N/A' || value === '') ? '' : value;
                        break;
                    case 'servicio': servidor.servicio_id = findIdByName('servicios', value); break;
                    case 'capa': servidor.capa_id = findIdByName('capas', value); break;
                    case 'ambiente': servidor.ambiente_id = findIdByName('ambientes', value); break;
                    case 'dominio':
                        servidor.dominio_id = findIdByName('dominios', value);
                        break;
                    case 'ecosistema':
                        if (value === 'N/A' || value === '') {
                            servidor.ecosistema_id = null;
                        } else {
                            servidor.ecosistema_id = findIdByName('ecosistemas', value);
                        }
                        break;
                    case 'so': servidor.sistema_operativo_id = findIdByName('sistemasOperativos', value); break;
                    case 'estatus': servidor.estatus_id = findIdByName('estatus', value); break;
                    default: break;
                }
            }
            if (!servidor.hasOwnProperty('ecosistema_id')) servidor.ecosistema_id = null;
            if (!servidor.hasOwnProperty('descripcion')) servidor.descripcion = '';
            return Object.assign({}, servidor, { activo: true });
        });

        Swal.fire({
            title: 'Guardando ' + servidoresParaGuardar.length + ' servidores...',
            text: 'Por favor, espere.',
            allowOutsideClick: false,
            didOpen: function() { Swal.showLoading(); }
        });

        Promise.all(servidoresParaGuardar.map(function(servidor) {
            return fetch(process.env.BACKEND_URL + '/api/servidores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(servidor)
            }).then(function(res) {
                if (!res.ok) return res.json().then(function(err) { return Promise.reject(err); });
                return res.json();
            });
        })).then(function() {
            Swal.fire('¡Éxito!', servidoresParaGuardar.length + ' servidores han sido guardados.', 'success');
            onClose();
            actualizarServidores('Carga masiva completada');
        }).catch(function(error) {
            Swal.fire('Error al guardar', 'Ocurrió un error: ' + (error.msg || error.message), 'error');
        });
    }

    function handleEditRow(rowIndex) {
        var obj = datosCSV[rowIndex];
        var fila = obj.fila;
        var errores = obj.errores;
        var initialData = {};
        for (var i = 0; i < encabezadoCSV.length; i++) {
            var header = encabezadoCSV[i];
            if (header && typeof header === 'string') {
                var key = getHeaderKey(header);
                var value = fila[i] || '';
                var formKeyMap = { servicio: 'servicio_id', capa: 'capa_id', ambiente: 'ambiente_id', dominio: 'dominio_id', ecosistema: 'ecosistema_id', so: 'sistema_operativo_id', estatus: 'estatus_id', nombre: 'nombre', tipo: 'tipo', ip: 'ip', balanceador: 'balanceador', vlan: 'vlan', link: 'link', descripcion: 'descripcion' };
                var catalogMap = { servicio: 'servicios', capa: 'capas', ambiente: 'ambientes', dominio: 'dominios', ecosistema: 'ecosistemas', so: 'sistemasOperativos', estatus: 'estatus' };
                var formKey = formKeyMap[key];
                var catalogName = catalogMap[key];
                if (formKey) {
                    if (key === 'descripcion') {
                        // Precargar el valor original del CSV, sin conversión ni id
                        initialData[formKey] = value;
                    } else if (key === 'dominio') {
                        initialData[formKey] = value;
                    } else if (catalogName) {
                        if (key === 'ecosistema') {
                            initialData[formKey] = value;
                        } else if (key === 'so') {
                            initialData[formKey] = findIdByName('sistemasOperativos', value);
                        } else {
                            var idValue = value;
                            if (isNaN(Number(value))) {
                                idValue = findIdByName(catalogName, value);
                            }
                            initialData[formKey] = idValue;
                        }
                    } else {
                        initialData[formKey] = value;
                    }
                }
            }
        }
        initialData.errors = errores;
        setEditModal({ open: true, data: initialData, rowIndex: rowIndex });
    }

    function findNameById(catalogName, id) {
        var catalog = catalogos[catalogName];
        if (!catalog || !id) return '';
        for (var i = 0; i < catalog.length; i++) {
            if (String(catalog[i].id) === String(id)) {
                if (catalogName === 'sistemasOperativos') {
                    return catalog[i].nombre + ' - V' + catalog[i].version;
                }
                return catalog[i].nombre;
            }
        }
        return '';
    }

    function handleUpdateRow(updatedData, rowIndex) {
        var filaActualizadaArray = [];
        for (var i = 0; i < encabezadoCSV.length; i++) {
            var header = encabezadoCSV[i];
            var headerNormalized = getHeaderKey(header);
            switch (headerNormalized) {
                case 'nombre': filaActualizadaArray.push(updatedData.nombre); break;
                case 'tipo': filaActualizadaArray.push(updatedData.tipo); break;
                case 'ip': filaActualizadaArray.push(updatedData.ip); break;
                case 'balanceador': filaActualizadaArray.push(updatedData.balanceador); break;
                case 'vlan': filaActualizadaArray.push(updatedData.vlan); break;
                case 'link': filaActualizadaArray.push(updatedData.link); break;
                case 'descripcion': filaActualizadaArray.push(updatedData.descripcion || ''); break;
                case 'servicio': filaActualizadaArray.push(findNameById('servicios', updatedData.servicio_id)); break;
                case 'capa': filaActualizadaArray.push(findNameById('capas', updatedData.capa_id)); break;
                case 'ambiente': filaActualizadaArray.push(findNameById('ambientes', updatedData.ambiente_id)); break;
                case 'dominio': filaActualizadaArray.push(findNameById('dominios', updatedData.dominio_id)); break;
                case 'ecosistema': filaActualizadaArray.push(findNameById('ecosistemas', updatedData.ecosistema_id)); break;
                case 'so': filaActualizadaArray.push(findNameById('sistemasOperativos', updatedData.sistema_operativo_id)); break;
                case 'estatus': filaActualizadaArray.push(findNameById('estatus', updatedData.estatus_id)); break;
                default: filaActualizadaArray.push('');
            }
        }

        var filasActuales = datosCSV.map(function(d) { return d.fila; });
        filasActuales[rowIndex] = filaActualizadaArray;

        var nuevosDatosCSV = filasActuales.map(function(fila, index) {
            var resultado = revalidarFila(fila, encabezadoCSV, filasActuales, index);
            return { fila: fila, errores: resultado.errores };
        });

        setDatosCSV(nuevosDatosCSV);
        setEditModal({ open: false, data: null, rowIndex: null });
    }

    function handleDeleteRow(rowIndex) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "La fila se eliminará de esta carga.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-error)',
            cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(function(result) {
            if (result.isConfirmed) {
                var nuevosDatos = datosCSV.slice();
                nuevosDatos.splice(rowIndex, 1);
                setDatosCSV(nuevosDatos);
                Swal.fire('¡Eliminado!', 'La fila ha sido eliminada.', 'success');
            }
        });
    }

    var EditarFilaModal = function({ open, onClose, initialData, onSave }) {
        if (!open) return null;
        return ReactDOM.createPortal(
            <div className="modal__overlay">
                <div className="modal__content modal-content-servidor" onClick={function(e) { e.stopPropagation(); }}>
                    <div className="modal__header">
                        <h2 className="modal__title">Editar Servidor de Carga Masiva</h2>
                        <button onClick={onClose} className="btn-close" />
                    </div>
                    <div className="modal__body">
                        <ServidorFormulario
                            esEdicion={true}
                            servidorInicial={initialData}
                            setModalVisible={onClose}
                            onSuccess={function() {}}
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
                    <div className="modal__content" onClick={function(e) { e.stopPropagation(); }}>
                        <div className="modal__header">
                            <h2 className="modal__title">Carga Masiva de Servidores</h2>
                            <button onClick={onClose} className="btn-close" />
                        </div>
                        <div className="modal__body" style={{ textAlign: 'center' }}>
                            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                            <button onClick={function() { fileInputRef.current && fileInputRef.current.click(); }} className="btn btn--primary">
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
                    onClose={function() { setPreviewVisible(false); }}
                    onSave={handleGuardar}
                    onEdit={handleEditRow}
                    onDelete={handleDeleteRow}
                />
            )}
            <EditarFilaModal
                open={editModal.open}
                onClose={function() { setEditModal({ open: false, data: null, rowIndex: null }); }}
                initialData={editModal.data}
                onSave={function(updatedData) { handleUpdateRow(updatedData, editModal.rowIndex); }}
            />
        </>
    );
};

export default ServidorCargaMasiva;