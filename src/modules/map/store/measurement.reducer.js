export const ACTIVE_CHANGED = 'measurement/active';
export const STATISTIC_CHANGED = 'measurement/statistic';
export const RESET_REQUESTED = 'measurement/reset';
export const REMOVE_REQUESTED = 'measurement/remove';


export const initialState = {
	/**
	 * @type {boolean}
	 */
	active: false,
	/**
 	 * @type {object}
 	 */
	statistic:{ length:0, area:0 },
	/**
	 * @type EventLike
	 */
	reset:null
};

export const measurementReducer = (state = initialState, action) => {

	const { type, payload } = action;
	switch (type) {
		case ACTIVE_CHANGED: {

			return {
				...state,
				active: payload

			};
		}
		case STATISTIC_CHANGED: {

			return {
				...state,
				statistic: payload

			};
		}
		case RESET_REQUESTED: {

			return {
				...state,
				reset: payload

			};
		}
		case REMOVE_REQUESTED: {

			return {
				...state,
				remove: payload

			};
		}
	}

	return state;
};
