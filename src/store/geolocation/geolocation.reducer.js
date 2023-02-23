export const ACTIVE_CHANGED = 'geolocation/active';
export const DENIED_CHANGED = 'geolocation/denied';
export const TRACKING_CHANGED = 'geolocation/tracking';
export const ACCURACY_CHANGED = 'geolocation/accuracy';
export const POSITION_CHANGED = 'geolocation/position';

export const initialState = {
	/**
	 * @property {boolean}
	 */
	active: false,

	/**
	 * @type {boolean}
	 */
	denied: false,

	/**
	 * @type {boolean}
	 */
	tracking: false,

	/**
	 * @property {number}
	 */
	accuracy: null,

	/**
	 * @property {array<number>}
	 */
	position: null
};

export const geolocationReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case ACTIVE_CHANGED: {
			return {
				...state,
				active: payload
			};
		}
		case DENIED_CHANGED: {
			return {
				...state,
				denied: payload
			};
		}
		case POSITION_CHANGED: {
			return {
				...state,
				position: payload
			};
		}
		case ACCURACY_CHANGED: {
			return {
				...state,
				accuracy: payload
			};
		}
		case TRACKING_CHANGED: {
			return {
				...state,
				tracking: payload
			};
		}
	}

	return state;
};
