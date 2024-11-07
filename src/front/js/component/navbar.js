import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";
import logoImgUrl from "../../img/logo_akh.png";
import "../../styles/navbar.css";

export const Navbar = () => {
	const { store, actions } = useContext(Context);
	const [specialities, setSpecialities] = useState([]);
	const [selectedSpecialitiesId, setSelectSpecialitiesId] = useState(null);

	const handleSpecialitySelectId = (id) => {
		setSelectSpecialitiesId(id);
		actions.getDoctorBySpeciality(id);
	}


	useEffect(() => {
		// Función para obtener especialidades desde la API
		async function gettingSpecialities() {
			const response = await actions.getSpecialities(); // Llamamos a la acción de obtener datos
			console.log("Datos recibidos desde API:", response);
			if (Array.isArray(response)) {
				setSpecialities(response); // Actualizamos el estado local solo si es un array válido
			}
		}
		gettingSpecialities();
	}, [actions]);

	// Verificamos los datos en el estado local 'specialities'
	console.log("Datos en el estado local 'specialities':", specialities);


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
							<button className="btn btn-dark dropdown-toggle navbar-buttons" data-bs-toggle="dropdown" aria-expanded="false">Especialidades</button>
							<ul className="dropdown-menu">
								{Array.isArray(specialities) && specialities.length > 0 ? (
									specialities.map((speciality, indspecialitiesex) => (
										<li className="dropdown-item" key={index} onClick={() => handleSpecialitySelectId(speciality.id)}>
											{speciality.nombre}
										</li>

									))
								) : (
									<li className="dropdown-item">No hay especialidades disponibles</li>
								)}
							</ul>

						</div>
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
