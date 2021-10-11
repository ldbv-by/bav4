export const MODAL_CHANGED = 'modal/contentChanged';

export const initialState = {
	/**
	 * @property {object|null}
	 */
	data: null,

	/**
	 * @property {boolean}
	 */
	active: false
};

export const modalReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case MODAL_CHANGED: {
			return {
				...state,
				data: payload,
				active: !!payload
			};
		}
	}

	return state;
};
