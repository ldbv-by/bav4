export const FEATURE_INFO_ADDED = 'featureInfo/added';
export const FEATURE_INFO_CLEARED = 'featureInfo/cleared';

export const initialState = {
	/**
	 * @property {Array.<FeatureInfo>}
	 */
	current: []
};

export const featureInfoReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case FEATURE_INFO_ADDED: {
			return {
				...state,
				current: [payload, ...state.current]
			};
		}
		case FEATURE_INFO_CLEARED: {
			return {
				...state,
				current: []
			};
		}
	}

	return state;
};
