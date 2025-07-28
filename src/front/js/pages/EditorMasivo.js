import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { BusquedaFiltro } from '../component/BusquedaFiltro';
import Loading from '../component/Loading';
import Icon from '../component/Icon';

// --- Componente para seleccionar columnas a editar ---
const SelectorColumnasEditables = ({ opciones, seleccionadas, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
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

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        const nuevasColumnas = checked
            ? [...seleccionadas, value]
            : seleccionadas.filter(col => col !== value);
        onChange(nuevasColumnas);
    };

    return (
        <div className="selector-columnas-container" ref={dropdownRef}>
            <label className="form__label">
                <Icon name="columns" />
                Columnas a editar:
            </label>
            <div className="custom-select">
                <button type="button" className="form__input custom-select__trigger" onClick={() => setIsOpen(!isOpen)}>
                    <span>{seleccionadas.length > 0 ? `${seleccionadas.length} seleccionada(s)` : "Ninguna"}</span>
                    <div className={`chevron ${isOpen ? "open" : ""}`}></div>
                </button>
                <div className={`custom-select__panel ${isOpen ? "open" : ""}`}>
                    {opciones.map((opcion) => (
                        <label key={opcion.value} className="custom-select__option">
                            <input
                                type="checkbox"
                                value={opcion.value}
                                checked={seleccionadas.includes(opcion.value)}
                                onChange={handleCheckboxChange}
                                disabled={opcion.disabled}
                            />
                            <span className={opcion.disabled ? 'disabled-option' : ''}>{opcion.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Componente para el dropdown de paginación ---
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

// --- Nuevo sub-componente para los dropdowns de edición en lote ---
const BulkEditDropdown = ({ value, onChange, options, catalog, catalogos }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const displayOptions = options || catalogos[catalog] || [];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const selectedOption = displayOptions.find(opt => String(opt.id) === String(value));
    const displayLabel = selectedOption ? (catalog === 'sistemasOperativos' ? `${selectedOption.nombre} - V${selectedOption.version}` : selectedOption.nombre) : "Seleccionar un valor...";

    return (
        <div className="custom-select" ref={dropdownRef} style={{ flexGrow: 1 }}>
            <button type="button" className="form__input custom-select__trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{displayLabel}</span>
                <div className={`chevron ${isOpen ? "open" : ""}`}></div>
            </button>
            <div className={`custom-select__panel ${isOpen ? "open" : ""}`}>
                {displayOptions.map(opt => (
                    <div
                        key={opt.id}
                        className={`custom-select__option ${String(value) === String(opt.id) ? 'selected' : ''}`}
                        onClick={() => handleSelect(String(opt.id))}
                    >
                        {catalog === 'sistemasOperativos' ? `${opt.nombre} - V${opt.version}` : opt.nombre}
                    </div>
                ))}
            </div>
        </div>
    );
};


const EditorMasivo = () => {
    // --- Estados del componente ---
    const [filtro, setFiltro] = useState({
        nombre: '', ip: '', balanceador: '', vlan: '', descripcion: '', link: '',
        tipo: [], servicios: [], capas: [], ambientes: [], dominios: [], sistemasOperativos: [], estatus: [],
    });
    const [servidores, setServidores] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);
    const [cambios, setCambios] = useState({});
    const [columnasEditables, setColumnasEditables] = useState([]);
    const [bulkEditValues, setBulkEditValues] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [catalogos, setCatalogos] = useState({
        servicios: [], capas: [], ambientes: [], dominios: [], sistemasOperativos: [], estatus: []
    });

    // --- Carga inicial de catálogos ---
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const backendUrl = process.env.BACKEND_URL;
                const urls = [
                    { name: "servicios", url: `${backendUrl}/api/servicios` },
                    { name: "capas", url: `${backendUrl}/api/capas` },
                    { name: "ambientes", url: `${backendUrl}/api/ambientes` },
                    { name: "dominios", url: `${backendUrl}/api/dominios` },
                    { name: "sistemasOperativos", url: `${backendUrl}/api/sistemas_operativos` },
                    { name: "estatus", url: `${backendUrl}/api/estatus` }
                ];
                const responses = await Promise.all(urls.map(item => fetch(item.url).then(res => res.json())));
                setCatalogos({
                    servicios: responses[0] || [], capas: responses[1] || [], ambientes: responses[2] || [],
                    dominios: responses[3] || [], sistemasOperativos: responses[4] || [], estatus: responses[5] || []
                });
            } catch (error) {
                console.error("Error al cargar catálogos:", error);
                Swal.fire("Error", "No se pudieron cargar los catálogos para los filtros.", "error");
            }
        };
        fetchCatalogos();
    }, []);

    // --- Función para buscar servidores ---
    const buscarServidores = async (e) => {
        if (e) e.preventDefault();
        setCargando(true);
        setBusquedaRealizada(true);
        setServidores([]);
        setCambios({});
        setBulkEditValues({});
        setColumnasEditables([]);
        setValidationErrors({});
        setCurrentPage(1);

        try {
            const queryParams = new URLSearchParams();
            for (const key in filtro) {
                if (filtro[key] && filtro[key].length > 0) {
                    const backendKey = key === 'sistemasOperativos' ? 'sistemas_operativos' : key;
                    if (Array.isArray(filtro[key])) {
                        filtro[key].forEach(val => queryParams.append(backendKey, val));
                    } else {
                        queryParams.append(backendKey, filtro[key]);
                    }
                }
            }

            const apiUrl = `${process.env.BACKEND_URL}/api/servidores/busqueda?${queryParams.toString()}`;
            const response = await fetch(apiUrl);

            if (!response.ok) throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);

            const data = await response.json();
            const normalizedData = data.map(srv => ({
                ...srv,
                servicio_id: srv.servicios?.[0]?.id || srv.servicio_id || null,
                capa_id: srv.capas?.[0]?.id || srv.capa_id || null,
                ambiente_id: srv.ambientes?.[0]?.id || srv.ambiente_id || null,
                dominio_id: srv.dominios?.[0]?.id || srv.dominio_id || null,
                sistema_operativo_id: srv.sistemasOperativos?.[0]?.id || srv.sistemas_operativos?.[0]?.id || srv.sistema_operativo_id || null,
                estatus_id: srv.estatus?.[0]?.id || srv.estatus_id || null,
            }));
            setServidores(normalizedData);

        } catch (error) {
            Swal.fire("Error de Búsqueda", `${error.message}`, "error");
        } finally {
            setCargando(false);
        }
    };

    // --- Lógica de Edición y Guardado ---
    const opcionesColumnas = [
        { value: 'nombre', label: 'Nombre', type: 'input', disabled: servidores.length > 1 },
        { value: 'tipo', label: 'Tipo', type: 'select', options: [{ id: 'VIRTUAL', nombre: 'Virtual' }, { id: 'FISICO', nombre: 'Físico' }] },
        { value: 'ip', label: 'IP', type: 'input', disabled: servidores.length > 1 },
        { value: 'balanceador', label: 'Balanceador', type: 'input' },
        { value: 'vlan', label: 'VLAN', type: 'input' },
        { value: 'link', label: 'Link', type: 'input', disabled: servidores.length > 1 },
        { value: 'descripcion', label: 'Descripción', type: 'input' },
        { value: 'servicio_id', label: 'Servicio', type: 'select', catalog: 'servicios' },
        { value: 'capa_id', label: 'Capa', type: 'select', catalog: 'capas' },
        { value: 'ambiente_id', label: 'Ambiente', type: 'select', catalog: 'ambientes' },
        { value: 'dominio_id', label: 'Dominio', type: 'select', catalog: 'dominios' },
        { value: 'sistema_operativo_id', label: 'S.O.', type: 'select', catalog: 'sistemasOperativos' },
        { value: 'estatus_id', label: 'Estatus', type: 'select', catalog: 'estatus' },
    ];

    const handleBulkEditChange = (campo, valor) => {
        setBulkEditValues(prev => ({ ...prev, [campo]: valor }));
    };

    const handleApplyBulkEdit = async (campo) => {
        const valor = bulkEditValues[campo];
        if (valor === undefined || valor === '') {
            Swal.fire("Valor no válido", "Por favor, selecciona un valor para aplicar.", "warning");
            return;
        }

        const campoLabel = opcionesColumnas.find(c => c.value === campo)?.label || campo;

        const result = await Swal.fire({
            title: `¿Aplicar a todos?`,
            text: `Se establecerá el campo "${campoLabel}" a un nuevo valor para los ${servidores.length} servidores encontrados.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-primario)',
            cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Sí, aplicar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            let nuevosCambios = { ...cambios };
            const servidoresActualizados = servidores.map(servidor => {
                nuevosCambios[servidor.id] = { ...nuevosCambios[servidor.id], [campo]: valor };
                return { ...servidor, [campo]: valor };
            });

            setServidores(servidoresActualizados);
            setCambios(nuevosCambios);
            setValidationErrors({});

            Swal.fire("Aplicado", `El campo "${campoLabel}" ha sido actualizado en la vista previa.`, "success");
        }
    };

    const handleGuardarCambios = async () => {
        setValidationErrors({});
        const numCambios = Object.keys(cambios).length;
        if (numCambios === 0) {
            Swal.fire("Sin cambios", "No se ha modificado ningún servidor.", "info");
            return;
        }

        const validaciones = [];
        for (const id in cambios) {
            const cambio = cambios[id];
            if (cambio.nombre || cambio.ip || cambio.link) {
                validaciones.push({
                    id: parseInt(id, 10),
                    nombre: cambio.nombre,
                    ip: cambio.ip,
                    link: cambio.link,
                });
            }
        }

        if (validaciones.length > 0) {
            try {
                const res = await fetch(`${process.env.BACKEND_URL}/api/servidores/validar-actualizaciones`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ validaciones }),
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de Validación',
                        text: 'Por favor, revise los campos marcados en rojo.',
                    });
                    const errorsMap = {};
                    errorData.detalles.forEach(detail => {
                        const valorEnConflictoMatch = detail.match(/'([^']+)'/);
                        if (!valorEnConflictoMatch) return;
                        const valorEnConflicto = valorEnConflictoMatch[1];
                        const servidorConError = servidores.find(srv =>
                            srv.nombre === valorEnConflicto || srv.ip === valorEnConflicto || srv.link === valorEnConflicto
                        );
                        if (servidorConError) {
                            if (!errorsMap[servidorConError.id]) {
                                errorsMap[servidorConError.id] = {};
                            }
                            if (detail.includes('nombre')) errorsMap[servidorConError.id].nombre = true;
                            if (detail.includes('IP')) errorsMap[servidorConError.id].ip = true;
                            if (detail.includes('Link')) errorsMap[servidorConError.id].link = true;
                        }
                    });
                    setValidationErrors(errorsMap);
                    return;
                }
            } catch (error) {
                Swal.fire('Error de Conexión', 'No se pudo contactar al servidor para validar los datos.', 'error');
                return;
            }
        }

        const result = await Swal.fire({
            title: `¿Guardar cambios en la BD?`,
            text: `Se actualizarán ${numCambios} servidor(es) permanentemente.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-primario)', cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Sí, guardar', cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setCargando(true);
            const promesas = Object.keys(cambios).map(id => {
                const servidorOriginal = servidores.find(s => s.id === parseInt(id, 10));
                const cambiosParaServidor = cambios[id];
                const payload = { ...servidorOriginal, ...cambiosParaServidor };
                delete payload.servicios;
                delete payload.capas;
                delete payload.ambientes;
                delete payload.dominios;
                delete payload.sistemasOperativos;
                delete payload.sistemas_operativos;
                delete payload.estatus;
                return fetch(`${process.env.BACKEND_URL}/api/servidores/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            });
            try {
                const responses = await Promise.all(promesas);
                const errores = responses.filter(res => !res.ok);
                if (errores.length > 0) throw new Error(`${errores.length} servidor(es) no se pudieron actualizar.`);
                Swal.fire('¡Guardado!', `${numCambios} servidor(es) han sido actualizados.`, 'success');
                setCambios({});
            } catch (error) {
                Swal.fire('Error', `Ocurrió un problema: ${error.message}`, 'error');
            } finally {
                setCargando(false);
            }
        }
    };

    // --- Renderizado de la Tabla y Controles ---
    const renderResultadosTabla = () => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentServidores = servidores.slice(indexOfFirstItem, indexOfLastItem);

        const columnas = [
            { header: 'Nombre', key: 'nombre' }, { header: 'Tipo', key: 'tipo' }, { header: 'IP', key: 'ip' },
            { header: 'Servicio', key: 'servicio_id', catalog: 'servicios' },
            { header: 'Capa', key: 'capa_id', catalog: 'capas' },
            { header: 'Ambiente', key: 'ambiente_id', catalog: 'ambientes' },
            { header: 'Balanceador', key: 'balanceador' },
            { header: 'VLAN', key: 'vlan' },
            { header: 'Dominio', key: 'dominio_id', catalog: 'dominios' },
            { header: 'S.O.', key: 'sistema_operativo_id', catalog: 'sistemasOperativos' },
            { header: 'Estatus', key: 'estatus_id', catalog: 'estatus' },
            { header: 'Descripción', key: 'descripcion' },
            { header: 'Link', key: 'link' }
        ];

        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        {columnas.map(c => <th key={c.key}>{c.header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {currentServidores.map((servidor, index) => {
                        const isModified = !!cambios[servidor.id];
                        const errorsInRow = validationErrors[servidor.id] || {};

                        return (
                            <tr key={servidor.id} className={isModified ? 'fila-modificada' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                {columnas.map(col => {
                                    let displayValue = servidor[col.key];
                                    if (col.catalog) {
                                        const found = catalogos[col.catalog]?.find(c => String(c.id) === String(displayValue));
                                        if (found) {
                                            displayValue = col.catalog === 'sistemasOperativos' ? `${found.nombre} - V${found.version}` : found.nombre;
                                        } else {
                                            displayValue = 'N/A';
                                        }
                                    }
                                    const hasError = !!errorsInRow[col.key];
                                    return (
                                        <td key={`${servidor.id}-${col.key}`} title={displayValue} className={hasError ? 'celda-con-error-validacion' : ''}>
                                            {displayValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    const renderBulkEditControls = () => {
        return (
            <div className="bulk-edit-controls">
                {columnasEditables.map(colKey => {
                    const colDef = opcionesColumnas.find(c => c.value === colKey);
                    if (!colDef) return null;

                    return (
                        <div key={colKey} className="bulk-edit-field">
                            <label>{colDef.label}:</label>
                            {colDef.type === 'input' ? (
                                <input
                                    type="text"
                                    className="form__input"
                                    value={bulkEditValues[colKey] || ''}
                                    onChange={(e) => handleBulkEditChange(colKey, e.target.value)}
                                />
                            ) : (
                                <BulkEditDropdown
                                    value={bulkEditValues[colKey] || ''}
                                    onChange={(value) => handleBulkEditChange(colKey, value)}
                                    options={colDef.options}
                                    catalog={colDef.catalog}
                                    catalogos={catalogos}
                                />
                            )}
                            <button className="btn btn--apply-bulk" onClick={() => handleApplyBulkEdit(colKey)}>
                                Aplicar
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    const PaginacionControles = () => {
        const totalPages = Math.ceil(servidores.length / itemsPerPage);
        return (
            <div className="pagination-controls">
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
        );
    };

    return (
        <div className="page-container">

            <div className="editor-masivo-container">
                <BusquedaFiltro
                    filtro={filtro} setFiltro={setFiltro}
                    buscarServidores={buscarServidores} cargando={cargando}
                    {...catalogos}
                />
                <div className="resultados-editor">
                    {cargando && <Loading />}
                    {!cargando && busquedaRealizada && (
                        <>
                            <header className="resultados-header">
                                <h2 className="resultados-titulo">Resultados de la Búsqueda</h2>
                                <span className="badge">{servidores.length} servidores encontrados</span>
                            </header>

                            {servidores.length > 0 ? (
                                <>
                                    <div className="editor-controles-superiores">
                                        <SelectorColumnasEditables
                                            opciones={opcionesColumnas}
                                            seleccionadas={columnasEditables}
                                            onChange={setColumnasEditables}
                                        />
                                        <button className="btn btn--primary" onClick={handleGuardarCambios} disabled={Object.keys(cambios).length === 0}>
                                            <Icon name="save" /> Guardar Cambios
                                        </button>
                                    </div>
                                    {columnasEditables.length > 0 && renderBulkEditControls()}
                                    <PaginacionControles />
                                    <div className="table-container">
                                        {renderResultadosTabla()}
                                    </div>
                                </>
                            ) : (
                                <div className="no-results-message"><p>No se encontraron servidores.</p></div>
                            )}
                        </>
                    )}
                    {!cargando && !busquedaRealizada && (
                        <div className="no-results-message"><p>Realiza una búsqueda para empezar a editar.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditorMasivo;
