export const OPENNAV_CLOSEDNAV_CHANGED = 'navigationRail/openNav';

export const initialState = {
	openNav: false
};

export const navigationRailReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case OPENNAV_CLOSEDNAV_CHANGED: {
			return {
				...state,
				openNav: payload
			};
		}
	}
	return state;
};
