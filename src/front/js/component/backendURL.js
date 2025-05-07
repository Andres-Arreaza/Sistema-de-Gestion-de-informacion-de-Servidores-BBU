import React from "react";

const Highlight = ({ children }) => <span className="bg-dark text-white px-2 rounded">{children}</span>;

export const BackendURL = () => (
    <div className="alert alert-danger text-center mt-5">
        <h2>⚠️ Configuración faltante: BACKEND_URL</h2>
        <p>La variable <Highlight>BACKEND_URL</Highlight> no está definida en tu archivo <Highlight>.env</Highlight>.</p>
        <ol className="text-start">
            <li>Verifica que tu backend esté corriendo en el puerto **3001**.</li>
            <li>Obtén la URL pública de tu servidor Flask.</li>
            <li>Abre el archivo <Highlight>.env</Highlight> en la raíz del proyecto.</li>
            <li>Agrega la línea <Highlight>BACKEND_URL=tú_api_host</Highlight>.</li>
            <li>Reemplaza <Highlight>tu_api_host</Highlight> con la URL de tu backend.</li>
        </ol>
        <p>Si estás desplegando el proyecto en **Heroku, Render.com o AWS**, revisa la configuración de variables de entorno en esas plataformas.</p>
    </div>
);