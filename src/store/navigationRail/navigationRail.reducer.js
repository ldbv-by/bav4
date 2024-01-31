export const OPENNAV_CLOSEDNAV_CHANGED = 'navigationRail/open';
export const ADD_TAB_ID = 'navigationRail/visitedTabIds';

export const initialState = {
	open: false,
	visitedTabIds: []
};

export const navigationRailReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case OPENNAV_CLOSEDNAV_CHANGED: {
			return {
				...state,
				open: payload
			};
		}
		case ADD_TAB_ID: {
			return {
				...state,
				visitedTabIds: [...new Set([...state.visitedTabIds, payload])]
			};
		}
	}
	return state;
};
