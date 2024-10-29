import React from "react";
import { Link } from "react-router-dom";
import logoImgUrl from "../../img/logo_akh.png";
import "../../styles/navbar.css";

export const Navbar = () => {
	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<img src={logoImgUrl} style={{ height: "100px" }} />
				</Link>
				<div>
					<button className="btn btn-dark signin-buttons">Sign in</button>
					<button className="btn btn-dark register-buttons">Register</button>
				</div>

				<div className="container d-flex align-items-center justify-content-between p-2 background">
					<div className="specialties-buttons d-flex gap-3">
						<div className="dropdown">
							<button className="btn btn-dark dropdown-toggle navbar-buttons" data-bs-toggle="dropdown" aria-expanded="false" >Especialidades</button>
							<ul className="dropdown-menu">
								<li className="dropdown-item">Pediatria</li>
								<li className="dropdown-item">Cardiologia</li>
								<li className="dropdown-item">Neurologia</li>
							</ul>

						</div>

						<button className="btn btn-dark navbar-buttons">Opciones</button>
						<button className="btn btn-dark navbar-buttons">Opciones</button>
						<button className="btn btn-dark navbar-buttons">Opciones</button>
					</div>
					<div className="search-bar d-flex align-items-center">
						<input type="text" placeholder="Nombre del doctor" className="form-control" />
						<span className="btn"><i className="fa fa-search"></i></span>
					</div>
				</div>
			</div>
		</nav>
	);
};
