export const OPEN_CLOSED_CHANGED = 'components/menue/sidePanel/open';

export const initialState = {
	open: false
};

const sidePanelReducer = (state = initialState, action) => {
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

export default sidePanelReducer;
