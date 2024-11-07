const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			specialities: [],
			doctors: []
		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			getSpecialities: async () => {
				try {
					// fetching data from the backend
					const response = await fetch(process.env.BACKEND_URL + "/api/especialidades")

					if (!response.ok) {
						throw new Error('Especialidad no obtenida')
					}

					const data = await response.json()

					return data;

				} catch (error) {
					console.log("Error loading message from backend", error)
					return [];
				}
			},

			setSpecialities: (specialities) => {
				setStore({ specialities })
			},

			getDoctorBySpeciality: async (id) => {
				try {
					const url = id
						? `${process.env.BACKEND_URL}/api/doctors?speciality=${id}`
						: `${process.env.BACKEND_URL}/api/doctors`;

					const response = await fetch(url);
					if (!response.ok) {
						throw new Error('Especialidad no obtenida');
					}
					const data = await response.json();
					setStore({ doctors: data });
					return data;
				} catch (error) {
					console.log("Error fetching doctors", error);
				}
			}
		}
	};
};

export default getState;
