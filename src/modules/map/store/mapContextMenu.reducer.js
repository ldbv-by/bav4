export const MAP_CONTEXT_MENU_CLICKED = 'event/contextMenu';

export const initialState = {
	coordinate: null,
	id: null
};

export const mapContextMenuReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case MAP_CONTEXT_MENU_CLICKED: {
			return {
				...state,
				coordinate: payload.coordinate,
				id: payload.id
			};
		}
	}
	return state;
};
