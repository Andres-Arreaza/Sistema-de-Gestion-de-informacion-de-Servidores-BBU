import React from "react";
import logoImgUrl from "../../img/logo_akh.png";


const Who = () => {
    return (
        <div id="who" className="vh-100 d-flex justify-content-center" style={{ marginTop: "5%", backgroundImage: 'url("https://img.freepik.com/vector-gratis/antecedentes-modernos-atencion-medica-servicios-medicos_1017-44785.jpg?semt=ais_hybrid")', backgroundSize: 'cover' }}>
            <div className="d-flex align-items-center">
                <div>
                    <h1 className="text-primary mb-5" style={{ fontSize: "55px" }}>WHO WE ARE</h1>
                    <p className="mt-5 mb-4 text-justify" style={{ fontSize: "25px" }}> AKH medical is a medical application, with quality medical care 24 hours a day.
                        <br></br>
                        We are endorsed by the Ministry of Health and we have qualified specialists.
                        <br></br>
                        We have presence in Colombia, Costa Rica, Panamá and Venezuela.
                        <br></br>
                        <br></br>
                        Your health is our priority!!
                    </p>
                    <img src={logoImgUrl} style={{ width: '400px', height: '200px' }} alt="Logo"></img>
                </div>
            </div>
        </div>
    )
}

export default Who