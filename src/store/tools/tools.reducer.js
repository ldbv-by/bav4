export const CURRENT_TOOL_CHANGED = 'tools/toolId';

export const initialState = {
	// id of current active tool
	current: null
};

export const toolsReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {

		case CURRENT_TOOL_CHANGED: {

			return {
				...state,
				current: payload
			};
		}
	}
	return state;
};
