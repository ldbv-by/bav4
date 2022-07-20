
export const ACTIVE_CHANGED = 'mfp/active';
export const SCALE_CHANGED = 'mfp/current/scale';
export const ID_CHANGED = 'mfp/current/id';
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
		id: null,
		scale: null,
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
		case ID_CHANGED: {
			const { current } = state;
			return {
				...state,
				current: { ...current, id: payload }
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

