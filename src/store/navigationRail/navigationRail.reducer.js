export const OPEN_CLOSED_CHANGED = 'navigationRail/open';
export const ADD_TAB_ID = 'navigationRail/visitedTabIds';
export const MEDIA_QUERY = '(orientation: landscape) and (max-width: 80em)';
import { TabIds } from '../../domain/mainMenu';

export const navigationRailReducer = (state, action) => {
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
 * Provides a navigationRail reducer which has no initial state
 * @returns navigationRail reducer
 */
export const createNoInitialStateNavigationRailReducer = () => {
	return (state = null, action) => navigationRailReducer(state, action);
};

/**
 * Provides a navigationRail reducer which initial state is obtained from the window object.
 * @param {Window} _window
 * @returns navigationRail reducer
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
		visitedTabIds: [TabIds.FEATUREINFO, TabIds.ROUTING]
	};

	return (state = initialState, action) => navigationRailReducer(state, action);
};
