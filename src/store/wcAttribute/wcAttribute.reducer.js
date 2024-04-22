import { EventLike } from '../../utils/storeUtils';

export const OBSERVED_ATTRIBUTE_CHANGED = 'wcAttribute/changed';

export const initialState = {
	/**
	 * @type {EventLike<string>}
	 */
	changed: new EventLike(null)
};

export const wcAttributeReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case OBSERVED_ATTRIBUTE_CHANGED: {
			return {
				...state,
				changed: payload
			};
		}
	}

	return state;
};
