export const FETCHING_CHANGED = 'network/fetching';
export const OFFLINE_CHANGED = 'network/offline';

export const initialState = {
	fetching: false,
	offline: false
};

export const networkReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case FETCHING_CHANGED: {

			return {
				...state,
				fetching: payload
			};
		}
		case OFFLINE_CHANGED: {

			return {
				...state,
				offline: payload
			};
		}
	}
	return state;
};