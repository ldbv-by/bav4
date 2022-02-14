

export const IMPORT_ADDED = 'import/added';

export const initialState = {

	/**
	 * @property {ImportOption|null}
	 */
	latest: null
};

export const importReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case IMPORT_ADDED: {
			return {
				...state,
				latest: payload
			};
		}
	}

	return state;
};
