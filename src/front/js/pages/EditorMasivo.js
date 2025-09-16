import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { BusquedaFiltro } from '../component/BusquedaFiltro';
import Loading from '../component/Loading';
import Icon from '../component/Icon';

// --- Funciones de Exportación y Auxiliares ---
const abrirModalLink = (servidor) => {
    if (!servidor || !servidor.link) {
        Swal.fire({
            icon: 'info',
            title: 'Sin Enlace',
            text: `El servidor "${servidor.nombre}" no tiene un enlace asociado.`,
            confirmButtonColor: "var(--color-primario)",
        });
        return;
    }

    Swal.fire({
        title: "Información del Enlace",
        html: `
            <div style="text-align: left; padding: 0 1rem;">
                <p><strong>Servidor:</strong> ${servidor.nombre || "No disponible"}</p>
                <p><strong>Descripción:</strong> ${servidor.descripcion || "No disponible"}</p>
                <p><strong>Enlace:</strong> <a href="${servidor.link}" target="_blank" rel="noopener noreferrer">${servidor.link}</a></p>
            </div>
        `,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "var(--color-primario)",
    });
};

const exportarCSV = (servidores) => {
    if (!servidores.length) return;
    const encabezados = `"Nombre";"Tipo";"IP MGMT";"IP Real";"IP Mask/25";"Servicio";"Ecosistema";"Aplicaciones";"Capa";"Ambiente";"Balanceador";"VLAN";"Dominio";"S.O.";"Estatus";"Descripción";"Link"\n`;
    const filas = servidores.map(srv => {
        // Aplicaciones
        let aplicaciones = '';
        if (Array.isArray(srv.aplicaciones) && srv.aplicaciones.length > 0) {
            aplicaciones = srv.aplicaciones.map(app => `${app.nombre} V${app.version}`).join(', ');
        }
        // Capa
        let capa = srv.capa?.nombre || srv.capas?.[0]?.nombre || '';
        // Dominio
        let dominio = srv.dominio?.nombre || srv.dominios?.[0]?.nombre || '';
        // S.O.
        let so = '';
        if (srv.sistema_operativo) {
            so = `${srv.sistema_operativo.nombre} - V${srv.sistema_operativo.version}`;
        } else if (srv.sistemasOperativos?.[0]) {
            so = `${srv.sistemasOperativos[0].nombre} - V${srv.sistemasOperativos[0].version}`;
        }
        // Estatus
        let estatus = srv.estatus?.nombre || srv.estatus?.[0]?.nombre || '';
        // Descripción
        let descripcion = srv.descripcion || '';
        // Link
        let link = srv.link || '';
        // Ecosistema
        let ecosistema = srv.ecosistema?.nombre || srv.ecosistemas?.[0]?.nombre || '';
        // Servicio
        let servicio = srv.servicio?.nombre || srv.servicios?.[0]?.nombre || '';
        // Ambiente
        let ambiente = srv.ambiente?.nombre || srv.ambientes?.[0]?.nombre || '';
        return `"${srv.nombre || ''}";"${srv.tipo || ''}";` +
            `"${srv.ip_mgmt || ''}";"${srv.ip_real || ''}";"${srv.ip_mask25 || ''}";` +
            `"${servicio}";` +
            `"${ecosistema}";` +
            `"${aplicaciones}";` +
            `"${capa}";"${ambiente}";"${srv.balanceador || ''}";"${srv.vlan || ''}";` +
            `"${dominio}";"${so}";"${estatus}";"${descripcion}";` +
            `"${link}"`;
    }).join("\n");
    const csvContent = `data:text/csv;charset=utf-8,\uFEFF${encodeURI(encabezados + filas)}`;
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "servidores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const exportarExcel = (servidores) => {
    if (!servidores.length) return;
    const estilos = `
        <style>
            body { font-family: Arial, sans-serif; }
            .excel-table { border-collapse: collapse; width: 100%; font-size: 12px; }
            .excel-table th, .excel-table td { border: 1px solid #cccccc; padding: 8px; text-align: center; vertical-align: middle; }
            .excel-table th { background-color: #005A9C; color: #FFFFFF; font-weight: bold; }
            .excel-table tr:nth-child(even) { background-color: #f2f2f2; }
            .header-table { border-collapse: collapse; width: 100%; margin-bottom: 25px; }
            .header-table td { border: none; vertical-align: middle; text-align: left; }
            .main-title { color: #000000; font-size: 28px; font-weight: bold; margin: 0; padding: 0; }
            .sub-title { color: #005A9C; font-size: 14px; font-style: italic; margin: 0; padding: 0; }
        </style>
    `;
    const encabezados = `<tr><th>Nombre</th><th>Tipo</th><th>IP MGMT</th><th>IP Real</th><th>IP Mask/25</th><th>Servicio</th><th>Ecosistema</th><th>Aplicaciones</th><th>Capa</th><th>Ambiente</th><th>Balanceador</th><th>VLAN</th><th>Dominio</th><th>S.O.</th><th>Estatus</th><th>Descripción</th><th>Link</th></tr>`;
    const filas = servidores.map(srv => {
        // Servicio
        let servicio = srv.servicio?.nombre || (srv.servicios && Array.isArray(srv.servicios) && srv.servicios.length > 0 ? srv.servicios[0].nombre : 'N/A');
        // Capa
        let capa = srv.capa?.nombre || (srv.capas && Array.isArray(srv.capas) && srv.capas.length > 0 ? srv.capas[0].nombre : 'N/A');
        // Ambiente
        let ambiente = srv.ambiente?.nombre || (srv.ambientes && Array.isArray(srv.ambientes) && srv.ambientes.length > 0 ? srv.ambientes[0].nombre : 'N/A');
        // Dominio
        let dominio = srv.dominio?.nombre || (srv.dominios && Array.isArray(srv.dominios) && srv.dominios.length > 0 ? srv.dominios[0].nombre : 'N/A');
        // Estatus
        let estatus = srv.estatus?.nombre || (srv.estatus && Array.isArray(srv.estatus) && srv.estatus.length > 0 ? srv.estatus[0].nombre : 'N/A');
        // S.O.
        let so = '';
        if (srv.sistema_operativo) {
            so = `${srv.sistema_operativo.nombre} - V${srv.sistema_operativo.version}`;
        } else if (srv.sistemasOperativos && Array.isArray(srv.sistemasOperativos) && srv.sistemasOperativos.length > 0) {
            so = `${srv.sistemasOperativos[0].nombre} - V${srv.sistemasOperativos[0].version}`;
        } else {
            so = 'N/A';
        }
        // Aplicaciones
        let aplicaciones = '';
        if (Array.isArray(srv.aplicaciones) && srv.aplicaciones.length > 0) {
            aplicaciones = srv.aplicaciones.map(app => `${app.nombre} V${app.version}`).join(', ');
        } else {
            aplicaciones = 'N/A';
        }
        // Ecosistema
        let ecosistema = srv.ecosistema?.nombre || (srv.ecosistemas && Array.isArray(srv.ecosistemas) && srv.ecosistemas.length > 0 ? srv.ecosistemas[0].nombre : 'N/A');
        return `<tr>
            <td>${srv.nombre || 'N/A'}</td>
            <td>${srv.tipo || 'N/A'}</td>
            <td>${srv.ip_mgmt || 'N/A'}</td>
            <td>${srv.ip_real || 'N/A'}</td>
            <td>${srv.ip_mask25 || 'N/A'}</td>
            <td>${servicio}</td>
            <td>${ecosistema}</td>
            <td>${aplicaciones}</td>
            <td>${capa}</td>
            <td>${ambiente}</td>
            <td>${srv.balanceador || 'N/A'}</td>
            <td>${srv.vlan || 'N/A'}</td>
            <td>${dominio}</td>
            <td>${so}</td>
            <td>${estatus}</td>
            <td>${srv.descripcion || 'N/A'}</td>
            <td>${srv.link || 'N/A'}</td>
        </tr>`;
    }).join("");
    const plantillaHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8">${estilos}</head><body><table class="header-table"><tr><td colspan="14"><h1 class="main-title">Reporte de Servidores</h1></td></tr><tr><td colspan="14"><p class="sub-title">(Gerencia de Operaciones de Canales Virtuales y Medios de Pagos)</p></td></tr></table><table class="excel-table">${encabezados}${filas}</table></body></html>`;
    const excelContent = `data:application/vnd.ms-excel;charset=utf-8,${encodeURIComponent(plantillaHtml)}`;
    const link = document.createElement("a");
    link.setAttribute("href", excelContent);
    link.setAttribute("download", "Reporte_Servidores.xls");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- Componentes Internos ---
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
    const displayLabel = selectedOption ? ((catalog === 'sistemasOperativos' || catalog === 'aplicaciones') ? `${selectedOption.nombre} - V${selectedOption.version}` : selectedOption.nombre) : "Seleccionar un valor...";

    return (
        <div className="custom-select" ref={dropdownRef} style={{ flexGrow: 1 }}>
            <button type="button" className="form__input custom-select__trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{displayLabel}</span>
                <div className={`chevron ${isOpen ? "open" : ""}`}></div>
            </button>
            <div className={`custom-select__panel ${isOpen ? "open" : ""}`}>
                {displayOptions.map(opt => (
                    <label
                        key={opt.id}
                        className={`custom-select__option ${String(value) === String(opt.id) ? 'selected' : ''}`}
                    >
                        <input
                            type="radio"
                            name={`bulk-edit-${catalog}`}
                            value={opt.id}
                            checked={String(value) === String(opt.id)}
                            onChange={() => handleSelect(String(opt.id))}
                        />
                        <span>
                            {(catalog === 'sistemasOperativos' || catalog === 'aplicaciones') ? `${opt.nombre} - V${opt.version}` : opt.nombre}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
};

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


const EditorMasivo = () => {
    const [filtro, setFiltro] = useState({
        nombre: '', ip: '', balanceador: '', vlan: '', descripcion: '', link: '',
        tipo: [], servicios: [], capas: [], ambientes: [], dominios: [], sistemasOperativos: [], estatus: [], ecosistemas: []
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
        servicios: [], capas: [], ambientes: [], dominios: [], sistemasOperativos: [], estatus: [], ecosistemas: [], aplicaciones: []
    });
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const exportMenuRef = useRef(null);
    const resultadosRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                    { name: "estatus", url: `${backendUrl}/api/estatus` },
                    { name: "ecosistemas", url: `${backendUrl}/api/ecosistemas` },
                    { name: "aplicaciones", url: `${backendUrl}/api/aplicaciones` }
                ];
                const responses = await Promise.all(urls.map(async item => {
                    try {
                        const res = await fetch(item.url);
                        if (!res.ok) {
                            throw new Error(`HTTP ${res.status} al cargar ${item.name}`);
                        }
                        const contentType = res.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            return await res.json();
                        } else {
                            throw new Error(`Respuesta no es JSON para ${item.name}`);
                        }
                    } catch (err) {
                        console.error(`Error al cargar catálogo ${item.name}:`, err);
                        return [];
                    }
                }));
                setCatalogos({
                    servicios: responses[0] || [], capas: responses[1] || [], ambientes: responses[2] || [],
                    dominios: responses[3] || [], sistemasOperativos: responses[4] || [], estatus: responses[5] || [],
                    ecosistemas: responses[6] || [], aplicaciones: responses[7] || []
                });
            } catch (error) {
                console.error("Error al cargar catálogos:", error);
                Swal.fire("Error", "No se pudieron cargar los catálogos para los filtros.", "error");
            }
        };
        fetchCatalogos();
    }, []);

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
                    let backendKey = key;
                    if (key === 'sistemasOperativos') backendKey = 'sistemas_operativos';
                    if (key === 'aplicaciones') backendKey = 'aplicaciones';
                    if (Array.isArray(filtro[key])) {
                        filtro[key].forEach(val => queryParams.append(backendKey, val));
                    } else {
                        queryParams.append(backendKey, filtro[key]);
                    }
                }
            }
            if (filtro.busquedaExacta) {
                queryParams.append('busquedaExacta', 'true');
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
            setTimeout(() => {
                resultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    const opcionesColumnas = [
        { value: 'nombre', label: 'Nombre', type: 'input', disabled: servidores.length > 1 },
        { value: 'tipo', label: 'Tipo', type: 'select', options: [{ id: 'VIRTUAL', nombre: 'Virtual' }, { id: 'FISICO', nombre: 'Físico' }] },
        { value: 'ip_mgmt', label: 'IP MGMT', type: 'input', disabled: servidores.length > 1 },
        { value: 'ip_real', label: 'IP Real', type: 'input', disabled: servidores.length > 1 },
        { value: 'ip_mask25', label: 'IP Mask/25', type: 'input', disabled: servidores.length > 1 },
        { value: 'balanceador', label: 'Balanceador', type: 'input' },
        { value: 'vlan', label: 'VLAN', type: 'input' },
        { value: 'link', label: 'Link', type: 'input', disabled: servidores.length > 1 },
        { value: 'descripcion', label: 'Descripción', type: 'input' },
        { value: 'servicio_id', label: 'Servicio', type: 'select', catalog: 'servicios' },
        { value: 'ecosistema_id', label: 'Ecosistema', type: 'select', catalog: 'ecosistemas' },
        { value: 'aplicacion_id', label: 'Aplicaciones', type: 'select', catalog: 'aplicaciones' },
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
        const isIpField = ['ip_mgmt', 'ip_real', 'ip_mask25'].includes(campo);

        if (!isIpField && (valor === undefined || valor === '')) {
            Swal.fire("Valor no válido", "Por favor, selecciona un valor para aplicar.", "warning");
            return;
        }

        if (isIpField && valor === '') {
            const servidoresSinIp = servidores.filter(servidor => {
                const otrasIps = ['ip_mgmt', 'ip_real', 'ip_mask25'].filter(key => key !== campo);
                const tieneOtrasIps = otrasIps.some(key => {
                    const cambioActual = cambios[servidor.id] && cambios[servidor.id][key] !== undefined ? cambios[servidor.id][key] : servidor[key];
                    return cambioActual && cambioActual.trim() !== '';
                });
                return !tieneOtrasIps;
            });

            if (servidoresSinIp.length > 0) {
                const nombresServidores = servidoresSinIp.map(s => s.nombre).join(', ');
                Swal.fire("Acción no permitida", `No se puede dejar el servidor sin ninguna IP. Los siguientes servidores quedarían sin IP: ${nombresServidores}`, "error");
                return;
            }
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
                const cambiosPrevios = nuevosCambios[servidor.id] || {};
                nuevosCambios[servidor.id] = { ...cambiosPrevios, [campo]: valor };

                // Actualizar el estado local del servidor para reflejar en la tabla
                let servidorActualizado = { ...servidor, [campo]: valor };

                if (campo === 'aplicacion_id') {
                    const aplicacionSeleccionada = catalogos.aplicaciones.find(a => String(a.id) === String(valor));
                    servidorActualizado.aplicaciones = aplicacionSeleccionada ? [aplicacionSeleccionada] : [];
                }

                return servidorActualizado;
            });

            setServidores(servidoresActualizados);
            setCambios(nuevosCambios);
            setValidationErrors({});

            Swal.fire("Aplicado", `El campo "${campoLabel}" ha sido actualizado en la vista previa.`, "success");
        }
    };

    const handleEliminarServidor = async (servidorParaEliminar) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `El servidor "${servidorParaEliminar.nombre}" será eliminado permanentemente. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-error)',
            cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${process.env.BACKEND_URL}/api/servidores/${servidorParaEliminar.id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.msg || errorData.error || 'Error al eliminar');
                }

                Swal.fire('¡Eliminado!', 'El servidor ha sido eliminado permanentemente.', 'success');
                setServidores(prev => prev.filter(s => s.id !== servidorParaEliminar.id));
                setCambios(prev => { const newCambios = { ...prev }; delete newCambios[servidorParaEliminar.id]; return newCambios; });
            } catch (error) {
                Swal.fire('Error', `Ocurrió un problema: ${error.message}`, 'error');
            }
        }
    };

    const handleGuardarCambios = async () => {
        setValidationErrors({});
        const numCambios = Object.keys(cambios).length;
        if (numCambios === 0) {
            Swal.fire("Sin cambios", "No se ha modificado ningún servidor.", "info");
            return;
        }

        // 1. Validar que al menos una IP esté presente por servidor modificado
        const servidoresSinIp = [];
        for (const id in cambios) {
            const servidorOriginal = servidores.find(s => s.id === parseInt(id, 10));
            const cambiosParaServidor = cambios[id] || {};

            const ip_mgmt = cambiosParaServidor.ip_mgmt ?? servidorOriginal.ip_mgmt;
            const ip_real = cambiosParaServidor.ip_real ?? servidorOriginal.ip_real;
            const ip_mask25 = cambiosParaServidor.ip_mask25 ?? servidorOriginal.ip_mask25;

            if (!ip_mgmt && !ip_real && !ip_mask25) {
                servidoresSinIp.push(servidorOriginal.nombre);
            }
        }

        if (servidoresSinIp.length > 0) {
            Swal.fire(
                "Validación fallida",
                `Los siguientes servidores deben tener al menos una IP: ${servidoresSinIp.join(", ")}`,
                "error"
            );
            return;
        }

        // 2. Validar unicidad de campos en el backend
        const validaciones = [];
        for (const id in cambios) {
            const cambio = cambios[id];
            if (cambio.nombre || cambio.ip_mgmt || cambio.ip_real || cambio.ip_mask25 || cambio.link) {
                validaciones.push({
                    id: parseInt(id, 10),
                    nombre: cambio.nombre,
                    ip_mgmt: cambio.ip_mgmt,
                    ip_real: cambio.ip_real,
                    ip_mask25: cambio.ip_mask25,
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
                        text: 'Por favor, revise los campos marcados en rojo. Hay datos duplicados.',
                    });
                    const errorsMap = {};
                    errorData.detalles.forEach(detail => {
                        const valorEnConflictoMatch = detail.match(/'([^']+)'/);
                        if (!valorEnConflictoMatch) return;
                        const valorEnConflicto = valorEnConflictoMatch[1];

                        const servidorConError = servidores.find(srv => {
                            const srvCambios = cambios[srv.id] || {};
                            return (srvCambios.nombre ?? srv.nombre) === valorEnConflicto ||
                                (srvCambios.ip_mgmt ?? srv.ip_mgmt) === valorEnConflicto ||
                                (srvCambios.ip_real ?? srv.ip_real) === valorEnConflicto ||
                                (srvCambios.ip_mask25 ?? srv.ip_mask25) === valorEnConflicto ||
                                (srvCambios.link ?? srv.link) === valorEnConflicto;
                        });

                        if (servidorConError) {
                            if (!errorsMap[servidorConError.id]) {
                                errorsMap[servidorConError.id] = {};
                            }
                            if (detail.includes('nombre')) errorsMap[servidorConError.id].nombre = true;
                            if (detail.includes('IP MGMT')) errorsMap[servidorConError.id].ip_mgmt = true;
                            if (detail.includes('IP Real')) errorsMap[servidorConError.id].ip_real = true;
                            if (detail.includes('IP Mask/25')) errorsMap[servidorConError.id].ip_mask25 = true;
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
            const promesas = Object.keys(cambios).map(async id => {
                const servidorOriginal = servidores.find(s => s.id === parseInt(id, 10));
                const cambiosParaServidor = cambios[id];
                // Solo enviar los campos editables y requeridos
                const payload = {
                    id: servidorOriginal.id,
                    nombre: cambiosParaServidor.nombre ?? servidorOriginal.nombre,
                    tipo: cambiosParaServidor.tipo ?? servidorOriginal.tipo,
                    ip_mgmt: cambiosParaServidor.hasOwnProperty('ip_mgmt') ? cambiosParaServidor.ip_mgmt : servidorOriginal.ip_mgmt,
                    ip_real: cambiosParaServidor.hasOwnProperty('ip_real') ? cambiosParaServidor.ip_real : servidorOriginal.ip_real,
                    ip_mask25: cambiosParaServidor.hasOwnProperty('ip_mask25') ? cambiosParaServidor.ip_mask25 : servidorOriginal.ip_mask25,
                    balanceador: cambiosParaServidor.balanceador ?? servidorOriginal.balanceador,
                    vlan: cambiosParaServidor.vlan ?? servidorOriginal.vlan,
                    link: cambiosParaServidor.link ?? servidorOriginal.link,
                    descripcion: cambiosParaServidor.descripcion ?? servidorOriginal.descripcion,
                    servicio_id: cambiosParaServidor.servicio_id ?? servidorOriginal.servicio_id,
                    ecosistema_id: cambiosParaServidor.ecosistema_id ?? servidorOriginal.ecosistema_id,
                    capa_id: cambiosParaServidor.capa_id ?? servidorOriginal.capa_id,
                    ambiente_id: cambiosParaServidor.ambiente_id ?? servidorOriginal.ambiente_id,
                    dominio_id: cambiosParaServidor.dominio_id ?? servidorOriginal.dominio_id,
                    sistema_operativo_id: cambiosParaServidor.sistema_operativo_id ?? servidorOriginal.sistema_operativo_id,
                    aplicacion_ids: cambiosParaServidor.aplicacion_id ? [cambiosParaServidor.aplicacion_id] : (servidorOriginal.aplicaciones?.map(a => a.id) || []),
                    estatus_id: cambiosParaServidor.estatus_id ?? servidorOriginal.estatus_id,
                    activo: servidorOriginal.activo,
                };
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/servidores/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    return response.ok;
                } catch (err) {
                    return false;
                }
            });
            try {
                const results = await Promise.all(promesas);
                const errores = results.filter(ok => !ok);
                if (errores.length > 0) throw new Error(`${errores.length} servidor(es) no se pudieron actualizar.`);

                Swal.fire({
                    icon: 'success',
                    title: `¡${numCambios} servidor(es) actualizados!`,
                });

                setCambios({});
            } catch (error) {
                Swal.fire('Error', `Ocurrió un problema: ${error.message}`, 'error');
            } finally {
                setCargando(false);
            }
        }
    };

    const renderResultadosTabla = () => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentServidores = servidores.slice(indexOfFirstItem, indexOfLastItem);

        const columnas = [
            { header: 'Nombre', key: 'nombre' },
            { header: 'Tipo', key: 'tipo' },
            { header: 'IP MGMT', key: 'ip_mgmt' },
            { header: 'IP Real', key: 'ip_real' },
            { header: 'IP Mask/25', key: 'ip_mask25' },
            { header: 'Servicio', key: 'servicio_id', catalog: 'servicios' },
            { header: 'Ecosistema', key: 'ecosistema_id', catalog: 'ecosistemas' },
            { header: 'Aplicaciones', key: 'aplicaciones' },
            { header: 'Capa', key: 'capa_id', catalog: 'capas' },
            { header: 'Ambiente', key: 'ambiente_id', catalog: 'ambientes' },
            { header: 'Balanceador', key: 'balanceador' },
            { header: 'VLAN', key: 'vlan' },
            { header: 'Dominio', key: 'dominio_id', catalog: 'dominios' },
            { header: 'S.O.', key: 'sistema_operativo_id', catalog: 'sistemasOperativos' },
            { header: 'Estatus', key: 'estatus_id', catalog: 'estatus' },
            { header: 'Descripción', key: 'descripcion' },
            { header: 'Link', key: 'link' },
            { header: 'Acciones', key: 'acciones' }
        ];

        return (
            <table className="table">
                <thead>
                    <tr>
                        <th style={{ textAlign: 'center' }}>#</th>
                        {columnas.map(c => <th key={c.key} style={{ textAlign: 'center' }}>{c.header}</th>)}
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
                                    if (col.key === 'link') {
                                        return (
                                            <td key={`${servidor.id}-link`}>
                                                <button className="btn-icon" onClick={() => abrirModalLink(servidor)} title="Ver detalles y enlace" disabled={!servidor.link}>
                                                    <Icon name="visibility" />
                                                </button>
                                            </td>
                                        );
                                    }
                                    if (col.key === 'acciones') {
                                        return (
                                            <td key={`${servidor.id}-acciones`}>
                                                <button className="btn-icon" onClick={() => handleEliminarServidor(servidor)} title="Eliminar servidor">
                                                    <Icon name="trash" />
                                                </button>
                                            </td>
                                        );
                                    }
                                    let displayValue = servidor[col.key];
                                    // Para las IPs, mostrar N/A si no hay valor
                                    if (["ip_mgmt", "ip_real", "ip_mask25"].includes(col.key)) {
                                        displayValue = displayValue || 'N/A';
                                    }
                                    if (col.catalog) {
                                        const found = catalogos[col.catalog]?.find(c => String(c.id) === String(displayValue));
                                        displayValue = found ? (col.catalog === 'sistemasOperativos' ? `${found.nombre} - V${found.version}` : found.nombre) : 'N/A';
                                    }
                                    if (col.key === 'aplicaciones') {
                                        const apps = servidor.aplicaciones || [];
                                        if (servidor.aplicacion_id && apps.length === 0) {
                                            const appFromCatalog = catalogos.aplicaciones.find(a => String(a.id) === String(servidor.aplicacion_id));
                                            if (appFromCatalog) {
                                                apps.push(appFromCatalog);
                                            }
                                        }
                                        displayValue = apps.length > 0 ? apps.map(a => `${a.nombre} - V${a.version}`).join(', ') : 'N/A';
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
                    filtro={filtro}
                    setFiltro={setFiltro}
                    buscarServidores={buscarServidores}
                    cargando={cargando}
                    servicios={catalogos.servicios}
                    capas={catalogos.capas}
                    ambientes={catalogos.ambientes}
                    dominios={catalogos.dominios}
                    sistemasOperativos={catalogos.sistemasOperativos}
                    estatus={catalogos.estatus}
                    ecosistemas={catalogos.ecosistemas}
                    aplicaciones={catalogos.aplicaciones}
                />
                <div className="resultados-editor" ref={resultadosRef}>
                    {cargando && <Loading />}
                    {!cargando && busquedaRealizada && (
                        <>
                            <header className="resultados-header">
                                <h2 className="resultados-titulo">Resultados de la Búsqueda</h2>
                                <span className="badge">{servidores.length} servidores encontrados</span>
                            </header>

                            {servidores.length > 0 ? (
                                <>
                                    <div className="editor-top-actions">
                                        <div className="export-dropdown-container" ref={exportMenuRef}>
                                            <button className="btn btn--primary" onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}>
                                                <Icon name="upload" /> Descargar
                                            </button>
                                            {isExportMenuOpen && (
                                                <div className="export-menu">
                                                    <button className="export-menu-item" onClick={() => { exportarCSV(servidores); setIsExportMenuOpen(false); }}>
                                                        <Icon name="csv" size={16} /> Exportar como CSV
                                                    </button>
                                                    <button className="export-menu-item" onClick={() => { exportarExcel(servidores); setIsExportMenuOpen(false); }}>
                                                        <Icon name="file-excel" size={16} /> Exportar como Excel
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <button className="btn btn--primary" onClick={() => setIsEditMode(true)} disabled={isEditMode}>
                                            <Icon name="edit" /> Editar
                                        </button>
                                    </div>

                                    {isEditMode && (
                                        <div className="editor-panel">
                                            <SelectorColumnasEditables
                                                opciones={opcionesColumnas}
                                                seleccionadas={columnasEditables}
                                                onChange={setColumnasEditables}
                                            />
                                            {columnasEditables.length > 0 && renderBulkEditControls()}
                                            <div className="editor-panel__actions">
                                                <button className="btn btn--secondary" onClick={() => setIsEditMode(false)}>
                                                    Cancelar
                                                </button>
                                                <button className="btn btn--primary" onClick={handleGuardarCambios} disabled={Object.keys(cambios).length === 0}>
                                                    <Icon name="save" /> Guardar Cambios
                                                </button>
                                            </div>
                                        </div>
                                    )}

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
