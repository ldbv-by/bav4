export const FETCHING_CHANGED = 'network/fetching';
export const OFFLINE_CHANGED = 'network/offline';

export const initialState = {
	pendingRequests: 0,
	fetching: false,
	offline: false
};

export const networkReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case FETCHING_CHANGED: {
			const { pendingRequests } = state;
			const currentPendingRequest = payload ? pendingRequests + 1 : Math.max(0, pendingRequests - 1);
			const fetching = currentPendingRequest > 0;

			return {
				...state,
				pendingRequests: currentPendingRequest,
				fetching: fetching
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
