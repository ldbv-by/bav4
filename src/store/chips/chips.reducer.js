export const CHIPS_CHANGED = 'chips/current';

export const initialState = {
	/**
	 * List of currently active chips.
	 */
	current: null

};

export const chipsReducer = (state = initialState, action) => {

	const { type, payload } = action;
	switch (type) {
		case CHIPS_CHANGED: {

			return {
				...state,
				current: payload

			};
		}
	}

	return state;
};
