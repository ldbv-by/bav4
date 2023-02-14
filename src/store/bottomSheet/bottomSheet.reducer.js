export const BOTTOM_SHEET_CHANGED = 'bottomSheet/contentChanged';

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

export const bottomSheetReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case BOTTOM_SHEET_CHANGED: {
			return {
				...state,
				data: payload,
				active: !!payload
			};
		}
	}

	return state;
};
