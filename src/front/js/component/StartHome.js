import React from "react";
import { Link } from "react-router-dom";

const StartHome = () => {
    return (
        <div className="vh-100" style={{ backgroundImage: 'url("https://img.freepik.com/vector-premium/fondo-medico-abstracto-iconos-simbolos-plantilla-concepto-e-idea-tecnologia-sanitaria-medicina-innovacion-salud-ciencia-e-investigacion_120542-595.jpg")', backgroundSize: 'cover' }}>
            <h1 className="pt-5" style={{ fontSize: "50px" }}><i>AKH MEDICAL</i></h1>
            <h1 style={{ fontSize: "50px" }}><i>OPEN 24 HOURS</i></h1>
            <h5 className="pt-5" style={{ fontSize: "40px" }}><i className="fa-regular fa-hospital"></i> YOUR HEALTH IS OUR PRIORITY <i className="fa-brands fa-whatsapp"></i></h5>
            <div className="container d-flex flex-row justify-content-center text-center">
                <div className="row">
                    <div className="col-sm-12 d-flex justify-content-center text-center" style={{ marginTop: "8%" }}>
                        <Link to="/">
                            <button style={{ borderRadius: "10px", border: "2px solid green" }} className="p-4 me-3 bg-white">SPECIALISTS</button>
                        </Link>

                        <Link to="/">
                            <button style={{ borderRadius: "10px", border: "2px solid green" }} className="p-4 me-3 bg-white">MEDICAL HISTORY</button>
                        </Link>

                        <Link to="/">
                            <button style={{ borderRadius: "10px", border: "2px solid green" }} className="p-4 bg-white">HEALTHY PLAN</button>
                        </Link>
                    </div>
                    <div className="row">
                        <div className="col-sm-12 mt-3 d-flex justify-content-center text-center">
                            <Link to="/">
                                <button style={{ borderRadius: "10px", border: "2px solid green" }} className="p-4 ms-3 me-3 bg-white">ASSESSOR</button>
                            </Link>

                            <Link to="/">
                                <button style={{ borderRadius: "10px", border: "2px solid green" }} className="p-4 me-3 bg-white">MEDICAMENT</button>
                            </Link>

                            <Link to="/">
                                <button style={{ borderRadius: "10px", border: "2px solid green" }} className="p-4  bg-white">PAYMENTS</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default StartHome