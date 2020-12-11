export const CONTEXT_MENUE_CLICK = 'components/contextMenue/click';

export const initialState = {
	data: { pointer: false, commands: false }
};

export const contextMenueReducer = (state = initialState, action) => {
	const {
		type,
		payload
	} = action;
	switch (type) {
		case CONTEXT_MENUE_CLICK: {
			return {
				...state,
				data: payload,
			};
		}
	}

	return state;
};