import React, { useState, useContext } from "react"
import { Context } from "../store/appContext";

const CreateTestimony = () => {
    const { store, actions } = useContext(Context)
    const [name, setName] = useState("")
    const [testimony, setTestimony] = useState("")
    const [photo, setPhoto] = useState("")
    return (
        <form onSubmit={submitForm}>
            <input value={photo} onChange={(e) => setPhoto(e.target.value)} type="file" className="form-control my-2" photo="Upload Photo" placeholder="Photo" recquired />
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="form-control my-2" name="name" placeholder="name" recquired />
            <input value={testimony} onChange={(e) => setTestimony(e.target.value)} type="text" className="form-control my-2" name="Testimony" placeholder="Testimony" recquired />

            <button className="btn btn-outline-success mt-2" type="submit" role="button" > Send Testimony </button>
        </form>
    );
}
export default CreateTestimony;