export const OPENNAV_CLOSEDNAV_CHANGED = 'navigationRail/open';
export const ACTIVE_TAB_ID_CHANGED = 'navigationRail/visitedTabIdsSet';

export const initialState = {
	open: false,
	visitedTabIdsSet: new Set([])
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
		case ACTIVE_TAB_ID_CHANGED: {
			return {
				...state,
				visitedTabIdsSet: state.visitedTabIdsSet.add(payload)
			};
		}
	}
	return state;
};
