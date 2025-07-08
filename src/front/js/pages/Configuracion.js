import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Loading from '../component/Loading';
import ServicioFormulario from '../component/ServicioFormulario';
import ServicioLista from '../component/ServicioLista';
import CapaFormulario from '../component/CapaFormulario';
import CapaLista from '../component/CapaLista';
import AmbienteFormulario from '../component/AmbienteFormulario';
import AmbienteLista from '../component/AmbienteLista';
import DominioFormulario from '../component/DominioFormulario';
import DominioLista from '../component/DominioLista';
import SistemaOperativoFormulario from '../component/SistemaOperativoFormulario';
import SistemaOperativoLista from '../component/SistemaOperativoLista';
import EstatusFormulario from '../component/EstatusFormulario';
import EstatusLista from '../component/EstatusLista';


const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

const configItems = [
    {
        label: "Servicio",
        createView: "crear-servicio",
        listView: "listar-servicios",
        apiResource: "servicios"
    },
    {
        label: "Capa",
        createView: "crear-capa",
        listView: "listar-capas",
        apiResource: "capas"
    },
    {
        label: "Ambiente",
        createView: "crear-ambiente",
        listView: "listar-ambientes",
        apiResource: "ambientes"
    },
    {
        label: "Dominio",
        createView: "crear-dominio",
        listView: "listar-dominios",
        apiResource: "dominios"
    },
    {
        label: "Sistema Operativo",
        createView: "crear-sistema-operativo",
        listView: "listar-sistemas-operativos",
        apiResource: "sistemas_operativos"
    },
    {
        label: "Estatus",
        createView: "crear-estatus",
        listView: "listar-estatus",
        apiResource: "estatus"
    }
];

// El componente ahora recibe 'activeView' para saber qué enlace resaltar
const AccordionItem = ({ item, isOpen, onClick, onShowCreate, onShowList, activeView }) => (
    <div className="config-menu-item">
        <button className="config-menu-header" onClick={onClick}>
            <span>{item.label}</span>
            <span className={`config-menu-arrow ${isOpen ? 'open' : ''}`}>
                <ChevronDownIcon />
            </span>
        </button>
        <div className={`config-submenu ${isOpen ? 'open' : ''}`}>
            {/* Se añade la clase 'active' condicionalmente a los enlaces internos */}
            <a href="#" className={`config-submenu-link ${activeView === item.createView ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onShowCreate(item.createView); }}>
                Crear {item.label}
            </a>
            <a href="#" className={`config-submenu-link ${activeView === item.listView ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onShowList(item.listView); }}>
                Listar {item.label}s
            </a>
        </div>
    </div>
);

const Configuracion = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [activeView, setActiveView] = useState('inicio');
    const [currentItem, setCurrentItem] = useState(null);

    const [servicios, setServicios] = useState([]);
    const [capas, setCapas] = useState([]);
    const [ambientes, setAmbientes] = useState([]);
    const [dominios, setDominios] = useState([]);
    const [sistemasOperativos, setSistemasOperativos] = useState([]);
    const [estatus, setEstatus] = useState([]);

    const [cargando, setCargando] = useState(false);

    const fetchGeneric = (endpoint, setter) => {
        setCargando(true);
        fetch(`${process.env.BACKEND_URL}/api/${endpoint}`)
            .then(res => res.ok ? res.json() : [])
            .then(setter)
            .catch(console.error)
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        const currentItem = configItems.find(item => item.listView === activeView);
        if (currentItem) {
            const setters = {
                'servicios': setServicios,
                'capas': setCapas,
                'ambientes': setAmbientes,
                'dominios': setDominios,
                'sistemas_operativos': setSistemasOperativos,
                'estatus': setEstatus
            };
            fetchGeneric(currentItem.apiResource, setters[currentItem.apiResource]);
        }
    }, [activeView]);

    const handleAccordionClick = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleEdit = (item, type) => {
        setCurrentItem(item);
        setActiveView(`crear-${type}`);
    };

    const handleCancel = () => {
        setCurrentItem(null);
        setActiveView('inicio');
    };

    const handleShowCreateForm = (view) => {
        setCurrentItem(null);
        setActiveView(view);
    };

    const handleShowList = (view) => {
        setCurrentItem(null);
        setActiveView(view);
    };

    const handleSave = (formData) => {
        const configItem = configItems.find(item => item.createView === activeView);
        if (!configItem) return;

        const { apiResource, listView, label } = configItem;
        const esEdicion = !!currentItem;
        const metodo = esEdicion ? "PUT" : "POST";
        const url = esEdicion
            ? `${process.env.BACKEND_URL}/api/${apiResource}/${currentItem.id}`
            : `${process.env.BACKEND_URL}/api/${apiResource}`;

        fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
            .then(response => {
                if (!response.ok) return response.json().then(err => Promise.reject(err));
                return response.json();
            })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: `${label} ${esEdicion ? 'actualizado' : 'creado'} correctamente.`,
                    timer: 2500,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                setCurrentItem(null);
                setActiveView(listView);
            })
            .catch(err => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.msg || `No se pudo guardar.`,
                    timer: 2500,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            });
    };

    const renderContent = () => {
        const fetchFunctions = {
            'servicios': () => fetchGeneric('servicios', setServicios),
            'capas': () => fetchGeneric('capas', setCapas),
            'ambientes': () => fetchGeneric('ambientes', setAmbientes),
            'dominios': () => fetchGeneric('dominios', setDominios),
            'sistemas_operativos': () => fetchGeneric('sistemas_operativos', setSistemasOperativos),
            'estatus': () => fetchGeneric('estatus', setEstatus),
        };

        switch (activeView) {
            case 'inicio':
                return (
                    <div className="config-hero-section">
                        <div className="decorative-line-top"></div>
                        <h1 className="config-main-title">Configuración de Servidores</h1>
                        <p className="config-subtitle">"Administra la Información de los Servidores"</p>
                        <div className="decorative-line-bottom"></div>
                    </div>
                );
            case 'crear-servicio':
                return <div className="content-wrapper"><ServicioFormulario onSave={handleSave} onCancel={handleCancel} servicio={currentItem} serviciosExistentes={servicios} /></div>;
            case 'listar-servicios':
                return <div className="content-wrapper"><ServicioLista servicios={servicios} onEdit={(item) => handleEdit(item, 'servicio')} fetchServicios={fetchFunctions.servicios} cargando={cargando} /></div>;

            case 'crear-capa':
                return <div className="content-wrapper"><CapaFormulario onSave={handleSave} onCancel={handleCancel} capa={currentItem} capasExistentes={capas} /></div>;
            case 'listar-capas':
                return <div className="content-wrapper"><CapaLista capas={capas} onEdit={(item) => handleEdit(item, 'capa')} fetchCapas={fetchFunctions.capas} cargando={cargando} /></div>;

            case 'crear-ambiente':
                return <div className="content-wrapper"><AmbienteFormulario onSave={handleSave} onCancel={handleCancel} ambiente={currentItem} ambientesExistentes={ambientes} /></div>;
            case 'listar-ambientes':
                return <div className="content-wrapper"><AmbienteLista ambientes={ambientes} onEdit={(item) => handleEdit(item, 'ambiente')} fetchAmbientes={fetchFunctions.ambientes} cargando={cargando} /></div>;

            case 'crear-dominio':
                return <div className="content-wrapper"><DominioFormulario onSave={handleSave} onCancel={handleCancel} dominio={currentItem} dominiosExistentes={dominios} /></div>;
            case 'listar-dominios':
                return <div className="content-wrapper"><DominioLista dominios={dominios} onEdit={(item) => handleEdit(item, 'dominio')} fetchDominios={fetchFunctions.dominios} cargando={cargando} /></div>;

            case 'crear-sistema-operativo':
                return <div className="content-wrapper"><SistemaOperativoFormulario onSave={handleSave} onCancel={handleCancel} sistemaOperativo={currentItem} sistemasOperativosExistentes={sistemasOperativos} /></div>;
            case 'listar-sistemas-operativos':
                return <div className="content-wrapper"><SistemaOperativoLista sistemasOperativos={sistemasOperativos} onEdit={(item) => handleEdit(item, 'sistema-operativo')} fetchSistemasOperativos={fetchFunctions.sistemas_operativos} cargando={cargando} /></div>;

            case 'crear-estatus':
                return <div className="content-wrapper"><EstatusFormulario onSave={handleSave} onCancel={handleCancel} estatus={currentItem} estatusExistentes={estatus} /></div>;
            case 'listar-estatus':
                return <div className="content-wrapper"><EstatusLista estatus={estatus} onEdit={(item) => handleEdit(item, 'estatus')} fetchEstatus={fetchFunctions.estatus} cargando={cargando} /></div>;

            default:
                return null;
        }
    };

    return (
        <div className="page-container">
            <div className="config-page-layout">
                <aside className="config-sidebar">
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">BanescOnline Empresas</h2>
                    </div>
                    <nav className="config-menu">
                        {configItems.map((item, index) => (
                            <AccordionItem
                                key={index}
                                item={item}
                                isOpen={openIndex === index}
                                onClick={() => handleAccordionClick(index)}
                                onShowCreate={handleShowCreateForm}
                                onShowList={handleShowList}
                                activeView={activeView}
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
