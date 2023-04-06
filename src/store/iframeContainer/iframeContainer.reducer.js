export const IFRAME_CONTAINER_CHANGED = 'iframeContainer/contentChanged';

export const initialState = {
	/**
	 * @property {object|null}
	 */
	content: null,

	/**
	 * @property {boolean}
	 */
	active: false
};

export const iframeContainerReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case IFRAME_CONTAINER_CHANGED: {
			return {
				...state,
				content: payload,
				active: !!payload
			};
		}
	}

	return state;
};
