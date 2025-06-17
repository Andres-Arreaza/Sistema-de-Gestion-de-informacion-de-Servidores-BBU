import React, { useState, useEffect } from "react";

export const Footer = () => {
	// Estado para controlar la animación y asegurar que se ejecute.
	const [isLoaded, setIsLoaded] = useState(false);

	// Este efecto se ejecuta una sola vez cuando el componente aparece en pantalla.
	useEffect(() => {
		// Un pequeño temporizador asegura que el navegador tenga tiempo de renderizar
		// el estado inicial (invisible) antes de aplicar la clase para la animación.
		const timer = setTimeout(() => {
			setIsLoaded(true);
		}, 10); // 10 milisegundos es suficiente.

		// Limpia el temporizador si el componente se elimina.
		return () => clearTimeout(timer);
	}, []); // El array vacío [] asegura que solo se ejecute una vez.

	return (
		// El className cambia dinámicamente para activar la transición del CSS.
		<footer className={`app-footer ${isLoaded ? 'loaded' : ''}`}>
			<div className="footer-container">
				<p>&copy; {new Date().getFullYear()} Banesco Banco Universal, C.A. Todos los derechos reservados.</p>
			</div>
		</footer>
	);
};