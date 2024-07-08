export const TOPIC_CHANGED = 'topics/current';
export const TOPIC_RESOURCES_READY = 'topics/resources/ready';

export const initialState = {
	/**
	 * Currently active topic ID.
	 * @property {string}
	 */
	current: null,
	/**
	 * Flag that indicates if the topics store is ready. "Ready" means all required resources are available.
	 *  @property {boolean}
	 */
	ready: false
};

export const topicsReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case TOPIC_CHANGED: {
			return {
				...state,
				current: payload
			};
		}
		case TOPIC_RESOURCES_READY: {
			return {
				...state,
				ready: payload
			};
		}
	}

	return state;
};
