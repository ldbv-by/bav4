export const ACTIVE_CHANGED = 'measurement/active';
export const STATISTIC_CHANGED = 'measurement/statistic';
export const MODE_CHANGED = 'measurement/mode';
export const FILE_SAVE_RESULT_CHANGED = 'measurement/fileSaveResult';
export const SELECTION_CHANGED = 'measurement/selection';
export const FINISH_REQUESTED = 'measurement/finish';
export const RESET_REQUESTED = 'measurement/reset';
export const REMOVE_REQUESTED = 'measurement/remove';


export const initialState = {
	/**
	 * @type {boolean}
	 */
	active: false,
	/**
	   * @type {MeasureStatistic}
	   */
	statistic: { length: null, area: null },
	/**
	 * @type {String}
	 */
	mode: null,
	/**
	 * @type {MeasureFileSaveResult}
	 */
	fileSaveResult: null,
	/**
	 * @type {Array<String>}
	 */
	selection: [],
	/**
	 * @type EventLike
	 */
	finish: null,
	/**
	 * @type EventLike
	 */
	reset: null,
	/**
	 * @type EventLike
	 */
	remove: null
};

export const measurementReducer = (state = initialState, action) => {

	const { type, payload } = action;
	switch (type) {
		case ACTIVE_CHANGED: {

			return {
				...state,
				active: payload

			};
		}
		case STATISTIC_CHANGED: {

			return {
				...state,
				statistic: payload

			};
		}
		case MODE_CHANGED: {

			return {
				...state,
				mode: payload

			};
		}
		case FILE_SAVE_RESULT_CHANGED: {

			return {
				...state,
				fileSaveResult: payload

			};
		}
		case SELECTION_CHANGED: {

			return {
				...state,
				selection: [...payload]

			};
		}
		case FINISH_REQUESTED: {

			return {
				...state,
				finish: payload

			};
		}
		case RESET_REQUESTED: {

			return {
				...state,
				reset: payload

			};
		}
		case REMOVE_REQUESTED: {

			return {
				...state,
				remove: payload

			};
		}
	}

	return state;
};
