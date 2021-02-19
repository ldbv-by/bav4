export const ACTIVE_CHANGED = 'measurement/active';


export const initialState = {
	active: false
};

export const measurementReducer = (state = initialState, action) => {

	const { type, payload } = action;
	switch (type) {
		case ACTIVE_CHANGED: {

			return {
				...state,
				active: payload

			};
		}
	}

	return state;
};
