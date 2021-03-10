export const OPEN_CLOSED_CHANGED = 'components/menue/contentPanel/open';

export const initialState = {
	open: false
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