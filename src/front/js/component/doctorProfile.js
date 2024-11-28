import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import RigoImgUrl from "../../img/rigo-baby.jpg";



export const DoctorProfile = () => {
    const { id } = useParams();
    const { store, actions } = useContext(Context);

    useEffect(() => {
        actions.getDoctorById(id)
    }, [id]);

    const doctor = store.selectedDoctor;

    if (!doctor) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container">
            <div className="card w-100 mb-3">
                <div className="row g-0">
                    <div className="col-md-4">
                        <img src={RigoImgUrl} className="img-fluid" alt="Doctor" />
                    </div>
                    <div className="col-md-8">
                        <div className="card-body text-start">
                            <h5 className="card-title">
                                {doctor.info.first_name} {doctor.info.last_name}
                            </h5>
                            <p className="card-text">Especialidad: {doctor.speciality}</p>
                            <p className="card-text">Edad: {doctor.age} años</p>
                            <p className="card-text">Descripción: {doctor.description}</p>
                            <Link to={`/appointment/${doctor.id}`}>
                                <button className="btn btn-dark">Agendar cita</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};