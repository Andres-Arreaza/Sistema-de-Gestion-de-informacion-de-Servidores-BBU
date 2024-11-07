import React, { useContext, useState } from "react";
import { Context } from "../../store/appContext";
import "../../../styles/home.css";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'

export const SingleLogin = () => {
    const { store, actions } = useContext(Context);
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const login = async (e) => {
        e.preventDefault()
        if (email == "") {
            mensajeError("Email is missing")
        }
        if (password == "") {
            mensajeError("Password is missing")
        }
        let resp = await actions.getLogin(email, password)
        if (resp) {
            //navigate("/")
        } else {
            mensajeError("Something went wrong")
        }
    }
    function mensajeError(texto) {
        Swal.fire({
            title: 'Error!',
            text: texto,
            icon: 'error',
            confirmButtonText: 'Ok'
        })
    }

    return (
        <div className="text-center mt-3 container">
            <h1 className="mb-4">Login</h1>
            <div className="row">
                <div className="col">
                    <img src="https://caymcorp.wordpress.com/wp-content/uploads/2011/03/candado.jpg" />
                </div>
                <div className="col bg-light">
                    <form>
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
                            <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="form-control" id="exampleInputPassword1" />
                        </div>

                        <button type="button" onClick={(e) => login(e)} className="btn btn-outline-success w-50">Login</button>
                    </form>
                </div>

            </div>
        </div>
    );
};