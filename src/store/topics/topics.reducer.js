export const TOPIC_CHANGED = 'topics/current';
export const TOPIC_RESOURCES_READY = 'topics/resources/ready';

export const initialState = {
	/**
	 * List of currently active layers.
	 */
	current: null,
	/**
	 * Flag that indicates if the topics store is ready. "Ready" means all required resources are available.
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
