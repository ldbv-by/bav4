export const ACTIVE_CHANGED = 'draw/active';
export const MODE_CHANGED = 'draw/mode';
export const TYPE_CHANGED = 'draw/type';
export const GEOMETRY_IS_VALID_CHANGED = 'draw/geometryIsValid';
export const STYLE_CHANGED = 'draw/style';
export const SELECTED_STYLE_CHANGED = 'draw/selectedStyle';
export const CLEAR_TEXT = 'draw/clearText';
export const CLEAR_DESCRIPTION = 'draw/clearDescription';
export const DESCRIPTION_CHANGED = 'draw/description';
export const FILE_SAVE_RESULT_CHANGED = 'draw/fileSaveResult';
export const SELECTION_CHANGED = 'draw/selection';
export const FINISH_REQUESTED = 'draw/finish';
export const RESET_REQUESTED = 'draw/reset';
export const REMOVE_REQUESTED = 'draw/remove';


export const INITIAL_STYLE = {
	symbolSrc: null,
	scale: null,
	color: null,
	text: null
};

export const initialState = {
	/**
	 * @type {boolean}
	 */
	active: false,
	/**
	 * @type {String}
	 */
	mode: null,
	/**
	 * @type {String}
	 */
	type: null,
	/**
	* @type {boolean}
	*/
	geometryIsValid: false,
	/**
	 * @type {Object}
	 */
	style: INITIAL_STYLE,
	/**
	 * @type {Object}
	 */
	selectedStyle: null,
	/**
	 * @type {String}
	 */
	description: null,
	/**
	 * @type {DrawFileSaveResult}
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

export const drawReducer = (state = initialState, action) => {

	const { type, payload } = action;
	switch (type) {
		case ACTIVE_CHANGED: {

			return {
				...state,
				active: payload

			};
		}
		case MODE_CHANGED: {

			return {
				...state,
				mode: payload

			};
		}
		case TYPE_CHANGED: {

			return {
				...state,
				type: payload

			};
		}
		case GEOMETRY_IS_VALID_CHANGED: {

			return {
				...state,
				validGeometry: payload

			};
		}
		case STYLE_CHANGED: {

			return {
				...state,
				style: payload

			};
		}
		case SELECTED_STYLE_CHANGED: {

			return {
				...state,
				selectedStyle: payload

			};
		}
		case DESCRIPTION_CHANGED: {

			return {
				...state,
				description: payload

			};
		}
		case CLEAR_DESCRIPTION: {

			return {
				...state,
				description: null

			};
		}
		case CLEAR_TEXT: {

			return {
				...state,
				style: { ...state.style, text: null },
				selectedStyle: state.selectedStyle ? { ...state.selectedStyle, style: { ...state.selectedStyle.style, text: null } } : null

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
