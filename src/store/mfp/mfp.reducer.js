
export const ACTIVE_CHANGED = 'mfp/active';
export const SCALE_CHANGED = 'mfp/current/scale';
export const MAP_SIZE_CHANGED = 'mfp/current/map_size';
export const CURRENT_CHANGED = 'mfp/current';

export const initialState = {

	/**
	 * @property {boolean}
	 */
	active: false,
	/**
	 * @property {MfpSetting}
	 */
	current: {
		scale: null,
		mapSize: null,
		dpi: null
	}
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
			const { current } = state;
			return {
				...state,
				current: { ...current, scale: payload }
			};
		}
		case MAP_SIZE_CHANGED: {
			const { current } = state;
			return {
				...state,
				current: { ...current, mapSize: payload }
			};
		}
		case CURRENT_CHANGED: {
			return {
				...state,
				current: payload
			};
		}
	}

	return state;
};

