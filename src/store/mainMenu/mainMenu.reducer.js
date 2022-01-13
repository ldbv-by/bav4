import { TabId } from './mainMenu.action';

export const OPEN_CLOSED_CHANGED = 'components/menu/mainMenu/open';
export const TAB_CHANGED = 'components/menu/mainMenu/tabChanged';
const ORIENTATION_MEDIA_QUERY = '(orientation: portrait)';

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

	}
	return state;
};

/**
 * Provides a media reducer which has no initial state
 * @param {object} initialState
 * @returns media reducer
 */
export const createNoInitialStateMainMenuReducer = () => {
	return (state = null, action) => mainMenuReducer(state, action);
};

/**
 * Provides a media reducer which initial state is beeing obtained from the window object.
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
		tab: TabId.TOPICS
	};

	return (state = initialState, action) => mainMenuReducer(state, action);
};
