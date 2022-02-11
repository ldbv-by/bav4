

export const IMPORT_URL_ADDED = 'import/url/added';
export const IMPORT_DATA_ADDED = 'import/data/added';

export const initialState = {

	/**
     * @property {string|null}
     */
	url: null,
	/**
     * @property {string|null}
     */
	data: null,
	/**
     * @property {string|null}
     */
	mimeType: null
};

export const importReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case IMPORT_URL_ADDED: {
			return {
				...state,
				url: payload,
				mimeType: null,
				data: null
			};
		}
		case IMPORT_DATA_ADDED: {
			const { data, mimeType } = payload;
			return {
				...state,
				data: data,
				mimeType: mimeType,
				url: null
			};
		}

	}

	return state;
};
