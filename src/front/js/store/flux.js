
const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			specialities: [],
			allDoctors: [],
			doctors: [],
			auth: false
		},
		actions: {
			// Use getActions to call a function within a fuction


			getLogin: async (email, password) => {
				try {
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/login", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							email: email,
							password: password
						})
					})
					if (resp.status == 400) {
						return false
					}
					const data = await resp.json()
					console.log(data)
					localStorage.setItem("token", data.access_token)
					setStore({ user: data.user, auth: true })

					return true;
				} catch (error) {
					console.log("Error loading message from backend", error)
					return false
				}
			},
			log_out: () => {
				localStorage.removeItem("token")
				setStore({ auth: false })
			},

			sign_up: async (email, password) => {
				try {
					// fetching data from the backend
					await fetch(process.env.BACKEND_URL + "/api/signup", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							email: email,
							password: password
						})
					})
					return true;
				} catch (error) {
					console.log("Error loading message from backend", error)
					return [];
				}
			},

			setSpecialities: (specialities) => {
				setStore({ specialities })
			},

			getSpecialities: async () => {
				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/specialities", {
						method: "GET",
						headers: {
							"Content-Type": "application/json"
						},
					})
					if (!response.ok) {
						throw new Error("Failed to fetch specialities");
					}
					const data = await response.json()
					if (Array.isArray(data) && data.length > 0) {
						setStore({ specialities: data });
						return data
					} else {
						throw new Error("No specialities found in the response")
					}

				} catch (error) {
					console.log("Error fetching specialities")
					return [];
				}
			},

			getAllDoctors: async () => {
				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/doctors")
					if (!response.ok) {
						throw new Error("Failed to get all doctors");
					}
					const data = await response.json()


					setStore({ allDoctors: data });
					return data;
				} catch (error) {
					console.log("Error fetching all doctors", error)
				}

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
