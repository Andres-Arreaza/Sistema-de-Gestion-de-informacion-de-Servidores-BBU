import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";

const SingleSignup = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [country, setCountry] = useState("")
    const [city, setCity] = useState("")
    const [role, setRole] = useState("")

    const paises = [
        "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda",
        "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Australia", "Austria",
        "Azerbaiyán", "Bahamas", "Bangladés", "Barbados", "Baréin", "Bélgica", "Belice",
        "Benín", "Bielorrusia", "Birmania", "Bolivia", "Bosnia y Herzegovina", "Botsuana",
        "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután", "Cabo Verde",
        "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre",
        "Colombia", "Comoras", "Corea del Norte", "Corea del Sur", "Costa de Marfil",
        "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto",
        "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia",
        "España", "Estados Unidos", "Estonia", "Esuatini", "Etiopía", "Filipinas",
        "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Granada",
        "Grecia", "Guatemala", "Guinea", "Guinea-Bisáu", "Guinea Ecuatorial", "Guyana",
        "Haití", "Honduras", "Hungría", "India", "Indonesia", "Irak", "Irán", "Irlanda",
        "Islandia", "Islas Marshall", "Islas Salomón", "Israel", "Italia", "Jamaica",
        "Japón", "Jordania", "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kuwait",
        "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein",
        "Lituania", "Luxemburgo", "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí",
        "Malta", "Marruecos", "Mauricio", "Mauritania", "México", "Micronesia", "Moldavia",
        "Mónaco", "Mongolia", "Montenegro", "Mozambique", "Namibia", "Nauru", "Nepal",
        "Nicaragua", "Níger", "Nigeria", "Noruega", "Nueva Zelanda", "Omán", "Países Bajos",
        "Pakistán", "Palaos", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polonia",
        "Portugal", "Reino Unido", "República Centroafricana", "República Checa",
        "República del Congo", "República Democrática del Congo", "República Dominicana",
        "Ruanda", "Rumania", "Rusia", "Samoa", "San Cristóbal y Nieves", "San Marino",
        "San Vicente y las Granadinas", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal",
        "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka",
        "Suazilandia", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia", "Suiza", "Surinam",
        "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga",
        "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania",
        "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Yemen",
        "Yibuti", "Zambia", "Zimbabue"
    ];

    return (
        <div className="container">
            <h1>Signup</h1>
            <form class="row g-3">
                <div class="col-md-6">
                    <label for="inputEmail4" class="form-label">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="your@email.com" class="form-control" id="inputEmail4" />
                </div>
                <div class="col-md-6">
                    <label for="inputPassword4" class="form-label">Password</label>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="1234" class="form-control" id="inputPassword4" />
                </div>
                <div class="col-md-6">
                    <label for="inputAddress" class="form-label">First Name</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" placeholder="Diego Alejandro" class="form-control" id="inputAddress" />
                </div>
                <div class="col-md-6">
                    <label for="inputAddress2" class="form-label">Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" class="form-control" id="inputAddress2" placeholder="Fontana Lasierra" />
                </div>
                <div class="col-md-6">
                    <label for="inputCity" class="form-label">City</label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} type="text" placeholder="Colonia del Sacramento" class="form-control" id="inputCity" />
                </div>
                <div class="col-md-4">
                    <label for="inputState" class="form-label">Country</label>
                    <select id="inputState" class="form-select">
                        <option selected>Choose your country</option>
                        {paises.map((item, index) => (
                            <option key={index} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
                <div class="col-md-2">
                    <label for="inputZip" class="form-label">Role</label>
                    <select id="inputState" class="form-select">
                        <option selected>Choose your role</option>
                        <option>Patient</option>
                        <option>Doctor</option>
                    </select>
                </div>
                <div class="col-12 d-flex justify-content-center mt-4">
                    <button type="submit" class="btn btn-outline-success w-50">Sign in</button>
                </div>
            </form>
        </div>
    )
}

export default SingleSignup