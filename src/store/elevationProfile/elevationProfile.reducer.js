export const ELEVATION_PROFILE_ACTIVE_CHANGED = 'elevationProfile/activeChanged';
export const ELEVATION_PROFILE_COORDINATES_CHANGED = 'elevationProfile/coordinatesChanged';
export const ELEVATION_PROFILE_CHANGED = 'elevationProfile/changed';

export const initialState = {
	/**
	 * Profile component is active
	 * @property {boolean}
	 */
	active: false,
	/**
	 * Identifier of the referenced coordinates
	 * @property {string}
	 */
	id: null
};

export const elevationProfileReducer = (state = initialState, action) => {
	const { type, payload } = action;

	switch (type) {
		case ELEVATION_PROFILE_ACTIVE_CHANGED: {
			const { active } = payload;
			return {
				...state,
				active: active
			};
		}

		case ELEVATION_PROFILE_CHANGED: {
			return {
				...state,
				id: payload
			};
		}
	}

	return state;
};
