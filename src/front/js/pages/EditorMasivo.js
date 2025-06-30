import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { BusquedaFiltro } from '../component/BusquedaFiltro'; // Asegúrate que la ruta es correcta
import Loading from '../component/Loading'; // Componente de carga que ya debes tener

// --- Iconos ---
const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);

const ColumnsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="12" y1="3" x2="12" y2="21"></line>
    </svg>
);

const ApplyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);


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
            <label className="selector-columnas-label">
                <ColumnsIcon />
                Columnas a editar:
            </label>
            <div className="custom-select">
                <button type="button" className="custom-select__trigger" onClick={() => setIsOpen(!isOpen)}>
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
    const [itemsPerPage, setItemsPerPage] = useState(10);

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
                    if (Array.isArray(filtro[key])) {
                        filtro[key].forEach(val => queryParams.append(key, val));
                    } else {
                        queryParams.append(key, filtro[key]);
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

    // --- Opciones de columnas dinámicas basadas en el número de servidores ---
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

    // --- Manejadores para la edición en lote ---
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
            confirmButtonColor: '#007953',
            cancelButtonColor: '#6c757d',
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

    // --- Guardar cambios en el backend ---
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
                        heightAuto: false,
                    });

                    const errorsMap = {};
                    errorData.detalles.forEach(detail => {
                        const valorEnConflictoMatch = detail.match(/'([^']+)'/);
                        if (!valorEnConflictoMatch) return;
                        const valorEnConflicto = valorEnConflictoMatch[1];

                        const servidorConError = servidores.find(srv =>
                            srv.nombre === valorEnConflicto ||
                            srv.ip === valorEnConflicto ||
                            srv.link === valorEnConflicto
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
            confirmButtonColor: '#007953', cancelButtonColor: '#6c757d',
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

    // --- Renderizado de los controles de edición en lote ---
    const renderBulkEditControls = () => (
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
                                value={bulkEditValues[colKey] || ''}
                                onChange={(e) => handleBulkEditChange(colKey, e.target.value)}
                            />
                        ) : (
                            <select
                                value={bulkEditValues[colKey] || ''}
                                onChange={(e) => handleBulkEditChange(colKey, e.target.value)}
                            >
                                <option value="" disabled>Seleccionar un valor...</option>
                                {(colDef.options || catalogos[colDef.catalog] || []).map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.nombre}</option>
                                ))}
                            </select>
                        )}
                        <button className="apply-bulk-btn" onClick={() => handleApplyBulkEdit(colKey)} title={`Aplicar a todos`}>
                            <ApplyIcon />
                        </button>
                    </div>
                );
            })}
        </div>
    );

    // --- Lógica y renderizado de paginación ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentServidores = servidores.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(servidores.length / itemsPerPage);

    const PaginacionControles = () => (
        <div className="paginacion-controles">
            <div className="items-por-pagina-selector">
                <label htmlFor="items-per-page">Servidores por página:</label>
                <select
                    id="items-per-page"
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
            <div className="navegacion-paginas">
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                    <ChevronLeftIcon />
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    <ChevronRightIcon />
                </button>
            </div>
        </div>
    );

    // --- Renderizado de la tabla de resultados ---
    const renderResultadosTabla = () => {
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
            <div className="editor-tabla-container">
                <table className="editor-tabla">
                    <thead>
                        <tr>
                            <th className="columna-numero">#</th>
                            {columnas.map(c => <th key={c.key}>{c.header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {currentServidores.map((servidor, index) => {
                            const isModified = !!cambios[servidor.id];
                            const errorsInRow = validationErrors[servidor.id] || {};

                            return (
                                <tr key={servidor.id} className={isModified ? 'fila-modificada' : ''}>
                                    <td className="columna-numero">{indexOfFirstItem + index + 1}</td>
                                    {columnas.map(col => {
                                        let displayValue = servidor[col.key];
                                        if (col.catalog) {
                                            const found = catalogos[col.catalog]?.find(c => String(c.id) === String(displayValue));
                                            displayValue = found ? found.nombre : 'N/A';
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
            </div>
        );
    };

    return (
        <div className="page-container">
            <div className="editor-hero-section">
                <div className="title-section">
                    <div className="decorative-line-top"></div>
                    <h1 className="main-title">Editor Masivo de Servidores</h1>
                    <p className="subtitle">"Filtra y modifica múltiples servidores a la vez"</p>
                    <div className="decorative-line-bottom"></div>
                </div>
            </div>

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
                            <div className="resultados-header">
                                <h2 className="resultados-titulo">Resultados de la Búsqueda</h2>
                                <span className="servidores-contador">{servidores.length} {servidores.length === 1 ? 'servidor encontrado' : 'servidores encontrados'}</span>
                            </div>

                            {servidores.length > 0 ? (
                                <>
                                    <div className="editor-controles-superiores">
                                        <SelectorColumnasEditables
                                            opciones={opcionesColumnas} seleccionadas={columnasEditables}
                                            onChange={setColumnasEditables}
                                        />
                                        <div className="editor-acciones">
                                            <button className="guardar-cambios-btn" onClick={handleGuardarCambios} disabled={Object.keys(cambios).length === 0}>
                                                <SaveIcon /> Guardar Cambios
                                            </button>
                                        </div>
                                    </div>

                                    {columnasEditables.length > 0 && renderBulkEditControls()}

                                    <PaginacionControles />
                                    {renderResultadosTabla()}
                                </>
                            ) : (
                                <div className="no-resultados"><p>No se encontraron servidores con los filtros seleccionados.</p></div>
                            )}
                        </>
                    )}
                    {!cargando && !busquedaRealizada && (
                        <div className="no-resultados"><p>Realiza una búsqueda para empezar a editar.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditorMasivo;
