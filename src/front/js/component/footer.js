import React from "react";

export const Footer = () => {
	return (
		<footer className="app-footer">
			<p>Gerencia de Operaciones de Canales Virtuales y Medios de Pagos</p>
			<p>&copy; {new Date().getFullYear()} Banesco Banco Universal, C.A. Todos los derechos reservados.</p>
		</footer>
	);
};
