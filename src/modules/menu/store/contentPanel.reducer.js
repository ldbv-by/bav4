export const OPEN_CLOSED_CHANGED = 'components/menu/contentPanel/open';

export const initialState = {
	open: true
};

export const contentPanelReducer = (state = initialState, action) => {
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