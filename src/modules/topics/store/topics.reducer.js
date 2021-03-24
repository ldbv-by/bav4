export const TOPIC_CHANGED = 'topics/current';


export const initialState = {
	current: null
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
	}

	return state;
};
