const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            message: null, // Estado para almacenar mensajes del backend
            servers: [], // Lista de servidores obtenida del backend
            services: [], // Lista de servicios obtenida del backend
            capas: [] // Lista de capas obtenida del backend
        },

        actions: {
            // 🔹 Obtener servidores desde el backend
            getServers: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/servers");
                    if (!resp.ok) throw new Error("Error al obtener servidores.");

                    const data = await resp.json();
                    setStore({ servers: data });
                    return data;
                } catch (error) {
                    console.error("Error cargando servidores:", error);
                }
            },

            // 🔹 Obtener mensaje del backend
            getMessage: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/hello");
                    if (!resp.ok) throw new Error("Error al obtener mensaje.");

                    const data = await resp.json();
                    setStore({ message: data.message });
                    return data;
                } catch (error) {
                    console.error("Error cargando mensaje:", error);
                }
            },

            // 🔹 Obtener servicios desde el backend
            getServices: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/servicios");
                    if (!resp.ok) throw new Error("Error al obtener servicios.");

                    const data = await resp.json();
                    setStore({ services: data });
                    return data;
                } catch (error) {
                    console.error("Error cargando servicios:", error);
                }
            },

            // 🔹 Obtener capas desde el backend
            getCapas: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/capas");
                    if (!resp.ok) throw new Error("Error al obtener capas.");

                    const data = await resp.json();
                    console.log("Capas recibidas:", data); // 🔹 Verifica en la consola si llegan los datos
                    setStore({ capas: data }); // 🔹 Guarda las capas en el estado global
                    return data;
                } catch (error) {
                    console.error("Error cargando capas:", error);
                }
            },

            // 🔹 Crear o actualizar servicio
            saveService: async (service) => {
                try {
                    const metodo = service.id ? "PUT" : "POST";
                    const url = service.id
                        ? `${process.env.BACKEND_URL}/api/servicios/${service.id}`
                        : `${process.env.BACKEND_URL}/api/servicios`;

                    const resp = await fetch(url, {
                        method: metodo,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(service),
                    });

                    const data = await resp.json();
                    if (data.error) {
                        console.error("Error al guardar servicio:", data.error);
                    } else {
                        getActions().getServices();
                    }
                } catch (error) {
                    console.error("Error al guardar servicio:", error);
                }
            },

            // 🔹 Eliminar servicio
            deleteService: async (id) => {
                try {
                    const resp = await fetch(`${process.env.BACKEND_URL}/api/servicios/${id}`, { method: "DELETE" });
                    await resp.json();
                    getActions().getServices();
                } catch (error) {
                    console.error("Error al eliminar servicio:", error);
                }
            },

            // 🔹 Crear o actualizar capa
            saveCapa: async (capa) => {
                try {
                    const metodo = capa.id ? "PUT" : "POST";
                    const url = capa.id
                        ? `${process.env.BACKEND_URL}/api/capas/${capa.id}`
                        : `${process.env.BACKEND_URL}/api/capas`;

                    const resp = await fetch(url, {
                        method: metodo,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(capa),
                    });

                    const data = await resp.json();
                    if (data.error) {
                        console.error("Error al guardar capa:", data.error);
                    } else {
                        getActions().getCapas();
                    }
                } catch (error) {
                    console.error("Error al guardar capa:", error);
                }
            },

            // 🔹 Eliminar capa
            deleteCapa: async (id) => {
                try {
                    const resp = await fetch(`${process.env.BACKEND_URL}/api/capas/${id}`, { method: "DELETE" });
                    await resp.json();
                    getActions().getCapas();
                } catch (error) {
                    console.error("Error al eliminar capa:", error);
                }
            },
        }
    };
};

export default getState;