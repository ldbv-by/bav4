export const TERMS_OF_USE_ACKNOWLEDGED_CHANGED = 'shared/termsOfUsAcknowledged';
export const FILE_SAVE_RESULT_CHANGED = 'shared/fileSaveResult';



export const initialState = {
	/**
     * @type {boolean}
     */
	termsOfUseAcknowledged: false,
	/**
     * @type {FileSaveResult}
     */
	fileSaveResult: null
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
		case FILE_SAVE_RESULT_CHANGED: {

			return {
				...state,
				fileSaveResult: payload

			};
		}
	}

	return state;
};

