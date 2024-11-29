import React from "react";
import { Link } from "react-router-dom";
import Who from "./Who";
import Work from "./Work";
import Testimonials from "./Testimonials";

const StartHome = () => {
    return (
        <div className="vh-100 bg-light">
            <h1 className="pt-5" style={{ fontSize: "50px", color: "#4682B4" }}><i>AKH MEDICAL</i></h1>
            <h1 className="" style={{ fontSize: "50px", color: "#4682B4" }}><i>OPEN 24 HOURS</i></h1>
            <h5 className="pt-5" style={{ fontSize: "40px", color: "#4682B4" }}><i className="fa-regular fa-hospital"></i> YOUR HEALTH IS OUR PRIORITY <i className="fa-brands fa-whatsapp"></i></h5>
            <div className="container d-flex flex-row justify-content-center text-center">
                <div className="row">
                    <div className="col-sm-12 d-flex justify-content-center text-center" style={{ marginTop: "8%", fontSize: "17px" }}>
                        <Link to="/">
                            <button style={{ borderRadius: "14px", border: "3px solid (255, 215, 0, 1)", backgroundColor: "#fffff0", color: "#4A8F8F" }} className="p-4 me-3 design">SPECIALISTS</button>
                        </Link>

                        <Link to="/">
                            <button style={{ borderRadius: "14px", border: "3px solid (255, 215, 0, 1)", backgroundColor: "#fffff0", color: "#4A8F8F" }} className="p-4 me-3 design">MEDICAL HISTORY</button>
                        </Link>

                        <Link to="/">
                            <button style={{ borderRadius: "14px", border: "3px solid (255, 215, 0, 1)", backgroundColor: "#fffff0", color: "#4A8F8F" }} className="p-4 design">HEALTHY PLAN</button>
                        </Link>
                    </div>
                    <div className="row">
                        <div className="col-sm-12 mt-3 d-flex justify-content-center text-center" style={{ fontSize: "17px" }}>
                            <Link to="/">
                                <button style={{ borderRadius: "14px", border: "3px solid (255, 215, 0, 1)", backgroundColor: "#fffff0", color: "#4A8F8F" }} className="p-4 ms-3 me-3 design">ASSESSOR</button>
                            </Link>

                            <Link to="/">
                                <button style={{ borderRadius: "14px", border: "3px solid (255, 215, 0, 1)", backgroundColor: "#fffff0", color: "#4A8F8F" }} className="p-4 me-3 design">MEDICAMENT</button>
                            </Link>

                            <Link to="/">
                                <button style={{ borderRadius: "14px", border: "3px solid (255, 215, 0, 1)", backgroundColor: "#fffff0", color: "#4A8F8F" }} className="p-4 design">PAYMENTS</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <Who />
                <Work />
                <Testimonials />
            </div>
        </div>
    )
}
export default StartHome