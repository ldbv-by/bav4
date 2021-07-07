export const ORIENTATION_CHANGED = 'media/orientation';
export const MIN_WIDTH_CHANGED = 'media/min-width';

export const ORIENTATION_MEDIA_QUERY = '(orientation: portrait)';
export const MIN_WIDTH_MEDIA_QUERY = '(min-width: 80em)';


const mediaReducer = (state, action) => {
	const { type, payload } = action;
	switch (type) {
		case ORIENTATION_CHANGED: {

			return {
				...state,
				portrait: payload
			};
		}
		case MIN_WIDTH_CHANGED: {

			return {
				...state,
				minWidth: payload
			};
		}
	}

	return state;
};

const defaultInitialState = {
	portrait : false,
	minWidth: true
};

/**
 *  Provides a media reducer which initial state is beeing obtained from the argument.
 * @param {object} initialState 
 * @returns media reducer
 */
export const createMediaReducerWithInitialState = (initialState = defaultInitialState) => {
	return (state = initialState, action) => mediaReducer(state, action);
};


/**
 * Provides a media reducer which initial state is beeing obtained from the window object.
 * @param {Window} _window 
 * @returns media reducer
 */
export const createMediaReducer = (_window = window) => {

	const initialState = {
		/**
		 * @property {boolean}
		 */
		portrait: _window.matchMedia(ORIENTATION_MEDIA_QUERY).matches,
		/**
		 * @property {boolean}
		 */
		minWidth: _window.matchMedia(MIN_WIDTH_MEDIA_QUERY).matches
	};

	return (state = initialState, action) => mediaReducer(state, action);
};
