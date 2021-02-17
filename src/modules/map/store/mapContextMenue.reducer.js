export const MAP_CONTEXT_MENUE_CLICKED = 'event/contextMenue';

export const initialState = {
	coordinate: null,
	id: null
};

export const mapContextMenueReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case MAP_CONTEXT_MENUE_CLICKED: {
			return {
				...state,
				coordinate: payload.coordinate,
				id: payload.id,
			};
		}
	}
	return state;
};