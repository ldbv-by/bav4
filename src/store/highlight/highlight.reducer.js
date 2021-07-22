export const FEATURE_CHANGED = 'highlight/feature';
export const SECONDARY_FEATURE_CHANGED = 'highlight/secondary_feature';
export const CLEAR_FEATURES = 'highlight/clear';

export const initialState = {

	/**
	 * @property {HightlightFeature|null}
	 */
	feature: null,
	/**
	 * @property {HightlightFeature|null}
	 */
	temporaryFeature: null,
	/**
	 * @property {boolean}
	 */
	active: false
};

export const highlightReducer = (state = initialState, action) => {

	const { type, payload } = action;
	switch (type) {
		case FEATURE_CHANGED: {

			const active = !!payload || !!state.temporaryFeature;

			return {
				...state,
				feature: payload,
				active: active
			};
		}
		case SECONDARY_FEATURE_CHANGED: {

			const active = !!payload || !!state.feature;

			return {
				...state,
				temporaryFeature: payload,
				active: active
			};
		}
		case CLEAR_FEATURES: {

			return {
				...state,
				feature: null,
				temporaryFeature: null,
				active: false
			};
		}
	}

	return state;
};
