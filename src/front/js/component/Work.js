import React from "react";


const Work = () => {
    return (
        <div id="work" className="vh-100 d-flex justify-content-center align-items-center" style={{ backgroundImage: 'url("https://img.freepik.com/vector-premium/antecedentes-cientificos-molecula-medicina-ciencia-tecnologia-quimica-fondo-pantalla-o-moleculas-adn-dinamica-geometrica_230610-59.jpg?semt=ais_hybrid")' }}>
            <div className="d-flex flex-column align-items-center">
                <h2 className="" style={{ fontSize: "55px", color: "rgba(138, 43, 226, 0.8)" }}>HOW IT WORKS</h2>
                <p className="mt-4 text-start" style={{ fontSize: "25px" }}>
                    AKH Medical offers the patient three types of consultation,
                    <br></br>
                    after prior evaluation with the specialist.
                </p>
                <div className="d-flex text-justify mt-4" style={{ fontSize: "18px" }}>
                    <div className="d-flex flex-column" style={{ marginRight: "20px" }}>
                        <i className="mb-5 text-decoration-underline custom-underline" style={{ color: "rgba(255, 105, 180, 0.8" }}><b>VÍA CHAT</b></i>
                        <img className="" style={{ width: "200px", height: "160px", border: "4px solid rgba(0, 255, 255, 0.8)", borderRadius: "15px" }} src="https://blog.inconcertcc.com/wp-content/uploads/2020/09/chat-online-inconcert.jpg"></img>
                    </div>
                    <div className="d-flex flex-column" style={{ marginRight: "20px" }}>
                        <i className="mb-5 text-decoration-underline" style={{ color: "rgba(255, 105, 180, 0.8" }}><b>TELECONSULTATION</b></i>
                        <img className="" style={{ width: "200px", height: "160px", border: "4px solid rgba(0, 255, 255, 0.8)", borderRadius: "15px" }} src="https://thumbs.dreamstime.com/z/un-hombre-recibe-una-consulta-de-m%C3%A9dicos-por-internet-en-su-casa-el-m%C3%A9dico-recomienda-medicamentos-v%C3%ADa-videoconferencia-chat-207836543.jpg"></img>
                    </div>
                    <div className="d-flex flex-column">
                        <i className="mb-5 text-decoration-underline" style={{ color: "rgba(255, 105, 180, 0.8" }}><b>IN PERSON</b></i>
                        <img className="" style={{ width: "200px", height: "160px", border: "4px solid rgba(0, 255, 255, 0.8)", borderRadius: "15px" }} src="https://www.elcomercio.com/wp-content/uploads/2021/09/17-1-700x417.jpg"></img>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Work