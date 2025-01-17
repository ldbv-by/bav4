export const INDEX_CHANGED = 'topics/topicsContentPane/index';

export const initialState = {
	/**
	 * Current index of active / displayed content
	 */
	index: 0
};

export const topicsContentPanelReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case INDEX_CHANGED: {
			return {
				...state,
				index: payload
			};
		}
	}
	return state;
};
