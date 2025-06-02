import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const FormularioServidor = ({ servidorInicial, setServidores, setModalVisible, esEdicion }) => {
    const [servicios, setServicios] = useState([]);
    const [capas, setCapas] = useState([]);
    const [ambientes, setAmbientes] = useState([]);
    const [dominios, setDominios] = useState([]);
    const [sistemasOperativos, setSistemasOperativos] = useState([]);
    const [estatus, setEstatus] = useState([]);
    const [formData, setFormData] = useState({
        nombre: "",
        tipo: "",
        ip: "",
        balanceador: "",
        vlan: "",
        servicio_id: "",
        capa_id: "",
        ambiente_id: "",
        link: "",
        descripcion: "",
        dominio_id: "",
        sistema_operativo_id: "",
        estatus_id: "1"
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const urls = [
                    { name: "servicios", url: "http://localhost:3001/api/servicios" },
                    { name: "capas", url: "http://localhost:3001/api/capas" },
                    { name: "ambientes", url: "http://localhost:3001/api/ambientes" },
                    { name: "dominios", url: "http://localhost:3001/api/dominios" },
                    { name: "sistemasOperativos", url: "http://localhost:3001/api/sistemas_operativos" },
                    { name: "estatus", url: "http://localhost:3001/api/estatus" }
                ];

                const responses = await Promise.all(urls.map(({ name, url }) =>
                    fetch(url)
                        .then(res => res.ok ? res.json() : Promise.reject(`Error en ${name}: ${res.status}`))
                        .catch(err => {
                            console.error(`Error al obtener ${name}:`, err);
                            return [];
                        })
                ));

                setServicios(responses[0]);
                setCapas(responses[1]);
                setAmbientes(responses[2]);
                setDominios(responses[3]);
                setSistemasOperativos(responses[4]);
                setEstatus(responses[5]);
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error en la carga de datos",
                    text: error.message,
                    showConfirmButton: true,
                    confirmButtonText: "Cerrar",
                    width: "50%"
                });
            }
        };

        fetchData();

        if (esEdicion && servidorInicial) {
            setFormData({
                nombre: servidorInicial.nombre || "",
                tipo: servidorInicial.tipo || "",
                ip: servidorInicial.ip || "",
                balanceador: servidorInicial.balanceador || "",
                vlan: servidorInicial.vlan || "",
                servicio_id: servidorInicial.servicios?.[0]?.id || "",
                capa_id: servidorInicial.capas?.[0]?.id || "",
                ambiente_id: servidorInicial.ambientes?.[0]?.id || "",
                descripcion: servidorInicial.descripcion || "",
                dominio_id: servidorInicial.dominios?.[0]?.id || "",
                sistema_operativo_id: servidorInicial.sistemasOperativos?.[0]?.id || "",
                estatus_id: servidorInicial.estatus?.[0]?.id || "1"
            });
        }
    }, [servidorInicial, esEdicion]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault(); /* 🔹 Evita que el formulario recargue la página */

        const requiredFields = Object.keys(formData).filter(field => !formData[field] || formData[field] === "");

        if (requiredFields.length > 0) {
            Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                html: requiredFields.map(field =>
                    `<p class="alerta-campos-faltantes">${field.replace("_id", "").toUpperCase()}</p>`
                ).join(""),
                timer: 3000, /* 🔹 Se cerrará automáticamente */
                showConfirmButton: false,
                width: "50%"
            });
            return;
        }

        Swal.fire({
            title: esEdicion ? "Confirmar actualización" : "Confirmar creación",
            text: esEdicion ? "¿Seguro que deseas actualizar este servidor?" : "¿Seguro que deseas guardar este servidor?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#007953",
            cancelButtonColor: "#dc3545",
            confirmButtonText: "Sí, guardar"
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                const response = await fetch(
                    esEdicion
                        ? `http://localhost:3001/api/servidores/${servidorInicial?.id}`
                        : "http://localhost:3001/api/servidores",
                    {
                        method: esEdicion ? "PUT" : "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...formData, activo: servidorInicial?.activo ?? true })
                    }
                );

                if (!response.ok) throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);

                const servidorActualizado = await response.json();

                setServidores(prevServidores =>
                    esEdicion ? prevServidores.map(s => s.id === servidorActualizado.id ? servidorActualizado : s) : [...prevServidores, servidorActualizado]
                );

                setModalVisible(false);

                Swal.fire({
                    icon: "success",
                    title: esEdicion ? "Servidor actualizado" : "Servidor guardado",
                    showConfirmButton: false,
                    width: "50%",
                    timer: 2000
                });

            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error al guardar el servidor",
                    text: error.message,
                    showConfirmButton: true,
                    confirmButtonText: "Cerrar"
                });
            }
        });
    };

    return (
        <form onSubmit={handleFormSubmit} className="grid-form">
            {/* 🔹 Fila 1 */}
            <div className="grid-form-row">
                <div className="form-field">
                    <label>Nombre</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} />
                </div>
                <div className="form-field">
                    <label>Tipo</label>
                    <select name="tipo" value={formData.tipo} onChange={handleChange} >
                        <option value="">Seleccione el Tipo</option>
                        <option value="FISICO">FISICO</option>
                        <option value="VIRTUAL">VIRTUAL</option>
                    </select>
                </div>
                <div className="form-field">
                    <label>IP</label>
                    <input type="text" name="ip" value={formData.ip} onChange={handleChange} />
                </div>
                <div className="form-field">
                    <label>Balanceador</label>
                    <input type="text" name="balanceador" value={formData.balanceador} onChange={handleChange} />
                </div>
                <div className="form-field">
                    <label>VLAN</label>
                    <input type="text" name="vlan" value={formData.vlan} onChange={handleChange} />
                </div>
            </div>

            {/* 🔹 Fila 2 con campos más pequeños */}
            <div className="grid-form-row">
                <div className="form-field field-small">
                    <label>Servicio</label>
                    <select name="servicio_id" value={formData.servicio_id} onChange={handleChange} >
                        <option value="">Seleccione un Servicio</option>
                        {servicios.map(servicio => (
                            <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field field-small">
                    <label>Capa</label>
                    <select name="capa_id" value={formData.capa_id} onChange={handleChange} >
                        <option value="">Seleccione una Capa</option>
                        {capas.map(capa => (
                            <option key={capa.id} value={capa.id}>{capa.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field field-small">
                    <label>Ambiente</label>
                    <select name="ambiente_id" value={formData.ambiente_id} onChange={handleChange} >
                        <option value="">Seleccione un Ambiente</option>
                        {ambientes.map(ambiente => (
                            <option key={ambiente.id} value={ambiente.id}>{ambiente.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field field-small">
                    <label>Link</label>
                    <input type="text" name="link" value={formData.link} onChange={handleChange} />
                </div>
                <div className="form-field field-small">
                    <label>Descripción</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange}></textarea>
                </div>
            </div>

            {/* 🔹 Fila 3 */}
            <div className="grid-form-row">
                <div className="form-field">
                    <label>Dominio</label>
                    <select name="dominio_id" value={formData.dominio_id} onChange={handleChange} >
                        <option value="">Seleccione un Dominio</option>
                        {dominios.map(dominio => (
                            <option key={dominio.id} value={dominio.id}>{dominio.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Sistema Operativo</label>
                    <select name="sistema_operativo_id" value={formData.sistema_operativo_id} onChange={handleChange} >
                        <option value="">Seleccione un S.O.</option>
                        {sistemasOperativos.map(so => (
                            <option key={so.id} value={so.id}>{so.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Estatus</label>
                    <select name="estatus_id" value={formData.estatus_id} onChange={handleChange} >
                        <option value="">Seleccione un Estatus</option>
                        {estatus.map(est => (
                            <option key={est.id} value={est.id}>{est.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 🔹 Botones con SweetAlert2 */}
            <div className="modal-buttons">
                <button type="submit" className="guardar-servidores-btn">
                    Guardar
                </button>

                {/* 🔹 Botón de cierre con estilo rojo */}
                <button
                    type="button"
                    className="cerrar-servidores-btn btn-red"
                    onClick={() => Swal.fire({
                        title: "Cerrar formulario",
                        text: "¿Seguro que deseas cerrar sin guardar?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#dc3545",
                        cancelButtonColor: "#007953",
                        confirmButtonText: "Sí, cerrar"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            setModalVisible(false);
                        }
                    })}
                >
                    Cerrar
                </button>
            </div>
        </form>
    );
};

export default FormularioServidor;