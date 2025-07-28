import React from "react";
import ReactDOM from "react-dom";

// --- NUEVAS IMPORTACIONES DE ESTILOS UNIFICADOS ---
// Se importa un solo conjunto de archivos CSS que controlan toda la aplicación.
import "../styles/index.css";
import "../styles/layout.css";
import "../styles/pages.css";
import "../styles/forms.css";
import "../styles/buttons.css";
import "../styles/tables.css";
import "../styles/components.css";

// El resto del archivo se mantiene igual
import Layout from "./layout";

ReactDOM.render(<Layout />, document.getElementById("app"));
