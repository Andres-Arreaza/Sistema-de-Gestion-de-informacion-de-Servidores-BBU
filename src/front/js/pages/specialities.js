import React, { useContext } from "react";
import { Context } from "../store/appContext";
import { SpecialitiesCard } from "../component/card";


export const Specialities = () => {
	const { store, actions } = useContext(Context);

	return (
		<div className="text-center mt-5">
			<SpecialitiesCard />
		</div>
	);
};
