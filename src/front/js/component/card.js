import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/cards.css";
import PropTypes from "prop-types";
import RigoImgUrl from "../../img/rigo-baby.jpg";

export const SpecialitiesCard = () => {
    return (
        <div className="container">
            <div className="card w-100 mb-3">
                <div className="row g-0">
                    <div className="col-md-4">
                        <img src={RigoImgUrl} className="img-fluid " />
                    </div>
                    <div className="col-md-8">
                        <div className="card-body text-start">
                            <h5 className="card-title">Card title</h5>
                            <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                            <p className="card-text"><small className="text-body-secondary">Last updated 3 mins ago</small></p>
                            <Link to={'/'}>
                                <button className="btn btn-dark card-buttons">View profile</button>
                            </Link>
                            <Link to={'/'}>
                                <button className="btn btn-dark card-buttons">Appointment</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}