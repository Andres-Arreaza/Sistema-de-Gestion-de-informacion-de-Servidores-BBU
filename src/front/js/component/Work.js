import React from "react";


const Work = () => {
    return (
        <div id="work" className="vh-100 d-flex justify-content-center align-items-center" style={{ backgroundImage: 'url("https://img.freepik.com/vector-premium/antecedentes-cientificos-molecula-medicina-ciencia-tecnologia-quimica-fondo-pantalla-o-moleculas-adn-dinamica-geometrica_230610-59.jpg?semt=ais_hybrid")' }}>
            <div className="d-flex flex-column align-items-center">
                <h2 className="text-primary" style={{ fontSize: "55px" }}>HOW IT WORKS</h2>
                <p className="mt-4 text-start" style={{ fontSize: "25px" }}>
                    AKH Medical offers the patient three types of consultation,
                    <br></br>
                    after prior evaluation with the specialist.
                </p>
                <div className="d-flex text-justify mt-4" style={{ fontSize: "18px" }}>
                    <div className="d-flex flex-column" style={{ marginRight: "20px" }}>
                        <i className="mb-5 text-primary text-decoration-underline custom-underline"><b>VÍA CHAT</b></i>
                        <img className="rounded-circle" style={{ width: "200px", height: "160px", border: "3px solid black" }} src="https://blog.inconcertcc.com/wp-content/uploads/2020/09/chat-online-inconcert.jpg"></img>
                    </div>
                    <div className="d-flex flex-column" style={{ marginRight: "20px" }}>
                        <i className="mb-5 text-primary text-decoration-underline"><b>TELECONSULTATION</b></i>
                        <img className="rounded-circle" style={{ width: "200px", height: "160px", border: "3px solid black" }} src="https://thumbs.dreamstime.com/z/un-hombre-recibe-una-consulta-de-m%C3%A9dicos-por-internet-en-su-casa-el-m%C3%A9dico-recomienda-medicamentos-v%C3%ADa-videoconferencia-chat-207836543.jpg"></img>
                    </div>
                    <div className="d-flex flex-column">
                        <i className="mb-5 text-primary text-decoration-underline"><b>IN PERSON</b></i>
                        <img className="rounded-circle" style={{ width: "200px", height: "160px", border: "3px solid black" }} src="https://www.elcomercio.com/wp-content/uploads/2021/09/17-1-700x417.jpg"></img>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Work