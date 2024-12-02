import React from "react";

const Testimonials = () => {
    const testimonialsData = [
        {
            id: 1,
            name: "Luciana del Río",
            photo: "https://artbreeder.b-cdn.net/imgs/faad1f6df7ad8592c2339cc2db17.jpeg",
            text: "Esta es la mejor aplicación de atención médica que he utilizado, excelente trato al paciente y especialistas de alta calidad",
        },
        {
            id: 2,
            name: "Ludovik Santander",
            photo: "https://this-person-does-not-exist.com/img/avatar-gen503d60bff207a61d7f41cde8edcaccdc.jpg",
            text: "Totalmente recomendada, puedes agendar citar desde la comodidad de tu hogar las 24 horas del día de forma rápida y segura",
        },
        {
            id: 3,
            name: "Laura Salgado",
            photo: "https://this-person-does-not-exist.com/img/avatar-genb7b517fcf4d9d9ccdd68cd6bbd6830b2.jpg",
            text: "Muy satisfecha con el uso de la aplicación, para AKH Medical la salud del paciente es una prioridad alrededor del continente americano",
        },
    ];

    return (
        <div id="testimonials" className="vh-100 container">
            <div className="vh-100 d-flex justify-content-center align-items-center">
                <div className="row">
                    <h1 className="mb-4 text-success">TESTIMONIALS</h1>
                    {testimonialsData.map((testimonial) => (
                        <div className="col-md-4 d-flex justify-content-center" key={testimonial.id}>
                            <div className="card d-flex justify-content-center" style={{ width: '16rem', height: "100%" }}>
                                <img
                                    src={testimonial.photo}
                                    className="card-img-top"
                                    alt="Person"
                                    style={{ height: "140px", backgroundSize: "cover" }}
                                />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{testimonial.name}</h5>
                                    <p className="card-text text-justify" style={{ flexGrow: 1 }}>
                                        {testimonial.text}
                                    </p>
                                    <div className="card-footer d-flex justify-content-center">
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div>
                        <button className="mt-4 btn btn-outline-success col-sm-2">Create Testimony</button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Testimonials;
