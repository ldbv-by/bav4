export const MAP_CONTEXT_MENU_CHANGED = 'contextMenu/changed';
export const MAP_CONTEXT_MENU_CONTENT_CHANGED = 'contextMenu/contentChanged';

export const initialState = {
	coordinate: null,
	content: null
};

export const mapContextMenuReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case MAP_CONTEXT_MENU_CHANGED: {
			return {
				...state,
				coordinate: payload.coordinate,
				content: payload.content
			};
		}
		case MAP_CONTEXT_MENU_CONTENT_CHANGED: {
			return {
				...state,
				content: payload
			};
		}
	}
	return state;
};
