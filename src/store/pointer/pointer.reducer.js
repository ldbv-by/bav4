export const CLICK_CHANGED = 'pointer/click';
export const CONTEXT_CLICK_CHANGED = 'pointer/contextClick';
export const BEING_DRAGGED_CHANGED = 'pointer/beingDragged';
export const POINTER_MOVE_CHANGED = 'pointer/move';

export const initialState = {
	/**
	 * @type {EventLike<PointerEvent>}
	 */
	click: null,

	/**
	 * @type {EventLike<PointerEvent>}
	 */
	contextClick: null,

	/**
	 * @type {boolean}
	 */
	beingDragged: false,

	/**
	 * @type {EventLike<PointerEvent>}
	 */
	move: null
};

export const pointerReducer = (state = initialState, action) => {
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
		case POINTER_MOVE_CHANGED: {
			return {
				...state,
				move: payload
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
