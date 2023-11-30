export const ELEVATION_PROFILE_ACTIVE_CHANGED = 'elevationProfile/activeChanged';
export const ELEVATION_PROFILE_COORDINATES_CHANGED = 'elevationProfile/coordinatesChanged';

export const initialState = {
	/**
	 * @property {Array<CoordinateLike>}
	 */
	coordinates: [],

	/**
	 * @property {boolean}
	 */
	active: false
};

export const elevationProfileReducer = (state = initialState, action) => {
	const { type, payload } = action;

	switch (type) {
		case ELEVATION_PROFILE_ACTIVE_CHANGED: {
			const { active, coordinates } = payload;
			return {
				...state,
				coordinates: coordinates ? [...coordinates] : [...state.coordinates],
				active: active
			};
		}
		case ELEVATION_PROFILE_COORDINATES_CHANGED: {
			return {
				...state,
				coordinates: [...payload]
			};
		}
	}

	return state;
};
