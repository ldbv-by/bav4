export const SELECTED_TOPIC_CHANGED = 'admin/currentTopicId';

export const initialState = {
	currentTopicId: null
};

export const adminReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case SELECTED_TOPIC_CHANGED: {
			return {
				...state,
				currentTopicId: payload
			};
		}
	}
	return state;
};
