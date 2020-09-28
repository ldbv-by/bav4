export const OPEN_CLOSED_CHANGED = 'components/sidePanel/open';

export const initialState = {
	sidePanel: {
		open: false
	}
};

const uiReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case OPEN_CLOSED_CHANGED: {

			return {
				...state,
				sidePanel: {
					open: payload
				}
			};
		}
	}

	return state;
};

export default uiReducer;
