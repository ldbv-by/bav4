export const ALTITUDE_PROFILE_ACTIVE_CHANGED = 'altitudeProfile/activeChanged';
export const ALTITUDE_PROFILE_COORDINATES_CHANGED = 'altitudeProfile/coordinatesChanged';

export const initialState = {
	/**
	 * @property {Array<Coordinate>}
	 */
	coordinates: [],

	/**
	 * @property {boolean}
	 */
	active: false
};

export const altitudeProfileReducer = (state = initialState, action) => {
	const { type, payload } = action;

	switch (type) {
		case ALTITUDE_PROFILE_ACTIVE_CHANGED: {
			const { active, coordinates = [] } = payload;
			return coordinates.length
				? {
					...state,
					coordinates: [...coordinates],
					active: active
				}
				: {
					...state,
					active: active
				};
		}
		case ALTITUDE_PROFILE_COORDINATES_CHANGED: {
			return {
				...state,
				coordinates: [...payload]
			};
		}
	}

	return state;
};
