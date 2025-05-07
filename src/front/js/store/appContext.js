import React, { useState, useEffect } from "react";
import getState from "./flux.js";

// Inicialización del contexto global
export const Context = React.createContext(null);

// Función para inyectar el contexto en los componentes
const injectContext = (PassedComponent) => {
	const StoreWrapper = (props) => {
		const [state, setState] = useState(
			getState({
				getStore: () => state.store,
				getActions: () => state.actions,
				setStore: (updatedStore) =>
					setState((prevState) => ({
						store: { ...prevState.store, ...updatedStore },
						actions: { ...prevState.actions },
					})),
			})
		);

		useEffect(() => {
			state.actions.getMessage(); // Inicializa datos del backend
		}, []);

		return (
			<Context.Provider value={state}>
				<PassedComponent {...props} />
			</Context.Provider>
		);
	};

	return StoreWrapper;
};

export default injectContext;