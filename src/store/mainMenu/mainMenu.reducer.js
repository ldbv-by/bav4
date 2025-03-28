import { EventLike } from '../../utils/storeUtils';

export const OPEN_CLOSED_CHANGED = 'components/menu/mainMenu/open';
export const TAB_CHANGED = 'components/menu/mainMenu/tabChanged';
export const FOCUS_SEARCH_FIELD = 'components/menu/mainMenu/focusSearchField';
const ORIENTATION_MEDIA_QUERY = '(max-width: 80em) or (orientation: portrait)';

const mainMenuReducer = (state, action) => {
	const { type, payload } = action;
	switch (type) {
		case OPEN_CLOSED_CHANGED: {
			return {
				...state,
				open: payload
			};
		}
		case TAB_CHANGED: {
			return {
				...state,
				tab: payload
			};
		}
		case FOCUS_SEARCH_FIELD: {
			return {
				...state,
				focusSearchField: payload
			};
		}
	}
	return state;
};

/**
 * Provides a media reducer which has no initial state
 * @returns media reducer
 */
export const createNoInitialStateMainMenuReducer = () => {
	return (state = null, action) => mainMenuReducer(state, action);
};

/**
 * Provides a media reducer which initial state is obtained from the window object.
 * @param {Window} _window
 * @returns media reducer
 */
export const createMainMenuReducer = (_window = window) => {
	const initialState = {
		/**
		 * @property {boolean}
		 */
		open: _window.matchMedia(ORIENTATION_MEDIA_QUERY).matches ? false : true,
		/**
		 * @property {number}
		 */
		tab: null,
		/**
		 *  @property {EventLike}
		 */
		focusSearchField: new EventLike()
	};

	return (state = initialState, action) => mainMenuReducer(state, action);
};
