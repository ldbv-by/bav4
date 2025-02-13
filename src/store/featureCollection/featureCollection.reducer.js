import { createUniqueId } from '../../utils/numberUtils';

export const FEATURE_ADD = 'featureCollection/entry/add';
export const CLEAR_FEATURES = 'featureCollection/clear';
export const REMOVE_FEATURE_BY_ID = 'featureCollection/remove/id';

export const initialState = {
	/**
	 * @property {Array<Feature>}
	 */
	entries: []
};

export const featureCollectionReducer = (state = initialState, action) => {
	const createIdIfMissing = (features) =>
		features.map((f) => {
			f.id = f.id ?? `${createUniqueId()}`;
			return f;
		});

	const { type, payload } = action;
	switch (type) {
		case FEATURE_ADD: {
			const entries = [...state.entries, ...createIdIfMissing(payload)];

			return {
				...state,
				entries
			};
		}
		case CLEAR_FEATURES: {
			return {
				...state,
				entries: []
			};
		}
		case REMOVE_FEATURE_BY_ID: {
			const entries = state.entries.filter((f) => !payload.includes(f.id));

			return {
				...state,
				entries
			};
		}
	}

	return state;
};
