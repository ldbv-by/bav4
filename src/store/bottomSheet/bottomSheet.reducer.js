export const BOTTOM_SHEET_CHANGED = 'bottomSheet/contentChanged';

export const initialState = {
	/**
	 * @property {object|null}
	 */
	data: null
};

export const bottomSheetReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case BOTTOM_SHEET_CHANGED: {
			return {
				...state,
				data: payload
			};
		}
	}

	return state;
};
