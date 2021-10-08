export const OPEN_CLOSED_CHANGED = 'components/menu/toolBar/open';

export const initialState = {
	open: false
};

export const toolBarReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case OPEN_CLOSED_CHANGED: {

			return {
				...state,
				open: payload
			};
		}
	}
	return state;
};
