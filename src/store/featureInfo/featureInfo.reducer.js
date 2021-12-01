export const FEATURE_INFO_ADDED = 'featureInfo/added';
export const FEATURE_INFO_REQUEST_START = 'featureInfo/request/start';
export const FEATURE_INFO_REQUEST_ABORT = 'featureInfo/request/abort';
export const QUERY_REGISTERED = 'featureInfo/queriedGeoresource/added';
export const QUERY_RESOLVED = 'featureInfo/queriedGeoresource/removed';

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
	 * Array of running queries
	 * @property {Array.<string>}
	 */
	queries: [],

	/**
	 * `true` if one or more queries are running
	 * @property {boolean}
	 */
	querying: false,

	/**
	 * Changes when current FeatureInfo request should be aborted and/or results should be reseted.
	 * Contains no payload.
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
				coordinate: payload,
				querying: true
			};
		case QUERY_REGISTERED:
			return {
				...state,
				queries: [...state.queries, payload],
				querying: true
			};
		case QUERY_RESOLVED: {
			const queries = state.queries.filter(geoResId => geoResId !== payload);
			return {
				...state,
				queries: queries,
				querying: queries.length > 0
			};
		}
		case FEATURE_INFO_REQUEST_ABORT:
			return {
				...state,
				current: [],
				queries: [],
				aborted: payload,
				querying: false
			};
	}

	return state;
};
