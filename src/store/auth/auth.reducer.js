export const AUTH_STATUS_CHANGED = 'auth/statusChanged';

export const initialState = {
	signedIn: false
};

export const authReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case AUTH_STATUS_CHANGED: {
			return {
				...state,
				signedIn: payload
			};
		}
	}
	return state;
};
