import React, { useState, useEffect } from "react";

const FormularioServidor = ({ setServidores, setModalVisible, onSuccess }) => {
    const [servicios, setServicios] = useState([]);
    const [capas, setCapas] = useState([]);
    const [ambientes, setAmbientes] = useState([]);
    const [dominios, setDominios] = useState([]);
    const [sistemasOperativos, setSistemasOperativos] = useState([]);
    const [estatus, setEstatus] = useState([]);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState("");

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
                        .then(res => {
                            if (!res.ok) {
                                throw new Error(`Error en ${name}: ${res.status} ${res.statusText}`);
                            }
                            return res.json();
                        })
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

                setError(null);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("http://localhost:3001/api/servidores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
            }

            const nuevoServidor = await response.json();
            // Recargar la lista de servidores manualmente
            const responseServidores = await fetch("http://localhost:3001/api/servidores");
            const servidoresActualizados = await responseServidores.json();
            setServidores(servidoresActualizados);

            setMensajeExito("✅ Servidor guardado exitosamente!");
            setModalVisible(false);

            if (onSuccess) {
                setTimeout(() => onSuccess("✅ Servidor guardado exitosamente!"), 100);
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleFormSubmit} className="grid-form">
            {mensajeExito && <div className="success-message">{mensajeExito}</div>}
            {error && <div className="error-message">{error}</div>}

            {/* Fila 1 */}
            <div className="grid-form-row">
                <div className="form-field">
                    <label>Nombre</label>
                    <input type="text" name="nombre" required />
                </div>
                <div className="form-field">
                    <label>Tipo</label>
                    <select name="tipo" required>
                        <option value="FÍSICO">FÍSICO</option>
                        <option value="VIRTUAL">VIRTUAL</option>
                    </select>
                </div>
                <div className="form-field">
                    <label>IP</label>
                    <input type="text" name="ip" required />
                </div>
                <div className="form-field">
                    <label>Balanceador</label>
                    <input type="text" name="balanceador" />
                </div>
                <div className="form-field">
                    <label>VLAN</label>
                    <input type="text" name="vlan" />
                </div>
            </div>

            {/* Fila 2 */}
            <div className="grid-form-row">
                <div className="form-field">
                    <label>Descripción</label>
                    <textarea name="descripcion"></textarea>
                </div>
                <div className="form-field">
                    <label>Link</label>
                    <input type="text" name="link" />
                </div>
                <div className="form-field">
                    <label>Servicio</label>
                    <select name="servicio_id">
                        <option value="">Seleccione un Servicio</option>
                        {servicios.map(servicio => (
                            <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Capa</label>
                    <select name="capa_id">
                        <option value="">Seleccione una Capa</option>
                        {capas.map(capa => (
                            <option key={capa.id} value={capa.id}>{capa.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Ambiente</label>
                    <select name="ambiente_id">
                        <option value="">Seleccione un Ambiente</option>
                        {ambientes.map(ambiente => (
                            <option key={ambiente.id} value={ambiente.id}>{ambiente.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Fila 3 */}
            <div className="grid-form-row">
                <div className="form-field">
                    <label>Dominio</label>
                    <select name="dominio_id">
                        <option value="">Seleccione un Dominio</option>
                        {dominios.map(dominio => (
                            <option key={dominio.id} value={dominio.id}>{dominio.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Sistema Operativo</label>
                    <select name="sistema_operativo_id">
                        <option value="">Seleccione un S.O.</option>
                        {sistemasOperativos.map(so => (
                            <option key={so.id} value={so.id}>{so.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Estatus</label>
                    <select name="estatus_id">
                        <option value="">Seleccione un Estatus</option>
                        {estatus.map(est => (
                            <option key={est.id} value={est.id}>{est.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Acciones */}
            <div className="modal-buttons">
                <button type="submit" className="guardar-servidores-btn">Guardar</button>
                <button type="button" className="cerrar-servidores-btn" onClick={() => setModalVisible(false)}>Cerrar</button>
            </div>
        </form>
    );
};

export default FormularioServidor;