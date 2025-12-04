import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { BusquedaFiltro } from '../component/BusquedaFiltro';
import Loading from '../component/Loading';
import Icon from '../component/Icon';
import SelectorColumnasEditables from '../component/SelectorColumnasEditables';
import BulkEditDropdown from '../component/BulkEditDropdown';
import ItemsPerPageDropdown from '../component/ItemsPerPageDropdown'; // (si se usa directamente en otros componentes)
import BulkEditControls from '../component/BulkEditControls';
// IMPORTS NUEVOS:
import EditorPagination from '../component/EditorPagination';
import { exportarCSV, exportarExcel, abrirModalLink } from '../component/ExportHelpers';

// --- Componentes Internos ---
const EditorMasivo = () => {
    const [filtro, setFiltro] = useState({
        nombre: '', ip: '', balanceador: '', descripcion: '', link: '',
        vlan_mgmt: '', vlan_real: '',
        tipo: [], servicios: [], capas: [], ambientes: [], dominios: [], sistemasOperativos: [], estatus: [], ecosistemas: []
    });
    // Ids seleccionados para eliminación múltiple
    const [seleccionados, setSeleccionados] = useState(new Set());
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

    // Cerrar el menú de exportación cuando se haga clic fuera o se presione Escape
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (!isExportMenuOpen) return;
            const el = exportMenuRef.current;
            if (el && !el.contains(e.target)) {
                setIsExportMenuOpen(false);
            }
        };
        const handleKey = (e) => {
            if (e.key === 'Escape' && isExportMenuOpen) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [isExportMenuOpen, exportMenuRef]);

    // Estado para ordenamiento
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Añadir estado y ref para controlar selects inline personalizados
    const [openEditorSelectKey, setOpenEditorSelectKey] = useState(null); // forma: `${id}_${key}`
    const editorSelectRef = useRef(null);

    // Helper para auth
    const getAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };
    const getAuthRole = () => localStorage.getItem('auth_role') || null;

    useEffect(() => {
        function onAuthChanged() {
            const role = getAuthRole();
            setUserRole(role);
            // Si la sesión se cerró (no hay role), cerrar modo edición y limpiar selecciones/menus asociados
            if (!role) {
                setIsEditMode(false);
                setIsExportMenuOpen(false);
                setSeleccionados(new Set());
            }
        }
        window.addEventListener('authChanged', onAuthChanged);
        return () => window.removeEventListener('authChanged', onAuthChanged);
    }, []);

    const [userRole, setUserRole] = useState(getAuthRole());

    // Router + helper para manejar expiración/401
    const navigate = useNavigate();
    const handleAuthExpired = () => {
        // Limpiar credenciales locales y notificar al resto de la app
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_role');
        localStorage.removeItem('auth_user');
        window.dispatchEvent(new Event('authChanged'));
        Swal.fire({
            icon: 'warning',
            title: 'Sesión expirada',
            text: 'Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión de nuevo.',
            confirmButtonColor: 'var(--color-primario)'
        }).then(() => {
            try { navigate('/login'); } catch (e) { /* navegación opcional */ }
        });
    };

    // Estado y helpers para edición inline en la tabla
    const [editingCell, setEditingCell] = useState(null); // { id, key, value } o null
    // Añadir ref para evitar closures que lean editingCell cuando es null
    const editingCellRef = useRef(null);
    useEffect(() => { editingCellRef.current = editingCell; }, [editingCell]);

    // Snapshot de los servidores tal como vinieron del backend (para comparaciones "original vs edit")
    const originalSnapshotRef = useRef({});

    // startEditCell: marcar la fila como "editando" y guardar la columna concreta en __editingKey
    const startEditCell = (servidor, key) => {
        if (!userRole || !['GERENTE', 'ESPECIALISTA'].includes(userRole)) return;
        const immutableCols = ['link']; // columnas no editables inline
        if (immutableCols.includes(key)) return;
        const current = servidor && (servidor[key] === null || servidor[key] === undefined) ? '' : String(servidor[key]);

        // Marcar la fila como editando y registrar la columna específica
        setServidores(prev => prev.map(s => ({
            ...s,
            __editing: s.id === servidor.id,
            __editingKey: s.id === servidor.id ? key : undefined
        })));
        setEditingCell({ id: servidor.id, key, value: current });

        // Si la columna es select según opcionesColumnas, abrir el panel inline
        const colDef = opcionesColumnas.find(o => o.value === key);
        if (colDef && colDef.type === 'select') {
            setOpenEditorSelectKey(`${servidor.id}_${key}`);
        } else {
            setOpenEditorSelectKey(null);
        }
    };

    // cancelEditing: limpiar marca de edición y resetear editingCell (incluye __editingKey)
    const cancelEditing = () => {
        setEditingCell(null);
        setServidores(prev => prev.map(s => ({ ...s, __editing: false, __editingKey: undefined })));
    };

    // Añadir función para validar un único cambio inline antes de aplicarlo
    const validateInlineChange = (servidorId, key, rawValue) => {
        const norm = v => (v === null || v === undefined) ? "" : String(v).trim();
        const value = rawValue === null || rawValue === undefined ? "" : String(rawValue).trim();

        // Reconstruir snapshot con cambios actuales + el cambio propuesto
        const merged = servidores.map(s => {
            const c = cambios[s.id] || {};
            const copy = { ...s, ...c };
            if (s.id === servidorId) copy[key] = value === "" ? null : value;
            return copy;
        });

        const target = merged.find(m => m.id === servidorId);
        if (!target) return { [key]: 'Registro no encontrado' };

        const errors = {};

        // Campos requeridos básicos (si el cambio afecta a uno de ellos y lo deja vacío)
        const requiredFields = ["nombre", "tipo", "servicio_id", "capa_id", "ambiente_id", "dominio_id", "sistema_operativo_id", "estatus_id", "balanceador"];
        if (requiredFields.includes(key) && !norm(target[key])) {
            errors[key] = 'Este campo es obligatorio.';
            return errors;
        }

        // Validación: al menos una IP presente en el servidor después del cambio
        const ipMgmt = norm(target.ip_mgmt);
        const ipReal = norm(target.ip_real);
        const ipMask = norm(target.ip_mask25);
        if (!ipMgmt && !ipReal && !ipMask) {
            errors.ip_mgmt = "Debe ingresar al menos una IP.";
            errors.ip_real = "Debe ingresar al menos una IP.";
            errors.ip_mask25 = "Debe ingresar al menos una IP.";
            return errors;
        }

        // Duplicados internos entre sus propias IPs
        const ips = [ipMgmt, ipReal, ipMask].filter(Boolean);
        const counts = ips.reduce((acc, ip) => (acc[ip] = (acc[ip] || 0) + 1, acc), {});
        if (ipMgmt && counts[ipMgmt] > 1) errors.ip_mgmt = "IP repetida en otro campo.";
        if (ipReal && counts[ipReal] > 1) errors.ip_real = "IP repetida en otro campo.";
        if (ipMask && counts[ipMask] > 1) errors.ip_mask25 = "IP repetida en otro campo.";

        // Unicidad frente a otros servidores (merged) - comprobar solo contra servidores distintos
        for (const other of merged) {
            if (other.id === target.id) continue;
            // Nombre
            if (norm(other.nombre) && norm(other.nombre).toLowerCase() === norm(target.nombre).toLowerCase()) {
                errors.nombre = 'Este nombre ya está en uso.';
            }
            // Link
            if (norm(other.link) && norm(other.link) === norm(target.link)) {
                errors.link = 'Este link ya está en uso.';
            }
            // IPs: reglas diferenciadas
            if (ipMgmt) {
                if (norm(other.ip_mgmt) === ipMgmt || norm(other.ip_real) === ipMgmt || norm(other.ip_mask25) === ipMgmt) {
                    errors.ip_mgmt = 'La IP ya está en uso.';
                }
            }
            if (ipReal) {
                if (norm(other.ip_mgmt) === ipReal || norm(other.ip_real) === ipReal || norm(other.ip_mask25) === ipReal) {
                    errors.ip_real = 'La IP ya está en uso.';
                }
            }
            if (ipMask) {
                if (norm(other.ip_mgmt) === ipMask || norm(other.ip_real) === ipMask) {
                    errors.ip_mask25 = 'La IP ya está en uso.';
                }
            }
        }

        return Object.keys(errors).length ? errors : null;
    };

    // Modificar applyInlineEdit: eliminar el Swal y dejar solo la marca de error inline
    const applyInlineEdit = async (servidorId, key, rawValue, options = {}) => {
        const forceClose = options.forceClose === true;
        const keepEditing = options.keepEditing === true; // NUEVO: si true, mantener fila/celda en edición tras éxito

        // Normalizar según campo (convertir ids a number cuando aplique)
        const normalize = (k, v) => {
            if (v === null || v === undefined) return null;
            const s = String(v).trim();
            if (s === "") return null;
            if (/_id$/.test(k)) {
                const n = Number(s);
                return Number.isNaN(n) ? s : n;
            }
            return s;
        };

        const newValue = normalize(key, rawValue);

        // Obtener valor original desde snapshot (si existe) para comparar cambios reales
        const originalRow = originalSnapshotRef.current?.[servidorId] || {};
        const originalValue = originalRow ? (originalRow[key] ?? null) : null;

        // --- VALIDACIÓN INMEDIATA: si falla, marcar la celda en rojo y permanecer en edición ---
        // const inlineErrors = validateInlineChange(servidorId, key, newValue);
        // if (inlineErrors) {
        //     // 1) marcar errores de validación para la fila
        //     setValidationErrors(prev => ({ ...(prev || {}), [servidorId]: { ...(prev?.[servidorId] || {}), ...inlineErrors } }));
        //     // Conservar el valor intentado
        //     const attemptedValue = rawValue === undefined || rawValue === null ? '' : String(rawValue);
        //     // Solo registrar en `cambios` / marcar preview si difiere del original
        //     if (String(attemptedValue) !== String(originalValue ?? '')) {
        //         setCambios(prev => {
        //             const copia = { ...(prev || {}) };
        //             copia[servidorId] = { ...(copia[servidorId] || {}), [key]: attemptedValue };
        //             return copia;
        //         });
        //         setServidores(prev => prev.map(s => s.id === servidorId ? { ...s, [key]: attemptedValue, __preview: true } : s));
        //     }
        //     // Mantener el editor abierto con el texto ingresado (no se borra)
        //     setEditingCell({ id: servidorId, key, value: attemptedValue });
        //     return false; // indicar fallo de validación al llamador
        // }

        // NOTA: validación completa se realizará al guardar (handleGuardarCambios).
        // Aquí aplicamos los cambios localmente sin bloquear al usuario.
        // Limpiar errores previos de esta fila para que no queden marcas antiguas.
        setValidationErrors(prev => {
            if (!prev || !prev[servidorId]) return prev;
            const copy = { ...prev };
            delete copy[servidorId];
            return copy;
        });

        // Si pasa la validación, continuar con la lógica previa para aplicar el cambio (optimista)
        // Si no hay cambio respecto al original, no marcar como editado ni cambiar color
        if (String(newValue) === String(originalValue ?? '')) {
            // limpiar errores si existieran y cerrar editor sin marcar preview
            setValidationErrors(prev => { if (!prev || !prev[servidorId]) return prev; const copy = { ...prev }; delete copy[servidorId]; return copy; });
            cancelEditing();
            return true; // éxito
        }

        // Actualizar `cambios` y vista local (optimista)
        setCambios(prev => {
            const copia = { ...prev };
            copia[servidorId] = { ...(copia[servidorId] || {}), [key]: newValue };
            return copia;
        });

        setServidores(prev => prev.map(s => {
            if (s.id !== servidorId) return s;
            const updated = { ...s, [key]: newValue };
            // marcar como preview para estilos
            updated.__preview = true;
            // marcar la última edición (fila y clave) para resaltar con color llamativo
            updated.__lastEdited = true;
            updated.__lastEditedKey = key;
            // Si keepEditing: mantener flags de edición para permitir cambiar la selección otra vez
            updated.__editing = !!keepEditing;
            updated.__editingKey = keepEditing ? key : undefined;
            // Si aplicacion_id: actualizar representación local de aplicaciones para mostrar nombre/version
            if (key === 'aplicacion_id') {
                const app = (catalogos.aplicaciones || []).find(a => String(a.id) === String(newValue));
                updated.aplicaciones = app ? [app] : [];
            }
            return updated;
        }));

        // Limpiar errores previos de esa fila (si existían)
        setValidationErrors(prev => {
            if (!prev || !prev[servidorId]) return prev;
            const copy = { ...prev };
            delete copy[servidorId];
            return copy;
        });

        // Actualizar editingCell con el nuevo valor para que el panel muestre correctamente la selección
        if (keepEditing) {
            setEditingCell({ id: servidorId, key, value: String(newValue ?? '') });
        }

        // Mostrar toast informativo
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cambio aplicado en vista previa', showConfirmButton: false, timer: 1100 });

        // Cerrar editor sólo si se solicitó explícitamente (forceClose) y no se pidió keepEditing
        if (forceClose || !keepEditing) {
            cancelEditing();
        }
        return true; // éxito
    };

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
                const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
                const responses = await Promise.all(urls.map(async item => {
                    try {
                        const res = await fetch(item.url, { headers });
                        if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${item.name}`);
                        const contentType = res.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) return await res.json();
                        else throw new Error(`Respuesta no es JSON para ${item.name}`);
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
                // Asegurar ecosistema_id (puede venir como lista srv.ecosistemas, objeto srv.ecosistema o campo directo)
                ecosistema_id: srv.ecosistemas?.[0]?.id || (srv.ecosistema && srv.ecosistema.id) || srv.ecosistema_id || null,
                estatus_id: srv.estatus?.[0]?.id || srv.estatus_id || null,
                // APLICACIONES: si el backend devuelve 'aplicacion' -> convertir a array en .aplicaciones
                aplicaciones: srv.aplicacion ? [srv.aplicacion] : (srv.aplicaciones || []),
            }));
            setServidores(normalizedData);
            // Guardar snapshot original para comparar cambios reales
            originalSnapshotRef.current = Object.fromEntries(normalizedData.map(s => [s.id, { ...s }]));
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
        { value: 'vlan_mgmt', label: 'VLAN MGMT', type: 'input' },
        { value: 'ip_real', label: 'IP Real', type: 'input', disabled: servidores.length > 1 },
        { value: 'vlan_real', label: 'VLAN REAL', type: 'input' },
        { value: 'ip_mask25', label: 'IP Mask/25', type: 'input', disabled: servidores.length > 1 },
        { value: 'balanceador', label: 'Balanceador', type: 'input' },
        { value: 'link', label: 'Link', type: 'input', disabled: servidores.length > 1 },
        { value: 'descripcion', label: 'Descripción', type: 'input' },
        { value: 'servicio_id', label: 'Servicio', type: 'select', catalog: 'servicios' },
        { value: 'ecosistema_id', label: 'Ecosistema', type: 'select', catalog: 'ecosistemas' },
        { value: 'aplicacion_id', label: 'Aplicacion', type: 'select', catalog: 'aplicaciones' },
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
                const originalVal = originalSnapshotRef.current?.[servidor.id]?.[campo];
                // Solo aplicar si el valor difiere del original
                if (String(valor ?? '') === String(originalVal ?? '')) {
                    return servidor;
                }
                const cambiosPrevios = nuevosCambios[servidor.id] || {};
                nuevosCambios[servidor.id] = { ...cambiosPrevios, [campo]: valor };

                // Actualizar el estado local del servidor para reflejar en la tabla y marcar preview
                let servidorActualizado = { ...servidor, [campo]: valor, __preview: true };

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

    // --- NUEVO: aplicar todos los cambios seleccionados en un único paso ---
    const handleApplyAllBulkEdits = async () => {
        if (!columnasEditables || columnasEditables.length === 0) {
            Swal.fire("Sin columnas", "Selecciona las columnas que deseas aplicar.", "info");
            return;
        }

        // Validar que los campos no-IP tengan valor (si es requerido)
        const missingNonIp = columnasEditables.filter(col => {
            const isIp = ['ip_mgmt', 'ip_real', 'ip_mask25'].includes(col);
            const val = bulkEditValues[col];
            return !isIp && (val === undefined || val === '');
        });
        if (missingNonIp.length > 0) {
            const labels = missingNonIp.map(c => opcionesColumnas.find(o => o.value === c)?.label || c).join(', ');
            Swal.fire("Valores incompletos", `Proporciona un valor para: ${labels}`, "warning");
            return;
        }

        // Validación: evitar que al aplicar se deje algún servidor sin ninguna IP
        const willClearIp = ['ip_mgmt', 'ip_real', 'ip_mask25'].some(ipf => bulkEditValues[ipf] === '');
        if (willClearIp) {
            const servidoresQueQuedarianSinIp = servidores.filter(servidor => {
                const cambiosServidor = cambios[servidor.id] || {};
                const ipMgmt = bulkEditValues.hasOwnProperty('ip_mgmt') ? bulkEditValues['ip_mgmt'] : (cambiosServidor.ip_mgmt ?? servidor.ip_mgmt);
                const ipReal = bulkEditValues.hasOwnProperty('ip_real') ? bulkEditValues['ip_real'] : (cambiosServidor.ip_real ?? servidor.ip_real);
                const ipMask = bulkEditValues.hasOwnProperty('ip_mask25') ? bulkEditValues['ip_mask25'] : (cambiosServidor.ip_mask25 ?? servidor.ip_mask25);
                const anyIp = (ipMgmt && String(ipMgmt).trim() !== '') || (ipReal && String(ipReal).trim() !== '') || (ipMask && String(ipMask).trim() !== '');
                return !anyIp;
            });
            if (servidoresQueQuedarianSinIp.length > 0) {
                Swal.fire("Acción no permitida", `Al aplicar, los siguientes servidores quedarían sin IP: ${servidoresQueQuedarianSinIp.map(s => s.nombre).join(', ')}`, "error");
                return;
            }
        }

        // Resumen para confirmación
        const resumen = columnasEditables.map(col => {
            const label = opcionesColumnas.find(o => o.value === col)?.label || col;
            const val = bulkEditValues[col] !== undefined ? bulkEditValues[col] : "(sin cambio)";
            return `<strong>${label}:</strong> ${String(val)}`;
        }).join('<br/>');

        const result = await Swal.fire({
            title: `¿Aplicar cambios a los ${servidores.length} servidores?`,
            html: `<div style="text-align:left">${resumen}</div>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, aplicar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: 'var(--color-primario)'
        });
        if (!result.isConfirmed) return;

        // Aplicar cambios en memoria (vista previa) y en el objeto "cambios"
        let nuevosCambios = { ...cambios };
        const servidoresActualizados = servidores.map(servidor => {
            const prev = nuevosCambios[servidor.id] || {};
            columnasEditables.forEach(col => {
                if (Object.prototype.hasOwnProperty.call(bulkEditValues, col)) {
                    const originalVal = originalSnapshotRef.current?.[servidor.id]?.[col];
                    const candidate = bulkEditValues[col];
                    // Solo aplicar si difiere del original
                    if (String(candidate ?? '') !== String(originalVal ?? '')) {
                        prev[col] = candidate;
                    }
                }
                if (col === 'aplicacion_id') {
                    const app = catalogos.aplicaciones.find(a => String(a.id) === String(prev.aplicacion_id));
                    servidor.aplicaciones = app ? [app] : [];
                }
            });
            nuevosCambios[servidor.id] = prev;
            const servidorActualizado = { ...servidor };
            Object.keys(prev).forEach(col => { servidorActualizado[col] = prev[col]; });
            servidorActualizado.__preview = Object.keys(prev).length > 0;
            return servidorActualizado;
        });

        setServidores(servidoresActualizados);
        setCambios(nuevosCambios);
        setValidationErrors({});
        Swal.fire("Aplicado", "Los cambios han sido aplicados en la vista previa.", "success");
    };

    // Renderiza los controles de edición masiva para las columnas seleccionadas (distribución uniforme)
    const renderBulkEditControls = () => {
        if (!columnasEditables || columnasEditables.length === 0) return null;
        // Usar flex-wrap para permitir varias filas y flex en cada campo para que se repartan el espacio disponible.
        return (
            <div
                className="bulk-edit-controls"
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.9rem',
                    alignItems: 'stretch',
                    width: '100%'
                }}
            >
                {columnasEditables.map(colKey => {
                    const colDef = opcionesColumnas.find(c => c.value === colKey) || { value: colKey, label: colKey, type: 'input' };
                    const val = bulkEditValues[colKey] ?? '';
                    return (
                        <div
                            key={colKey}
                            className="bulk-edit-field"
                            style={{
                                flex: '1 1 240px',     // crecer igualmente, base de 240px
                                minWidth: 160,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '6px 8px',
                                boxSizing: 'border-box',
                                borderRadius: 6,
                                background: 'transparent'
                            }}
                        >
                            <label style={{ width: 140, fontWeight: 600, whiteSpace: 'nowrap', flex: '0 0 auto' }}>{colDef.label}</label>
                            {colDef.type === 'select' ? (
                                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                                    {/* asegurar que el dropdown ocupe todo el espacio disponible */}
                                    <BulkEditDropdown
                                        value={val}
                                        onChange={(v) => handleBulkEditChange(colKey, v)}
                                        options={colDef.options}
                                        catalog={colDef.catalog}
                                        catalogos={catalogos}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            ) : (
                                <input
                                    className="form__input"
                                    style={{ width: '100%', flex: '1 1 auto', minWidth: 0 }}
                                    value={val}
                                    onChange={(e) => handleBulkEditChange(colKey, e.target.value)}
                                    placeholder={colDef.label}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleEliminarServidor = async (servidorParaEliminar) => {
        // verificar permisos
        if (!userRole || !['GERENTE', 'ESPECIALISTA'].includes(userRole)) {
            return Swal.fire('Permiso denegado', 'Debes iniciar sesión con un rol que tenga permisos para eliminar.', 'error');
        }

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
                    headers: getAuthHeaders()
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

    // Eliminar todos los servidores obtenidos por la búsqueda actual
    const handleEliminarResultados = async () => {
        if (!userRole || !['GERENTE', 'ESPECIALISTA'].includes(userRole)) {
            return Swal.fire('Permiso denegado', 'Debes iniciar sesión con un rol que tenga permisos para eliminar.', 'error');
        }

        const ids = Array.from(seleccionados);
        if (!ids.length) {
            Swal.fire('Sin selección', 'Por favor selecciona al menos un servidor para eliminar.', 'info');
            return;
        }

        const result = await Swal.fire({
            title: `Eliminar ${ids.length} servidor(es)?`,
            text: 'Esta acción eliminará permanentemente los servidores seleccionados. ¿Deseas continuar?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-error)',
            cancelButtonColor: 'var(--color-texto-secundario)',
            confirmButtonText: 'Eliminar seleccionados',
            cancelButtonText: 'Cancelar'
        });
        if (!result.isConfirmed) return;

        try {
            Swal.fire({ title: 'Eliminando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const backendUrl = process.env.BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/servidores/bulk-delete`, {
                method: 'POST',
                headers: Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders()),
                body: JSON.stringify({ ids })
            });
            const contentType = response.headers.get('content-type');
            let data = null;
            if (contentType && contentType.includes('application/json')) data = await response.json();

            if (!response.ok) {
                const msg = (data && data.error) ? data.error : `Error al eliminar: ${response.status}`;
                Swal.close();
                Swal.fire('Error', msg, 'error');
                return;
            }

            const deletedCount = data && data.deleted_count ? data.deleted_count : ids.length;
            setServidores(prev => prev.filter(s => !ids.includes(s.id)));
            setCambios(prev => { const copy = { ...prev }; ids.forEach(id => delete copy[id]); return copy; });
            limpiarSeleccion();
            Swal.close();
            Swal.fire('Eliminados', `${deletedCount} servidores fueron eliminados permanentemente.`, 'success');
        } catch (err) {
            Swal.close();
            console.error('Error en eliminación masiva:', err);
            Swal.fire('Error', 'Ocurrió un error al eliminar los servidores.', 'error');
        }
    };

    const handleGuardarCambios = async () => {
        if (!userRole || !['GERENTE', 'ESPECIALISTA'].includes(userRole)) {
            return Swal.fire('Permiso denegado', 'Debes iniciar sesión con un rol que tenga permisos para guardar cambios.', 'error');
        }

        setValidationErrors({});
        const numCambios = Object.keys(cambios).length;
        if (numCambios === 0) {
            Swal.fire("Sin cambios", "No se ha modificado ningún servidor.", "info");
            return;
        }

        // NUEVO: validaciones client-side similares a ServidorFormulario antes de pedir validación al backend
        const validLocal = validateEditChanges();
        if (!validLocal) return; // si hay errores, se muestran y se aborta

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
                // Añadir headers de autenticación a la validación (requiere sesion)
                const res = await fetch(`${process.env.BACKEND_URL}/api/servidores/validar-actualizaciones`, {
                    method: 'POST',
                    headers: Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders()),
                    body: JSON.stringify({ validaciones }),
                });
                if (res.status === 401) {
                    handleAuthExpired();
                    return;
                }
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
                // Si se obtiene 401 desde la capa de conexión o cualquier otro error, intentar manejar expiración
                if (error && error.message && error.message.toLowerCase().includes('401')) {
                    handleAuthExpired();
                    return;
                }
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
            // Comprobar token local antes de intentar enviar PUTs
            if (!localStorage.getItem('auth_token')) {
                setCargando(false);
                return Swal.fire('No autorizado', 'Debes iniciar sesión para guardar cambios.', 'error');
            }
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
                    vlan_mgmt: cambiosParaServidor.hasOwnProperty('vlan_mgmt') ? cambiosParaServidor.vlan_mgmt : servidorOriginal.vlan_mgmt,
                    vlan_real: cambiosParaServidor.hasOwnProperty('vlan_real') ? cambiosParaServidor.vlan_real : servidorOriginal.vlan_real,
                    link: cambiosParaServidor.link ?? servidorOriginal.link,
                    descripcion: cambiosParaServidor.descripcion ?? servidorOriginal.descripcion,
                    servicio_id: cambiosParaServidor.servicio_id ?? servidorOriginal.servicio_id,
                    ecosistema_id: cambiosParaServidor.ecosistema_id ?? servidorOriginal.ecosistema_id,
                    capa_id: cambiosParaServidor.capa_id ?? servidorOriginal.capa_id,
                    ambiente_id: cambiosParaServidor.ambiente_id ?? servidorOriginal.ambiente_id,
                    dominio_id: cambiosParaServidor.dominio_id ?? servidorOriginal.dominio_id,
                    sistema_operativo_id: cambiosParaServidor.sistema_operativo_id ?? servidorOriginal.sistema_operativo_id,
                    estatus_id: cambiosParaServidor.estatus_id ?? servidorOriginal.estatus_id,
                    activo: servidorOriginal.activo,
                };

                // Incluir aplicacion_ids únicamente si el usuario modificó la aplicación
                if (Object.prototype.hasOwnProperty.call(cambiosParaServidor, 'aplicacion_id')) {
                    // Si el valor es nulo/vacío se envía array vacío para desasignar; si tiene valor, enviar como array con el id
                    payload.aplicacion_ids = cambiosParaServidor.aplicacion_id ? [cambiosParaServidor.aplicacion_id] : [];
                }

                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/servidores/${id}`, {
                        method: 'PUT',
                        headers: Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders()),
                        body: JSON.stringify(payload)
                    });
                    if (response.status === 401) {
                        // manejar expiración y detener el proceso
                        handleAuthExpired();
                        return false;
                    }
                    return response.ok;
                } catch (err) {
                    // si falla por red/otros, retornamos false para que el catch global lo reporte
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
                // limpiar flags de preview/editing/lastEdited en la vista local
                setServidores(prev => prev.map(s => {
                    const copy = { ...s };
                    delete copy.__preview;
                    delete copy.__editingKey;
                    delete copy.__lastEdited;
                    delete copy.__lastEditedKey;
                    copy.__editing = false;
                    return copy;
                }));
            } catch (error) {
                // Si detectamos que la causa fue expiración (ya notificada por handleAuthExpired), no mostrar otro modal redundante
                if (!localStorage.getItem('auth_token')) {
                    // ya se manejó en handleAuthExpired
                } else {
                    Swal.fire('Error', `Ocurrió un problema: ${error.message}`, 'error');
                }
            } finally {
                setCargando(false);
            }
        }
    };

    // --- FUNCION: ordenar servidores según sortConfig (reinserción para evitar ReferenceError) ---
    const getSortedServidores = () => {
        if (!sortConfig.key) return servidores;
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        const sorted = [...servidores].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Si la columna tiene catálogo, comparar por nombre (o por "nombre - Vversion" para S.O./apps)
            const colDef = columnas.find(c => c.key === sortConfig.key);
            if (colDef && colDef.catalog) {
                const aObj = catalogos[colDef.catalog]?.find(c => String(c.id) === String(aValue));
                const bObj = catalogos[colDef.catalog]?.find(c => String(c.id) === String(bValue));
                aValue = aObj ? (colDef.catalog === 'sistemasOperativos' ? `${aObj.nombre} - V${aObj.version}` : aObj.nombre) : '';
                bValue = bObj ? (colDef.catalog === 'sistemasOperativos' ? `${bObj.nombre} - V${bObj.version}` : bObj.nombre) : '';
            }

            // Caso aplicacion_id: comparar por nombre de la aplicación (si está en .aplicaciones o .aplicacion)
            if (sortConfig.key === 'aplicacion_id') {
                aValue = (a.aplicaciones && a.aplicaciones[0]) ? a.aplicaciones[0].nombre : (a.aplicacion ? a.aplicacion.nombre : (a.aplicacion_id ?? ''));
                bValue = (b.aplicaciones && b.aplicaciones[0]) ? b.aplicaciones[0].nombre : (b.aplicacion ? b.aplicacion.nombre : (b.aplicacion_id ?? ''));
            }

            aValue = aValue !== null && aValue !== undefined ? String(aValue) : '';
            bValue = bValue !== null && bValue !== undefined ? String(bValue) : '';

            // Normalizar para comparación y usar collator (soporta comparación numérica dentro de strings)
            const cmp = collator.compare(aValue.toLowerCase(), bValue.toLowerCase());
            return sortConfig.direction === 'asc' ? cmp : -cmp;
        });
        return sorted;
    };

    // --- NUEVO: handler para cambiar la columna y dirección de ordenamiento ---
    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    // --- RENDER: tabla de resultados (reintegrada para evitar ReferenceError) ---
    const renderResultadosTabla = () => {
        const sortedServidores = getSortedServidores();
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentServidores = sortedServidores.slice(indexOfFirstItem, indexOfLastItem);

        return (
            <table className="table">
                <thead>
                    <tr>
                        <th style={{ textAlign: 'center' }}>#</th>
                        {columnas.map(c => (
                            <th
                                key={c.key}
                                style={{ textAlign: 'center', cursor: c.sortable ? 'pointer' : 'default', userSelect: 'none' }}
                                onClick={() => c.sortable && handleSort(c.key)}
                                title={c.sortable ? (sortConfig.key === c.key ? (sortConfig.direction === 'asc' ? 'Orden ascendente' : 'Orden descendente') : 'Ordenar') : undefined}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    {c.header}
                                    {c.sortable && (
                                        <span style={{ marginLeft: 4, display: 'inline-flex', alignItems: 'center' }}>
                                            {sortConfig.key === c.key ? (
                                                sortConfig.direction === 'asc' ? <Icon name="arrow-upward" size={16} style={{ color: '#005A9C' }} />
                                                    : <Icon name="arrow-downward" size={16} style={{ color: '#005A9C' }} />
                                            ) : (
                                                <Icon name="unfold-more" size={16} style={{ color: '#888' }} />
                                            )}
                                        </span>
                                    )}
                                </span>
                            </th>
                        ))}
                        {userRole && (
                            <th style={{ textAlign: 'center', width: '140px', minWidth: '120px', maxWidth: '180px' }}>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <span style={{ userSelect: 'none' }}>Eliminar</span>
                                    <input
                                        type="checkbox"
                                        className="filter-checkbox"
                                        checked={currentServidores.length > 0 && currentServidores.every(s => seleccionados.has(s.id))}
                                        onChange={() => toggleSeleccionarTodosPagina(currentServidores)}
                                        title="Seleccionar/Deseleccionar todos en esta página"
                                        style={{ transform: 'scale(0.95)' }}
                                    />
                                </label>
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {currentServidores.map((servidor, idx) => {
                        const rowIndex = indexOfFirstItem + idx + 1;
                        const errorsInRow = validationErrors[servidor.id] || {};
                        const errorCount = Object.keys(errorsInRow).length; // cantidad de campos con error en la fila
                        // isModified: hay cambios pendientes que difieren del original snapshot?
                        const isModified = Boolean(cambios[servidor.id] && Object.keys(cambios[servidor.id]).some(k => {
                            const orig = originalSnapshotRef.current?.[servidor.id]?.[k];
                            const pending = cambios[servidor.id][k];
                            return String(pending ?? '') !== String(orig ?? '');
                        }));
                        const rowHasErrors = errorCount > 0;

                        // Construir clases: fila-modificada y/o fila-editada (última edición)
                        const trClasses = [
                            isModified ? 'fila-modificada' : '',
                            servidor.__lastEdited ? 'fila-editada' : '',
                            servidor.__editing ? 'fila-editando' : '',
                            errorCount === 1 ? 'fila-con-error' : '',
                            errorCount > 1 ? 'fila-multi-error' : ''
                        ].filter(Boolean).join(' ');

                        return (
                            <tr key={servidor.id} className={trClasses}>
                                <td style={{ textAlign: 'center' }}>{rowIndex}</td>

                                {columnas.map(col => {
                                    // Link como botón
                                    if (col.key === 'link') {
                                        return (
                                            <td key={`${servidor.id}-link`} style={{ textAlign: 'center', width: '90px', minWidth: '70px', maxWidth: '110px' }}>
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => abrirModalLink(servidor)}
                                                    title="Ver detalles y enlace"
                                                    disabled={!servidor.link}
                                                    style={{ width: 34, height: 34, padding: 4, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Icon name="visibility" />
                                                </button>
                                            </td>
                                        );
                                    }

                                    let displayValue = servidor[col.key];

                                    // Catálogos: mostrar nombre/versión si corresponde
                                    if (col.catalog) {
                                        const found = catalogos[col.catalog]?.find(c => String(c.id) === String(displayValue));
                                        displayValue = found ? (col.catalog === 'sistemasOperativos' ? `${found.nombre} - V${found.version}` : found.nombre) : 'N/A';
                                    }

                                    // Aplicación: mostrar nombre/version desde .aplicaciones o buscando por aplicacion_id en el catálogo
                                    if (col.key === 'aplicacion_id') {
                                        const apps = servidor.aplicaciones || [];
                                        if (servidor.aplicacion_id && apps.length === 0) {
                                            const appFromCatalog = catalogos.aplicaciones.find(a => String(a.id) === String(servidor.aplicacion_id));
                                            if (appFromCatalog) apps.push(appFromCatalog);
                                        }
                                        displayValue = apps.length > 0 ? apps.map(a => `${a.nombre} - V${a.version}`).join(', ') : (servidor.aplicacion_id ? String(servidor.aplicacion_id) : 'N/A');
                                    }

                                    // IPs: mostrar N/A si vacío
                                    if (["ip_mgmt", "ip_real", "ip_mask25"].includes(col.key)) {
                                        displayValue = displayValue || 'N/A';
                                    }

                                    const hasError = !!errorsInRow[col.key];

                                    // Determinar clases de celda: error / preview / celda-editada (última clave)
                                    // pendingChanges solo si hay cambio pendiente y difiere del valor original
                                    const pendingChanges = Boolean(cambios[servidor.id] && Object.prototype.hasOwnProperty.call(cambios[servidor.id], col.key) &&
                                        (String(cambios[servidor.id][col.key] ?? '') !== String(originalSnapshotRef.current?.[servidor.id]?.[col.key] ?? '')));
                                    const tdClasses = [
                                        hasError ? 'celda-con-error-validacion' : '',
                                        servidor.__preview ? 'celda-preview' : '',
                                        (servidor.__lastEditedKey === col.key || pendingChanges) ? 'celda-editada' : '',
                                        (servidor.__editingKey === col.key) ? 'celda-editando' : ''
                                    ].filter(Boolean).join(' ');

                                    // Determinar si esta celda está en edición
                                    const isEditingThisCell = editingCell && editingCell.id === servidor.id && editingCell.key === col.key;

                                    // VLAN: dividir por espacios para mostrar en varias líneas si aplica
                                    if (col.key === 'vlan_mgmt' || col.key === 'vlan_real') {
                                        const text = String(displayValue || '');
                                        const parts = text.split(/\s+/).filter(Boolean);
                                        return (
                                            <td
                                                key={`${servidor.id}-${col.key}`}
                                                title={text}
                                                className={tdClasses}
                                                style={{ whiteSpace: 'normal' }}
                                                onDoubleClick={() => startEditCell(servidor, col.key)}
                                            >
                                                <div className="cell-value cell-vlan">
                                                    {isEditingThisCell ? (
                                                        <>
                                                            <input
                                                                autoFocus
                                                                className={`form__input ${errorsInRow[col.key] ? 'form__input--error' : ''}`}
                                                                style={{ width: '100%' }}
                                                                value={editingCell?.value ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setEditingCell(prev => prev ? { ...prev, value: val } : { id: servidor.id, key: col.key, value: val });
                                                                }}
                                                                onBlur={(e) => {
                                                                    const val = e && e.target ? e.target.value : editingCellRef.current?.value ?? '';
                                                                    applyInlineEdit(servidor.id, col.key, val);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    const val = e && e.target ? e.target.value : editingCellRef.current?.value ?? '';
                                                                    if (e.key === 'Escape') { e.preventDefault(); cancelEditing(); }
                                                                    if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); applyInlineEdit(servidor.id, col.key, val); }
                                                                }}
                                                            />
                                                            {errorsInRow[col.key] && (
                                                                <div className="cell-error-message" role="alert" aria-live="polite">{errorsInRow[col.key]}</div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {parts.length === 0 ? <span className="cell-empty">N/A</span> : parts.map((p, i) => <div key={i} className="cell-text">{p}</div>)}
                                                            {errorsInRow[col.key] && (
                                                                <div className="cell-error-message" role="alert" aria-live="polite">{errorsInRow[col.key]}</div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td
                                            key={`${servidor.id}-${col.key}`}
                                            title={displayValue}
                                            className={tdClasses}
                                            onDoubleClick={() => startEditCell(servidor, col.key)}
                                        >
                                            <div className="cell-value">
                                                {isEditingThisCell ? (
                                                    <>
                                                        {/* Si la columna es de tipo select (tiene catálogo) o es 'tipo', renderizar <select> */}
                                                        {(col.catalog || col.key === 'tipo') ? (
                                                            (() => {
                                                                // construir opciones como antes
                                                                let options = [];
                                                                if (col.key === 'tipo') {
                                                                    const tipoDef = opcionesColumnas.find(o => o.value === 'tipo');
                                                                    options = tipoDef?.options?.map(opt => ({ id: opt.id, label: opt.nombre || opt.id })) || [
                                                                        { id: 'VIRTUAL', label: 'Virtual' },
                                                                        { id: 'FISICO', label: 'Físico' }
                                                                    ];
                                                                } else {
                                                                    const catalog = catalogos[col.catalog] || [];
                                                                    options = catalog.map(item => {
                                                                        if (col.catalog === 'sistemasOperativos' || col.catalog === 'aplicaciones') {
                                                                            const label = item.version ? `${item.nombre} - V${item.version}` : item.nombre;
                                                                            return { id: item.id, label };
                                                                        }
                                                                        return { id: item.id, label: item.nombre };
                                                                    });
                                                                }

                                                                const keyId = `${servidor.id}_${col.key}`;
                                                                const isOpen = openEditorSelectKey === keyId;

                                                                return (
                                                                    <div className="custom-select" ref={editorSelectRef} style={{ width: '100%' }}>
                                                                        <button
                                                                            type="button"
                                                                            className={`form__input custom-select__trigger ${errorsInRow[col.key] ? 'form__input--error' : ''}`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                // Garantizar que editingCell refleje el valor actual antes de abrir el panel
                                                                                if (!(editingCell && editingCell.id === servidor.id && editingCell.key === col.key)) {
                                                                                    const currentVal = servidor[col.key] !== undefined && servidor[col.key] !== null ? String(servidor[col.key]) : '';
                                                                                    // marcar fila como editando y fijar la key
                                                                                    setServidores(prev => prev.map(s => ({
                                                                                        ...s,
                                                                                        __editing: s.id === servidor.id,
                                                                                        __editingKey: s.id === servidor.id ? col.key : undefined
                                                                                    })));
                                                                                    setEditingCell({ id: servidor.id, key: col.key, value: currentVal });
                                                                                }
                                                                                setOpenEditorSelectKey(prev => prev === keyId ? null : keyId);
                                                                            }}
                                                                        >
                                                                            <span>
                                                                                {editingCell?.value ? (
                                                                                    // mostrar etiqueta humana si es posible
                                                                                    (options.find(o => String(o.id) === String(editandoCell.value)) || { label: String(editandoCell.value) }).label
                                                                                ) : '--'}
                                                                            </span>
                                                                            <div className={`chevron ${isOpen ? "open" : ""}`}></div>
                                                                        </button>

                                                                        <div className={`custom-select__panel {  ${isOpen ? "open" : ""}`} style={{ width: '100%' }}>
                                                                            {/* opción vacía para desasignar */}
                                                                            <div
                                                                                className="custom-select__option"
                                                                                role="button"
                                                                                tabIndex={0}
                                                                                onClick={async (e) => {
                                                                                    e.stopPropagation();
                                                                                    const ok = await applyInlineEdit(servidor.id, col.key, null, { keepEditing: true });
                                                                                    const keyId = `${servidor.id}_${col.key}`;
                                                                                    if (!ok) setOpenEditorSelectKey(keyId);
                                                                                }}
                                                                                onKeyDown={async (e) => {
                                                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        const ok = await applyInlineEdit(servidor.id, col.key, null, { keepEditing: true });
                                                                                        const keyId = `${servidor.id}_${col.key}`;
                                                                                        if (!ok) setOpenEditorSelectKey(keyId);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <span>--</span>
                                                                            </div>

                                                                            {options.map(opt => (
                                                                                <div
                                                                                    key={String(opt.id)}
                                                                                    className={`custom-select__option ${String(editandoCell?.value) === String(opt.id) ? 'selected' : ''}`}
                                                                                    role="button"
                                                                                    tabIndex={0}
                                                                                    onClick={async (e) => {
                                                                                        e.stopPropagation();
                                                                                        const ok = await applyInlineEdit(servidor.id, col.key, opt.id, { keepEditing: true });
                                                                                        const keyId = `${servidor.id}_${col.key}`;
                                                                                        if (!ok) {
                                                                                            setOpenEditorSelectKey(keyId);
                                                                                        }
                                                                                    }}
                                                                                    onKeyDown={async (e) => {
                                                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                                                            e.preventDefault();
                                                                                            e.stopPropagation();
                                                                                            const ok = await applyInlineEdit(servidor.id, col.key, opt.id, { keepEditing: true });
                                                                                            const keyId = `${servidor.id}_${col.key}`;
                                                                                            if (!ok) setOpenEditorSelectKey(keyId);
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <span>{opt.label}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()
                                                        ) : (
                                                            /* fallback: input de texto para columnas no-select (se mantiene comportamiento previo) */
                                                            <input
                                                                autoFocus
                                                                className={`form__input ${errorsInRow[col.key] ? 'form__input--error' : ''}`}
                                                                style={{ width: '100%' }}
                                                                value={editingCell?.value ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setEditingCell(prev => prev ? { ...prev, value: val } : { id: servidor.id, key: col.key, value: val });
                                                                }}
                                                                onBlur={(e) => {
                                                                    const val = e && e.target ? e.target.value : editingCellRef.current?.value ?? '';
                                                                    applyInlineEdit(servidor.id, col.key, val);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    const val = e && e.target ? e.target.value : editingCellRef.current?.value ?? '';
                                                                    if (e.key === 'Escape') { e.preventDefault(); cancelEditing(); }
                                                                    if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); applyInlineEdit(servidor.id, col.key, val); }
                                                                }}
                                                            />
                                                        )}
                                                        {/* mensaje de error inline (si existe) */}
                                                        {errorsInRow[col.key] && (
                                                            <div className="cell-error-message" role="alert" aria-live="polite">{errorsInRow[col.key]}</div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {(displayValue === null || displayValue === undefined || String(displayValue).trim() === '')
                                                            ? <span className="cell-empty">N/A</span>
                                                            : <span className="cell-text">{displayValue}</span>
                                                        }
                                                        {errorsInRow[col.key] && (
                                                            <div className="cell-error-message" role="alert" aria-live="polite">{errorsInRow[col.key]}</div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                                {userRole && (
                                    <td style={{ textAlign: 'center', width: '140px', minWidth: '120px', maxWidth: '180px' }}>
                                        <input
                                            type="checkbox"
                                            className="filter-checkbox"
                                            checked={seleccionados.has(servidor.id)}
                                            onChange={() => toggleSeleccionado(servidor.id)}
                                            title={`Seleccionar servidor ${servidor.nombre}`}
                                            style={{ transform: 'scale(0.95)' }}
                                        />
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    // Toggle selección individual (checkbox fila)
    const toggleSeleccionado = (id) => {
        setSeleccionados(prev => {
            const copia = new Set(prev);
            if (copia.has(id)) copia.delete(id);
            else copia.add(id);
            return copia;
        });
    };

    // Seleccionar/deseleccionar todos los de la página actual
    const toggleSeleccionarTodosPagina = (currentServidores) => {
        const idsPagina = currentServidores.map(s => s.id);
        setSeleccionados(prev => {
            const copia = new Set(prev);
            const todosSeleccionados = idsPagina.every(id => copia.has(id));
            idsPagina.forEach(id => {
                if (todosSeleccionados) copia.delete(id);
                else copia.add(id);
            });
            return copia;
        });
    };

    // Limpiar selección completa
    const limpiarSeleccion = () => setSeleccionados(new Set());

    // Definición de columnas usada por la tabla y funciones de ordenamiento
    const columnas = [
        { header: 'Nombre', key: 'nombre', sortable: true },
        { header: 'Tipo', key: 'tipo' },
        { header: 'IP MGMT', key: 'ip_mgmt' },
        { header: 'VLAN MGMT', key: 'vlan_mgmt' },
        { header: 'IP Real', key: 'ip_real' },
        { header: 'VLAN REAL', key: 'vlan_real' },
        { header: 'IP Mask/25', key: 'ip_mask25' },
        { header: 'Servicio', key: 'servicio_id', catalog: 'servicios' },
        { header: 'Ecosistema', key: 'ecosistema_id', catalog: 'ecosistemas' },
        { header: 'Aplicacion', key: 'aplicacion_id', catalog: 'aplicaciones' },
        { header: 'Capa', key: 'capa_id', catalog: 'capas' },
        { header: 'Ambiente', key: 'ambiente_id', catalog: 'ambientes' },
        { header: 'Balanceador', key: 'balanceador' },
        { header: 'Dominio', key: 'dominio_id', catalog: 'dominios' },
        { header: 'S.O.', key: 'sistema_operativo_id', catalog: 'sistemasOperativos' },
        { header: 'Estatus', key: 'estatus_id', catalog: 'estatus' },
        { header: 'Descripción', key: 'descripcion' },
        { header: 'Link', key: 'link' }
    ];

    // Valida localmente los cambios (reutiliza reglas de ServidorFormulario)
    const validateEditChanges = () => {
        const errorsMap = {};

        // Reconstruir snapshot con cambios aplicados para validar unicidades entre servidores
        const mergedServidores = servidores.map(s => {
            const change = cambios[s.id] || {};
            return { ...s, ...change };
        });

        const requiredFields = ["nombre", "tipo", "servicio_id", "capa_id", "ambiente_id", "dominio_id", "sistema_operativo_id", "estatus_id", "balanceador"];

        // Helper para comparar igualdad considerándo null/undefined/empty
        const norm = v => (v === null || v === undefined) ? "" : String(v).trim();

        // Index merged by id for quick lookup
        const mergedById = Object.fromEntries(mergedServidores.map(s => [s.id, s]));

        for (const idStr of Object.keys(cambios)) {
            const id = parseInt(idStr, 10);
            const servidor = mergedById[id];
            if (!servidor) continue;
            const serverErrors = {};

            // 1) Campos requeridos
            requiredFields.forEach(f => {
                if (!norm(servidor[f])) {
                    serverErrors[f] = 'Este campo es obligatorio.';
                }
            });

            // 2) Al menos una IP
            const ipMgmt = norm(servidor.ip_mgmt);
            const ipReal = norm(servidor.ip_real);
            const ipMask = norm(servidor.ip_mask25);
            if (!ipMgmt && !ipReal && !ipMask) {
                serverErrors.ip_mgmt = "Debe ingresar al menos una IP.";
                serverErrors.ip_real = "Debe ingresar al menos una IP.";
                serverErrors.ip_mask25 = "Debe ingresar al menos una IP.";

            } else {
                // 3) Duplicados internos entre sus propias IPs



                const ips = [ipMgmt, ipReal, ipMask].filter(Boolean);
                const counts = ips.reduce((acc, ip) => (acc[ip] = (acc[ip] || 0) + 1, acc), {});
                if (ipMgmt && counts[ipMgmt] > 1) serverErrors.ip_mgmt = "IP repetida en otro campo.";
                if (ipReal && counts[ipReal] > 1) serverErrors.ip_real = "IP repetida en otro campo.";
                if (ipMask && counts[ipMask] > 1) serverErrors.ip_mask25 = "IP repetida en otro campo.";
            }

            // 4) Unicidad frente a otros servidores (usar mergedServidores)
            for (const other of mergedServidores) {
                if (other.id === servidor.id) continue;
                // Nombre único
                if (norm(other.nombre) && norm(other.nombre).toLowerCase() === norm(servidor.nombre).toLowerCase()) {
                    serverErrors.nombre = 'Este nombre ya está en uso.';
                }
                // Link único
                if (norm(other.link) && norm(other.link) === norm(servidor.link)) {
                    serverErrors.link = 'Este link ya está en uso.';
                }
                // IPs: reglas diferenciadas
                // ip_mgmt / ip_real (debemos evitar que coincidan con cualquier ip en otro servidor)
                if (ipMgmt) {
                    if (norm(other.ip_mgmt) === ipMgmt || norm(other.ip_real) === ipMgmt || norm(other.ip_mask25) === ipMgmt) {
                        serverErrors.ip_mgmt = 'La IP ya está en uso.';
                    }
                }
                if (ipReal) {
                    if (norm(other.ip_mgmt) === ipReal || norm(other.ip_real) === ipReal || norm(other.ip_mask25) === ipReal) {
                        serverErrors.ip_real = 'La IP ya está en uso.';
                    }
                }
                // ip_mask25 sólo debe ser única respecto ip_mgmt/ip_real en otros servidores
                if (ipMask) {
                    if (norm(other.ip_mgmt) === ipMask || norm(other.ip_real) === ipMask) {
                        serverErrors.ip_mask25 = 'La IP ya está en uso.';
                    }
                }
            }

            if (Object.keys(serverErrors).length > 0) {
                errorsMap[servidor.id] = serverErrors;
            }
        }

        if (Object.keys(errorsMap).length > 0) {
            setValidationErrors(errorsMap);
            Swal.fire({
                icon: 'error',
                title: 'Validación fallida',
                html: 'Hay errores en los datos. Revisa los campos marcados en rojo.',
            });
            return false;
        }
        return true;
    };

    // Después de que se carguen los catálogos, sincronizar la propiedad `aplicaciones`
    // para cada servidor que tenga `aplicacion_id` pero no tenga el objeto en `aplicaciones`.
    useEffect(() => {
        // Si no hay catálogos de aplicaciones, no hacemos nada
        if (!catalogos || !Array.isArray(catalogos.aplicaciones) || catalogos.aplicaciones.length === 0) return;

        setServidores(prev => {
            let changed = false;
            const mapped = prev.map(s => {
                // si ya tiene aplicaciones o no tiene aplicacion_id, no tocar
                if ((s.aplicaciones && s.aplicaciones.length) || !s.aplicacion_id) return s;
                // buscar en el catálogo la aplicación correspondiente
                const found = catalogos.aplicaciones.find(a => String(a.id) === String(s.aplicacion_id));

                if (found) {
                    changed = true;
                    return { ...s, aplicaciones: [found] };
                }
                return s;
            });
            // solo actualizar el estado si hubo cambios para evitar rerenders innecesarios
            return changed ? mapped : prev;
        });
    }, [catalogos.aplicaciones]);

    // Efecto para capturar Enter/Escape mientras hay una celda en edición.
    // Leer editingCell desde editingCellRef.current para evitar leer .value de null.
    useEffect(() => {
        if (!editingCell) return;

        const handleKeyDown = (e) => {
            const ec = editingCellRef.current;
            if (!ec) return;

            if (e.key === 'Enter') {
                try { e.preventDefault(); } catch (err) { /* ignore */ }
                try { e.stopPropagation(); } catch (err) { /* ignore */ }
                try { if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation(); } catch (err) { /* ignore */ }

                // Usar el snapshot seguro desde ref
                applyInlineEdit(ec.id, ec.key, ec.value);
                return false;
            } else if (e.key === 'Escape') {
                try { e.preventDefault(); } catch (err) { /* ignore */ }
                try { e.stopPropagation(); } catch (err) { /* ignore */ }
                cancelEditing();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [applyInlineEdit, cancelEditing]); // editingCell no en deps para evitar closure stale (usamos ref)

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
                            </header>

                            {servidores.length > 0 ? (
                                <>
                                    <div className="editor-top-actions">
                                        {/* (Barra superior: reservada para acciones contextuales; 'Editar Masivo' fue movido a la toolbar junto a Descargar) */}
                                    </div>

                                    {/* BARRA: paginación + contador + botón Guardar Cambios */}
                                    <div className="editor-toolbar" style={{ marginBottom: '.75rem' }}>
                                        {/* LEFT: Mostrar + selector + Descargar */}
                                        <div className="toolbar-group toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                                            {/* MOVER: botón "Editar Masivo" a la izquierda de Descargar */}
                                            {userRole && (
                                                <button
                                                    className="btn btn--primary btn--compact"
                                                    onClick={() => setIsEditMode(true)}
                                                    disabled={isEditMode || !['GERENTE', 'ESPECIALISTA'].includes(userRole)}
                                                    title="Editar masivo"
                                                >
                                                    <Icon name="edit" /> Editar Masivo
                                                </button>
                                            )}
                                            <div className="export-dropdown-container" ref={exportMenuRef} style={{ position: 'relative' }}>
                                                <button className="btn btn--primary" onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} aria-haspopup="true" aria-expanded={isExportMenuOpen}>
                                                    <Icon name="upload" /> Descargar
                                                </button>
                                                {isExportMenuOpen && (
                                                    <div className="export-menu" style={{ position: 'absolute', right: 0 }}>
                                                        <button className="export-menu-item" onClick={() => { exportarCSV(servidores); setIsExportMenuOpen(false); }}>
                                                            <Icon name="csv" size={16} /> Exportar como CSV
                                                        </button>
                                                        <button className="export-menu-item" onClick={() => { exportarExcel(servidores); setIsExportMenuOpen(false); }}>
                                                            <Icon name="file-excel" size={16} /> Exportar como Excel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* CENTER: badge + paginación (ocupa el espacio disponible para centrar) */}
                                        <div className="toolbar-group toolbar-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flex: 1 }}>
                                            <span className="badge" style={{ minWidth: 170, textAlign: 'center' }}>{servidores.length} servidores encontrados</span>

                                            {/* MOVIDO: "Mostrar" + selector junto al badge */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                                <label style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Mostrar:</label>
                                                <ItemsPerPageDropdown value={itemsPerPage} onChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }} />
                                            </div>

                                            <div className="pagination-controls-inline" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <button className="btn-icon" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} title="Página Anterior">
                                                    <Icon name="chevron-left" />
                                                </button>
                                                <span>Página <strong className="page-number">{currentPage}</strong> de <strong className="page-number">{Math.max(1, Math.ceil(servidores.length / itemsPerPage))}</strong></span>
                                                <button className="btn-icon" onClick={() => setCurrentPage(Math.min(Math.max(1, Math.ceil(servidores.length / itemsPerPage)), currentPage + 1))} disabled={currentPage >= Math.ceil(servidores.length / itemsPerPage)} title="Página Siguiente">
                                                    <Icon name="chevron-right" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* RIGHT: Guardar Cambios */}
                                        <div className="toolbar-group toolbar-right" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', justifyContent: 'flex-end' }}>
                                            {userRole && (
                                                <>
                                                    {/* NUEVO: botón "Eliminar Seleccionados" a la izquierda de Guardar */}
                                                    <button
                                                        className="btn btn--danger btn--compact"
                                                        onClick={handleEliminarResultados}
                                                        disabled={cargando || seleccionados.size === 0 || !['GERENTE', 'ESPECIALISTA'].includes(userRole)}
                                                        title="Eliminar servidores seleccionados"
                                                    >
                                                        <Icon name="trash" /> Eliminar Seleccionados
                                                    </button>

                                                    <button
                                                        className="btn btn--primary btn--compact"
                                                        onClick={handleGuardarCambios}
                                                        disabled={Object.keys(cambios).length === 0 || cargando || !['GERENTE', 'ESPECIALISTA'].includes(userRole)}
                                                        title={Object.keys(cambios).length === 0 ? "No hay cambios para guardar" : "Guardar cambios en la BD"}
                                                    >
                                                        <Icon name="save" /> Guardar Cambios
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* editor-panel moved below so it appears directly above the table */}
                                    {isEditMode && (
                                        <div className="editor-panel" style={{ marginBottom: '0.75rem' }}>
                                            <SelectorColumnasEditables
                                                opciones={opcionesColumnas}
                                                seleccionadas={columnasEditables}
                                                onChange={setColumnasEditables}
                                            />
                                            {columnasEditables.length > 0 && <BulkEditControls
                                                columnasEditables={columnasEditables}
                                                opcionesColumnas={opcionesColumnas}
                                                bulkEditValues={bulkEditValues}
                                                handleBulkEditChange={handleBulkEditChange}
                                                catalogos={catalogos}
                                                handleApplyBulkEdit={handleApplyBulkEdit}
                                            />}
                                            <div className="editor-panel__actions">
                                                <button className="btn btn--secondary" onClick={() => setIsEditMode(false)}>
                                                    Cancelar
                                                </button>

                                                <button
                                                    className="btn btn--primary btn--apply-all"
                                                    onClick={handleApplyAllBulkEdits}
                                                    disabled={columnasEditables.length === 0}
                                                    title={columnasEditables.length === 0 ? "Selecciona columnas para aplicar" : "Aplicar cambios seleccionados a todos los servidores"}
                                                >
                                                    Aplicar Cambios
                                                </button>


                                            </div>
                                        </div>
                                    )}

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
                        <div className="no-results-message"><p>Realiza una búsqueda.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditorMasivo;