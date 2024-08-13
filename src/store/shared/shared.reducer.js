export const TERMS_OF_USE_ACKNOWLEDGED_CHANGED = 'shared/termsOfUsAcknowledged';

export const initialState = {
	/**
	 * @type {boolean}
	 */
	termsOfUseAcknowledged: false
};

export const sharedReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case TERMS_OF_USE_ACKNOWLEDGED_CHANGED: {
			return {
				...state,
				termsOfUseAcknowledged: payload
			};
		}
	}

	return state;
};
