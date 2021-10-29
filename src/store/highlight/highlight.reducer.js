import { createUniqueId } from '../../utils/numberUtils';

export const FEATURE_SET = 'highlight/feature/set';
export const FEATURE_ADD = 'highlight/feature/add';
export const TEMPORARY_FEATURE_SET = 'highlight/temporary_feature/set';
export const TEMPORARY_FEATURE_ADD = 'highlight/temporary_feature/add';
export const CLEAR_FEATURES = 'highlight/clear';
export const REMOVE_FEATURE_BY_ID = 'highlight/remove/id';

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

	const createIdIfMissing = features => features.map(f => {
		if (!f.id) {
			f.id = createUniqueId();
		}
		return f;
	});

	const { type, payload } = action;
	switch (type) {
		case FEATURE_SET: {

			const active = (!!payload.length || !!state.temporaryFeatures.length);

			return {
				...state,
				features: createIdIfMissing(payload),
				active: active
			};
		}
		case FEATURE_ADD: {

			const features = [...state.features, ...createIdIfMissing(payload)];
			const active = !!state.temporaryFeatures.length || !!features.length;

			return {
				...state,
				features: features,
				active: active
			};
		}
		case TEMPORARY_FEATURE_SET: {

			const active = (!!payload.length || !!state.features.length);

			return {
				...state,
				temporaryFeatures: createIdIfMissing(payload),
				active: active
			};
		}
		case TEMPORARY_FEATURE_ADD: {

			const temporaryFeatures = [...state.temporaryFeatures, ...createIdIfMissing(payload)];
			const active = !!state.features.length || !!temporaryFeatures.length;

			return {
				...state,
				temporaryFeatures: temporaryFeatures,
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
		case REMOVE_FEATURE_BY_ID: {

			const test = f => f.id !== payload;
			const features = state.features.filter(test);
			const temporaryFeatures = state.temporaryFeatures.filter(test);
			const active = !!features.length || !!temporaryFeatures.length;

			return {
				...state,
				features: features,
				temporaryFeatures: temporaryFeatures,
				active: active
			};
		}
	}

	return state;
};
