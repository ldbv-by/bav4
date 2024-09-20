export const TIME_TRAVEL_TIMESTAMP_CHANGED = 'timeTravel/timestamp';
export const TIME_TRAVEL_ACTIVE_CHANGED = 'timeTravel/active';

export const initialState = {
	/**
	 * Current timestamp
	 * @property {string|null}
	 */
	timestamp: null,
	/**
	 * Flag that indicates if the time travel slider is active
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
				timestamp: payload
			};
		}
		case TIME_TRAVEL_ACTIVE_CHANGED: {
			const { active, timestamp } = payload;
			return {
				...state,
				active,
				timestamp: timestamp ?? state.timestamp
			};
		}
	}

	return state;
};
