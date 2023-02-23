import { createUniqueId } from '../../utils/numberUtils';

export const FEATURE_ADD = 'highlight/feature/add';
export const CLEAR_FEATURES = 'highlight/clear';
export const REMOVE_FEATURE_BY_ID = 'highlight/remove/id';

export const initialState = {
	/**
	 * @property {HighlightFeature|null}
	 */
	features: [],
	/**
	 * @property {boolean}
	 */
	active: false
};

export const highlightReducer = (state = initialState, action) => {
	const createIdIfMissing = (features) =>
		features.map((f) => {
			if (!f.id) {
				f.id = createUniqueId();
			}
			return f;
		});

	const { type, payload } = action;
	switch (type) {
		case FEATURE_ADD: {
			const features = [...state.features, ...createIdIfMissing(payload)];
			const active = !!features.length;

			return {
				...state,
				features: features,
				active: active
			};
		}
		case CLEAR_FEATURES: {
			return {
				...state,
				features: [],
				active: false
			};
		}
		case REMOVE_FEATURE_BY_ID: {
			const features = state.features.filter((f) => !payload.includes(f.id));
			const active = !!features.length;

			return {
				...state,
				features: features,
				active: active
			};
		}
	}

	return state;
};
