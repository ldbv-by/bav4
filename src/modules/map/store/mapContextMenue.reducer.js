export const MAP_CONTEXT_MENUE_CLICKED = 'event/contextMenue';

export const initialState = {
	eventCoordinate: null,
	data: null
};

export const mapContextMenueReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case MAP_CONTEXT_MENUE_CLICKED: {
			return {
				...state,
				eventCoordinate: payload.eventCoordinate,
				data: payload.data,
			};
		}
	}
	return state;
};