export const ORIENTATION_CHANGED = 'media/orientation';
export const MIN_WIDTH_CHANGED = 'media/min-width';
export const COLOR_SCHEMA_CHANGED = 'media/color-schema';
export const RESPONSIVE_PARAMETER_OBSERVATION_CHANGED = 'media/responsive-parameter-observation';

export const ORIENTATION_MEDIA_QUERY = '(orientation: portrait)';
export const MIN_WIDTH_MEDIA_QUERY = '(min-width: 80em)';
export const PREFERS_COLOR_SCHEMA_QUERY = '(prefers-color-scheme: dark)';

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
		case COLOR_SCHEMA_CHANGED: {
			return {
				...state,
				darkSchema: payload
			};
		}
		case RESPONSIVE_PARAMETER_OBSERVATION_CHANGED: {
			return {
				...state,
				observeResponsiveParameter: payload
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
export const createNoInitialStateMediaReducer = () => {
	return (state = null, action) => mediaReducer(state, action);
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
		minWidth: _window.matchMedia(MIN_WIDTH_MEDIA_QUERY).matches,
		/**
		 * @property {boolean}
		 */
		darkSchema: _window.matchMedia(PREFERS_COLOR_SCHEMA_QUERY).matches,
		/**
		 * @property {boolean}
		 */
		observeResponsiveParameter: true
	};

	return (state = initialState, action) => mediaReducer(state, action);
};
