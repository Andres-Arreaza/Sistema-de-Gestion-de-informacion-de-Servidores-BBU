import React, { useState, useContext } from "react"
import { Context } from "../store/appContext";

const CreateTestimony = () => {
    const { store, actions } = useContext(Context)
    const [name, setName] = useState("")
    const [testimony, setTestimony] = useState("")
    const [photo, setPhoto] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log(photo, name, testimony)
        if (photo != "" && name != "" && testimony) {
            let data = {
                name: name,
                photo: photo,
                testimony: testimony,
            }
            let resp = await actions.createTestimony(data)
            if (resp) {
                navigate("/testimonials")
            }
            else {
                alert("Faltan datos");
            }
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="col-4">
                <label htmlFor="exampleInputEmail1" className="form-label">Upload Photo</label>
                <input value={photo} onChange={(e) => setPhoto(e.target.value)} type="file" className="form-control my-2" photo="Upload Photo" placeholder="Photo" recquired />
            </div>

            <div className="col-4">
                <label htmlFor="exampleInputEmail1" className="form-label"> Name </label>
                <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="form-control my-2" name="name" placeholder="name" recquired />
            </div>

            <div className="col-4">
                <label htmlFor="exampleInputEmail1" className="form-label">Testimony</label>
                <input value={testimony} onChange={(e) => setTestimony(e.target.value)} type="text" className="form-control my-2" name="Testimony" placeholder="Testimony" recquired />
            </div>

            <button className="btn btn-outline-success mt-2" type="submit" role="button" > Send Testimony </button>
        </form>
    );
}
export default CreateTestimony;