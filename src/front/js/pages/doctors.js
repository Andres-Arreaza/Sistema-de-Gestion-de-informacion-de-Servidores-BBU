import React, { useContext } from "react";
import { DoctorList } from "../component/doctorList";


export const Doctors = () => {

	return (
		<div className="text-center mt-5">
			<DoctorList />
		</div>
	);
};
