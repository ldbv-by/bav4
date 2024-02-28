export const OPEN_CLOSED_CHANGED = 'navigationRail/open';
export const ADD_TAB_ID = 'navigationRail/visitedTabIds';
export const MEDIA_QUERY = '(orientation: landscape) and (max-width: 80em)';

export const initialState = {
	open: false,
	visitedTabIds: []
};

export const navigationRailReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case OPEN_CLOSED_CHANGED: {
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

/**
 * Provides a media reducer which has no initial state
 * @param {object} initialState
 * @returns media reducer
 */
export const createNoInitialStateNavigationRailReducer = () => {
	return (state = null, action) => navigationRailReducer(state, action);
};

/**
 * Provides a media reducer which initial state is beeing obtained from the window object.
 * @param {Window} _window
 * @returns media reducer
 */
export const createNavigationRailReducer = (_window = window) => {
	const initialState = {
		/**
		 * @property {boolean}
		 */
		open: _window.matchMedia(MEDIA_QUERY).matches ? true : false,
		/**
		 * @property {number}
		 */
		visitedTabIds: []
	};

	return (state = initialState, action) => navigationRailReducer(state, action);
};
