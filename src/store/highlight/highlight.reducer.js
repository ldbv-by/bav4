export const FEATURE_SET = 'highlight/feature/set';
export const FEATURE_ADD = 'highlight/feature/add';
export const TEMPORARY_FEATURE_SET = 'highlight/temporary_feature/set';
export const TEMPORARY_FEATURE_ADD = 'highlight/temporary_feature/add';
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
		case FEATURE_SET: {

			const active = (!!payload.length || !!state.temporaryFeatures.length);

			return {
				...state,
				features: [...payload],
				active: active
			};
		}
		case FEATURE_ADD: {

			const active = (!!payload.length || !!state.temporaryFeatures.length);

			return {
				...state,
				features: [...state.features, ...payload],
				active: active
			};
		}
		case TEMPORARY_FEATURE_SET: {

			const active = (!!payload.length || !!state.features.length);

			return {
				...state,
				temporaryFeatures: [...payload],
				active: active
			};
		}
		case TEMPORARY_FEATURE_ADD: {

			const active = (!!payload.length || !!state.features.length);

			return {
				...state,
				temporaryFeatures: [...state.temporaryFeatures, ...payload],
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
