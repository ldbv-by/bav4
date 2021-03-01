export const CLICK_CHANGED = 'map/click';
export const CONTEXT_CLICK_CHANGED = 'map/contextClick';
export const BEING_DRAGGED_CHANGED = 'map/beingDragged';
export const POINTER_CHANGED = 'map/pointer';

export const initialState = {

	/**
     * @type {EventLike<Click>}
     */
	click: null,

	/**
     * @type {EventLike<Click>}
     */
	contextClick: null,

	/**
     * @type {boolean}
     */
	beingDragged: false,

	/**
     * @type {EventLike<Click>}
     */
	pointer: null

};


export const mapReducer = (state = initialState, action) => {

	const { type, payload } = action;
	switch (type) {
		case CLICK_CHANGED: {

			return {
				...state,
				click: payload
			};
		}
		case CONTEXT_CLICK_CHANGED: {

			return {
				...state,
				contextClick: payload
			};
		}
		case POINTER_CHANGED: {

			return {
				...state,
				pointer: payload
			};
		}
		case BEING_DRAGGED_CHANGED: {

			return {
				...state,
				beingDragged: payload
			};
		}
	}

	return state;
};
