import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Loading from '../component/Loading';
import ServicioFormulario from '../component/ServicioFormulario';
import ServicioLista from '../component/ServicioLista';

// --- Icono para el menú desplegable ---
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

const configItems = [
    {
        label: "Servicio",
        createView: "crear-servicio",
        listView: "listar-servicios"
    },
    // Añade aquí los demás items de configuración (Capa, Ambiente, etc.)
];

// CORRECCIÓN 1: El componente del menú ahora recibe funciones específicas para cada acción
const AccordionItem = ({ item, isOpen, onClick, onShowCreate, onShowList }) => (
    <div className="config-menu-item">
        <button className="config-menu-header" onClick={onClick}>
            <span>{item.label}</span>
            <span className={`config-menu-arrow ${isOpen ? 'open' : ''}`}>
                <ChevronDownIcon />
            </span>
        </button>
        <div className={`config-submenu ${isOpen ? 'open' : ''}`}>
            {/* Al hacer clic, llama a la función para mostrar el formulario de creación */}
            <a href="#" className="config-submenu-link" onClick={(e) => { e.preventDefault(); onShowCreate(item.createView); }}>
                Crear {item.label}
            </a>
            {/* Al hacer clic, llama a la función para mostrar la lista */}
            <a href="#" className="config-submenu-link" onClick={(e) => { e.preventDefault(); onShowList(item.listView); }}>
                Listar {item.label}s
            </a>
        </div>
    </div>
);

const Configuracion = () => {
    const [openIndex, setOpenIndex] = useState(0);
    const [activeView, setActiveView] = useState('listar-servicios'); // Vista por defecto
    const [currentItem, setCurrentItem] = useState(null); // Para pasar datos al editar
    const [servicios, setServicios] = useState([]);
    const [cargando, setCargando] = useState(true);

    const fetchServicios = () => {
        setCargando(true);
        fetch(`${process.env.BACKEND_URL}/api/servicios`)
            .then(response => response.ok ? response.json() : Promise.reject("Error al obtener servicios."))
            .then(data => setServicios(data))
            .catch(error => console.error("Error al obtener servicios:", error))
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        fetchServicios();
    }, []);

    const handleAccordionClick = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Esta función se llama al hacer clic en "Editar" desde la lista
    const handleEdit = (item, type) => {
        setCurrentItem(item); // Guarda el item a editar
        setActiveView(`crear-${type}`); // Muestra el formulario
    };

    // Esta función se llama al hacer clic en "Cancelar" desde el formulario
    const handleCancel = () => {
        setCurrentItem(null); // Limpia el item
        const type = activeView.split('-')[1];
        setActiveView(`listar-${type}s`); // Vuelve a la lista
    };

    // CORRECCIÓN 2: Nuevas funciones para manejar la navegación desde el menú
    // Esta se activa al hacer clic en "Crear Servicio"
    const handleShowCreateForm = (view) => {
        setCurrentItem(null); // <-- LA CLAVE: Limpia el item actual
        setActiveView(view);  // Muestra el formulario vacío
    };

    // Esta se activa al hacer clic en "Listar Servicios"
    const handleShowList = (view) => {
        setCurrentItem(null); // Limpia el item actual por si acaso
        setActiveView(view);  // Muestra la lista
    };

    const handleSave = (formData) => {
        const esEdicion = !!currentItem;
        const metodo = esEdicion ? "PUT" : "POST";
        const url = esEdicion
            ? `${process.env.BACKEND_URL}/api/servicios/${currentItem.id}`
            : `${process.env.BACKEND_URL}/api/servicios`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => Promise.reject(err));
                }
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    return response.json();
                } else {
                    return {};
                }
            })
            .then(() => {
                fetchServicios();
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: `Servicio ${esEdicion ? 'actualizado' : 'creado'} correctamente.`,
                    timer: 2500,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                setCurrentItem(null);
                setActiveView('listar-servicios');
            })
            .catch(err => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.msg || 'No se pudo guardar el servicio.',
                    timer: 2500,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            });
    };

    const renderContent = () => {
        switch (activeView) {
            case 'listar-servicios':
                return <ServicioLista servicios={servicios} onEdit={(item) => handleEdit(item, 'servicio')} fetchServicios={fetchServicios} cargando={cargando} />;
            case 'crear-servicio':
                return <ServicioFormulario onSave={handleSave} onCancel={handleCancel} servicio={currentItem} serviciosExistentes={servicios} />;
            default:
                return <ServicioLista servicios={servicios} onEdit={(item) => handleEdit(item, 'servicio')} fetchServicios={fetchServicios} cargando={cargando} />;
        }
    };

    return (
        <div className="page-container">
            <div className="config-hero-section">
                <div className="decorative-line-top"></div>
                <h1 className="config-main-title">Configuración de Servidores</h1>
                <p className="config-subtitle">"Administra la Información de los Servidores"</p>
                <div className="decorative-line-bottom"></div>
            </div>
            <div className="config-page-layout">
                <aside className="config-sidebar">
                    <nav className="config-menu">
                        {configItems.map((item, index) => (
                            // CORRECCIÓN 3: Se pasan las nuevas funciones al componente del menú
                            <AccordionItem
                                key={index}
                                item={item}
                                isOpen={openIndex === index}
                                onClick={() => handleAccordionClick(index)}
                                onShowCreate={handleShowCreateForm}
                                onShowList={handleShowList}
                            />
                        ))}
                    </nav>
                </aside>
                <main className="config-main-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Configuracion;
