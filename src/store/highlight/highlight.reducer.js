export const FEATURE_CHANGED = 'highlight/feature';
export const SECONDARY_FEATURE_CHANGED = 'highlight/secondary_feature';
export const CLEAR_FEATURES = 'highlight/clear';

export const initialState = {

	/**
	 * @property {HighlightFeature|null}
	 */
	features: [],
	/**
	 * @property {HighlightFeature|null}
	 */
	temporaryFeatures: [],
	/**
	 * @property {boolean}
	 */
	active: false
};

export const highlightReducer = (state = initialState, action) => {

	const { type, payload } = action;
	switch (type) {
		case FEATURE_CHANGED: {

			const active = (!!payload.length || !!state.temporaryFeatures.length);

			return {
				...state,
				features: [...payload],
				active: active
			};
		}
		case SECONDARY_FEATURE_CHANGED: {

			const active = (!!payload.length || !!state.features.length);

			return {
				...state,
				temporaryFeatures: [...payload],
				active: active
			};
		}
		case CLEAR_FEATURES: {

			return {
				...state,
				features: [],
				temporaryFeatures: [],
				active: false
			};
		}
	}

	return state;
};
