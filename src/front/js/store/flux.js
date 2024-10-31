const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			specialities: []
		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			getSpecialities: async () => {
				try {
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/especialidades")

					if (!resp.ok) {
						throw new Error('Especialidad no obtenida')
					}

					const data = await resp.json()
					console.log(data)

					return data;

				} catch (error) {
					console.log("Error loading message from backend", error)
					return [];
				}
			},

			setSpecialities: (specialities) => {
				setStore({ specialities })
			},
		}
	};
};

export default getState;
