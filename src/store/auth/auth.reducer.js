export const AUTH_STATUS_CHANGED = 'auth/statusChanged';

export const initialState = {
	/**
	 * @param {boolen} signedIn The current status, `true if the User is authenticated
	 */
	signedIn: false,
	/**
	 * @param {boolean} byUser `true` if the current status was triggered by the User (e.g. clicks the sign-out button)
	 */
	byUser: false
};

export const authReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case AUTH_STATUS_CHANGED: {
			const { signedIn, byUser } = payload;
			return {
				...state,
				signedIn,
				byUser
			};
		}
	}
	return state;
};
