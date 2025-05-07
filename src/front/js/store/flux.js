const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            message: null, // Estado para almacenar mensajes del backend
            servers: [] // Lista de servidores obtenida del backend
        },
        actions: {
            // Función para obtener servidores desde el backend
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

            // Función para obtener un mensaje del backend
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
            }
        }
    };
};

export default getState;