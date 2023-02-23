export const BEING_MOVED_CHANGED = 'pointer/beingMoved';
export const MOVE_START_CHANGED = 'pointer/moveStart';
export const MOVE_END_CHANGED = 'pointer/moveEnd';

export const initialState = {
	/**
	 * @type EventLike
	 */
	moveStart: null,

	/**
	 * @type EventLike
	 */
	moveEnd: null,

	/**
	 * @type {boolean}
	 */
	beingMoved: false
};

export const mapReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case BEING_MOVED_CHANGED: {
			return {
				...state,
				beingMoved: payload
			};
		}
		case MOVE_START_CHANGED: {
			return {
				...state,
				moveStart: payload
			};
		}
		case MOVE_END_CHANGED: {
			return {
				...state,
				moveEnd: payload
			};
		}
	}

	return state;
};
