// import React, { useState, useEffect } from "react";
// import Swal from "sweetalert2";

// // Importa los componentes que se usarán
// import ServidorFormulario from "../component/ServidorFormulario";
// import ServidorCargaMasiva from "../component/ServidorCargaMasiva";
// import Loading from "../component/Loading";


// // --- Iconos SVG para las tarjetas de acción ---
// const PlusCircleIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//         <circle cx="12" cy="12" r="10"></circle>
//         <line x1="12" y1="8" x2="12" y2="16"></line>
//         <line x1="8" y1="12" x2="16" y2="12"></line>
//     </svg>
// );
// const UploadCloudIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
//         <polyline points="16 16 12 12 8 16"></polyline>
//     </svg>
// );


// const Servidor = () => {
//     // Estado para controlar la visibilidad del modal de creación
//     const [modalCrearVisible, setModalCrearVisible] = useState(false);
//     const [servidores, setServidores] = useState([]); // Aunque no se muestre la tabla, se mantiene para la lógica de éxito

//     // Función que se ejecuta cuando un servidor se crea o edita con éxito
//     const handleSuccess = (mensaje) => {
//         Swal.fire({
//             icon: "success",
//             title: mensaje,
//             showConfirmButton: false,
//             timer: 2000,
//             heightAuto: false
//         });
//         // Si se necesitara recargar una lista de servidores en otra vista, se haría aquí
//         // fetchServidores();
//     };

//     return (
//         <div className="page-container">
//             {/* Encabezado de la página */}
//             <div className="hero-section">
//                 <div className="title-section">
//                     <div className="decorative-line-top"></div>
//                     <h1 className="main-title">Gestión de Servidores</h1>
//                     <p className="subtitle">Crea servidores de forma individual o mediante carga masiva.</p>
//                     <div className="decorative-line-bottom"></div>
//                 </div>
//             </div>

//             {/* Área de contenido con las acciones principales */}
//             <div className="content-area">
//                 <div className="actions-grid">
//                     {/* Tarjeta de Acción: Crear Servidor */}
//                     <div className="action-card" onClick={() => setModalCrearVisible(true)}>
//                         <div>
//                             <div className="action-card-icon">
//                                 <PlusCircleIcon />
//                             </div>
//                             <h3 className="action-card-title">Crear Servidor</h3>
//                             <p className="action-card-description">Añade un nuevo servidor a la infraestructura completando el formulario de manera individual.</p>
//                         </div>
//                         <div className="action-card-footer">
//                             <span className="action-card-button">Crear Individualmente</span>
//                         </div>
//                     </div>

//                     {/* Tarjeta de Acción: Carga Masiva */}
//                     <div className="action-card">
//                         <div>
//                             <div className="action-card-icon">
//                                 <UploadCloudIcon />
//                             </div>
//                             <h3 className="action-card-title">Carga Masiva</h3>
//                             <p className="action-card-description">Sube un archivo CSV para registrar múltiples servidores de forma simultánea y eficiente.</p>
//                         </div>
//                         {/* El componente ServidorCargaMasiva ahora es un botón que activa su propio modal */}
//                         <div className="action-card-footer">
//                             <ServidorCargaMasiva onUploadSuccess={handleSuccess} />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Modal para el formulario de creación de servidor */}
//             {modalCrearVisible && (
//                 <div className="modal-overlay" onClick={() => setModalCrearVisible(false)}>
//                     <div className="modal-content-servidor" onClick={(e) => e.stopPropagation()}>
//                         <h2 className="modal-title">Crear Nuevo Servidor</h2>
//                         <ServidorFormulario
//                             setModalVisible={setModalCrearVisible}
//                             onSuccess={handleSuccess}
//                             esEdicion={false}
//                         />
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Servidor;
