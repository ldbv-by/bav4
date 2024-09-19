export const TIME_TRAVEL_TIMESTAMP_CHANGED = 'timeTravel/timestamp';
export const TIME_TRAVEL_ACTIVE_CHANGED = 'timeTravel/active';

export const initialState = {
	/**
	 * Current timestamp
	 * @property {string|null}
	 */
	current: null,
	/**
	 * Flag that indicates if the time travel feature is active
	 *  @property {boolean}
	 */
	active: false
};

export const timeTravelReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case TIME_TRAVEL_TIMESTAMP_CHANGED: {
			return {
				...state,
				current: payload
			};
		}
		case TIME_TRAVEL_ACTIVE_CHANGED: {
			const { active, timestamp } = payload;
			return {
				...state,
				active,
				current: timestamp ?? state.current
			};
		}
	}

	return state;
};
