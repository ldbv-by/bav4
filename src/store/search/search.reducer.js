import { EventLike } from '../../utils/storeUtils';

export const QUERY_CHANGED = 'search/query';

export const initialState = {
	/**
	 * @type {EventLike<string>}
	 */
	query: new EventLike(null)
};

export const searchReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case QUERY_CHANGED: {
			return {
				...state,
				query: payload
			};
		}
	}
	return state;
};
