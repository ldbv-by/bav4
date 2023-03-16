import { EventLike } from '../../utils/storeUtils';

export const STATE_FORE_ENCODING_CHANGED = 'stateForEncoding/changed';

export const initialState = {
	/**
	 * @type {EventLike<string>}
	 */
	changed: new EventLike(null)
};

export const stateForEncodingReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case STATE_FORE_ENCODING_CHANGED: {
			return {
				...state,
				changed: payload
			};
		}
	}

	return state;
};
