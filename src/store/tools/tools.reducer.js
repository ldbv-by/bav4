export const ACTIVE_TOOL_CHANGED = 'tools/toolId';

export const initialState = {
	// id of current active tool
	toolId: null
};

export const toolsReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {

		case ACTIVE_TOOL_CHANGED: {

			return {
				...state,
				toolId: payload
			};
		}
	}
	return state;
};
