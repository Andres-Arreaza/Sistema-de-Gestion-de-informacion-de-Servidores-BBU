import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";

const SingleSignup = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [country, setCountry] = useState("")
    const [city, setCity] = useState("")
    const [age, setAge] = useState("")
    const [role, setRole] = useState("")
    const [speciality, setSpeciality] = useState("")
    const [timeAvailability, setTimeAvailability] = useState("")
    const [medicalConsultantPrice, setMedicalConsultantPrice] = useState("")


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
            <h1 className="d-flex justify-content-center mt-5 mb-5">SIGN UP</h1>
            <form className="row g-3 bg-light pb-4 ps-3 pe-3">
                <div className="col-md-4">
                    <label htmlFor="inputEmail4" className="form-label">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="your@email.com" className="form-control" id="inputEmail4" />
                </div>
                <div className="col-md-4">
                    <label htmlFor="inputPassword4" className="form-label">Password</label>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="1234" className="form-control" id="inputPassword4" />
                </div>
                <div className="col-md-2">
                    <label htmlFor="inputZip" className="form-label">Role</label>
                    <select id="inputState" value={role} onChange={(e) => setRole(e.target.value)} className="form-select">
                        <option selected>Choose your role</option>
                        <option>Patient</option>
                        <option>Doctor</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <label htmlFor="inputState" className="form-label">Country</label>
                    <select id="inputState" className="form-select">
                        <option selected>Choose your country</option>
                        {paises.map((item, index) => (
                            <option key={index} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <label htmlFor="inputAddress" className="form-label">First Name</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" placeholder="Diego Alejandro" className="form-control" id="inputAddress" />
                </div>
                <div className="col-md-4">
                    <label htmlFor="inputAddress2" className="form-label">Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" className="form-control" id="inputAddress2" placeholder="Fontana Lasierra" />
                </div>
                <div className="col-md-2">
                    <label htmlFor="inputPassword4" className="form-label">City</label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} type="password" placeholder="Villa del Viento" className="form-control" id="inputPassword4" />
                </div>
                <div className="col-md-2">
                    <label htmlFor="inputPassword4" className="form-label">Age</label>
                    <input value={age} onChange={(e) => setAge(e.target.value)} type="password" placeholder="31" className="form-control" id="inputPassword4" />
                </div>
                {role === 'Doctor' && (
                    <>
                        <div className="col-md-4">
                            <label htmlFor="inputCity" className="form-label">Speciality</label>
                            <input value={speciality} onChange={(e) => setSpeciality(e.target.value)} type="text" placeholder="Pediatry" className="form-control" id="inputCity" />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="inputCity" className="form-label"> Time_availability</label>
                            <input value={timeAvailability} onChange={(e) => setTimeAvailability(e.target.value)} type="text" placeholder="8am - 5pm" className="form-control" id="inputCity" />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="inputCity" className="form-label">Medical consultant price</label>
                            <input value={medicalConsultantPrice} onChange={(e) => setMedicalConsultantPrice(e.target.value)} type="text" placeholder="100" className="form-control" id="inputCity" />
                        </div>
                    </>
                )}
            </form>
            <div className="col-md-12 d-flex justify-content-center mt-4">
                <button type="submit" className="btn btn-outline-success ps-5 pe-5">Sign in</button>
            </div>
        </div>
    )
}

export default SingleSignup