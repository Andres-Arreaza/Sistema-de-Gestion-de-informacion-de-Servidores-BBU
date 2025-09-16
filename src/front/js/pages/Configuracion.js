import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Loading from '../component/Loading';
import ServicioFormulario from '../component/ServicioFormulario';
import ServicioLista from '../component/ServicioLista';
import EcosistemaFormulario from '../component/EcosistemaFormulario';
import EcosistemaLista from '../component/EcosistemaLista';
import CapaFormulario from '../component/CapaFormulario';
import CapaLista from '../component/CapaLista';
import AmbienteFormulario from '../component/AmbienteFormulario';
import AmbienteLista from '../component/AmbienteLista';
import DominioFormulario from '../component/DominioFormulario';
import DominioLista from '../component/DominioLista';
import SistemaOperativoFormulario from '../component/SistemaOperativoFormulario';
import SistemaOperativoLista from '../component/SistemaOperativoLista';
import AplicacionFormulario from '../component/AplicacionFormulario';
import AplicacionLista from '../component/AplicacionLista.js';
import EstatusFormulario from '../component/EstatusFormulario';
import EstatusLista from '../component/EstatusLista';
import Icon from '../component/Icon';

const configItems = [
    { label: "Servicio", createView: "crear-servicio", listView: "listar-servicios", apiResource: "servicios" },
    { label: "Ecosistema", createView: "crear-ecosistema", listView: "listar-ecosistemas", apiResource: "ecosistemas" },
    { label: "Capa", createView: "crear-capa", listView: "listar-capas", apiResource: "capas" },
    { label: "Ambiente", createView: "crear-ambiente", listView: "listar-ambientes", apiResource: "ambientes" },
    { label: "Dominio", createView: "crear-dominio", listView: "listar-dominios", apiResource: "dominios" },
    { label: "Sistema Operativo", createView: "crear-sistema-operativo", listView: "listar-sistemas-operativos", apiResource: "sistemas_operativos" },
    { label: "Estatus", createView: "crear-estatus", listView: "listar-estatus", apiResource: "estatus" },
    { label: "Aplicación", createView: "crear-aplicacion", listView: "listar-aplicaciones", apiResource: "aplicaciones" }
];

const AccordionItem = ({ item, isOpen, onClick, onShowCreate, onShowList, isModuleActive, activeView }) => (
    <div className={`config-menu-item ${isModuleActive ? 'module-active' : ''}`}>
        <button className="config-menu-header" onClick={onClick}>
            <span>{item.label}</span>
            <span className={`config-menu-arrow ${isOpen ? 'open' : ''}`}>
                <Icon name="chevron-down" size={16} />
            </span>
        </button>
        <div className={`config-submenu ${isOpen ? 'open' : ''}`}>
            <a href="#" className={`config-submenu-link ${activeView === item.createView ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onShowCreate(item.createView); }}>
                Crear {item.label}
            </a>
            <a href="#" className={`config-submenu-link ${activeView === item.listView ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onShowList(item.listView); }}>
                Listar {item.label}
            </a>
        </div>
    </div>
);

const Configuracion = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [activeView, setActiveView] = useState('inicio');
    const [currentItem, setCurrentItem] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [catalogos, setCatalogos] = useState({
        servicios: [], ecosistemas: [], capas: [], ambientes: [], dominios: [], sistemasOperativos: [], estatus: [], aplicaciones: []
    });

    const fetchAllCatalogos = async () => {
        setCargando(true);
        try {
            const promises = configItems.map(item =>
                fetch(`${process.env.BACKEND_URL}/api/${item.apiResource}`)
                    .then(res => res.ok ? res.json() : [])
            );
            const results = await Promise.all(promises);
            const newCatalogos = {};
            configItems.forEach((item, index) => {
                let key = item.apiResource.replace('sistemas_operativos', 'sistemasOperativos');
                key = key.replace('ecosistemas', 'ecosistemas');
                key = key.replace('aplicaciones', 'aplicaciones'); // Mantenemos 'aplicaciones' en el estado para consistencia
                newCatalogos[key] = results[index] || [];
            });
            setCatalogos(newCatalogos);
        } catch (error) {
            console.error("Error al cargar catálogos:", error);
            Swal.fire("Error", "No se pudieron cargar los datos de configuración.", "error");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchAllCatalogos();
    }, []);

    const fetchRecurso = (apiResource) => {
        let key = apiResource.replace('sistemas_operativos', 'sistemasOperativos');
        key = key.replace('ecosistemas', 'ecosistemas');
        key = key.replace('aplicaciones', 'aplicaciones'); // Mantenemos 'aplicaciones' en el estado
        setCargando(true);
        fetch(`${process.env.BACKEND_URL}/api/${apiResource}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setCatalogos(prev => ({ ...prev, [key]: data }));
            })
            .catch(console.error)
            .finally(() => setCargando(false));
    };

    const handleSave = (formData) => {
        const configItem = configItems.find(item => item.createView === activeView);
        if (!configItem) return;

        const { apiResource, listView, label } = configItem;
        const esEdicion = !!currentItem;
        const metodo = esEdicion ? "PUT" : "POST";
        const url = esEdicion
            ? `${process.env.BACKEND_URL}/api/${apiResource}/${currentItem?.id}`
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
                    timer: 2000,
                    showConfirmButton: false
                });
                setCurrentItem(null);
                setActiveView(listView);
                fetchRecurso(apiResource);
            })
            .catch(err => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al Guardar',
                    text: err.msg || `No se pudo guardar el registro.`,
                });
            });
    };

    const handleAccordionClick = (index) => setOpenIndex(openIndex === index ? null : index);
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

    const renderContent = () => {
        switch (activeView) {
            case 'inicio':
                return (
                    <div key="inicio" className="content-wrapper">
                        <section className="hero hero--config">
                            <div className="hero__content">
                                <h1 className="hero__title config__title">Configuración de Información</h1>
                                <p className="hero__subtitle config__subtitle">"Administra los módulos de los Servidores"</p>
                            </div>
                        </section>
                    </div>
                );
            case 'crear-servicio':
                return <div key="crear-servicio" className="content-wrapper content-wrapper--plain"><ServicioFormulario onSave={handleSave} onCancel={handleCancel} servicio={currentItem} serviciosExistentes={catalogos.servicios} /></div>;
            case 'listar-servicios':
                return <div key="listar-servicios" className="content-wrapper"><ServicioLista servicios={catalogos.servicios} onEdit={(item) => handleEdit(item, 'servicio')} fetchServicios={() => fetchRecurso('servicios')} cargando={cargando} /></div>;

            case 'crear-ecosistema':
                return <div key="crear-ecosistema" className="content-wrapper content-wrapper--plain"><EcosistemaFormulario onSave={handleSave} onCancel={handleCancel} ecosistema={currentItem} ecosistemasExistentes={catalogos.ecosistemas} /></div>;
            case 'listar-ecosistemas':
                return <div key="listar-ecosistemas" className="content-wrapper"><EcosistemaLista ecosistemas={catalogos.ecosistemas} onEdit={(item) => handleEdit(item, 'ecosistema')} fetchEcosistemas={() => fetchRecurso('ecosistemas')} cargando={cargando} /></div>;

            case 'crear-capa':
                return <div key="crear-capa" className="content-wrapper content-wrapper--plain"><CapaFormulario onSave={handleSave} onCancel={handleCancel} capa={currentItem} capasExistentes={catalogos.capas} /></div>;
            case 'listar-capas':
                return <div key="listar-capas" className="content-wrapper"><CapaLista capas={catalogos.capas} onEdit={(item) => handleEdit(item, 'capa')} fetchCapas={() => fetchRecurso('capas')} cargando={cargando} /></div>;

            case 'crear-ambiente':
                return <div key="crear-ambiente" className="content-wrapper content-wrapper--plain"><AmbienteFormulario onSave={handleSave} onCancel={handleCancel} ambiente={currentItem} ambientesExistentes={catalogos.ambientes} /></div>;
            case 'listar-ambientes':
                return <div key="listar-ambientes" className="content-wrapper"><AmbienteLista ambientes={catalogos.ambientes} onEdit={(item) => handleEdit(item, 'ambiente')} fetchAmbientes={() => fetchRecurso('ambientes')} cargando={cargando} /></div>;

            case 'crear-dominio':
                return <div key="crear-dominio" className="content-wrapper content-wrapper--plain"><DominioFormulario onSave={handleSave} onCancel={handleCancel} dominio={currentItem} dominiosExistentes={catalogos.dominios} /></div>;
            case 'listar-dominios':
                return <div key="listar-dominios" className="content-wrapper"><DominioLista dominios={catalogos.dominios} onEdit={(item) => handleEdit(item, 'dominio')} fetchDominios={() => fetchRecurso('dominios')} cargando={cargando} /></div>;

            case 'crear-sistema-operativo':
                return <div key="crear-sistema-operativo" className="content-wrapper content-wrapper--plain"><SistemaOperativoFormulario onSave={handleSave} onCancel={handleCancel} sistemaOperativo={currentItem} sistemasOperativosExistentes={catalogos.sistemasOperativos} /></div>;
            case 'listar-sistemas-operativos':
                return <div key="listar-sistemas-operativos" className="content-wrapper"><SistemaOperativoLista sistemasOperativos={catalogos.sistemasOperativos} onEdit={(item) => handleEdit(item, 'sistema-operativo')} fetchSistemasOperativos={() => fetchRecurso('sistemas_operativos')} cargando={cargando} /></div>;

            case 'crear-estatus':
                return <div key="crear-estatus" className="content-wrapper content-wrapper--plain"><EstatusFormulario onSave={handleSave} onCancel={handleCancel} estatus={currentItem} estatusExistentes={catalogos.estatus} /></div>;
            case 'listar-estatus':
                return <div key="listar-estatus" className="content-wrapper"><EstatusLista estatus={catalogos.estatus} onEdit={(item) => handleEdit(item, 'estatus')} fetchEstatus={() => fetchRecurso('estatus')} cargando={cargando} /></div>;

            case 'crear-aplicacion':
                return <div key="crear-aplicacion" className="content-wrapper content-wrapper--plain"><AplicacionFormulario onSave={handleSave} onCancel={handleCancel} aplicacion={currentItem} aplicacionesExistentes={catalogos.aplicaciones} /></div>;
            case 'listar-aplicaciones':
                return <div key="listar-aplicaciones" className="content-wrapper"><AplicacionLista aplicaciones={catalogos.aplicaciones} onEdit={(item) => handleEdit(item, 'aplicacion')} fetchAplicaciones={() => fetchRecurso('aplicacion')} cargando={cargando} /></div>;

            default: return null;
        }
    };

    return (
        <div className="page-container config-page">
            <aside className="config-sidebar">
                <nav className="config-menu">
                    {configItems.map((item, index) => {
                        const isModuleActive = activeView.includes(item.createView) || activeView.includes(item.listView);
                        return (
                            <AccordionItem
                                key={index}
                                item={item}
                                isOpen={openIndex === index}
                                onClick={() => handleAccordionClick(index)}
                                onShowCreate={handleShowCreateForm}
                                onShowList={handleShowList}
                                isModuleActive={isModuleActive}
                                activeView={activeView}
                            />
                        );
                    })}
                </nav>
            </aside>
            <main className="config-main-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default Configuracion;
