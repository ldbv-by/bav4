export const FEATURE_INFO_ADDED = 'featureInfo/added';
export const FEATURE_INFO_SET = 'featureInfo/set';
export const FEATURE_INFO_CLEARED = 'featureInfo/cleared';
export const COORDINATE_UPDATED = 'featureInfo/coordinate/updated';

export const initialState = {
	/**
	 * Array of current FeatureInfo items
	 * @property {Array.<FeatureInfo>}
	 */
	current: [],

	/**
	 *@property {EvenLike | null}
	 */
	coordinate: null
};

export const featureInfoReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case FEATURE_INFO_ADDED:
			return {
				...state,
				current: [...payload, ...state.current]
			};
		case FEATURE_INFO_SET:
			return {
				...state,
				current: [...payload]
			};
		case FEATURE_INFO_CLEARED:
			return {
				...state,
				current: []
			};
		case COORDINATE_UPDATED:
			return {
				...state,
				coordinate: payload
			};

	}

	return state;
};
