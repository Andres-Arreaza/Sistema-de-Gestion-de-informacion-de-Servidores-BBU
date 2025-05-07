import React from "react";

export const Footer = () => (
	<footer className="footer mt-auto py-3 bg-light text-center">
		<div className="container">
			<img
				src="https://banesco-prod-2020.s3.amazonaws.com/wp-content/themes/banescocontigo/assets/images/header/logo.svg.gzip"
				alt="Banesco Logo"
				className="footer-logo"
			/>
			<p className="text-muted">
				Banesco Banco Universal, C.A. © Copyright {new Date().getFullYear()}.
			</p>
		</div>
	</footer>
);