export const ACTIVE_CHANGED = 'layerSwipe/active';
export const RATIO_VALUE_CHANGED = 'layerSwipe/ratio';

export const initialState = {
	/**
	 * @property {boolean}
	 */
	active: false,
	/**
	 * @property {number} ratio in percent [0-100]
	 */
	ratio: 50
};

export const layerSwipeReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case ACTIVE_CHANGED: {
			return {
				...state,
				active: payload
			};
		}
		case RATIO_VALUE_CHANGED: {
			return {
				...state,
				ratio: payload
			};
		}
	}
	return state;
};
