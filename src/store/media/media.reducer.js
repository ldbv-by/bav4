export const ORIENTATION_CHANGED = 'media/orientation';
export const MIN_WIDTH_CHANGED = 'media/min-width';

export const ORIENTATION_MEDIA_QUERY = '(orientation: portrait)';
export const MIN_WIDTH_MEDIA_QUERY = '(min-width: 80em)';


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

	return (state = initialState, action) => {

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
};
