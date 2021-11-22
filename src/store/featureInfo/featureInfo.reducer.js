export const FEATURE_INFO_ADDED = 'featureInfo/added';
export const FEATURE_INFO_REQUEST_START = 'featureInfo/request/start';
export const FEATURE_INFO_REQUEST_ABORT = 'featureInfo/request/abort';
export const QUERIED_GEORESOUCE_ADDED = 'featureInfo/queriedGeoresource/added';
export const QUERIED_GEORESOUCE_REMOVED = 'featureInfo/queriedGeoresource/removed';

export const initialState = {
	/**
	 * Array of current FeatureInfo items
	 * @property {Array.<FeatureInfo>}
	 */
	current: [],

	/**
	 * Current coordinate for a FeatureInfo request
	 *@property {EvenLike | null}
	 */
	coordinate: null,

	/**
	 * Array of GeoResource Ids being currently queried
	 * @property {Array.<string>}
	 */
	pending: [],

	/**
	 * Changes when current FeatureInfo request was aborted
	 * @property {EvenLike | null}
	 */
	aborted: null
};

export const featureInfoReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case FEATURE_INFO_ADDED:
			return {
				...state,
				current: [...payload, ...state.current]
			};
		case FEATURE_INFO_REQUEST_START:
			return {
				...state,
				current: [],
				coordinate: payload
			};
		case QUERIED_GEORESOUCE_ADDED:
			return {
				...state,
				pending: [...state.pending, payload]
			};
		case QUERIED_GEORESOUCE_REMOVED:
			return {
				...state,
				pending: state.pending.filter(geoResId => geoResId !== payload)
			};
		case FEATURE_INFO_REQUEST_ABORT:
			return {
				...state,
				current: [],
				pending: [],
				aborted: payload
			};
	}

	return state;
};
