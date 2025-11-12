import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";
import ServidorFormulario from "./ServidorFormulario";
import Icon from './Icon';

const getHeaderKey = function (header) {
    if (!header || typeof header !== 'string') return '';
    // Si el header es 'descripción' (con acento) o 'descripcion', mapea ambos a 'descripcion' para el key
    let normalized = header.trim().toLowerCase().replace(/ /g, '_').replace(/\./g, '').replace(/\//g, '');
    if (normalized === 'descripción' || normalized === 'descripcion') {
        return 'descripcion';
    }
    return header.toLowerCase().normalize("NFD").replace(/[\u00c0-\u024f]/g, "").trim().replace(/ /g, '_').replace(/\./g, '').replace(/\//g, '');
};

const TablaPrevisualizacion = function ({ datos, encabezado, onEdit, onDelete, startIndex = 0 }) {
    if (!datos || datos.length === 0) {
        return <p className="no-data-preview">No hay datos para previsualizar.</p>;
    }
    // Generar encabezado modificado para mostrar las tres IPs
    const customHeaders = encabezado.slice();
    // Buscar índices reales en el encabezado original
    const ipIndex = encabezado.findIndex(h => getHeaderKey(h) === 'ip');
    const vlanMgmtIndex = encabezado.findIndex(h => getHeaderKey(h) === 'vlan_mgmt' || getHeaderKey(h) === 'vlan');
    const vlanRealIndex = encabezado.findIndex(h => getHeaderKey(h) === 'vlan_real');
    // Si existe columna 'ip' en el CSV, reemplazar por columnas: IP MGMT, VLAN MGMT, IP Real, VLAN REAL, IP Mask25
    if (ipIndex !== -1) {
        customHeaders.splice(ipIndex, 1, 'IP MGMT', 'VLAN MGMT', 'IP Real', 'VLAN REAL', 'IP Mask25');
    }
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        {customHeaders.map(function (col, index) { return <th key={index}>{col}</th>; })}
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {datos.map(function ({ fila, errores }, rowIndex) {
                        var tieneErrorFila = Object.keys(errores).length > 0;
                        return (
                            <tr key={rowIndex} className={tieneErrorFila ? 'fila-con-error' : 'fila-correcta'}>
                                <td>{startIndex + rowIndex + 1}</td>
                                {fila.map(function (celda, cellIndex) {
                                    // Si es la columna IP combinada, mostrar IP MGMT + VLAN MGMT + IP REAL + VLAN REAL + IP MASK25
                                    if (ipIndex !== -1 && cellIndex === ipIndex) {
                                        const ipMgmtVal = fila[ipIndex] || '';
                                        const ipRealVal = fila[ipIndex + 1] || '';
                                        const ipMaskVal = fila[ipIndex + 2] || '';
                                        const vlanMgmtVal = vlanMgmtIndex !== -1 ? (fila[vlanMgmtIndex] || '') : '';
                                        const vlanRealVal = vlanRealIndex !== -1 ? (fila[vlanRealIndex] || '') : '';
                                        return [
                                            <td key={cellIndex + '-mgmt'} className={errores['ip_mgmt'] ? 'celda-con-error' : ''}>
                                                <span className={errores['ip_mgmt'] ? 'texto-error' : ''}>{ipMgmtVal}</span>
                                            </td>,
                                            <td key={cellIndex + '-vlan-mgmt'} className={errores['vlan_mgmt'] ? 'celda-con-error' : ''}>
                                                <span className={errores['vlan_mgmt'] ? 'texto-error' : ''}>{vlanMgmtVal}</span>
                                            </td>,
                                            <td key={cellIndex + '-real'} className={errores['ip_real'] ? 'celda-con-error' : ''}>
                                                <span className={errores['ip_real'] ? 'texto-error' : ''}>{ipRealVal}</span>
                                            </td>,
                                            <td key={cellIndex + '-vlan-real'} className={errores['vlan_real'] ? 'celda-con-error' : ''}>
                                                <span className={errores['vlan_real'] ? 'texto-error' : ''}>{vlanRealVal}</span>
                                            </td>,
                                            <td key={cellIndex + '-mask25'} className={errores['ip_mask25'] ? 'celda-con-error' : ''}>
                                                <span className={errores['ip_mask25'] ? 'texto-error' : ''}>{ipMaskVal}</span>
                                            </td>
                                        ];
                                    }
                                    // Omitir las columnas IP Real/IP Mask/25 y las VLAN originales si ya las mostramos
                                    if (ipIndex !== -1 && (cellIndex === ipIndex + 1 || cellIndex === ipIndex + 2 || cellIndex === vlanMgmtIndex || cellIndex === vlanRealIndex)) {
                                        return null;
                                    }
                                    var headerKey = getHeaderKey(encabezado[cellIndex]);
                                    // Mapeo de encabezado a formKey para los campos de catálogo y repetidos
                                    const catalogFormKeys = {
                                        servicio: 'servicio_id',
                                        ecosistema: 'ecosistema_id',
                                        aplicacion: 'aplicacion_id',
                                        capa: 'capa_id',
                                        ambiente: 'ambiente_id',
                                        dominio: 'dominio_id',
                                        's.o.': 'sistema_operativo_id',
                                        estatus: 'estatus_id',
                                        tipo: 'tipo',
                                        nombre: 'nombre',
                                        ip_mgmt: 'ip_mgmt',
                                        ip_real: 'ip_real',
                                        ip_mask25: 'ip_mask25',
                                        link: 'link'
                                    };
                                    // Buscar el formKey correspondiente
                                    const formKey = catalogFormKeys[encabezado[cellIndex]?.trim().toLowerCase()];
                                    var tieneErrorCelda = !!errores[formKey || headerKey];
                                    let valorMostrar = celda;
                                    if (headerKey === 'descripcion' && (!celda || celda.trim() === '')) {
                                        valorMostrar = 'N/A';
                                    }
                                    if ((headerKey === 'ip_mgmt' || headerKey === 'ip_real' || headerKey === 'ip_mask25') && (celda === null || celda === '' || typeof celda === 'undefined')) {
                                        valorMostrar = 'N/A';
                                    }
                                    if (headerKey === 'link' && (celda === null || celda === '' || typeof celda === 'undefined')) {
                                        valorMostrar = 'N/A';
                                    }
                                    // Si el campo es de catálogo o es nombre, ip, link y tiene error, mostrar en rojo
                                    const esCampoCatalogoORepetido = !!formKey || ['nombre', 'ip_mgmt', 'ip_real', 'ip_mask25', 'link'].includes(headerKey);
                                    return (
                                        <td
                                            key={cellIndex}
                                            title={valorMostrar}
                                            className={tieneErrorCelda && esCampoCatalogoORepetido ? 'celda-con-error' : ''}
                                        >
                                            <span className={tieneErrorCelda && esCampoCatalogoORepetido ? 'texto-error' : ''}>{valorMostrar}</span>
                                        </td>
                                    );
                                })}
                                <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'inline-flex', gap: '0.5em', alignItems: 'center' }}>
                                        <button onClick={function () { onEdit(startIndex + rowIndex); }} className="btn-icon" title="Editar Fila">
                                            <Icon name="edit" />
                                        </button>
                                        <button onClick={function () { onDelete(startIndex + rowIndex); }} className="btn-icon" title="Eliminar Fila">
                                            <Icon name="trash" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const ItemsPerPageDropdown = function ({ value, onChange }) {
    var [isOpen, setIsOpen] = useState(false);
    var options = [50, 100, 150, 200];
    var dropdownRef = useRef(null);

    useEffect(function () {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return function () { document.removeEventListener("mousedown", handleClickOutside); };
    }, []);

    function handleSelect(option) {
        onChange(option);
        setIsOpen(false);
    }

    return (
        <div className="custom-select pagination-select" ref={dropdownRef}>
            <button type="button" className="form__input custom-select__trigger" onClick={function () { setIsOpen(!isOpen); }}>
                <span>{value}</span>
                <div className={"chevron" + (isOpen ? " open" : "")}></div>
            </button>
            <div className={"custom-select__panel" + (isOpen ? " open" : "")}>
                {options.map(function (opt) {
                    return (
                        <div
                            key={opt}
                            className={"custom-select__option" + (value === opt ? ' selected' : '')}
                            onClick={function () { handleSelect(opt); }}
                        >
                            {opt}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const PreviewModal = function ({ datos, encabezado, onClose, onSave, onEdit, onDelete }) {
    var [currentPage, setCurrentPage] = useState(1);
    var [itemsPerPage, setItemsPerPage] = useState(50);

    var indexOfLastItem = currentPage * itemsPerPage;
    var indexOfFirstItem = indexOfLastItem - itemsPerPage;
    var currentItems = datos.slice(indexOfFirstItem, indexOfLastItem);
    var totalPages = Math.ceil(datos.length / itemsPerPage);

    // Calcular cantidad de servidores buenos y malos
    var cantidadBuenos = datos.filter(d => Object.keys(d.errores).length === 0).length;
    var cantidadMalos = datos.filter(d => Object.keys(d.errores).length > 0).length;

    return ReactDOM.createPortal(
        <div className="modal__overlay">
            <div className="modal__content modal-content-preview">
                <div className="modal__header">
                    <h2 className="modal__title">Vista Previa de Carga</h2>
                    <button onClick={onClose} className="btn-close" />
                </div>
                <div className="pagination-controls" style={{ padding: '0 var(--espaciado-lg)', borderBottom: '1px solid var(--color-borde)' }}>
                    <div className="pagination__items-per-page" style={{ display: 'flex', alignItems: 'center', gap: '1.5em' }}>
                        <label>Mostrar:</label>
                        <ItemsPerPageDropdown value={itemsPerPage} onChange={setItemsPerPage} />
                        <span className="badge badge--success" style={{ fontSize: '1em', padding: '0.4em 1em', display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                            <Icon name="check-circle" style={{ color: 'var(--color-primario)' }} />
                            {cantidadBuenos} {cantidadBuenos === 1 ? 'servidor listo para guardar' : 'servidores listos para guardar'}
                        </span>
                        <span className="badge badge--error" style={{ fontSize: '1em', padding: '0.4em 1em', display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                            <Icon name="times-circle" style={{ color: 'var(--color-error)' }} />
                            {cantidadMalos} servidor{cantidadMalos === 1 ? '' : 'es'} con error{cantidadMalos === 1 ? '' : 'es'}
                        </span>
                    </div>
                    <div className="pagination__navigation">
                        <button className="btn-icon" onClick={function () { setCurrentPage(currentPage - 1); }} disabled={currentPage === 1}>
                            <Icon name="chevron-left" />
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button className="btn-icon" onClick={function () { setCurrentPage(currentPage + 1); }} disabled={currentPage === totalPages}>
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

const ServidorCargaMasiva = function ({ onClose, actualizarServidores }) {
    var [selectedFile, setSelectedFile] = useState(null);
    var [datosCSV, setDatosCSV] = useState([]);
    var [encabezadoCSV, setEncabezadoCSV] = useState([]);
    var [nombreArchivo, setNombreArchivo] = useState("");
    var [isPreviewVisible, setPreviewVisible] = useState(false);
    var fileInputRef = useRef(null);
    var [editModal, setEditModal] = useState({ open: false, data: null, rowIndex: null });
    var [catalogos, setCatalogos] = useState({});
    var [servidoresExistentes, setServidoresExistentes] = useState([]);
    // --- Función para exportar CSV ---
    function exportarCSV() {
        if (!datosCSV.length) return;
        // Encabezados completos igual que Excel
        const encabezados = [
            "Nombre", "Tipo", "IP MGMT", "IP Real", "IP Mask/25", "Servicio", "Ecosistema", "Aplicacion", "Capa", "Ambiente", "Balanceador", "VLAN", "Dominio", "S.O.", "Estatus", "Descripción", "Link"
        ];
        // Usar los datos procesados para exportar lo que se ve en la tabla
        const filas = datosCSV.map(obj => {
            const fila = obj.fila;
            let ipIndex = encabezadoCSV.findIndex(h => getHeaderKey(h) === 'ip');
            let valores = [];
            let i = 0;
            while (i < encabezadoCSV.length) {
                let header = encabezadoCSV[i];
                let key = getHeaderKey(header);
                let val = fila[i];
                if (ipIndex !== -1 && i === ipIndex) {
                    valores.push(fila[ipIndex] || '');
                    valores.push(fila[ipIndex + 1] || '');
                    valores.push(fila[ipIndex + 2] || '');
                    i += 3;
                    continue;
                }
                switch (key) {
                    case 'servicio':
                        val = findNameById('servicios', val) || val;
                        break;
                    case 'capa':
                        val = findNameById('capas', val) || val;
                        break;
                    case 'ambiente':
                        val = findNameById('ambientes', val) || val;
                        break;
                    case 'dominio':
                        val = findNameById('dominios', val) || val;
                        break;
                    case 'estatus':
                        val = findNameById('estatus', val) || val;
                        break;
                    case 'so':
                    case 's.o.':
                        val = findNameById('sistemasOperativos', val) || val;
                        break;
                    default:
                        break;
                }
                valores.push(val || '');
                i++;
            }
            let resultado = [
                valores[encabezados.indexOf("Nombre")],
                valores[encabezados.indexOf("Tipo")],
                valores[encabezados.indexOf("IP MGMT")],
                valores[encabezados.indexOf("IP Real")],
                valores[encabezados.indexOf("IP Mask/25")],
                valores[encabezados.indexOf("Servicio")],
                valores[encabezados.indexOf("Ecosistema")],
                valores[encabezados.indexOf("Aplicacion")],
                valores[encabezados.indexOf("Capa")],
                valores[encabezados.indexOf("Ambiente")],
                valores[encabezados.indexOf("Balanceador")],
                valores[encabezados.indexOf("VLAN")],
                valores[encabezados.indexOf("Dominio")],
                valores[encabezados.indexOf("S.O.")],
                valores[encabezados.indexOf("Estatus")],
                valores[encabezados.indexOf("Descripción")],
                valores[encabezados.indexOf("Link")]
            ];
            return resultado.map(val => `"${val || ''}"`).join(';');
        });
        const csvContent = `data:text/csv;charset=utf-8,\uFEFF${encabezados.join(';') + '\n' + filas.join('\n')}`;
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", "servidores.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    useEffect(function () {
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
                    { name: "ecosistemas", url: backendUrl + "/api/ecosistemas" },
                    { name: "aplicaciones", url: backendUrl + "/api/aplicaciones" }
                ];
                var responses = await Promise.all(urls.map(function (item) { return fetch(item.url).then(function (res) { return res.ok ? res.json() : []; }); }));
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
                    ecosistemas: catalogosData[6] || [],
                    aplicaciones: catalogosData[7] || []
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
        function findIndex(keyword) {
            const keywords = Array.isArray(keyword) ? keyword.map(k => getHeaderKey(k)) : [getHeaderKey(keyword)];
            return encabezado.findIndex(function (h) { return keywords.includes(getHeaderKey(h)); });
        }
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
            if (catalogName === 'sistemasOperativos' || catalogName === 'aplicaciones') {
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
            { key: 'ip_mgmt', header: 'IP MGMT', required: true, formKey: 'ip_mgmt' },
            { key: 'ip_real', header: 'IP Real', required: false, formKey: 'ip_real' },
            { key: 'ip_mask25', header: 'IP Mask25', required: false, formKey: 'ip_mask25' },
            { key: 'servicio', header: 'Servicio', required: true, catalog: 'servicios', formKey: 'servicio_id' },
            { key: 'capa', header: 'Capa', required: true, catalog: 'capas', formKey: 'capa_id' },
            { key: 'ambiente', header: 'Ambiente', required: true, catalog: 'ambientes', formKey: 'ambiente_id' },
            { key: 'dominio', header: 'Dominio', required: true, catalog: 'dominios', formKey: 'dominio_id' },
            { key: 'ecosistema', header: 'Ecosistema', required: false, catalog: 'ecosistemas', formKey: 'ecosistema_id' },
            { key: 'aplicacion', header: ['Aplicación', 'Aplicacion', 'Aplicaciones'], required: false, catalog: 'aplicaciones', formKey: 'aplicacion_id' },
            { key: 's.o.', header: ['S.O.', 'so'], required: true, catalog: 'sistemasOperativos', formKey: 'sistema_operativo_id' },
            { key: 'estatus', header: 'Estatus', required: true, catalog: 'estatus', formKey: 'estatus_id' },
            { key: 'link', header: 'Link', required: false, formKey: 'link' }
        ];

        columnas.forEach(function (col) {
            var index = findIndex(col.header);
            var value = getValue(index);
            var formKey = col.formKey;
            // Solo los campos realmente obligatorios deben marcar error si están vacíos
            if (col.required && !value && ['ip_mgmt', 'ip_real', 'ip_mask25'].indexOf(col.key) === -1) {
                errores[formKey] = true;
            }
            else if (value) {
                if (col.values && !col.values.some(function (v) { return v.toUpperCase() === value.toUpperCase(); })) errores[formKey] = true;
                if (col.catalog) {
                    checkCatalog(col.catalog, col.header, value, formKey);
                }
                // Validación de repetidos y existentes para nombre, ip_mgmt, ip_real, ip_mask25, link
                if (['nombre', 'ip_mgmt', 'ip_real', 'ip_mask25', 'link'].indexOf(col.key) !== -1) { // ip_mask25 se incluye en la validación
                    if (col.key !== 'descripcion') {
                        if (value !== null && value !== undefined && value !== '' && value.toUpperCase() !== 'N/A') {
                            // Validación contra servidores existentes
                            if (servidoresExistentes.some(function (s) {
                                if (col.key === 'ip_mask25') {
                                    // ip_mask25 no puede existir en ip_mgmt o ip_real
                                    return s.ip_mgmt === value || s.ip_real === value;
                                } else if (['ip_mgmt', 'ip_real'].includes(col.key)) {
                                    // ip_mgmt y ip_real no pueden existir en ningún campo de ip
                                    return s.ip_mgmt === value || s.ip_real === value || s.ip_mask25 === value;
                                }
                                // Para nombre y link
                                return s[col.key] && s[col.key].toLowerCase() === value.toLowerCase();
                            })) errores[formKey] = true;

                            // Validación contra otras filas en la carga masiva
                            var repiteEnCarga = todasLasFilas.some(function (otraFila, idx) {
                                if (rowIndex === idx) return false; // No comparar consigo misma
                                const ipMgmtIndex = findIndex('ip_mgmt');
                                const ipRealIndex = findIndex('ip_real');
                                const ipMask25Index = findIndex('ip_mask25');

                                const otraIpMgmt = (otraFila[ipMgmtIndex] || '').toLowerCase();
                                const otraIpReal = (otraFila[ipRealIndex] || '').toLowerCase();
                                const otraIpMask25 = (otraFila[ipMask25Index] || '').toLowerCase();
                                const valorActual = value.toLowerCase();

                                if (col.key === 'ip_mask25') {
                                    return otraIpMgmt === valorActual || otraIpReal === valorActual;
                                } else if (['ip_mgmt', 'ip_real'].includes(col.key)) {
                                    return otraIpMgmt === valorActual || otraIpReal === valorActual || otraIpMask25 === valorActual;
                                }
                                // Para nombre y link
                                return (otraFila[index] || '').toLowerCase() === valorActual;
                            });
                            if (repiteEnCarga) errores[formKey] = true;
                        }
                    }
                }
            }
        });
        // Validación: al menos uno de los tres campos de IP debe estar lleno (no vacío, no solo espacios, no N/A)
        const ipKeys = ['ip_mgmt', 'ip_real', 'ip_mask25'];
        const ipValues = ipKeys.map(key => {
            const idx = findIndex(key.replace('_', ' '));
            const val = idx !== -1 ? String(fila[idx] || '').trim() : '';
            return (val && val.toUpperCase() !== 'N/A') ? val : '';
        });
        if (ipValues.every(ip => ip === '')) {
            ipKeys.forEach(key => { errores[key] = true; });
        }
        return { errores: errores };
    }

    function procesarYValidarDatos(datos) {
        if (!datos || datos.length < 1 || !Array.isArray(datos[0])) {
            Swal.fire("Archivo inválido", "El archivo CSV no tiene un formato correcto o está vacío.", "info"); return;
        }
        var encabezado = datos[0];
        var filasData = datos.slice(1);
        setEncabezadoCSV(encabezado);

        var filasProcesadas = filasData.map(function (fila, index) {
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
            complete: function (results) { procesarYValidarDatos(results.data); },
            error: function (error) { Swal.fire('Error de lectura', 'No se pudo leer el archivo CSV. Error: ' + error.message, 'error'); }
        });
    }

    function findIdByName(catalogName, name) {
        var catalog = catalogos[catalogName];
        if (!catalog || !name) return null;
        if (catalogName === 'sistemasOperativos' || catalogName === 'aplicaciones') {
            for (var i = 0; i < catalog.length; i++) {
                if ((catalog[i].nombre + ' - V' + catalog[i].version).toLowerCase() === name.trim().toLowerCase()) {
                    return catalog[i].id;
                }
            }
            // Fallback por si solo viene el nombre
            const match = catalog.find(item => item.nombre.toLowerCase() === name.trim().toLowerCase());
            if (match) return match.id;
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
        // console.log('handleGuardar - datosCSV:', datosCSV);
        // Mostrar el payload que se enviará al backend
        var filasConErrores = datosCSV.filter(function (dato) { return Object.keys(dato.errores).length > 0; });
        var filasValidas = datosCSV.filter(function (dato) { return Object.keys(dato.errores).length === 0; });
        var servidoresParaGuardar = filasValidas.map(function (obj) {
            var fila = obj.fila;
            var servidor = {
                aplicacion_id: null, // Inicializar campos opcionales
                ecosistema_id: null
            };
            var ipFields = ['ip_mgmt', 'ip_real', 'ip_mask25'];
            for (var i = 0; i < encabezadoCSV.length; i++) {
                var header = encabezadoCSV[i];
                var key = getHeaderKey(header);
                var value = fila[i];
                if (key === 'ip_mgmt' || key === 'ip_real' || key === 'ip_mask25') {
                    servidor[key] = (value === 'N/A' || value === '' || value == null) ? null : value;
                } else {
                    switch (key) {
                        case 'nombre': servidor.nombre = value; break;
                        case 'tipo': servidor.tipo = value; break;
                        case 'balanceador': servidor.balanceador = value; break;
                        // legacy 'vlan' (si existe) mapearlo a vlan_mgmt por compatibilidad
                        case 'vlan': servidor.vlan_mgmt = (value === 'N/A' || value === '' || value == null) ? null : value; break;
                        case 'vlan_mgmt': servidor.vlan_mgmt = (value === 'N/A' || value === '' || value == null) ? null : value; break;
                        case 'vlan_real': servidor.vlan_real = (value === 'N/A' || value === '' || value == null) ? null : value; break;
                        case 'link': servidor.link = (value === 'N/A' || value === '' || value == null) ? null : value; break;
                        case 'descripcion':
                            servidor.descripcion = typeof value === 'string' ? value : '';
                            break;
                        case 'servicio': servidor.servicio_id = findIdByName('servicios', value); break;
                        case 'capa': servidor.capa_id = findIdByName('capas', value); break;
                        case 'ambiente': servidor.ambiente_id = findIdByName('ambientes', value); break;
                        case 'dominio':
                            servidor.dominio_id = findIdByName('dominios', value);
                            break;
                        case 'ecosistema':
                            servidor.ecosistema_id = (value === 'N/A' || value === '' || value == null) ? null : findIdByName('ecosistemas', value);
                            break;
                        case 'aplicación':
                        case 'aplicacion':
                        case 'aplicaciones':
                            servidor.aplicacion_id = (value === 'N/A' || value === '' || value == null) ? null : findIdByName('aplicaciones', value);
                            break;
                        case 'so': servidor.sistema_operativo_id = findIdByName('sistemasOperativos', value); break;
                        case 's.o.': servidor.sistema_operativo_id = findIdByName('sistemasOperativos', value); break;
                        case 'estatus': servidor.estatus_id = findIdByName('estatus', value); break;
                        default: break;
                    }
                }
            }
            // Asegurar que los campos VLAN estén presentes (null si no vienen)
            if (typeof servidor.vlan_mgmt === 'undefined') servidor.vlan_mgmt = null;
            if (typeof servidor.vlan_real === 'undefined') servidor.vlan_real = null;
            return Object.assign({}, servidor, { activo: true });
        });
        //console.log('Payload a enviar al backend:', servidoresParaGuardar);
        var filasConErrores = datosCSV.filter(function (dato) { return Object.keys(dato.errores).length > 0; });
        if (filasConErrores.length > 0) {
            Swal.fire('Registros con errores', 'No se puede guardar. Por favor, corrija todas las filas marcadas en rojo.', 'error');
            return;
        }
        var filasValidas = datosCSV.filter(function (dato) { return Object.keys(dato.errores).length === 0; });
        if (filasValidas.length === 0) {
            Swal.fire('No hay registros válidos', 'No hay servidores para guardar.', 'info');
            return;
        }

        Swal.fire({
            title: 'Guardando ' + servidoresParaGuardar.length + ' servidores...',
            text: 'Por favor, espere.',
            allowOutsideClick: false,
            didOpen: function () { Swal.showLoading(); }
        });

        Promise.all(servidoresParaGuardar.map(function (servidor) {
            return fetch(process.env.BACKEND_URL + '/api/servidores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(servidor)
            }).then(function (res) {
                if (!res.ok) return res.json().then(function (err) { return Promise.reject(err); });
                return res.json();
            });
        })).then(function () {
            Swal.fire('¡Éxito!', servidoresParaGuardar.length + ' servidores han sido guardados.', 'success');
            onClose();
            actualizarServidores('Carga masiva completada');
        }).catch(function (error) {
            // Intenta obtener un mensaje claro, si no lo encuentra, muestra el error completo para depuración.
            const detalleError = error ? (error.msg || error.message || JSON.stringify(error)) : 'No hay detalles del error.';
            Swal.fire('Error al guardar', 'Ocurrió un error: ' + detalleError, 'error');
        });
    }

    function handleEditRow(rowIndex) {
        var obj = datosCSV[rowIndex];
        var fila = obj.fila;
        var errores = obj.errores;
        var initialData = {};
        let ipIndex = encabezadoCSV.findIndex(h => getHeaderKey(h) === 'ip');
        // localizar índices de VLAN en el encabezado (vlan_mgmt, vlan_real o legacy 'vlan')
        const vlanMgmtIndex = encabezadoCSV.findIndex(h => getHeaderKey(h) === 'vlan_mgmt' || getHeaderKey(h) === 'vlan');
        const vlanRealIndex = encabezadoCSV.findIndex(h => getHeaderKey(h) === 'vlan_real');

        for (var i = 0; i < encabezadoCSV.length; i++) {
            var header = encabezadoCSV[i];
            if (!header || typeof header !== 'string') continue;

            var key = getHeaderKey(header);
            var value = fila[i] || '';

            if (ipIndex !== -1 && i === ipIndex) {
                initialData.ip_mgmt = fila[ipIndex] || '';
                initialData.ip_real = fila[ipIndex + 1] || '';
                initialData.ip_mask25 = fila[ipIndex + 2] || '';
                // precargar VLANs si existen en el CSV
                if (vlanMgmtIndex !== -1) initialData.vlan_mgmt = fila[vlanMgmtIndex] || '';
                if (vlanRealIndex !== -1) initialData.vlan_real = fila[vlanRealIndex] || '';
                i += 2; // Saltar las siguientes dos columnas de IP
                continue;
            }

            var formKeyMap = {
                nombre: 'nombre', tipo: 'tipo', ip_mgmt: 'ip_mgmt', ip_real: 'ip_real', ip_mask25: 'ip_mask25',
                balanceador: 'balanceador', vlan: 'vlan', vlan_mgmt: 'vlan_mgmt', vlan_real: 'vlan_real', link: 'link', descripcion: 'descripcion',
                servicio: 'servicio_id', capa: 'capa_id', ambiente: 'ambiente_id', dominio: 'dominio_id',
                ecosistema: 'ecosistema_id', aplicacion: 'aplicacion_id', aplicación: 'aplicacion_id',
                aplicaciones: 'aplicacion_id', 's.o.': 'sistema_operativo_id', so: 'sistema_operativo_id',
                estatus: 'estatus_id'
            };

            var catalogMap = {
                servicio: 'servicios', capa: 'capas', ambiente: 'ambientes', dominio: 'dominios',
                ecosistema: 'ecosistemas', aplicacion: 'aplicaciones', aplicación: 'aplicaciones',
                aplicaciones: 'aplicaciones', 's.o.': 'sistemasOperativos', so: 'sistemasOperativos',
                estatus: 'estatus'
            };

            var formKey = formKeyMap[key];
            var catalogName = catalogMap[key];

            if (formKey) {
                if (catalogName) {
                    initialData[formKey] = value ? findIdByName(catalogName, value) : '';
                } else {
                    initialData[formKey] = value;
                }
            }
        }

        // Asegurar que los campos opcionales/IP existan en el objeto
        if (!initialData.ip_mask25) initialData.ip_mask25 = '';
        if (!initialData.vlan_mgmt) initialData.vlan_mgmt = '';
        if (!initialData.vlan_real) initialData.vlan_real = '';
        if (typeof initialData.descripcion !== 'string') initialData.descripcion = '';
        if (!initialData.link) initialData.link = '';

        initialData.errors = errores;
        setEditModal({ open: true, data: initialData, rowIndex: rowIndex });
    }

    function findNameById(catalogName, id) {
        var catalog = catalogos[catalogName];
        if (!catalog || !id) return '';
        for (var i = 0; i < catalog.length; i++) {
            if (String(catalog[i].id) === String(id)) {
                if (catalogName === 'sistemasOperativos' || catalogName === 'aplicaciones') {
                    return catalog[i].nombre + ' - V' + catalog[i].version;
                }
                return catalog[i].nombre;
            }
        }
        return '';
    }

    function handleUpdateRow(updatedData, rowIndex) {
        // IP masiva: si solo hay una, las otras dos van como N/A
        let ipFields = ['ip_mgmt', 'ip_real', 'ip_mask25'];
        // Si solo una IP tiene valor real, las otras van como null (para guardar en backend)
        let ipValues = ipFields.map(f => updatedData[f] && updatedData[f].trim() !== '' && updatedData[f] !== 'N/A');
        let ipCount = ipValues.filter(Boolean).length;
        if (ipCount === 1) {
            ipFields.forEach(f => {
                if (!updatedData[f] || updatedData[f].trim() === '' || updatedData[f] === 'N/A') {
                    updatedData[f] = null;
                }
            });
        } else {
            // Si el usuario deja vacío o pone 'N/A', siempre se guarda como null
            ipFields.forEach(f => {
                if (updatedData[f] === 'N/A' || updatedData[f] === '' || updatedData[f] == null) {
                    updatedData[f] = null;
                }
            });
        }
        // IP Mask25 se mantiene independiente, no igual a IP MGMT
        var filaActualizadaArray = [];
        let ipIndex = encabezadoCSV.findIndex(h => getHeaderKey(h) === 'ip');
        for (var i = 0; i < encabezadoCSV.length; i++) {
            var header = encabezadoCSV[i];
            var headerNormalized = getHeaderKey(header);
            // Si el encabezado original es 'ip', mapear las tres IPs de forma independiente
            if (ipIndex !== -1 && i === ipIndex) {
                filaActualizadaArray.push(updatedData.ip_mgmt); // IP MGMT
                filaActualizadaArray.push(updatedData.ip_real); // IP Real
                filaActualizadaArray.push(updatedData.ip_mask25); // IP Mask25
                i += 2;
                continue;
            }
            switch (headerNormalized) {
                case 'nombre': filaActualizadaArray.push(updatedData.nombre); break;
                case 'tipo': filaActualizadaArray.push(updatedData.tipo); break;
                case 'ip_mgmt': filaActualizadaArray.push(updatedData.ip_mgmt); break;
                case 'ip_real': filaActualizadaArray.push(updatedData.ip_real); break;
                case 'ip_mask25': filaActualizadaArray.push(updatedData.ip_mask25); break;
                case 'balanceador': filaActualizadaArray.push(updatedData.balanceador); break;
                case 'vlan': filaActualizadaArray.push(updatedData.vlan); break;
                case 'vlan_mgmt': filaActualizadaArray.push(updatedData.vlan_mgmt); break;
                case 'vlan_real': filaActualizadaArray.push(updatedData.vlan_real); break;
                case 'link': filaActualizadaArray.push(updatedData.link); break;
                case 'descripcion': filaActualizadaArray.push(updatedData.descripcion && updatedData.descripcion.trim() !== '' ? updatedData.descripcion : ''); break;
                case 'servicio': filaActualizadaArray.push(findNameById('servicios', updatedData.servicio_id)); break;
                case 'capa': filaActualizadaArray.push(findNameById('capas', updatedData.capa_id)); break;
                case 'ambiente': filaActualizadaArray.push(findNameById('ambientes', updatedData.ambiente_id)); break;
                case 'dominio': filaActualizadaArray.push(findNameById('dominios', updatedData.dominio_id)); break;
                case 'ecosistema': filaActualizadaArray.push(findNameById('ecosistemas', updatedData.ecosistema_id)); break;
                case 'aplicacion':
                case 'aplicación':
                case 'aplicaciones':
                    filaActualizadaArray.push(findNameById('aplicaciones', updatedData.aplicacion_id)); break;
                case 'so':
                case 's.o.':
                    filaActualizadaArray.push(findNameById('sistemasOperativos', updatedData.sistema_operativo_id)); break;
                case 'estatus': filaActualizadaArray.push(findNameById('estatus', updatedData.estatus_id)); break;
                default:
                    // Si no es una columna conocida, buscar si hay un valor directo en updatedData
                    const directValue = updatedData[headerNormalized];
                    if (typeof directValue !== 'undefined') {
                        filaActualizadaArray.push(directValue);
                    } else {
                        // Intentar encontrar el valor original para no dejar la celda vacía
                        const originalIndex = encabezadoCSV.findIndex(h => getHeaderKey(h) === headerNormalized);
                        if (originalIndex !== -1) {
                            filaActualizadaArray.push(datosCSV[rowIndex].fila[originalIndex] || '');
                        } else {
                            filaActualizadaArray.push('');
                        }
                    }
            }
        }

        var filasActuales = datosCSV.map(function (d) { return d.fila; });
        filasActuales[rowIndex] = filaActualizadaArray;

        var nuevosDatosCSV = filasActuales.map(function (fila, index) {
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
        }).then(function (result) {
            if (result.isConfirmed) {
                var nuevosDatos = datosCSV.slice();
                nuevosDatos.splice(rowIndex, 1);
                setDatosCSV(nuevosDatos);
                Swal.fire('¡Eliminado!', 'La fila ha sido eliminada.', 'success');
            }
        });
    }

    var EditarFilaModal = function ({ open, onClose, initialData, onSave }) {
        if (!open) return null;
        return ReactDOM.createPortal(
            <div className="modal__overlay">
                <div className="modal__content modal-content-servidor" onClick={function (e) { e.stopPropagation(); }}>
                    <div className="modal__header">
                        <h2 className="modal__title">Editar Servidor de Carga Masiva</h2>
                        <button onClick={onClose} className="btn-close" />
                    </div>
                    <div className="modal__body">
                        <ServidorFormulario
                            esEdicion={true}
                            servidorInicial={initialData}
                            setModalVisible={onClose}
                            onSuccess={function () { }}
                            onSaveRow={onSave}
                        />
                    </div>
                </div>
            </div>, document.body);
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1em' }}>
                <button className="btn btn--primary" onClick={exportarCSV} disabled={datosCSV.length === 0}>
                    <Icon name="csv" /> Descargar CSV
                </button>
            </div>
            {ReactDOM.createPortal(
                <div className="modal__overlay" onClick={onClose}>
                    <div className="modal__content" onClick={function (e) { e.stopPropagation(); }}>
                        <div className="modal__header">
                            <h2 className="modal__title">Carga Masiva de Servidores</h2>
                            <button onClick={onClose} className="btn-close" />
                        </div>
                        <div className="modal__body" style={{ textAlign: 'center' }}>
                            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                            <button onClick={function () { fileInputRef.current && fileInputRef.current.click(); }} className="btn btn--primary">
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
                    onClose={function () { setPreviewVisible(false); }}
                    onSave={handleGuardar}
                    onEdit={handleEditRow}
                    onDelete={handleDeleteRow}
                />
            )}
            <EditarFilaModal
                open={editModal.open}
                onClose={function () { setEditModal({ open: false, data: null, rowIndex: null }); }}
                initialData={editModal.data}
                onSave={function (updatedData) { handleUpdateRow(updatedData, editModal.rowIndex); }}
            />
        </>
    );
};

export default ServidorCargaMasiva