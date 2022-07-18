
export const ACTIVE_CHANGED = 'mfp/active';
export const FORMAT_CHANGED = 'mfp/format';
export const SCALE_CHANGED = 'mfp/scale';
export const MAP_SIZE_CHANGED = 'mfp/map_size';

export const initialState = {

	/**
	 * @property {boolean}
	 */
	active: false,
	/**
	 * @property {number}
	 */
	scale: null,
	/**
	 * @property {MapSize}
	 */
	mapSize: null
};

export const mfpReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case ACTIVE_CHANGED: {
			return {
				...state,
				active: payload
			};
		}
		case SCALE_CHANGED: {
			return {
				...state,
				scale: payload
			};
		}
		case MAP_SIZE_CHANGED: {
			return {
				...state,
				mapSize: payload
			};
		}
	}

	return state;
};

